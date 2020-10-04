#!/usr/bin/env node

const { build } = require("estrella");

build({
  entry: "./src/bundle.ts",
  outfile: "./dist/src/main.js",
  target: "es2019",
  platform: "node",
  format: "cjs",
  bundle: true,
  tsconfig: "./tsconfig.json",
  watch: true,
  run: true,
});
