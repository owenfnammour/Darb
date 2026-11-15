import { useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/authContext.js'
import { AuthError } from '../lib/authApi.js'
import { validateRegister, hasErrors, EMAIL_DOMAIN, MIN_PASSWORD_LENGTH } from '../lib/validation.js'
import { afterSignInPath } from '../lib/afterSignIn.js'
import AuthLayout from '../components/auth/AuthLayout.jsx'
import FormField from '../components/auth/FormField.jsx'
import FormAlert from '../components/auth/FormAlert.jsx'
import Button from '../components/Button.jsx'

const emptyForm = { name: '', email: '', password: '', password2: '' }

export default function Register() {
  const { user, register } = useAuth()
  const location = useLocation()
  const [values, setValues] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  function update(field) {
    return (event) => {
      setValues((current) => ({ ...current, [field]: event.target.value }))
      setErrors((current) => ({ ...current, [field]: '' }))
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const found = validateRegister(values)
    setErrors(found)
    if (hasErrors(found)) {
      const firstBad = Object.keys(found).find((field) => found[field])
      document.getElementById(`register-${firstBad}`)?.focus()
      return
    }

    setFormError(null)
    setSubmitting(true)
    try {
      // On success the new user is signed in, and the check below sends them on
      await register({ name: values.name, email: values.email, password: values.password })
    } catch (error) {
      if (error instanceof AuthError && error.code === 'email-taken') {
        // The user knows exactly what to fix, so the message sits on the field
        setErrors((current) => ({ ...current, email: error.message }))
        document.getElementById('register-email')?.focus()
      } else {
        setFormError({ title: 'Something went wrong on our side', detail: 'Try again in a moment.' })
      }
    } finally {
      setSubmitting(false)
    }
  }

  // Signed in (just registered, or already): nothing to do here
  if (user) return <Navigate to={afterSignInPath(location)} replace />

  return (
    <AuthLayout title="Make an account" subtitle="Your university address, so riders know who you are.">
      <form className="space-y-5 px-7 py-6" onSubmit={handleSubmit} noValidate>
        {formError && <FormAlert title={formError.title} detail={formError.detail} />}

        <FormField
          id="register-name"
          label="Full name"
          autoComplete="name"
          placeholder="Hana Ali"
          value={values.name}
          onChange={update('name')}
          error={errors.name}
        />
        <FormField
          id="register-email"
          label="University email"
          type="email"
          autoComplete="email"
          placeholder="hana.ali@lau.edu"
          hint={`Must end in ${EMAIL_DOMAIN}.`}
          value={values.email}
          onChange={update('email')}
          error={errors.email}
        />
        <FormField
          id="register-password"
          label="Password"
          type="password"
          autoComplete="new-password"
          hint={`At least ${MIN_PASSWORD_LENGTH} characters.`}
          value={values.password}
          onChange={update('password')}
          error={errors.password}
        />
        <FormField
          id="register-password2"
          label="Repeat password"
          type="password"
          autoComplete="new-password"
          value={values.password2}
          onChange={update('password2')}
          error={errors.password2}
        />

        <Button type="submit" disabled={submitting} aria-busy={submitting} className="w-full">
          {submitting ? 'Creating account…' : 'Create account'}
        </Button>

        <p className="text-center text-xs text-muted">
          Already have an account?{' '}
          <Link to="/sign-in" state={location.state} className="font-semibold text-brand-800 underline decoration-accent-400 decoration-2 underline-offset-4">
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}
