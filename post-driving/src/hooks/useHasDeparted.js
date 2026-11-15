import { useEffect, useState } from 'react';

/** Update at departure even when the driver leaves the page open. */
export function useHasDeparted(departureAt) {
  const departure = Date.parse(departureAt);
  const [now, setNow] = useState(Date.now);

  useEffect(() => {
    let timer;
    function update() {
      const current = Date.now();
      setNow(current);
      if (departure > current) {
        // Browser timeouts are limited to roughly 24.8 days.
        timer = setTimeout(update, Math.min(departure - current, 2 ** 31 - 1));
      }
    }
    update();
    return () => clearTimeout(timer);
  }, [departure]);

  return departure <= now;
}
