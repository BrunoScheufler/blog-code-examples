# Example Node.js application using TypeScript, esbuild, and Estrella

## Running the traditional development environment

```
./node_modules/.bin/tsc
node dist/src/main.js
```

Building using the TypeScript compiler (`tsc`) takes approximately 1.3s on this tiny codebase.

## Running esbuild and Estrella

Running type-checks separately (`tsc --noEmit`) takes around the same time as building and emitting files.

Building with esbuild

```bash
./node_modules/.bin/esbuild \
    --outfile="dist/main.js" \
    --target=es2019 \
    --platform=node \
    --format=cjs \
    --tsconfig="tsconfig.json" \
    --bundle \
    src/main.ts
```

takes around 15ms.

With Estrella, watching, building, and running can be automated

```bash
./build.js
```
