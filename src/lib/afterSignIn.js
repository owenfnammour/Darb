// Where to go once someone has signed in or registered:
// back to the page that sent them to sign in, or home.
// Never back to /sign-in or /register themselves, or the page would loop.
export function afterSignInPath(location) {
  const from = location.state?.from
  if (!from || from === '/sign-in' || from === '/register') return '/'
  return from
}
