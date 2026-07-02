import { createContext, useCallback, useContext, useMemo, useState } from 'react'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [refreshToken, setRefreshToken] = useState(0)
  const [message, setMessage] = useState(null)

  const refresh = useCallback(() => {
    setRefreshToken((current) => current + 1)
  }, [])

  const showSuccess = useCallback((text) => {
    setMessage({ type: 'success', text })
  }, [])

  const showError = useCallback((text) => {
    setMessage({ type: 'error', text })
  }, [])

  const clearMessage = useCallback(() => {
    setMessage(null)
  }, [])

  const value = useMemo(
    () => ({
      refreshToken,
      refresh,
      message,
      showSuccess,
      showError,
      clearMessage,
    }),
    [refreshToken, refresh, message, showSuccess, showError, clearMessage],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}
