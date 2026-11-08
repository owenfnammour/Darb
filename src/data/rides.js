// Sample data

export const viewer = { id: 'Ow', initials: 'OW' }

export const rides = [
  {
    id: 1,
    from: 'Jbeil',
    to: 'Byblos campus',
    day: 'Today',
    time: '07:30',
    price: 4,
    driver: { name: 'Karim H.', initials: 'KH' },
    seatsOffered: 5,
    requests: [{ riderId: 'r1', seats: 3, status: 'accepted' }],
  },
  {
    id: 2,
    from: 'Achrafieh',
    to: 'Beirut campus',
    day: 'Today',
    time: '08:00',
    price: 3,
    driver: { name: 'Hana A.', initials: 'HA' },
    seatsOffered: 4,
    requests: [
      { riderId: 'r2', seats: 2, status: 'accepted' },
      { riderId: 'r3', seats: 1, status: 'pending' },
    ],
  },
]
