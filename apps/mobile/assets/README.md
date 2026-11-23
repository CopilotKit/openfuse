# MyMuse artwork

`mascot.png` is the plush muse that leads the app. It is a flat, cream-coloured
hooded character drawn for MyMuse so the mark stays crisp from 16 px favicons up
to 1024 px installers. The transparent PNG is bundled locally and used by the
shared `Mascot` component; sky, sand and lilac backgrounds preserve the avatar
colour preference.

`icon.png` is the app icon: the mascot on a soft sky gradient with a sparkle.
`adaptive-icon.png` is the Android foreground layer (same mascot, transparent),
`splash-icon.png` is the launch mark, and `favicon.png` is the browser tab icon.
The desktop installers reuse `apps/desktop/build/icon.png`, which is the same
1024 px artwork, so Windows, macOS and Linux all show the identical logo.

`features/` holds the eighteen feature tiles (research, workflows, memory,
browser, analytics, docs, design, payments, developer, planner, spaces, audio,
vision, chat, code, automation, meetings, security). They are shown in the Apps
screen by `src/features.tsx` and were cut from the mascot feature sheets in the
repository's top-level `assets/` folder.

All artwork is original to this repository and included under its MIT license.
