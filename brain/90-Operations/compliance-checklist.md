# Security, Privacy & Air-Gap Compliance Checklist

## Air-Gapped Zero-Trust Architecture
1. **Zero-Network Policy**: In offline mode, the runtime enforces strict CSP (`connect-src 'none'`). No telemetry or user data ever leaves the local machine.
2. **Cryptographic Provenance**: Every block, page AST, and media asset is hashed with SHA-256. Single-byte tampering immediately flags the document as invalid.
3. **Sandboxed Code Execution**: Custom interactive widgets run inside an isolated `<iframe>` sandbox with strict postMessage validation, blocking access to parent DOM and cookies.
4. **License Compliance**: Core SDK and viewer are distributed under Apache License 2.0. Commercial converters and Enterprise Fleet tools are proprietary to J AI ENTERPRISES.
