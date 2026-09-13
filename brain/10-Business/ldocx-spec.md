# Living Document Format (.ldocx) Technical Specification

Developed by **J AI ENTERPRISES**, LDOCX is an open, autonomous, client-side digital container format replacing static PDFs.

## Physical Binary Framing Header
- **Offset 0..3**: ASCII `LDFX` (0x4C 0x44 0x46 0x58).
- **Offset 4..7**: Version descriptor (0x02 0x05 0x00 -> v2.5.0).
- **Offset 8..15**: Feature bitmask flags (Bit 0: Encrypted, Bit 1: Signed, Bit 2: Compressed, Bit 3: Air-Gapped Strict).
- **Offset 16..31**: CRC32 / truncated SHA-256 preflight checksum.
- **Offset 32..63**: 128-bit RFC 4122 Document UUID.
- **Offset 64..EOF**: Content-addressed ZIP-64 package containing:
  - `manifest.json`: Strongly-typed AST schema, element hierarchy, dependencies.
  - `pages/page_*.json`: Serialized page blocks (text, code, 3d_model, sandbox, video).
  - `assets/`: Content-hashed assets (`assets/<sha256>.<ext>`).
  - `signatures/`: Ed25519 & ECDSA P-256 cryptographic signatures.
  - `checksum.sha256`: Full document tamper-proof verification hash.

## Living Primitives
1. **WebGL 3D Engine**: Three.js integration rendering .glb, .gltf, .obj, .stl with programmatic camera and lighting.
2. **Fluid Temporal Dynamics**: Real-time cursor ripple wave simulations.
3. **Particle Physics**: Stardust, Hyperspace Warp, Golden Embers, Crystal Shards with gravitational attraction.
4. **Sandboxed JSX Execution**: Client-side Babel compilation running React components inside isolated iframes.
5. **Air-Gap Policy**: Strict Content Security Policy (`connect-src 'none'`) ensuring zero data exfiltration.
