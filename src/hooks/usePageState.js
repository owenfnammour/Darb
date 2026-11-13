import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

// Stands in for a fetch: 'loading' first, then 'ready'. Add ?state=loading or ?state=error to
// the address to see those states on purpose.
export default function usePageState(delay = 450) {
  const [params, setParams] = useSearchParams()
  const [attempt, setAttempt] = useState(0)
  const [readyAttempt, setReadyAttempt] = useState(-1)
  const forced = params.get('state')

  useEffect(() => {
    const timer = setTimeout(() => setReadyAttempt(attempt), delay)
    return () => clearTimeout(timer)
  }, [attempt, delay])

  let status = readyAttempt === attempt ? 'ready' : 'loading'
  if (forced === 'loading') status = 'loading'
  if (forced === 'error') status = 'error'

  function retry() {
    setParams({}, { replace: true })
    setAttempt((a) => a + 1)
  }

  return { status, retry }
}
