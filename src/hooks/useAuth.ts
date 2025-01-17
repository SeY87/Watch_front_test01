import { useEffect, useState } from 'react'
import { useSupabase } from './useSupabase'
import { User } from '@supabase/supabase-js'

export const useAuth = () => {
  const supabase = useSupabase()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setIsAuthenticated(!!session)
      setUser(session?.user || null)
    }
    
    checkAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session)
      setUser(session?.user || null)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  return { isAuthenticated, user }
} 