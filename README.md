# Darb — Seats going your way

Darb is a campus ride board for university students. Students who drive to campus post the trips they are already making and the seats they have spare; students without a car find a ride going their way and ask for a seat.

It is not a taxi service. The driver decides who rides, and whatever the trip costs is settled between the people in the car.

## How it works

1. **Post the trip you are making.** Where from, where to, when, how many seats are free, and the price per seat.
2. **Riders ask, the driver chooses.** Requests go to the driver, who accepts or declines each one.
3. **Seats can never oversell.** The moment the last seat is accepted, the ride closes to new requests. Anyone still waiting joins a queue and is offered a seat if one frees up.

### The house rule

- Accepted seats can never exceed the seats the driver offered.
- A rider cannot hold accepted seats on two rides that leave within three hours of each other.

Seats remaining is always calculated from the accepted requests and never stored.

## Features

- **Home**: route search and the rides leaving soonest.
- **Find a ride**: filter by route, day, seats needed and max price. Results are grouped by day and split into pages, and the filters stay in the address so a search can be shared or refreshed.
- **Ride detail**: a different view for the driver, for another signed-in student and for someone signed out, plus the waiting queue when a ride is full.
- **Driver profile**: who you would be riding with and their other trips.
- **Post a ride**: a form with validation that warns before you leave with unsaved changes.
- **My rides**: the trips you drive and the requests waiting on you, and where you stand on other people's trips.
- **Sign in and register.**
- **The seat counter**: the signature component, a row of seats that shows taken, free, pending and your own seat at a glance.

Every page that loads data handles four states: loading, empty, error and populated. Every page works on a phone at 390px wide.

## Tech stack

| Tool | Used for |
|---|---|
| [React 19](https://react.dev) | User interface |
| [React Router 7](https://reactrouter.com) | Pages and navigation |
| [Tailwind CSS 4](https://tailwindcss.com) | Styling, through the `@tailwindcss/vite` plugin |
| [Vite 8](https://vite.dev) | Dev server and production build |
| [ESLint 10](https://eslint.org) | Linting, with the React Hooks and React Refresh plugins |
| Git and GitHub | Version control, branches and pull requests |

State is handled with React context and `useReducer`; there is no extra state library.

## Getting started

You need [Node.js](https://nodejs.org) 20.19 or newer (Vite 8 needs it).

```bash
git clone https://github.com/owenfnammour/Darb.git
cd Darb
npm install
npm run dev
```

Then open the address Vite prints, usually http://localhost:5173.

| Command | What it does |
|---|---|
| `npm run dev` | Starts the dev server with hot reload |
| `npm run build` | Builds the production version into `dist/` |
| `npm run preview` | Serves the production build locally |
| `npm run lint` | Checks the code with ESLint |
| `npm run test:driving` | Runs the Post and Driving tests with Node's built-in test runner (no browser download) |

## Post a ride and Driving

Post trips at `/post`, edit at `/post?edit=ID` or `/ride/:id/edit`, and review requests at `/my-rides/driving`. Drivers can accept, decline, edit, and cancel before departure. Cancellation and declining a request ask for confirmation.

Phase 1 stores rides in memory; reloading restores the sample data. All ride departure checks and form validation use the fixed demo `NOW` in `src/data/rides.js`. Form dates use Asia/Beirut and are stored as ISO instants. Vehicle capacity uses `viewer.passengerCapacity` when supplied, otherwise Karim/Hana have 5 passenger seats and other accounts have 4.


## Project structure

```
src/
├── components/   Reusable pieces: header, footer, ride card, seat counter, buttons, status pills
├── pages/        One file per screen: Home, Browse, Ride detail, Driver profile
├── context/      Who is signed in (AuthProvider and useAuth)
├── lib/          Plain logic: form validation, the fake auth API, riding statuses, ride rules
├── state/        App-wide state: rides and the current viewer (React context)
├── data/         Sample rides and users, and the seat rules
├── hooks/        Shared hooks, such as the loading/error state of a page
├── App.jsx       Routes
└── main.jsx      Entry point
```


## Surface Distribution

| Surface | Owner |
|---|---|
| Home | Owen Nammour |
| Find a ride (Browse) | Owen Nammour |
| Seat counter and shared components | Owen Nammour |
| Ride detail | Saad El Chakra |
| Driver profile | Saad El Chakra |
| Post a ride | Fatme Akar |
| My rides: driving | Fatme Akar |
| My rides: riding | Hana Ali |
| Sign in and register | Hana Ali |

## Team

Owen Nammour · Saad Eldin Elchakra · Hana Ali · Fatme Akar

CSC443 Web Programming · Fall 2026
