# El Mecano Garage — scroll-animated website (pitch demo)

A one-page website for El Mecano Garage (Mnihla, Tunis) where a 3D car reacts to scrolling:

1. **Diagnostic préventif:** a laser scanner sweeps the car and reveals an X-ray view with live diagnostic labels.
2. **Réparation mécanique:** the scissor doors and hood open, then the car explodes into body, cabin, engine, transmission and wheels.
3. **Reprogrammation ECU:** a front close-up with glowing lights, speed streaks and an animated power-curve card.
4. **Diagnostic d'achat:** a turntable view with an inspection report that ticks itself off and ends on "Véhicule validé".

After the 3D section come stats (4.9★, 178 Google reviews), the 6 services, why El Mecano, real customer reviews,
the FAQ, opening hours with a live "open now" badge, a map, WhatsApp/phone buttons and a sticky mobile call bar.
French by default, with a full Arabic (right-to-left) version from the `FR | عربي` switch.

## Open it

`dist/index.html` is a single self-contained file (about 4.5 MB). Code, fonts, logo and the 3D model are all inside.
Double-click it to open it in Chrome, Edge, Safari or Firefox. No server or internet connection is needed;
only the Google map needs internet.

## Put it online

Any static host works. For example, drag the `dist` folder onto https://app.netlify.com/drop, or use GitHub Pages.
To go live on elmecano.co, whoever manages the domain must point it at the new host. The site is currently on GoHighLevel.

Before going live:
- remove the "Concept de site proposé à El Mecano Garage" line in the footer (`footer.concept` in `src/i18n.js`);
- the scanner values ("Usure 68 %", "12,6 V"…) are illustrative UI and can be changed in `src/i18n.js`;
- optionally replace the static reviews with the live GoHighLevel reviews widget.

## Edit and rebuild

```bash
npm install
node tools/build.mjs          # → dist/index.html
```

- `src/i18n.js`: all text, in French and Arabic
- `src/index.html`, `src/styles.css`: page structure and design
- `src/main.js`: 3D scene and scroll timeline (camera keyframes are in `CAM`)
- `tools/shots.mjs`, `tools/record.mjs`: screenshots and the frame-exact pitch video (`?record` mode)

Contact details used: +216 52 351 490 · Cité Massouda, Mnihla, Tunis 2062 · WhatsApp wa.me/21652351490.

## Credits

3D model "Car Concept" © 2024 Darmstadt Graphics Group GmbH (Eric Chadwick), CC BY 4.0, modified. See `model/LICENSE.md`.
Fonts: Montserrat, Lato, Cairo (SIL Open Font License) via Fontsource. 3D engine: three.js (MIT).
