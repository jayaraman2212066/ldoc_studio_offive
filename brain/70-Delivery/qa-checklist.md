# Cross-Platform QA & Release Checklist

Before tagging any production release of LDOC Studio:

- [ ] **Web Studio**: Verify `index.html`, `live-studio.html`, `creator.html`, `viewer.html` load cleanly with zero console errors.
- [ ] **3D WebGL Pipeline**: Ensure `.glb`, `.gltf`, `.obj`, `.stl` assets render at 60+ FPS with responsive touch/mouse rotation.
- [ ] **Reactive Sandboxes**: Test velocity dyno, orbital trajectory, and ARR multiple calculator widgets.
- [ ] **Document Cryptography**: Verify SHA-256 hash generation and ECDSA signature validation on import/export.
- [ ] **Windows Installer**: Test `dist/setup.exe` installation, desktop shortcut, and `.ldocx` file association.
- [ ] **macOS Bundle**: Test `mac-dist/LDOC-Free-Suite.dmg` drag-to-Applications installation.
- [ ] **Linux Suite**: Test `linux-dist/setup-linux.sh` and `.desktop` menu integration.
- [ ] **Android Package**: Verify `android-dist/LDOC-Studio.apk` install and touch performance.
- [ ] **Stripe Action Links**: Verify payment redirects function seamlessly.
