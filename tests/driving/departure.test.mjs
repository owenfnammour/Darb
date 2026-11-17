import test from 'node:test'
import assert from 'node:assert/strict'
import { NOW, initialRides, users } from '../../src/data/rides.js'
import { campusDateTime, hasDeparted, isDriverReviewClosed, prepareDriverRide, rideToForm, validateRide } from '../../src/lib/rideForm.js'
import { reducer } from '../../src/lib/ridesReducer.js'
import { drivingCount } from '../../src/lib/riding.js'

const trip = (offset = 1) => ({
  ...structuredClone(initialRides[0]),
  departsAt: new Date(Number(NOW) + offset).toISOString(),
  seatsOffered: 2,
  requests: [{ id: 'pending', riderId: 'fatme', seats: 1, status: 'pending' }],
})

test('demo samples remain reviewable and editable regardless of the real clock', (t) => {
  t.mock.timers.enable({ apis: ['Date'], now: Date.parse('2040-01-01') })
  const owned = initialRides.filter(ride => ride.driverId === 'karim' && !ride.cancelled && new Date(ride.departsAt) >= NOW)
  assert.equal(drivingCount(initialRides, 'karim'), owned.length)
  assert.ok(owned.length > 0)
  for (const ride of owned) {
    assert.equal(hasDeparted(ride.departsAt), false)
    assert.equal(isDriverReviewClosed(ride), false)
    assert.deepEqual(validateRide(rideToForm(ride), 5, 0, undefined, ride.to), {})
    assert.equal(prepareDriverRide(initialRides, rideToForm(ride), users.karim, ride.id).id, ride.id)
  }
  assert.deepEqual(campusDateTime(), campusDateTime(NOW))
})

test('accept, decline and cancel work before departure using the demo clock', () => {
  const state = [trip()]
  assert.equal(reducer(state, { type: 'accept', rideId: 1, requestId: 'pending' })[0].requests[0].status, 'accepted')
  assert.equal(reducer(state, { type: 'decline', rideId: 1, requestId: 'pending' })[0].requests[0].status, 'declined')
  const cancelled = reducer(state, { type: 'cancelRide', rideId: 1 })[0]
  assert.equal(cancelled.cancelled, true)
  assert.deepEqual(cancelled.requests, state[0].requests)
  assert.equal(state[0].cancelled, false)
})

for (const offset of [0, -1]) {
  test(`departure guard rejects direct reducer actions at NOW ${offset}ms`, () => {
    const state = [trip(offset)]
    assert.equal(hasDeparted(state[0].departsAt), true)
    for (const type of ['accept', 'decline', 'cancelRide']) {
      assert.equal(reducer(state, { type, rideId: 1, requestId: 'pending' }), state)
    }
    const future = { ...state[0], departsAt: '2026-11-03T08:30:00+02:00' }
    assert.equal(reducer(state, { type: 'driver/save', ride: future }), state)
    assert.throws(() => prepareDriverRide(state, rideToForm(future), users.karim, 1), /departed/)
  })
}

test('cancelled rides reject review and stale edits', () => {
  const state = [{ ...trip(), cancelled: true }]
  for (const type of ['accept', 'decline', 'cancelRide']) {
    assert.equal(reducer(state, { type, rideId: 1, requestId: 'pending' }), state)
  }
  assert.equal(reducer(state, { type: 'driver/save', ride: { ...state[0], cancelled: false } }), state)
})

test('filling the car queues pending requests and withdrawal offers freed seats', () => {
  const state = [{ ...trip(), seatsOffered: 1, requests: [
    { id: 'first', riderId: 'fatme', seats: 1, status: 'pending' },
    { id: 'second', riderId: 'owen', seats: 1, status: 'pending' },
  ] }]
  const full = reducer(state, { type: 'accept', rideId: 1, requestId: 'first' })
  assert.deepEqual(full[0].requests.map(r => r.status), ['accepted', 'waitlisted'])
  const freed = reducer(full, { type: 'withdraw', rideId: 1, riderId: 'fatme' })
  assert.deepEqual(freed[0].requests.map(r => r.status), ['withdrawn', 'pending'])
})
