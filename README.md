# vite-circular-dependencies
POC for Vite causing circular dependencies 

## Summary
Vite bundles both the Vue library and its own helpers into the top index chunk, and because all components import Vue and use those helpers, then all JavaScript chunks import index.

The impact is that a change to one component causes a hash change to all components which causes a large browser cache invalidation between code releases.

## Investigation

Since the top index indirectly imports all components, any change in a single component changes that component hash, then cascades up to index, then cascades back down to all components.

The impact can be seen here as follow:


1. Build the app, save the list of hash changes (lines omitted for clarity):

```zsh
 % npm run build

dist/assets/vue.5532db34.svg        0.48 KiB
dist/index.html                     0.44 KiB
dist/assets/HelloWorld.2a228e41.js  0.26 KiB / gzip: 0.21 KiB
dist/assets/Panel.37d1d496.js       0.19 KiB / gzip: 0.17 KiB
dist/assets/ByByeWorld.22d2d993.js  0.26 KiB / gzip: 0.22 KiB
dist/assets/index.3f6467e9.css      1.21 KiB / gzip: 0.63 KiB
dist/assets/index.7837aefd.js      52.55 KiB / gzip: 21.24 KiB
```

2. Change one of the components, for example change "Hello" to "Hello!" in `HelloWorld.vue`, and rebuild:

```zsh
% npm run build

dist/assets/vue.5532db34.svg        0.48 KiB
dist/index.html                     0.44 KiB
dist/assets/HelloWorld.85a3b193.js  0.26 KiB / gzip: 0.21 KiB
dist/assets/Panel.9626c151.js       0.19 KiB / gzip: 0.17 KiB
dist/assets/ByByeWorld.d27c7ad5.js  0.26 KiB / gzip: 0.22 KiB
dist/assets/index.3f6467e9.css      1.21 KiB / gzip: 0.63 KiB
dist/assets/index.6acde798.js       52.55 KiB / gzip: 21.25 KiB
```

Notice that the hash of `ByeByeWorld.js` has changed, even if that component doesn't import `HelloWorld.vue`. In fact, all `.js` files have new hashes.

3. This can be explained becuase all chunks import `index`:

```zsh
% grep -rEo "/index\.\w+\.js" dist

dist/index.html:/index.6acde798.js
dist/assets/Panel.9626c151.js:/index.6acde798.js
dist/assets/ByByeWorld.d27c7ad5.js:/index.6acde798.js
dist/assets/HelloWorld.85a3b193.js:/index.6acde798.js
```

## Workaround

1. Uncomment the `manualChunks` function in `vite.config.ts`.

2. Build the app

```zsh
% npm run build

dist/assets/vue.5532db34.svg        0.48 KiB
dist/index.html                     0.59 KiB
dist/assets/index.caa16f9f.js       1.13 KiB / gzip: 0.58 KiB
dist/assets/vite.288ff0a5.js        1.26 KiB / gzip: 0.67 KiB
dist/assets/HelloWorld.78a2bc30.js  0.26 KiB / gzip: 0.22 KiB
dist/assets/Panel.2ce48d7b.js       0.19 KiB / gzip: 0.17 KiB
dist/assets/ByByeWorld.1350f4f8.js  0.27 KiB / gzip: 0.22 KiB
dist/assets/index.3f6467e9.css      1.21 KiB / gzip: 0.63 KiB
dist/assets/vendor.3885daba.js     50.40 KiB / gzip: 20.29 KiB
```

3. Change one of the components again, for example revert "Hello!" to "Hello" in `HelloWorld.vue`, and rebuild:

```zsh
dist/assets/vue.5532db34.svg        0.48 KiB
dist/index.html                     0.59 KiB
dist/assets/index.15a1828f.js       1.13 KiB / gzip: 0.58 KiB
dist/assets/HelloWorld.5cb36190.js  0.26 KiB / gzip: 0.22 KiB
dist/assets/vite.288ff0a5.js        1.26 KiB / gzip: 0.67 KiB
dist/assets/Panel.2ce48d7b.js       0.19 KiB / gzip: 0.17 KiB
dist/assets/ByByeWorld.1350f4f8.js  0.27 KiB / gzip: 0.22 KiB
dist/assets/index.3f6467e9.css      1.21 KiB / gzip: 0.63 KiB
dist/assets/vendor.3885daba.js     50.40 KiB / gzip: 20.29 KiB
```

Notice that the hash of `ByeByeWorld.js` has NOT changed. In fact, only `HelloWorld.js` and `index.js` have changed.

4. This can be explained because none of the chunks are importing `index`:

```
% grep -rEo "/index\.\w+\.js" dist        

dist/index.html:/index.15a1828f.js
```
