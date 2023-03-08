import resolve from "@rollup/plugin-node-resolve";
import { babel } from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import globals from 'rollup-plugin-node-globals';
import builtins from 'rollup-plugin-node-builtins';

export default {
  input: "src/index.js",
  output: [
    {
      format: "esm",
      file: "bundle.js",
    },
  ],
  plugins: [
    resolve(),
    commonjs(),
  ],
};