"use client"

import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api"

export function useApi<T>(
  endpoint: string,
  options: {
    immediate?: boolean
    requireAuth?: boolean
    pollInterval?: number
  } = {},
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { immediate = true, requireAuth = false, pollInterval } = options

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      const token = requireAuth ? localStorage.getItem("token") : undefined
      const result = await apiClient.get(endpoint, token)

      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const refetch = () => {
    fetchData()
  }

  useEffect(() => {
    if (immediate) {
      fetchData()
    }
  }, [endpoint, immediate])

  useEffect(() => {
    if (pollInterval && pollInterval > 0) {
      const interval = setInterval(fetchData, pollInterval)
      return () => clearInterval(interval)
    }
  }, [pollInterval])

  return { data, loading, error, refetch }
}
