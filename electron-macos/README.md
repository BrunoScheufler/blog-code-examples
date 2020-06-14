# Electron macOS starter

> This code example is part of [my blog post](https://brunoscheufler.com/blog/2020-06-14-getting-started-with-building-macos-electron-apps) on getting started with Electron application development for macOS.

## development

```bash
$ yarn start
```

## distribution

### create a release package

```bash
export APPLE_ID=""
export APPLE_ID_PASSWORD=""
export APPLE_CODE_SIGN_IDENTITY=""

$ yarn make
```
