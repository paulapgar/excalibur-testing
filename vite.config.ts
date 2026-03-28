import { defineConfig } from "vite";

// if you use tiled maps
// there is a collision between react w/ typescript .tsx
// and tiled tileset files .tsx
// this forces vite to not interpret tsx as react
// const tiledPlugin = () => {
//   return {
//     name: "tiled-tileset-plugin",
//     enforce: "pre",
//     resolveId(sourceId: string, _importer: string | undefined, _options: any) {
//       if (!sourceId.endsWith(".tsx")) return;
//       return { id: "tileset:" + sourceId, external: "relative" };
//     },
//   };
// };

export default defineConfig({
  base: "./", // optionally give a base path, useful for itch.io to serve relative instead of the default absolute
  //plugins: [tiledPlugin()], // hint vite that tiled tilesets should be treated as external
  plugins: [],
  // currently excalibur plugins are commonjs
  // this forces vite to keep things from bundling ESM together with commonjs
  optimizeDeps: {
    exclude: ["excalibur"],
  },
  build: {
    assetsInlineLimit: 0, // excalibur cannot handle inlined xml in prod mode
    sourcemap: true,
    // Vite uses rollup currently for prod builds so a separate config is needed
    // to keep vite from bundling ESM together with commonjs
    rollupOptions: {
      output: {
        format: "umd",
      },
    },
  },
});
