import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import babel from "@rollup/plugin-babel";
import { terser } from "rollup-plugin-terser";
import json from '@rollup/plugin-json';
import external from '@yelo/rollup-node-external';
// import nodePolyfills from "rollup-plugin-node-polyfills";

import pkg from "./package.json";

const name = "md2docx";

const plugins = [
  // nodePolyfills(),
  resolve({ preferBuiltins: true }),
  commonjs(),
  babel(),
  json(),
];
/**
 * key为包名称，value为全局引用的值
 * example: const globals = { jquery: "$" };
 */
const globals = {};

export default [
  {
    input: "src/main.js",
    output: [
      { //cjs setting
        name,
        file: pkg.main,
        format: "cjs",
        exports: "named",
        globals
      },
      { //esm setting
        name,
        file: pkg.module,
        format: "es",
        exports: "named",
        globals
      },
    ],
    plugins,
    external: external(),
  }
];
