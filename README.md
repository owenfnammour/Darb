# Darb

Campus ride sharing. Run `npm ci` and `npm run dev` to start locally.

Post trips at `/post`, edit at `/post?edit=ID` or `/ride/:id/edit`, and review
requests at `/my-rides/driving`. Drivers can accept, decline, edit, and cancel
before departure. Cancellation and declining a request ask for confirmation.

Phase 1 stores rides in memory; reloading restores the sample data. All ride
departure checks and form validation use the fixed demo `NOW` in
`src/data/rides.js`. Form dates use Asia/Beirut and are stored as ISO instants.
Vehicle capacity uses `viewer.passengerCapacity` when supplied, otherwise
Karim/Hana have 5 passenger seats and other accounts have 4.

Run `npm run test:driving`, `npm run lint`, and `npm run build` to check changes.
The driving tests use Node's built-in test runner; no browser download is needed.
