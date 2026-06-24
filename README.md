# Cryptovg

Client-side password and secret toolkit. Generate and analyse passwords,
passphrases and TOTP codes, and check whether a password has been breached —
**entirely in the browser**. There is no backend and nothing sensitive leaves
your machine.

Part of the [project hub](https://sergiogbernardo.github.io/), alongside
[Bytevg](https://sergiogbernardo.github.io/Bytevg/),
[Inspectorvg](https://sergiogbernardo.github.io/Inspectorvg/) and
[Scanvg](https://sergiogbernardo.github.io/Scanvg/).

> **Status:** scaffold / work in progress. The shell, design system and Pages
> deploy are ready; the modules below are being built.

## Planned modules

- **Generator** — random passwords (length, character sets, exclude ambiguous)
  and EFF diceware passphrases, with the estimated entropy in bits.
- **Strength analysis** — [`zxcvbn`](https://github.com/dropbox/zxcvbn) score,
  estimated crack time and the reasoning (patterns, common words, sequences).
- **Breach check** — Have I Been Pwned via the range API with **k-anonymity**:
  the password is hashed locally (SHA-1) and only the first 5 hash characters
  are sent; the suffix is matched in the browser. The password never leaves the
  device.
- **TOTP / 2FA** — generate TOTP codes from an `otpauth://` URI or base32 secret,
  with a live countdown. HMAC via the Web Crypto API.

## Stack

React + TypeScript + Vite + Tailwind. No backend, no tracking.

## Develop

```bash
npm install
npm run dev
```

## Build

```bash
npm run build      # outputs to dist/
npm run preview
```

The Vite `base` is `/Cryptovg/` to match GitHub Pages. Deployment is automated by
`.github/workflows/deploy.yml` on every push to `main`.
