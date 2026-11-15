# Post and Driving contribution

This contribution adds surfaces 05 (Post/Edit) and 06 (My rides: Driving) to the
existing application. It starts from main after Auth and Riding were merged
(`a2ad635`); it does not merge the open Browse branch or copy a second application.

## Routes and review flow

- `/post`: post a trip using the signed-in viewer.
- `/post?edit=ID`: existing Ride Detail edit links now open the populated form.
- `/ride/:id/edit`: equivalent edit route, also preserving the edit ID on error retry.
- `/my-rides/driving`: owned, non-cancelled trips and the existing shared tabs.
- Review opens an inline request panel in Driving, using the provider's existing
  accept/decline/cancel and queue transitions. Decline/cancel ask for confirmation.
- Past departures display Departed and close review, including an open decline
  dialog when departure passes while the page stays open.

My rides' existing default redirect to Riding remains. The teammate-owned Ride
Detail, request list, Auth, Riding, Home, and Driver Profile pages are not edited.
The new Driving panel does not change those pages' own request controls.

## Existing files edited

- `src/App.jsx`: add Post/Edit/Driving routes and a single data-router context so
  the custom unsaved-changes guard can intercept navigation and browser Back.
  Existing route elements and provider ordering are retained.
- `src/state/Providers.jsx`: add a namespaced create/edit action and `saveRide`.
  Existing request, withdrawal, acceptance, decline, cancellation, and queue cases
  are unchanged. New rides carry a public driver snapshot when the viewer is not
  in the static demo dictionary, avoiding undefined names in shared ride cards.
- `package.json` and lockfile: add feature-specific tests and pinned Playwright as
  a development dependency. Existing application dependencies are unchanged.

SeatCounter, SeatGlyph, the shared seat/rider-conflict helpers, MyRidesTabs, Button,
Auth files, shared CSS/theme, Vite configuration, and demo ride/user data are all
reused without changes. The existing shared rule rejects accepted departures at
or below three hours apart, including equality; this contribution preserves it.

## Phase 1 data assumptions

Rides use the team's existing shared in-memory provider. Route navigation shares
new/edited rides immediately with Ride Detail, Driver Profile, and Riding. A full
browser reload restores the team's seed data, as it did before this contribution.
No second ride store, database, new auth adapter, or persistence layer is added.

The team's fixed November demo trips and clock are unchanged. At the real current
time those samples may be past departures; create a future trip to exercise new
requests, or use a controlled browser clock when testing the original samples.
Form/display conversion for the new fields uses Asia/Beirut and saves ISO instants.

The existing viewer model has no vehicle capacity field. The feature uses a supplied
`viewer.passengerCapacity` when available, otherwise explicit demo capacities:
Karim/Hana 5, Fatme 4, other accounts 4. These defaults are local to this feature and
should be reviewed with the team; Auth/user records are not modified.

New registered drivers can post and have a public name on their shared ride. The
existing static user/profile lookup limitations on teammate-owned screens are not
expanded or rewritten in this contribution. Unknown rider names in the new panel
fall back to Student rather than causing a rendering error.

## Checks and commands

```sh
npm ci
npm run lint
npm run build
npm run test:driving
npm run test:e2e:driving
```

Logic tests cover field/date validation, canonical create/edit data, accepted-capacity
protection, ownership, cancellation, existing return destinations, the unchanged
shared three-hour boundary, and departure closure.

Browser tests are supplied for desktop and 390px mobile: Post validation/editing,
custom navigation guard, existing Auth return flow, shared Ride Detail/Profile
state, request review, existing Riding/queue transitions, cancellation, departure
closure, loading/empty/error states, and registration of a new driver. They use
installed Google Chrome on an isolated local port (5177), and write only to the
already-ignored `.tmp/` directory.

Validation at preparation: lint, production build, and all 10 logic tests passed.
The request to launch the Chrome suite was declined, so the supplied browser suite
has not been executed for this contribution. Run it before accepting the PR.

The original standalone app remains a backup. Its old localStorage persistence
and its independent router/configuration were not copied into this application.
