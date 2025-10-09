import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

type Profile = {
  id: string
  username: string | null
  display_name: string | null
  avatar_url: string | null
  onboarding_completed: boolean | null
  created_at?: string
  updated_at?: string
}

type AuthContextValue = {
  session: Session | null
  user: User | null
  profile: Profile | null
  isLoading: boolean
  signInWithPassword: (params: { email: string; password: string }) => Promise<{ error?: string }>
  signUpWithPassword: (params: { email: string; password: string; username?: string; displayName?: string }) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  updateProfile: (updates: Partial<Pick<Profile, 'username' | 'display_name' | 'avatar_url' | 'onboarding_completed'>>) => Promise<{ error?: string }>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    ;(async () => {
      const { data } = await supabase.auth.getSession()
      if (!isMounted) return
      setSession(data.session)
      setUser(data.session?.user ?? null)
      setIsLoading(false)
    })()

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      setUser(newSession?.user ?? null)
    })
    return () => {
      isMounted = false
      sub.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!user) {
      setProfile(null)
      return
    }
    refreshProfile()
  }, [user?.id])

  const refreshProfile = async () => {
    if (!user) return
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()
    if (error) {
      // eslint-disable-next-line no-console
      console.warn('Failed to load profile', error.message)
      return
    }
    setProfile((data as Profile) ?? null)
  }

  const signInWithPassword: AuthContextValue['signInWithPassword'] = async ({ email, password }) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message }
    return {}
  }

  const signUpWithPassword: AuthContextValue['signUpWithPassword'] = async ({ email, password, username, displayName }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username: username ?? null, display_name: displayName ?? null } },
    })
    if (error) return { error: error.message }

    const newUser = data.user
    const { data: sess } = await supabase.auth.getSession()
    if (newUser && sess.session) {
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({ id: newUser.id, username: username ?? null, display_name: displayName ?? null })
      if (profileError) {
        // eslint-disable-next-line no-console
        console.warn('Failed to create profile', profileError.message)
      }
    }
    return {}
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setProfile(null)
  }

  const updateProfile: AuthContextValue['updateProfile'] = async (updates) => {
    if (!user) return { error: 'Not authenticated' }
    const { error } = await supabase
      .from('profiles')
      .update({ ...updates })
      .eq('id', user.id)
    if (error) return { error: error.message }
    await refreshProfile()
    return {}
  }

  const value = useMemo<AuthContextValue>(() => ({
    session,
    user,
    profile,
    isLoading,
    signInWithPassword,
    signUpWithPassword,
    signOut,
    refreshProfile,
    updateProfile,
  }), [session, user, profile, isLoading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}


