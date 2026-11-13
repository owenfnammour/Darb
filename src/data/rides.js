// Sample data (Phase 1 has no API yet, so this is the "database").
// Rides store the driver by id and every request on the ride. Seats left is never stored,
// it is worked out from the accepted requests (see seats.js).

// A fixed "now" so the sample rides always read as upcoming.
export const NOW = new Date('2026-11-02T06:00:00')

export const users = {
  karim: { id: 'karim', name: 'Karim Hawa', initials: 'KH', major: 'Computer Science', routine: 'drives Jbeil → Byblos most weekdays', ridesDriven: 14, seatsShared: 41, onTime: 93, memberSince: 'Sep 2025' },
  fatme: { id: 'fatme', name: 'Fatme Akar', initials: 'FA', major: 'Business', routine: 'drives to Beirut campus on Mondays', ridesDriven: 6, seatsShared: 15, onTime: 88, memberSince: 'Jan 2026' },
  hana: { id: 'hana', name: 'Hana Ali', initials: 'HA' },
  owen: { id: 'owen', name: 'Owen Nammour', initials: 'ON' },
  saad: { id: 'saad', name: 'Saad Eldin', initials: 'SE' },
  marc: { id: 'marc', name: 'Marc Hebbo', initials: 'MH' },
  njteh: { id: 'njteh', name: 'Njteh Balian', initials: 'NB' },
  lea: { id: 'lea', name: 'Lea Haddad', initials: 'LH' },
  rami: { id: 'rami', name: 'Rami Khoury', initials: 'RK' },
}

// Who you can browse as until real sign-in exists (null = signed out)
export const viewerChoices = ['hana', 'karim', 'owen', 'fatme', null]

export const initialRides = [
  {
    id: 1,
    from: 'Jbeil',
    to: 'Byblos campus',
    departsAt: '2026-11-02T07:30:00',
    price: 4,
    driverId: 'karim',
    seatsOffered: 5,
    pickup: 'Jbeil highway entrance, by the Total station.',
    notes: 'Parking at the north gate. Back around 17:00 if anyone wants the return.',
    cancelled: false,
    requests: [
      { id: 'r1', riderId: 'marc', seats: 1, status: 'accepted', message: '' },
      { id: 'r2', riderId: 'njteh', seats: 1, status: 'accepted', message: '' },
      { id: 'r3', riderId: 'saad', seats: 1, status: 'accepted', message: '' },
      { id: 'r4', riderId: 'fatme', seats: 1, status: 'pending', message: 'Can you drop me at the roundabout?' },
      { id: 'r5', riderId: 'owen', seats: 2, status: 'pending', message: 'Me and a friend, if there is room.' },
    ],
  },
  {
    id: 2,
    from: 'Achrafieh',
    to: 'Beirut campus',
    departsAt: '2026-11-02T08:00:00',
    price: 3,
    driverId: 'fatme',
    seatsOffered: 4,
    pickup: 'Sassine square, outside the pharmacy.',
    notes: 'Small car, small bags please.',
    cancelled: false,
    requests: [
      { id: 'r6', riderId: 'lea', seats: 2, status: 'accepted', message: '' },
      { id: 'r7', riderId: 'rami', seats: 2, status: 'accepted', message: '' },
      { id: 'r8', riderId: 'marc', seats: 1, status: 'waitlisted', message: '' },
      { id: 'r9', riderId: 'hana', seats: 1, status: 'waitlisted', message: '' },
    ],
  },
  {
    id: 3,
    from: 'Byblos campus',
    to: 'Jbeil',
    departsAt: '2026-11-02T09:30:00',
    price: 4,
    driverId: 'fatme',
    seatsOffered: 3,
    pickup: 'North gate of the campus.',
    notes: '',
    cancelled: false,
    requests: [{ id: 'r10', riderId: 'owen', seats: 1, status: 'accepted', message: '' }],
  },
  {
    id: 4,
    from: 'Jbeil',
    to: 'Byblos campus',
    departsAt: '2026-11-04T07:30:00',
    price: 4,
    driverId: 'karim',
    seatsOffered: 5,
    pickup: 'Jbeil highway entrance, by the Total station.',
    notes: 'Parking at the north gate.',
    cancelled: false,
    requests: [{ id: 'r11', riderId: 'saad', seats: 1, status: 'accepted', message: '' }],
  },
  {
    id: 5,
    from: 'Byblos campus',
    to: 'Jbeil',
    departsAt: '2026-11-04T17:00:00',
    price: 4,
    driverId: 'karim',
    seatsOffered: 5,
    pickup: 'North gate of the campus.',
    notes: '',
    cancelled: false,
    requests: [],
  },
]

// Dates are always formatted from departsAt, never stored as text.
function startOfDay(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

export function dayLabel(ride) {
  const d = new Date(ride.departsAt)
  const diff = Math.round((startOfDay(d) - startOfDay(NOW)) / 86400000)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
}

export function longDate(ride) {
  return new Date(ride.departsAt).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
}

export function shortDate(ride) {
  return new Date(ride.departsAt).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
}

export function timeLabel(ride) {
  return new Date(ride.departsAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}
