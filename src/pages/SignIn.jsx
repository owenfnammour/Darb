import { useState } from 'react'
import { useAuth } from '../context/authContext.js'
import { AuthError } from '../lib/authApi.js'
import { validateSignIn, hasErrors } from '../lib/validation.js'
import AuthLayout from '../components/auth/AuthLayout.jsx'
import FormField from '../components/auth/FormField.jsx'
import FormAlert from '../components/auth/FormAlert.jsx'
import Button from '../components/Button.jsx'

const emptyForm = { email: '', password: '' }

// onSignedIn: what to do after success (later: navigate somewhere).
// Passed in from outside so this page doesn't depend on the router yet.
export default function SignIn({ onSignedIn = () => {} }) {
  const { signIn } = useAuth()
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
      const user = await signIn(values)
      onSignedIn(user)
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

        <Button
          type="submit"
          disabled={submitting}
          aria-busy={submitting}
          className={`w-full ${submitting ? 'opacity-60' : ''}`}
        >
          {submitting ? 'Signing in…' : 'Sign in'}
        </Button>

        <p className="text-center text-xs text-muted">
          New here?{' '}
          {/* TODO: becomes <Link to="/register"> once we have the router */}
          <a href="/register" className="font-semibold text-brand-800 underline decoration-accent-400 decoration-2 underline-offset-4">
            Make one
          </a>
        </p>
      </form>
    </AuthLayout>
  )
}