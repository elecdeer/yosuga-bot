import nodeResolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import esbuild from "rollup-plugin-esbuild";
import { defineConfig } from "rollup";
import { builtinModules } from "module";
import json from "@rollup/plugin-json";
import run from "@rollup/plugin-run";

import pkg from "./package.json";

const dev = !!process.env.DEV;

const entry = "src/index.ts";

const external = [
  ...builtinModules,
  ...Object.keys(pkg.dependencies || {}),
  // ...Object.keys(pkg.peerDependencies || {}),
];

const plugins = [
  nodeResolve({
    preferBuiltins: true,
  }),
  commonjs({
    // esmExternals: true,
    // requireReturnsDefault: "namespace",
  }),
  json(),
  esbuild({
    target: "node16",
  }),
  dev &&
    run({
      // env: {
      //   "enable-source-maps": true,
      // },
      execArgv: ["--enable-source-maps"],
    }),
];

export default defineConfig([
  {
    input: entry,
    output: {
      // file: "dist/index.mjs",
      dir: "dist",
      entryFileNames: "[name].mjs",
      format: "esm",
      // exports: "default",
      sourcemap: true,
      // exports: "named",
      // exports: "none",
      // interop: "auto",
    },
    external: external,
    plugins: plugins,
  },
]);
