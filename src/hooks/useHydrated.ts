// src/hooks/useHydrated.ts

import { useEffect, useState } from 'react'

/**
 * Returns true after hydration is complete.
 * Use this to prevent hydration mismatches.
 */
export function useHydrated() {
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setHydrated(true)
  }, [])

  return hydrated
}