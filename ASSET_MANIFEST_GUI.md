# TTPASSPORT GUI Build — Asset Manifest

**Design reference only. Not official government branding or authorised production art.**

## Key instructions

- Use the root `CODEX_GUI_BUILD_PROMPT.md` alongside the existing project root `AGENTS.md`.
- The latest user-selected hero is `assets/ttpassport/banners/hero-citizen-passport.png` (and optimized `.webp`) and **replaces the earlier alternative hero**.
- Copy ONLY `assets/ttpassport/**` to the project's appropriate static assets folder, usually `public/assets/ttpassport/**` once confirmed.
- Keep `references/**` outside the production/public directory. They are screenshots for visual review, not UI assets.
- All navigation, forms, labels, headings, status chips, buttons and cards must be HTML/Wappler Bootstrap components, NOT flattened screenshots.
- Replace approximate AI heraldry with government-supplied authorised official insignia before any public deployment.
- Do not present the conceptual passport imagery as a real government-issued passport or security feature.

## Screen-to-asset mapping

| Screen | Asset |
|---|---|
| Shared government masthead | `assets/ttpassport/banners/header-government-crimson.webp` |
| Citizen public home hero (user-selected) | `assets/ttpassport/banners/hero-citizen-passport.webp` |
| Login/registration | `assets/ttpassport/backgrounds/bg-login-authentication.webp` |
| Citizen dashboard | `assets/ttpassport/backgrounds/bg-citizen-dashboard.webp` |
| Application wizard | `assets/ttpassport/backgrounds/bg-application-form.webp` |
| Back office | `assets/ttpassport/backgrounds/bg-backoffice-dashboard.webp` |
| International office selection | `assets/ttpassport/backgrounds/bg-international-service.webp` |
| eKYC background | `assets/ttpassport/backgrounds/bg-security-guilloche.webp` |
| Optional hibiscus decoration | `assets/ttpassport/accents/hibiscus-corner-watermark.webp` |
| Optional footer wave | `assets/ttpassport/accents/footer-wave.webp` |
| Optional information surfaces | `assets/ttpassport/panels/panel-information-gold.webp`, `panel-highlight-red.webp`, `panel-ivory-neutral.webp` |

## Mockup references

- `references/01_design_system_style_guide.png` — base tokens and visual hierarchy.
- `references/02_citizen_portal_home.png` — citizen layout.
- `references/03_first_time_application.png` — wizard layout.
- `references/04_immigration_backoffice.png` — back-office concepts, **ignore unrelated visa/permit nav**.
- `references/05_user_selected_hero_layout.png` — source composition of latest chosen hero.

No live government insignia, application data, credentials or citizen identity records are included.
