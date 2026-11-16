import { useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/authContext.js'
import { AuthError } from '../lib/authApi.js'
import { validateSignIn, hasErrors } from '../lib/validation.js'
import { afterSignInPath } from '../lib/afterSignIn.js'
import AuthLayout from '../components/auth/AuthLayout.jsx'
import FormField from '../components/auth/FormField.jsx'
import FormAlert from '../components/auth/FormAlert.jsx'
import Button from '../components/Button.jsx'

const emptyForm = { email: '', password: '' }

export default function SignIn() {
  const { user, signIn } = useAuth()
  const location = useLocation()
  const [values, setValues] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  // Typing in a field clears that field's error
  function update(field) {
    return (event) => {
      setValues((current) => ({ ...current, [field]: event.target.value }))
      setErrors((current) => ({ ...current, [field]: '' }))
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const found = validateSignIn(values)
    setErrors(found)
    if (hasErrors(found)) {
      // Put the cursor in the first box that needs fixing
      const firstBad = Object.keys(found).find((field) => found[field])
      document.getElementById(`signin-${firstBad}`)?.focus()
      return
    }

    setFormError(null)
    setSubmitting(true)
    try {
      // On success the user is set, and the check below sends them on
      await signIn(values)
    } catch (error) {
      if (error instanceof AuthError) {
        // Same message for a wrong email or a wrong password
        setFormError({ title: error.message, detail: 'Check both and try again, or reset your password.' })
        setValues((current) => ({ ...current, password: '' }))
      } else {
        setFormError({ title: 'Something went wrong on our side', detail: 'Try again in a moment.' })
      }
    } finally {
      setSubmitting(false)
    }
  }

  // Signed in (just now, or already): nothing to do here
  if (user) return <Navigate to={afterSignInPath(location)} replace />

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to ask for a seat or post a ride.">
      {/* noValidate: use our own messages instead of the browser's popups */}
      <form className="space-y-5 px-7 py-6" onSubmit={handleSubmit} noValidate>
        {formError && <FormAlert title={formError.title} detail={formError.detail} />}

        <FormField
          id="signin-email"
          label="University email"
          type="email"
          autoComplete="email"
          placeholder="hana.ali@lau.edu"
          value={values.email}
          onChange={update('email')}
          error={errors.email}
        />
        <FormField
          id="signin-password"
          label="Password"
          type="password"
          autoComplete="current-password"
          value={values.password}
          onChange={update('password')}
          error={errors.password}
        />

        <Button type="submit" disabled={submitting} aria-busy={submitting} className="w-full">
          {submitting ? 'Signing in…' : 'Sign in'}
        </Button>

        <p className="text-center text-xs text-muted">
          New here?{' '}
          {/* Pass the "from" page along, so registering also brings you back */}
          <Link to="/register" state={location.state} className="font-semibold text-brand-800 underline decoration-accent-400 decoration-2 underline-offset-4">
            Make one
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}
