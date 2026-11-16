import test from 'node:test'
import assert from 'node:assert/strict'
import { initialRides, users } from '../../src/data/rides.js'
import { conflictingRide, seatCount } from '../../src/data/seats.js'
import { campusDateTime, departureInstant, emptyRideForm, isDriverReviewClosed, passengerCapacity, prepareDriverRide, rideToForm, validateRide } from '../../src/lib/rideForm.js'

const now = Date.parse('2026-11-01T10:00:00Z')
const rides = () => structuredClone(initialRides)
const valid = () => ({ ...emptyRideForm(), origin: 'Batroun', destination: 'Byblos campus', date: '2026-11-03', time: '08:30', offeredSeats: '4', price: '3.50' })

test('remaining capacity uses accepted seat quantities, never pending requests', () => {
  assert.equal(seatCount(initialRides[0]).taken, 3)
  assert.equal(seatCount(initialRides[0]).left, 2)
})
test('Beirut forms round-trip winter and summer, rejecting impossible dates and DST gaps', () => {
  for (const date of ['2030-01-15', '2030-07-15']) assert.deepEqual(campusDateTime(departureInstant(date, '07:30')), { date, time: '07:30' })
  assert.ok(Number.isNaN(departureInstant('2030-02-30', '07:30')))
  assert.ok(Number.isNaN(departureInstant('2030-03-31', '00:30')))
})
test('field validation rejects missing values, past departures, overcapacity, fractional seats and prices', () => {
  assert.equal(Object.keys(validateRide(valid(), 5, 0, now)).length, 0)
  assert.equal(Object.keys(validateRide(emptyRideForm(), 5, 0, now)).length, 5)
  for (const offeredSeats of ['0', '1.5', '6']) assert.ok(validateRide({ ...valid(), offeredSeats }, 5, 0, now).offeredSeats)
  for (const price of ['', '-1', '4.123']) assert.ok(validateRide({ ...valid(), price }, 5, 0, now).price)
  assert.ok(validateRide({ ...valid(), date: '2020-01-01' }, 5, 0, now).date)
})
test('create prepares the existing canonical ride shape without mutating team samples', () => {
  const before = rides()
  const created = prepareDriverRide(initialRides, valid(), users.hana, null, 'new-trip', now)
  assert.equal(created.from, 'Batroun'); assert.equal(created.seatsOffered, 4); assert.equal(created.id, 'new-trip')
  assert.equal(created.driverId, 'hana'); assert.equal(created.cancelled, false); assert.deepEqual(created.requests, [])
  assert.equal(created.driver.name, 'Hana Ali'); assert.deepEqual(initialRides, before)
})
test('edit preserves pickup and requests and rejects accepted-capacity reduction', () => {
  const current = initialRides[0], values = rideToForm(current)
  const edited = prepareDriverRide(initialRides, { ...values, price: '2' }, users.karim, '1', 'unused', now)
  assert.equal(edited.id, 1); assert.equal(edited.pickup, current.pickup); assert.deepEqual(edited.requests, current.requests)
  assert.throws(() => prepareDriverRide(initialRides, { ...values, offeredSeats: '2' }, users.karim, 1, 'unused', now), /already accepted/)
})
test('ownership, missing/cancelled rides, and signed-out create are rejected', () => {
  assert.throws(() => prepareDriverRide(initialRides, valid(), null, null, 'new', now), /Sign in/)
  assert.throws(() => prepareDriverRide(initialRides, valid(), users.hana, 1, 'new', now), /own active rides/)
  assert.throws(() => prepareDriverRide(initialRides, valid(), users.karim, 'missing', 'new', now), /could not be found/)
  const data = rides(); data[0].cancelled = true
  assert.throws(() => prepareDriverRide(data, valid(), users.karim, 1, 'new', now), /own active rides/)
})
test('edit rechecks accepted riders using the unchanged team three-hour rule, including equality', () => {
  const data = rides(), target = data[0]
  data[2].requests = [{ id: 'conflict', riderId: 'marc', seats: 1, status: 'accepted' }]
  data[2].departsAt = new Date(Date.parse(target.departsAt) + 3 * 3600000).toISOString()
  assert.ok(conflictingRide(data, target, 'marc'))
  assert.throws(() => prepareDriverRide(data, rideToForm(target), users.karim, target.id, 'unused', now), /conflict/)
  data[2].departsAt = new Date(Date.parse(target.departsAt) + 3 * 3600000 + 1).toISOString()
  assert.equal(conflictingRide(data, target, 'marc'), undefined)
})
test('existing return-trip destinations remain editable', () => {
  const current = initialRides[4]
  const edited = prepareDriverRide(initialRides, { ...rideToForm(current), price: '2' }, users.karim, 5, 'unused', now)
  assert.equal(edited.to, 'Jbeil'); assert.equal(edited.pickup, current.pickup)
})
test('Driving review closes exactly at departure, or on a cancelled ride', () => {
  const current = initialRides[0], departure = Date.parse(current.departsAt)
  assert.equal(isDriverReviewClosed(current, departure - 1), false)
  assert.equal(isDriverReviewClosed(current, departure), true)
  assert.equal(isDriverReviewClosed({ ...current, cancelled: true }, departure - 1), true)
})
test('supplied passenger capacity wins over explicit Phase 1 demo defaults', () => {
  assert.equal(passengerCapacity(users.karim), 5)
  assert.equal(passengerCapacity({ id: 'registered' }), 4)
  assert.equal(passengerCapacity({ id: 'registered', passengerCapacity: 2 }), 2)
})
