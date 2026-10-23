import { useEffect, useState } from 'react'
import { get, sub } from './store'
export function useStore() {
  const [s, setS] = useState(get())
  useEffect(() => sub(setS), [])
  return s
}
