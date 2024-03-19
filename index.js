import childProcess from 'child_process';
import { promisify } from 'util';

const exec = promisify(childProcess.exec);

async function fetchCdnAsset(cdnUrl, packageName, version, file) {
  const url = `https://${cdnUrl}${createCdnUrl(packageName, version, file)}`;
  const curlExpression = `curl ${url} --verbose --fail --retry 3 --connect-timeout 10 --max-time 60`;
  return (await exec(curlExpression)).stdout;
}

const createCdnUrl = (packageName, version, file) => `/${packageName}/${version}/es-modules/${file}`;

export function cdnProxy(options) {
  const cdnUrl = options.cdn ?? '';
  const packages = options.packages ?? {};
  const regexPattern = /^\/(?<packageName>[a-z_-]+)\/(?<version>.*?)\/(?<moduleType>es-modules)\/(?<file>.+)$/;
  const CDN_ASSET_REGEX = new RegExp(regexPattern);

  return {
    resolveImport({ source }) {
      const pkgName = Object.keys(packages).find(name => source === name || source.startsWith(`${name}/`));

      if (!pkgName) {
        return undefined;
      }
      
      let filePath = source.substring(pkgName.length + 1);
      if (!filePath) {
        filePath = 'index.js';
      }

      return createCdnUrl(pkgName, packages[pkgName], filePath);
    },

    async serve(ctx) {
      const match = ctx.url.match(CDN_ASSET_REGEX);

      if (!match) {
        return undefined;
      }

      const { packageName, version, file } = match.groups;
      const body = await fetchCdnAsset(cdnUrl, packageName, version, file);
      return { body };
    },
  }
}