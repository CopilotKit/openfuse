# MyMuse desktop

An Electron shell around the Expo web client, packaged for Windows, macOS, and Linux with
[electron-builder](https://www.electron.build).

`main.cjs` serves the exported web client (`apps/mobile/dist/web`) from a local HTTP server on
`127.0.0.1:8081` and loads it in a window. It must be a real HTTP origin, not `file://`, because the
Expo export uses absolute asset paths and the API accepts `http://localhost:8081` and
`http://127.0.0.1:8081` by default.

## Run

```sh
pnpm dev:desktop
```

This builds the web client, then opens the desktop window. The API still runs separately
(`pnpm dev`) and is reached at `http://localhost:8787`.

## Package

```sh
pnpm build:desktop:win    # NSIS installer, portable .exe, .msi
pnpm build:desktop:mac    # .dmg and .zip
pnpm build:desktop:linux  # .AppImage and .deb
pnpm build:desktop        # current platform only
```

Artifacts land in `apps/desktop/release`. The `.msi` and `.dmg` targets need their native build
hosts; `.exe` targets can also be cross-built on Linux with Wine and a virtual display:

```sh
xvfb-run -a pnpm --dir apps/desktop exec electron-builder --win nsis portable
```

Builds are unsigned unless signing credentials are configured (`CSC_LINK`/`CSC_KEY_PASSWORD` for
Windows and macOS). macOS also requires `CSC_IDENTITY_AUTO_DISCOVERY=false` for unsigned builds.

The packaged app contains the web client under `resources/web` and does not need Node or pnpm at
runtime. It does need a reachable API, set via `EXPO_PUBLIC_API_URL` when the web client is built.
