import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import Button from '../components/Button.jsx'
import RideCard from '../components/RideCard.jsx'
import { Link, useNavigate } from 'react-router-dom'
import { useRides, useViewer } from '../state/context.js'

// name is what the field is called in the address when the form is sent, e.g. /browse?from=Jbeil
const fields = [
  { id: 'h-from', name: 'from', label: 'Leaving from', placeholder: 'Jbeil' },
  { id: 'h-to', name: 'to', label: 'Going to', placeholder: 'Byblos campus' },
  { id: 'h-when', name: 'day', label: 'When', type: 'date' },
]

const steps = [
  { title: 'Post the trip you are making', text: 'Where from, where to, when, and how many seats are going spare.' },
  { title: 'Riders ask, you choose', text: 'Requests come to you. Accept the ones you want, decline the rest.' },
  { title: 'Seats can never oversell', text: 'The moment the last seat is accepted the ride closes itself.' },
]

export default function Home() {
  const { rides } = useRides()
  const { viewer } = useViewer()
  const navigate = useNavigate()
  const leavingSoon = [...rides]
    .filter((ride) => !ride.cancelled)
    .sort((a, b) => new Date(a.departsAt) - new Date(b.departsAt))
    .slice(0, 2)

  return (
    <>
      <Header active="Find a ride" initials={viewer ? viewer.initials : ''} />

      <main className="mx-auto max-w-6xl px-4 py-10">
        {/* Hero section*/}
        <section className="relative overflow-hidden rounded-card border border-line bg-brand-900 px-6 py-12 text-paper sm:px-10 sm:py-16">
          <div className="absolute inset-x-0 bottom-0 h-px bg-accent-400/50" aria-hidden="true"></div>
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-accent-300">
            Byblos &middot; Beirut &middot; everywhere between
          </p>
          <h1 className="mt-4 max-w-2xl font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl">
            Somebody is already driving your way.
          </h1>
          <p className="mt-4 max-w-xl text-base text-paper/70">
            Darb is where students with a spare seat find students without a car. Not a taxi &mdash;
            the driver decides who rides, and whatever it costs is settled between you.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button variant="accent" onClick={() => navigate('/browse')}>Find a seat</Button>
            <Button variant="onDark" onClick={() => navigate('/post')}>Post a ride</Button>
          </div>
        </section>

        {/* Route search section overlapping on the hero section*/}
        <div className="relative z-10 -mt-8 px-2 sm:px-6">
          {/* Sends what was typed to the browse page in the address: /browse?from=...&to=...&day=... */}
          <form
            className="rounded-card border border-line bg-surface p-4 shadow-sm sm:p-5"
            onSubmit={(e) => {
              e.preventDefault()
              navigate('/browse?' + new URLSearchParams(new FormData(e.target)))
            }}
          >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {fields.map(({ id, name, label, type, placeholder }) => (
                <div key={id} className="flex flex-col gap-1.5">
                  <label htmlFor={id} className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</label>
                  <input
                    id={id}
                    name={name}
                    type={type}
                    placeholder={placeholder}
                    className="w-full rounded-card border border-line bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-muted/60 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100"
                  />
                </div>
              ))}
              <div className="flex items-end">
                <Button type="submit" className="w-full">Find seats</Button>
              </div>
            </div>
          </form>
        </div>

        {/* Leaving soon section */}
        <section className="mt-14">
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-display text-2xl font-semibold tracking-tight text-brand-900">Leaving soon</h2>
            <Link to="/browse" className="text-sm font-medium text-brand-700 underline decoration-accent-400 decoration-2 underline-offset-4">
              All rides
            </Link>
          </div>
          <ul className="mt-5 grid gap-4 lg:grid-cols-2">
            {leavingSoon.map((ride) => (
              <RideCard key={ride.id} ride={ride} viewer={viewer} />
            ))}
          </ul>
        </section>

        {/* Concept explanation */}
        <section className="mt-16 grid gap-6 sm:grid-cols-3">
          {steps.map((step, i) => (
            <div key={step.title} className="rounded-card border border-line bg-surface p-6">
              <span className="font-mono text-xs text-accent-600">0{i + 1}</span>
              <h3 className="mt-2 font-display text-lg font-semibold text-brand-900">{step.title}</h3>
              <p className="mt-1.5 text-sm text-muted">{step.text}</p>
            </div>
          ))}
        </section>
      </main>

      <Footer />
    </>
  )
}
