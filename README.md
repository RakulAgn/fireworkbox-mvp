# FireworkBox MVP

A browser MVP for creating layered fireworks-box art. It offers a dieline workspace, editable text and image layers, glow effects, project saving, real AI image generation, and SVG export that opens in CorelDRAW.

## Starter template library

The MVP contains searchable starter layouts for Paper Bomb Carton, Tuck End Carton, Matchbox Sleeve, Firecracker Bundle Wrapper, Paper Strip / Brand Band, Rocket / Tube Wrapper, and Belly Band / Outer Sleeve. They are creative-layout guides rather than certified factory die-cut drawings. Before production, use the printer/manufacturer-approved dimensions and dieline for the chosen product.

## Run it

```powershell
cd C:\Users\RakulA\Documents\Codex\2026-11-01\he\outputs\fireworkbox-mvp
$env:OPENAI_API_KEY = "your_api_key" # optional; enables real AI generation
npm start
```

Open `http://localhost:3000`.

Without an API key, **Generate assets** deliberately adds a demo asset so the layer-editing experience can still be tested. With a key, the browser sends the prompt to the local server, and the server calls OpenAI; the key is never exposed to the browser.

## AI asset workflow

1. Choose an asset type, art direction, number of variants, and quality.
2. Leave **Transparent PNG** on for characters, flames, badges, and individual design objects.
3. Click **Generate assets**. The results appear in the generated-assets tray.
4. Click an asset in the tray to add it as a separate, movable layer on the box.

The endpoint uses `gpt-image-2.5-sunburst`, requests PNG output, and permits up to three variants at a time. It hashes the connecting address into a privacy-preserving `safety_identifier`; a production service should replace this with a stable authenticated user ID.

## Print handoff

Use **Export SVG** for an editable vector-layout handoff to CorelDRAW. It keeps text, shapes, effects and positioned artwork as individual SVG objects. Raster AI images remain embedded raster layers, which are movable and effect-editable in CorelDRAW, but are not individually vector-editable. Use **Print / PDF** for a proof or PDF output. The MVP is RGB; production release needs CMYK profiles, bleed validation and printer-specific PDF/X presets.

