// Rules for the sign in and register forms.
// Every function returns an error message, or '' when the value is fine.
// No React here on purpose: plain functions are easy to test and reuse in Phase 2.

export const EMAIL_DOMAIN = '@lau.edu'
export const MIN_PASSWORD_LENGTH = 8

// Lowercase and trim, so "Hana.Ali@LAU.edu " and "hana.ali@lau.edu" are the same account
export function normalizeEmail(email) {
  return email.trim().toLowerCase()
}

export function validateName(name) {
  if (name.trim() === '') return 'Enter your full name.'
  return ''
}

export function validateEmail(email) {
  const value = normalizeEmail(email)
  if (value === '') return 'Enter your university email.'
  // something before the @, no spaces, and it must end in @lau.edu
  if (!/^[^\s@]+@lau\.edu$/.test(value)) return `Must end in ${EMAIL_DOMAIN}.`
  return ''
}

export function validatePassword(password) {
  if (password.length < MIN_PASSWORD_LENGTH) return `At least ${MIN_PASSWORD_LENGTH} characters.`
  return ''
}

export function validatePasswordRepeat(password, repeat) {
  if (repeat === '') return 'Repeat your password.'
  if (repeat !== password) return 'Passwords do not match.'
  return ''
}

// Whole register form at once -> { name: '', email: 'Must end in @lau.edu.', ... }
export function validateRegister({ name, email, password, password2 }) {
  return {
    name: validateName(name),
    email: validateEmail(email),
    password: validatePassword(password),
    password2: validatePasswordRepeat(password, password2),
  }
}

// Sign in only checks that both boxes are filled.
// The real rules are not repeated here: the server decides if the pair is right,
// and the error never says which half was wrong.
export function validateSignIn({ email, password }) {
  return {
    email: email.trim() === '' ? 'Enter your email.' : '',
    password: password === '' ? 'Enter your password.' : '',
  }
}

export function hasErrors(errors) {
  return Object.values(errors).some((message) => message !== '')
}