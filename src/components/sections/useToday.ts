import { useEffect, useState } from "react"
import { localToday } from "@/lib/calendar"

export function useToday(initial: string) {
  const [today, setToday] = useState(initial)
  useEffect(() => setToday(localToday()), [])
  return today
}
