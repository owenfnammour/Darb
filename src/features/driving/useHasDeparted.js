import { useCallback, useSyncExternalStore } from 'react'

export default function useHasDeparted(departsAt) {
  const departure = Date.parse(departsAt)
  const subscribe = useCallback((notify) => {
    let timer
    function update() {
      clearTimeout(timer)
      notify()
      const remaining = departure - Date.now()
      if (remaining > 0) timer = setTimeout(update, Math.min(remaining, 2 ** 31 - 1))
    }
    update()
    window.addEventListener('focus', update)
    return () => { clearTimeout(timer); window.removeEventListener('focus', update) }
  }, [departure])
  const snapshot = useCallback(() => departure <= Date.now(), [departure])
  return useSyncExternalStore(subscribe, snapshot, () => false)
}
