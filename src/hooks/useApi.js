/**
 * Custom Hooks for API Calls
 * Reusable hooks for common API operations
 */

import { useState, useEffect, useCallback } from 'react'
import { formatApiError } from '../utils/apiErrorHandler'

/**
 * Hook for API calls with loading and error states
 * @param {Function} apiFunction - API function to call
 * @param {boolean} immediate - Whether to call immediately on mount
 * @returns {Object} { data, loading, error, execute, reset }
 */
export const useApi = (apiFunction, immediate = false) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const execute = useCallback(
    async (...args) => {
      try {
        setLoading(true)
        setError(null)
        const result = await apiFunction(...args)
        setData(result)
        return result
      } catch (err) {
        const errorMessage = formatApiError(err)
        setError(errorMessage)
        throw new Error(errorMessage)
      } finally {
        setLoading(false)
      }
    },
    [apiFunction]
  )

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (immediate) {
      execute()
    }
  }, [immediate, execute])

  return { data, loading, error, execute, reset }
}

/**
 * Hook for paginated API calls
 * @param {Function} apiFunction - API function that accepts skip/limit
 * @param {number} pageSize - Items per page
 * @returns {Object} Pagination state and controls
 */
export const usePagination = (apiFunction, pageSize = 20) => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)

  const loadPage = useCallback(
    async (pageNumber) => {
      try {
        setLoading(true)
        setError(null)

        const skip = pageNumber * pageSize
        const result = await apiFunction({ skip, limit: pageSize })

        if (Array.isArray(result)) {
          setData(result)
          setHasMore(result.length === pageSize)
        } else {
          setData([])
          setHasMore(false)
        }

        setPage(pageNumber)
      } catch (err) {
        setError(formatApiError(err))
      } finally {
        setLoading(false)
      }
    },
    [apiFunction, pageSize]
  )

  const nextPage = useCallback(() => {
    if (hasMore && !loading) {
      loadPage(page + 1)
    }
  }, [page, hasMore, loading, loadPage])

  const prevPage = useCallback(() => {
    if (page > 0 && !loading) {
      loadPage(page - 1)
    }
  }, [page, loading, loadPage])

  const reset = useCallback(() => {
    loadPage(0)
  }, [loadPage])

  useEffect(() => {
    loadPage(0)
  }, [loadPage])

  return {
    data,
    loading,
    error,
    page,
    hasMore,
    nextPage,
    prevPage,
    reset,
    reload: () => loadPage(page),
  }
}

/**
 * Hook for data polling
 * @param {Function} apiFunction - API function to poll
 * @param {number} interval - Polling interval in ms
 * @param {boolean} enabled - Whether polling is enabled
 * @returns {Object} { data, loading, error }
 */
export const usePolling = (apiFunction, interval = 5000, enabled = true) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!enabled) return

    const fetchData = async () => {
      try {
        setLoading(true)
        const result = await apiFunction()
        setData(result)
        setError(null)
      } catch (err) {
        setError(formatApiError(err))
      } finally {
        setLoading(false)
      }
    }

    // Initial fetch
    fetchData()

    // Set up polling
    const intervalId = setInterval(fetchData, interval)

    return () => clearInterval(intervalId)
  }, [apiFunction, interval, enabled])

  return { data, loading, error }
}

/**
 * Hook for debounced API calls (useful for search)
 * @param {Function} apiFunction - API function to call
 * @param {number} delay - Debounce delay in ms
 * @returns {Object} { data, loading, error, execute }
 */
export const useDebouncedApi = (apiFunction, delay = 500) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [timeoutId, setTimeoutId] = useState(null)

  const execute = useCallback(
    (...args) => {
      // Clear existing timeout
      if (timeoutId) {
        clearTimeout(timeoutId)
      }

      setLoading(true)

      // Set new timeout
      const newTimeoutId = setTimeout(async () => {
        try {
          const result = await apiFunction(...args)
          setData(result)
          setError(null)
        } catch (err) {
          setError(formatApiError(err))
        } finally {
          setLoading(false)
        }
      }, delay)

      setTimeoutId(newTimeoutId)
    },
    [apiFunction, delay, timeoutId]
  )

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [timeoutId])

  return { data, loading, error, execute }
}
