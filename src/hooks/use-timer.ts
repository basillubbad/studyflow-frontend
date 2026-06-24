"use client"

import { useState, useEffect, useCallback, useRef } from "react"

export type TimerState = "idle" | "running" | "paused"

interface UseTimerProps {
  initialTime: number // in seconds
  onComplete?: () => void
}

interface UseTimerReturn {
  time: number
  state: TimerState
  start: () => void
  pause: () => void
  reset: () => void
  setTime: (time: number) => void
}

export function useTimer({ initialTime, onComplete }: UseTimerProps): UseTimerReturn {
  const [time, setTimeState] = useState(initialTime)
  const [state, setState] = useState<TimerState>("idle")
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const onCompleteRef = useRef(onComplete)

  // Keep onComplete ref updated
  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  // Clear interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  // Timer logic
  useEffect(() => {
    if (state === "running" && time > 0) {
      intervalRef.current = setInterval(() => {
        setTimeState((prev) => {
          if (prev <= 1) {
            setState("idle")
            onCompleteRef.current?.()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [state, time])

  const start = useCallback(() => {
    if (time > 0) {
      setState("running")
    }
  }, [time])

  const pause = useCallback(() => {
    setState("paused")
  }, [])

  const reset = useCallback(() => {
    setState("idle")
    setTimeState(initialTime)
  }, [initialTime])

  const setTime = useCallback((newTime: number) => {
    setTimeState(newTime)
  }, [])

  return { time, state, start, pause, reset, setTime }
}
