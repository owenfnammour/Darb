// A pretend server for Phase 1. It keeps users in localStorage.
// In Phase 2 only this file changes: the same functions will call the real API.
import { normalizeEmail } from './validation.js'
import { users } from '../data/rides.js'

// v2: the ids changed to match data/rides.js, so old saved test accounts are ignored
const USERS_KEY = 'darb.users.v2'
const SESSION_KEY = 'darb.session.v2'
const FAKE_DELAY_MS = 400 // so loading states actually show up

// Phase 1 only: passwords are kept in plain text because there is no server.
// Phase 2 must hash them on the server and never send them back.
// Test accounts: every sample user in data/rides.js, with the same id,
// so "who is signed in" matches "who is on the ride".
// Email is firstname.lastname@lau.edu, password is password123.
const seedUsers = Object.values(users).map((u) => ({
  id: u.id,
  name: u.name,
  email: `${u.name.toLowerCase().replace(/\s+/g, '.')}@lau.edu`,
  password: 'password123',
}))

export class AuthError extends Error {
  constructor(code, message) {
    super(message)
    this.code = code
  }
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function readUsers() {
  try {
    const saved = JSON.parse(localStorage.getItem(USERS_KEY))
    return Array.isArray(saved) ? saved : seedUsers
  } catch {
    return seedUsers
  }
}

function writeUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

function initialsOf(name) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')
}

// What the rest of the app is allowed to see: never the password
function toPublicUser(user) {
  return { id: user.id, name: user.name, email: user.email, initials: initialsOf(user.name) }
}

export async function register({ name, email, password }) {
  await wait(FAKE_DELAY_MS)
  const users = readUsers()
  const cleanEmail = normalizeEmail(email)

  if (users.some((u) => u.email === cleanEmail)) {
    throw new AuthError('email-taken', 'An account with this email already exists. Try signing in.')
  }

  const user = { id: crypto.randomUUID(), name: name.trim(), email: cleanEmail, password }
  writeUsers([...users, user])
  localStorage.setItem(SESSION_KEY, user.id)
  return toPublicUser(user)
}

export async function signIn({ email, password }) {
  await wait(FAKE_DELAY_MS)
  const cleanEmail = normalizeEmail(email)
  const user = readUsers().find((u) => u.email === cleanEmail && u.password === password)

  // Same error whether the email or the password was wrong
  if (!user) {
    throw new AuthError('invalid-credentials', 'That email and password do not match')
  }

  localStorage.setItem(SESSION_KEY, user.id)
  return toPublicUser(user)
}

export async function signOut() {
  await wait(FAKE_DELAY_MS / 2)
  localStorage.removeItem(SESSION_KEY)
}

// Who is signed in right now (used when the page loads)
export async function getSession() {
  await wait(FAKE_DELAY_MS / 2)
  const id = localStorage.getItem(SESSION_KEY)
  const user = readUsers().find((u) => u.id === id)
  return user ? toPublicUser(user) : null
}

// Development only: the "Viewing as" switch uses this to become a sample user
// without typing a password. null signs out.
export async function signInAs(id) {
  if (id === null) {
    localStorage.removeItem(SESSION_KEY)
    return null
  }
  const user = readUsers().find((u) => u.id === id)
  if (!user) throw new AuthError('unknown-user', 'There is no test user with that id')
  localStorage.setItem(SESSION_KEY, user.id)
  return toPublicUser(user)
}
