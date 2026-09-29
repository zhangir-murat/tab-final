# TAB

A mobile-first nightlife and ordering web app for OrangeTower Analytics, implemented from the supplied 28-page **TAB App.pdf**.

## Run

Requires Node.js 20.19+ (Node 22 LTS recommended).

```sh
npm ci
npm run dev
```

Open the URL printed by Vite. To use it on an iPhone on the same local network, run `npm run dev -- --host 0.0.0.0`. Camera scanning requires HTTPS or localhost; use the sample scan or pasted-link fallback on an unsecured LAN URL.

```sh
npm test
npm run build
npm run preview
```

The deployable app is generated in `dist/`. Relative asset paths support both a root domain and subdirectory hosting. No environment variables are required.

## Try a complete night

1. From Home, tap the location button beside Maya to open House of Yes.
2. Choose Disco Paloma, customize it, and add it to the round.
3. Review the round, open a personal or group tab, and complete the clearly labeled demo authorization.
4. On the order screen, tap **Show server** to animate the ticket into the bartender-facing position. Tap **Bring back** to restore it.
5. Open **Bartender demo** and mark the order ready, then delivered.
6. Exit to your tab and close out. With one $16 Paloma and a 20% tip, the total is $20.62 ($1.42 tax + $3.20 tip).
7. Rate the night, save the venue, or share its link. The receipt remains in History after reload.

## Implemented

- Home, searchable venue discovery, category filters, favorites, venue menus/info/group views.
- Drink options (rim, ice, style, notes, quantity), pending-round review and multiple ordered rounds.
- Personal and group tabs; members, per-person orders, equal split calculations, tips, receipt history.
- Demo Apple Pay, Google Pay, and card authorization; close-out is disabled until every round is delivered.
- Animated peach order ticket, bartender-facing orientation, order age, and demo order-status controls.
- Friends, availability states, pokes, local invitations, plans/RSVPs, social activity, profile editing.
- Real QR generation, camera scanner with permission/error handling, pasted-link and sample-code fallbacks.
- Shareable venue/friend URLs and native sharing where supported, with clipboard fallback.
- Browser-local persistence, reset controls, keyboard dialog focus management, reduced-motion support, iPhone safe-area spacing, and Home Screen metadata.
- Bundled fonts; no third-party font requests at runtime.

## Demo boundaries

The PDF explicitly labels payment authorization as simulated. This build uses local demo data throughout: **no real charges, live bar orders, real social messages, multi-user synchronization, or payment credentials**. Venue menus, hours, and prices are illustrative. Covering a friend's tab uses an explicitly labeled sample balance. Split calculations do not collect money from anyone. Browser data is local to the device and may be cleared by the browser.

A live launch requires authenticated user accounts, a server-authoritative order/tab ledger, venue/POS integration, a payment provider with authorization/capture and webhook handling, verified menu data, and a realtime social layer. Do not connect production payments directly to this client-side state.

## Deployment

Build command: `npm run build`. Publish directory: `dist`. Deploy those files to any HTTPS static host. A GitHub Actions workflow runs tests/build and uploads `tab-web-build` on pushes and pull requests. Download that artifact to obtain the exact deployable files from a verified commit.

A ChatGPT Sites preview was attempted during the build but creation was blocked by the account's Site Hosting usage limit. No existing Site was overwritten.

## Structure

- `src/App.tsx`: connected views, dialogs, state and navigation.
- `src/data.ts`: typed demo models and initial data.
- `src/domain.mjs`: integer-cent totals, tax, splitting, and order validation.
- `src/styles.css`: responsive PDF-inspired dark interface and animation.
- `tests/`: domain and React interaction tests.

## Verification

Automated React DOM tests cover the complete personal-tab lifecycle, order customization, ticket state, delivery guard, exact receipt arithmetic, group membership and persistence, venue search, favorites, profile editing, plan creation, and the QR fallback. Unit checks cover cent-conserving splits and order snapshots. Production TypeScript/Vite build passes.

A real browser rendering and camera-device pass could not be completed in the build environment. The automated DOM tests do not verify pixel layout, physical camera capture, Safari native sharing, or animation rendering on a device.
