# Darb — Campus Ride Board

React frontend for posting campus rides and managing the **My rides: Driving** dashboard
in the CSC443 group project. Drivers can create and edit trips, review seat requests,
and cancel rides. This module covers surfaces **05 (Post a ride)** and **06 (Driving)**.

## Features

- Validated create/edit form with an unsaved-changes dialog.
- Driving dashboard and request review with loading, empty, error, and populated states.
- Reusable components, responsive layouts, keyboard-accessible controls, and local fonts.

## Stack and requirements

| Purpose | Technology |
| --- | --- |
| UI | React 19, JavaScript (JSX) |
| Routing | React Router 7 with a data router |
| Styling | Tailwind CSS 3.4, PostCSS, local WOFF2 fonts |
| Development/build | Vite 7, npm |
| Testing | Node.js test runner, Playwright |
| Demo persistence | Browser localStorage |

Use **Node.js 22.12+** and npm. Browser tests also require Google Chrome.
The current app uses mock data and a demo user; a backend and environment variables
are not needed to run it.

## Getting started

Open a terminal in this folder:

```sh
npm ci
npm run dev
```

Visit **http://127.0.0.1:5173**. If that port is occupied, use the URL printed by Vite.
The app opens the Driving dashboard with **Hana Ali** signed in as the demo driver.

## Pages and demo flow

| Route | What to see |
| --- | --- |
| `/` or `/my-rides/driving` | Your rides, seat counts, and pending request actions |
| `/post` | Create a ride |
| `/rides/morning-trip` | Sample owner workspace with two pending requests |
| `/rides/midweek-trip/edit` | Edit the second sample ride |
| `/my-rides/driving?demo=empty` | Empty dashboard |
| `/my-rides/driving?demo=error` | Load failure; **Try again** recovers |

Post a ride, then open it from Driving to edit it. On the sample morning trip, accepting
Owen's two-seat request fills the car and blocks further acceptance. Change a form field
and select **Cancel** to try the unsaved-changes guard.

Browse (`/rides`), Riding (`/my-rides/riding`), and Sign In (`/sign-in`) are placeholders
for the other group members' screens. The owner workspace supports request management;
the complete Ride Detail screen will be integrated by the team.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create the production build in `dist/` |
| `npm run preview` | Serve the production build locally after building |
| `npm test` | Test validation, seat rules, persistence, and service behavior |
| `npm run test:e2e` | Test user flows on desktop and 390px mobile layouts |

Playwright uses Google Chrome and manages its own dev server. Browser settings are in
[playwright.config.js](playwright.config.js).
Production hosting must serve `index.html` for application routes so direct links work.

## Project structure

```text
src/
  App.jsx           Routes
  components/       Shared UI, ride form, seat counter, and request review
  pages/            Post/Edit, Driving, and owner workspace
  domain/rides.js   Validation, seat calculations, dates, and conflict rules
  data/             Sample data and replaceable mock service
  state/            Shared rides, viewer, actions, and loading state
  styles/           Tailwind entry point and font declarations
public/fonts/       Bundled fonts
tests/              Logic and browser tests
```

## Data and ride rules

Changes persist in localStorage under `darb.rides.v1`. To restore fresh sample rides,
delete that key in browser developer tools and reload. Sample departures start in the
future when data is first created. Demo-state URLs use temporary in-memory data.

- Remaining seats are calculated from **accepted seat quantities**; pending requests do not reserve seats.
- Accepted seats cannot exceed the driver's offered seats or be removed by reducing capacity.
- A rider cannot hold accepted seats on trips departing less than three hours apart; exactly three hours is allowed.
- Forms and displays use `Asia/Beirut`; stored departures are ISO timestamps. Prices are USD per seat.
- Once departure time passes, Driving shows **Departed** and request review closes,
  including when the page stays open. Existing ride and request records are retained;
  `Departed` is a display state, not a new stored status.

## Team integration

Use one shared router, layout, Tailwind theme, and `RidesProvider` in the combined app.
[App.jsx](src/App.jsx) exports the routes. Share `SeatCounter`, `MyRidesTabs`, and the
domain helpers, and reuse `RequestReview` inside the full owner Ride Detail screen.

Pass the authenticated user as `viewer` to `RidesProvider` (`null` when signed out),
using `{ id, name, initials, passengerCapacity }`. Replace the mock service through the
provider's `service` prop. See [rideService.js](src/data/rideService.js) for its async
`list`, `save`, `review`, and `cancel` contract, and [seed.js](src/data/seed.js) for the
data shape. The API must enforce ownership, capacity, and time-conflict rules when added.
