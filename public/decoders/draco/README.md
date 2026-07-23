# Self-hosted Draco decoder

The 3D viewer decompresses Draco-encoded geometry using a **self-hosted** decoder
(SEC-002 — no third-party origin is fetched at runtime). The loader is configured
to read the decoder from `/decoders/draco/` (see
[`src/viewer/modelManifest.ts`](../../src/viewer/modelManifest.ts) →
`DRACO_DECODER_PATH`).

## Required files

Copy these files from the installed `three` package into this directory:

```
node_modules/three/examples/jsm/libs/draco/  →  public/decoders/draco/
```

At minimum the viewer needs:

- `draco_decoder.js`
- `draco_decoder.wasm`
- `draco_wasm_wrapper.js`

On Windows PowerShell:

```powershell
New-Item -ItemType Directory -Force public/decoders/draco | Out-Null
Copy-Item node_modules/three/examples/jsm/libs/draco/* public/decoders/draco/ -Recurse
```

These decoder binaries are intentionally **not** committed; they are produced
from the pinned `three` version so the decoder always matches the loader.
