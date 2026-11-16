import { useRef, useState } from 'react';
import { useBlocker, useBeforeUnload, useNavigate } from 'react-router-dom';
import { useCallback } from 'react';
import { CAMPUSES, campusDateTime, emptyRideForm, passengerCapacity, rideToForm, validateRide } from '../lib/rideForm.js';
import { seatCount } from '../data/seats.js';
import { useRides, useViewer } from '../state/context.js';
import { ConfirmDialog } from './ConfirmDialog.jsx';
import Button from './Button.jsx';


function Field({ name, label, hint, error, children }) {
  return <div className="flex min-w-0 flex-col gap-1.5">
    <label htmlFor={`ride-${name}`} className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</label>
    {children}
    {(error || hint) && <p id={`ride-${name}-message`} className={`text-xs ${error ? 'font-medium text-red-700' : 'text-muted'}`}>{error || hint}</p>}
  </div>;
}

export function RideForm({ ride }) {
  const { saveRide } = useRides();
  const { viewer } = useViewer();
  const capacity = passengerCapacity(viewer);
  const navigate = useNavigate();
  const [initial] = useState(() => ride ? rideToForm(ride) : emptyRideForm());
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const allowNavigation = useRef(false);
  const inFlight = useRef(false);
  const form = useRef(null);
  const dirty = JSON.stringify(values) !== JSON.stringify(initial);
  const accepted = ride ? seatCount(ride).taken : 0;
  const validate = next => validateRide(next, capacity, accepted, undefined, ride?.to);
  const blocker = useBlocker(({ currentLocation, nextLocation }) => !allowNavigation.current && (dirty || inFlight.current)
    && `${currentLocation.pathname}${currentLocation.search}` !== `${nextLocation.pathname}${nextLocation.search}`);
  useBeforeUnload(useCallback(event => {
    if ((dirty || inFlight.current) && !allowNavigation.current) { event.preventDefault(); event.returnValue = ''; }
  }, [dirty]));

  function change(event) {
    const next = { ...values, [event.target.name]: event.target.value };
    setValues(next);
    setSaveError('');
    if (submitted) setErrors(validate(next));
    else if (errors[event.target.name]) setErrors(previous => ({ ...previous, [event.target.name]: validate(next)[event.target.name] }));
  }
  function inputProps(name, hint) {
    return {
      id: `ride-${name}`, name, value: values[name], onChange: change,
      onBlur: () => setErrors(previous => ({ ...previous, [name]: validate(values)[name] })),
      'aria-invalid': Boolean(errors[name]), 'aria-describedby': errors[name] || hint ? `ride-${name}-message` : undefined,
      className: `w-full rounded-card border bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-muted/60 focus:outline-hidden focus:ring-4 ${errors[name] ? 'border-red-500 focus:border-red-600 focus:ring-red-100' : 'border-line focus:border-brand-500 focus:ring-brand-100'}`,
    };
  }
  async function submit(event) {
    event.preventDefault();
    if (inFlight.current) return;
    setSubmitted(true);
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      form.current.elements.namedItem(Object.keys(nextErrors)[0])?.focus();
      return;
    }
    inFlight.current = true;
    setSaving(true);
    setSaveError('');
    try {
      await saveRide(values, ride?.id);
      allowNavigation.current = true;
      navigate('/my-rides/driving');
    } catch (failure) { setSaveError(failure.message); }
    finally { inFlight.current = false; setSaving(false); }
  }
  const count = Object.values(errors).filter(Boolean).length;
  return <>
    <form ref={form} onSubmit={submit} noValidate className="mt-8 max-w-3xl space-y-7" aria-label={ride ? 'Edit ride' : 'Post a ride'}>
      <fieldset disabled={saving} className="min-w-0 space-y-7">
        <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
          <Field name="origin" label="Leaving from" hint="A place riders will recognise, not an address." error={errors.origin}>
            <input {...inputProps('origin', true)} type="text" autoComplete="off" maxLength={100} required />
          </Field>
          <Field name="destination" label="Going to" error={errors.destination}>
            <select {...inputProps('destination')} required>{[...new Set([...CAMPUSES, ...(ride ? [ride.to] : [])])].map(campus => <option key={campus}>{campus}</option>)}</select>
          </Field>
          <Field name="date" label="Date" error={errors.date}>
            <input {...inputProps('date')} type="date" min={campusDateTime().date} required />
          </Field>
          <Field name="time" label="Departs" error={errors.time}>
            <input {...inputProps('time')} type="time" required />
          </Field>
          <Field name="offeredSeats" label="Seats going spare" hint={`Your car seats ${capacity} passengers.${accepted ? ` ${accepted} seats are already accepted.` : ''}`} error={errors.offeredSeats}>
            <input {...inputProps('offeredSeats', true)} type="number" min={Math.max(1, accepted)} max={capacity} step="1" required />
          </Field>
          <Field name="price" label="Price a seat" hint="USD. What the trip costs you, split. Settled between you." error={errors.price}>
            <input {...inputProps('price', true)} type="number" min="0" step="0.01" required />
          </Field>
        </div>
        <Field name="notes" label="Anything riders should know" hint="Optional." error={errors.notes}>
          <textarea {...inputProps('notes', true)} rows={3} maxLength={2000} placeholder="Pickup point, luggage, whether you come back the same day" />
        </Field>
      </fieldset>
      {saveError && <p role="alert" className="rounded-card border border-red-100 bg-red-50 p-4 text-sm text-red-800">{saveError}</p>}
      <div className="flex flex-wrap items-center gap-3 border-t border-line pt-6">
        <Button type="submit" disabled={saving}>{saving ? 'Saving…' : ride ? 'Save changes' : 'Post the ride'}</Button>
        <Button type="button" variant="ghost" disabled={saving} onClick={() => navigate('/my-rides/driving')}>Cancel</Button>
        <p aria-live="polite" className="ml-auto text-xs font-medium text-red-700">{count > 0 ? `${count} ${count === 1 ? 'field needs' : 'fields need'} attention` : ''}</p>
      </div>
    </form>
    <ConfirmDialog open={blocker.state === 'blocked'} title={ride ? 'Leave without saving?' : 'Leave without posting?'}
      busy={saving} onCancel={() => blocker.reset?.()} onConfirm={() => blocker.proceed?.()}>
      You have unsaved changes. Nothing is saved until you {ride ? 'save your changes' : 'post it'}.
    </ConfirmDialog>
  </>;
}
