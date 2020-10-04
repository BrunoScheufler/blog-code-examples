#!/usr/bin/env node

const { build } = require("estrella");

build({
  entry: "./src/entrypoints/bundle.ts",
  outfile: "./dist/main.js",
  target: "es2019",
  platform: "node",
  format: "cjs",
  bundle: true,
  tsconfig: "./tsconfig.json",
  watch: true,
  run: true,
});
