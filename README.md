# cdn proxy plugin

`web-dev-server.config.js`:
```js
import { cdnProxy } from '@pgfg/cdn-proxy-plugin';

export default {
  plugins: [
    cdnProxy({
      cdn: 'cdn.foo.com',
      // or:
      // cdn: 'staging.cdn.foo.com',
      packages: {
        'foo-web': '1.0.0',
      }
    })
  ]
};
```

Rewrites bare module specifiers (e.g.: `import "foo-web"`) to CDN urls (e.g.: `import "https://cdn.foo.com/foo-web/1.0.0/es-modules/file.js"`)