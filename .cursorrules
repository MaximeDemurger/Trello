# React Native + Expo + Supabase Cursor Rules

This document outlines comprehensive guidelines for building React Native applications using Expo, Supabase, TypeScript, and React Reanimated. These rules are based on production-ready patterns and best practices.

## Table of Contents

1. [Technology Stack](#technology-stack)
2. [Project Structure](#project-structure)
3. [Code Standards](#code-standards)
4. [Component Architecture](#component-architecture)
5. [Styling with Unistyles](#styling-with-unistyles)
6. [Database & Supabase Integration](#database--supabase-integration)
7. [Data Fetching with React Query](#data-fetching-with-react-query)
8. [Custom Hooks Patterns](#custom-hooks-patterns)
9. [Animation Guidelines](#animation-guidelines)
10. [Navigation Patterns](#navigation-patterns)
11. [Error Handling](#error-handling)
12. [Internationalization](#internationalization)
13. [State Management](#state-management)
14. [Performance Best Practices](#performance-best-practices)
15. [Security Guidelines](#security-guidelines)

## Technology Stack

### Core Dependencies
- **React Native**: 0.81.4+ with new architecture enabled
- **Expo**: ^54.0.0 with managed workflow
- **TypeScript**: ~5.9.2 for type safety
- **Supabase**: ^2.57.4 for backend services
- **React Query**: ^5.90.1 for data fetching and caching
- **React Reanimated**: ~4.1.0 for animations
- **React Native Unistyles**: ^3.0.13 for styling

### Essential Libraries
```json
{
  "@tanstack/react-query": "^5.90.1",
  "@supabase/supabase-js": "^2.57.4",
  "react-native-reanimated": "~4.1.0",
  "react-native-unistyles": "^3.0.13",
  "react-native-safe-area-context": "~5.6.0",
  "react-i18next": "^15.7.3",
  "react-native-mmkv": "^3.3.3",
  "zustand": "^5.0.8",
  "expo-notifications": "~0.32.11",
  "expo-location": "~19.0.7",
  "react-native-toast-message": "^2.3.3"
}
```

## Project Structure

```
app/
├── components/           # Reusable UI components
│   ├── FloatingActionbutton/
│   │   └── FloatingActionButton.tsx
│   ├── FoodItemCard/
│   │   └── FoodItemCard.tsx
│   ├── PremiumCard/
│   │   └── PremiumCard.tsx
│   └── index.ts         # Central exports
├── hooks/               # Custom React hooks
├── navigation/          # Navigation configuration
├── providers/           # React context providers
├── screens/             # Screen components
│   ├── FridgeScreen/
│   │   └── FridgeScreen.tsx
│   ├── ListScreen/
│   │   └── ListScreen.tsx
│   ├── OnboardingScreen/
│   │   ├── OnboardingScreen.tsx
│   │   └── pages/       # Sub-pages for complex screens
│   │       ├── OnboardingPageOne.tsx
│   │       ├── OnboardingPageTwo.tsx
│   │       ├── OnboardingPageThree.tsx
│   │       └── index.ts
│   ├── ProfileScreen/
│   │   └── ProfileScreen.tsx
│   ├── RecipesScreen/
│   │   └── RecipesScreen.tsx
│   └── index.ts         # Central exports
├── services/           # API services and business logic
├── storage/            # Local storage utilities
├── svg/                # SVG components
├── localization/       # i18n configuration
├── utils/              # Utility functions
└── unistyles.ts        # Design tokens and theme
```

### Folder Structure Rules

1. **Components**: Each component gets its own folder with:
   - `ComponentName/ComponentName.tsx` - Main component file
   - Clean, descriptive folder names matching component names
   - Central `index.ts` file in `components/` for exports
   - Example: `FloatingActionbutton/FloatingActionButton.tsx`

2. **Screens**: Each screen gets its own folder with:
   - `ScreenName/ScreenName.tsx` - Main screen file
   - For complex screens, use sub-folders like `pages/` for multi-step flows
   - Central `index.ts` file in `screens/` for exports
   - Example: `OnboardingScreen/OnboardingScreen.tsx` with `pages/` subfolder

3. **Services**: Group by feature/domain:
   - `users.ts`, `relationships.ts`, `notifications.ts`
   - Each service exports typed functions
   - Include proper error handling

4. **Hooks**: Custom hooks with clear naming:
   - `useAuth.ts`, `useProfile.ts`, `useNotifications.ts`
   - Follow React Query patterns for data hooks

5. **Central Exports**: Always maintain `index.ts` files for clean imports:
   ```typescript
   // app/components/index.ts
   export { FoodItemCard } from './FoodItemCard/FoodItemCard'
   export { FloatingActionButton } from './FloatingActionbutton/FloatingActionButton'
   export { PremiumCard } from './PremiumCard/PremiumCard'
   
   // app/screens/index.ts
   export { FridgeScreen } from "./FridgeScreen/FridgeScreen"
   export { ListScreen } from "./ListScreen/ListScreen"
   export { OnboardingScreen } from "./OnboardingScreen/OnboardingScreen"
   export { ProfileScreen } from "./ProfileScreen/ProfileScreen"
   export { RecipesScreen } from "./RecipesScreen/RecipesScreen"
   ```

## Code Standards

### Naming Conventions

```typescript
// Functions/Variables: camelCase
const getUserProfile = async () => {}
const isLoading = true

// Constants: UPPER_SNAKE_CASE
const API_BASE_URL = 'https://api.example.com'
const MAX_RETRY_ATTEMPTS = 3

// Types/Interfaces: PascalCase
type UserProfile = {
  id: string
  username: string
}

// Components: PascalCase
export const UserProfileCard = () => {}
```

### TypeScript Guidelines

```typescript
// ✅ Prefer types over interfaces
type ButtonProps = {
  variant?: ButtonVariant
  disabled?: boolean
  onPress?: () => void
  children?: React.ReactNode
}

// ✅ Use type inference whenever possible
const [isLoading, setIsLoading] = useState(false) // Boolean inferred

// ✅ Strict typing with database types
type User = Database["public"]["Tables"]["users"]["Row"]
type UserInsert = Database["public"]["Tables"]["users"]["Insert"]

// ❌ Avoid any, unknown, or generic types
const handleData = (data: any) => {} // Don't do this

// ✅ Use proper error typing
type ServiceResult<T> = {
  data: T | null
  error: string | null
}
```

### Code Formatting

```typescript
// ✅ Use spaces between code blocks for readability
export const UserService = {
  async getProfile(userId: string): Promise<ServiceResult<User>> {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single()

      if (error) {
        return { data: null, error: error.message }
      }

      return { data, error: null }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : "Unknown error"
      }
    }
  }
}
```

## Component Architecture

### Component Structure Pattern

```typescript
import React, { forwardRef } from 'react'
import { Pressable, Text, ViewStyle, TextStyle, StyleProp } from 'react-native'
import { ButtonPreset } from './Button.preset'

type ButtonVariant = keyof typeof ButtonPreset

type ButtonProps = {
  variant?: ButtonVariant
  disabled?: boolean
  onPress?: () => void
  children?: React.ReactNode
  containerStyle?: StyleProp<ViewStyle>
  textStyle?: StyleProp<TextStyle>
}

const defaultVariant: ButtonVariant = 'normal'

export const Button: React.FC<ButtonProps> = ({
  variant = defaultVariant,
  disabled,
  onPress,
  children,
  containerStyle,
  textStyle,
}) => {
  const preset = ButtonPreset[variant]

  const handlePress = () => {
    if (!disabled && onPress) {
      onPress()
    }
  }

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={handlePress}
      style={({ pressed }) => [
        preset.container,
        disabled && { opacity: 0.5 },
        pressed && { opacity: 0.8 },
        containerStyle,
      ]}
    >
      {typeof children === 'string' ? (
        <Text style={[preset.text, textStyle]}>{children}</Text>
      ) : (
        children
      )}
    </Pressable>
  )
})

Button.displayName = 'Button'
```

### Component Guidelines

1. **React 19+ Optimization**: With React 19's compiler, manual `React.memo` is often unnecessary due to automatic memoization
2. **Use `forwardRef`** when exposing imperative APIs
3. **Include `displayName`** for debugging
4. **Handle loading and error states** explicitly
5. **Use proper accessibility props** (`accessibilityRole`, `accessibilityLabel`)
6. **Manual memoization** only when needed for complex state dependencies or third-party library integration

### Preset Pattern for Styling

```typescript
// Button.preset.ts
import { UnistylesRuntime } from 'react-native-unistyles'

const theme = UnistylesRuntime.getTheme()

const baseContainer = {
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
  height: theme.components.button.height.md,
  paddingHorizontal: theme.spacing(3),
}

const baseText = {
  fontSize: theme.fontSize.xl,
  fontFamily: theme.font.bold,
  textAlign: 'center' as const,
}

export const ButtonPreset = {
  normal: {
    container: {
      ...baseContainer,
      backgroundColor: theme.colors.blue,
      borderRadius: theme.radius('xxl'),
    },
    text: {
      ...baseText,
      color: theme.colors.white,
    },
  },
  secondary: {
    container: {
      ...baseContainer,
      backgroundColor: theme.colors.royalBlue,
      borderRadius: theme.radius('xxl'),
      shadowColor: theme.colors.royalBlue,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.3,
      shadowRadius: 15,
      elevation: 10,
    },
    text: {
      ...baseText,
      color: theme.colors.white,
    },
  },
} as const
```

## Safe Area Handling

### 🚨 CRITICAL: SafeAreaView Usage Rules

**NEVER use SafeAreaView from react-native - IT IS DEPRECATED:**
- ❌ `import { SafeAreaView } from 'react-native'` - This is deprecated
- ❌ Using React Native's built-in SafeAreaView

**ALWAYS use react-native-safe-area-context:**
- ✅ `import { SafeAreaView } from 'react-native-safe-area-context'`
- ✅ Wrap your app with `SafeAreaProvider`
- ✅ Use proper safe area handling

### Setup Pattern

```typescript
// App.tsx - REQUIRED SafeAreaProvider setup
import React from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { AppNavigator } from './navigation/AppNavigator'

export default function App() {
  return (
    <SafeAreaProvider>
      <AppNavigator />
    </SafeAreaProvider>
  )
}
```

### Screen Component Pattern

```typescript
// ✅ CORRECT - Using react-native-safe-area-context
import React from 'react'
import { View, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StyleSheet } from 'react-native-unistyles'

export const MyScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text>Screen content</Text>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
}))
```

### Safe Area Hook Usage

```typescript
// For custom safe area handling
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export const CustomComponent = () => {
  const insets = useSafeAreaInsets()
  
  return (
    <View 
      style={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}
    >
      {/* Content */}
    </View>
  )
}
```

### Safe Area Best Practices

1. **Always wrap your root app** with `SafeAreaProvider`
2. **Use SafeAreaView for full-screen components** like screens
3. **Use useSafeAreaInsets hook** for custom safe area handling
4. **Test on devices with notches** (iPhone X+, Android with notches)
5. **Consider landscape orientation** safe areas

## Styling with Unistyles

### 🚨 CRITICAL: Unistyles 3.0 Usage Rules

**NEVER use the following deprecated patterns:**
- ❌ `useStyles` hook - This is NOT available in Unistyles 3.0
- ❌ `createStyleSheet` - Use `StyleSheet.create` instead
- ❌ `const { styles, theme } = useStyles(stylesheet)` - This pattern is obsolete

**ALWAYS use the correct Unistyles 3.0 pattern:**
```typescript
// ✅ CORRECT - Unistyles 3.0 Pattern
import { StyleSheet } from 'react-native-unistyles'

const styles = StyleSheet.create((theme) => ({
  container: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
  }
}))

// Usage in component - NO HOOKS NEEDED
export const MyComponent = () => {
  return <View style={styles.container} />
}
```

**Key Unistyles 3.0 Facts:**
- ✅ No hooks required for basic styling
- ✅ Direct style object usage
- ✅ Theme access via `(theme) => ({ ... })` callback
- ✅ Automatic re-rendering when theme changes
- ✅ Better performance than hook-based approach

### Unistyles Documentation Reference

**IMPORTANT**: Always reference the comprehensive Unistyles documentation for LLMs when implementing styling features: https://www.unistyl.es/llms-full.txt

This documentation contains complete usage examples, API references, and best practices for:
- Configuration setup (themes, breakpoints, settings)
- StyleSheet.create() patterns with variants and responsive design
- Runtime integration and theme switching
- Performance optimization
- Integration with React Native components
- Advanced features like withUnistyles HOC

### Design System Configuration

```typescript
// unistyles.ts
import { StyleSheet } from "react-native-unistyles"

// Design Tokens
const spacing = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32
} as const

const borderRadius = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, full: 9999
} as const

const typography = {
  fontFamily: {
    regular: "Manrope-Regular",
    medium: "Manrope-Medium",
    semiBold: "Manrope-SemiBold",
    bold: "Manrope-Bold",
  },
  fontSize: {
    xs: 8, sm: 10, base: 11, md: 12, lg: 14, 
    xl: 16, xxl: 18, xxxl: 20, xxxxl: 24
  }
} as const

// Theme Definition
const lightTheme = {
  colors: {
    blue: "rgb(19, 19, 236)",
    white: "rgb(255, 255, 255)",
    black: "rgb(0, 0, 0)",
    // ... more colors
  },
  
  // Helper functions
  spacing: (multiplier: number) => multiplier * 8,
  radius: (size: keyof typeof borderRadius) => borderRadius[size],
  font: typography.fontFamily,
  fontSize: typography.fontSize,

  // Component tokens
  components: {
    button: {
      height: { sm: 40, md: 50, lg: 62 },
      padding: { sm: spacing.md, md: spacing.lg }
    },
    input: {
      height: 48,
      padding: spacing.md,
      borderRadius: borderRadius.sm,
    }
  }
}

// Configure Unistyles
StyleSheet.configure({
  themes: { light: lightTheme },
  settings: { adaptiveThemes: true }
})
```

### Styling Best Practices

1. **Use design tokens** instead of hardcoded values
2. **Implement consistent spacing** with the spacing function
3. **Define component-specific tokens** for reusability
4. **Use semantic color names** that reflect purpose

## Database & Supabase Integration

### Database Types Generation

```bash
# Generate types from Supabase schema
npx supabase gen types typescript --project-id your-project-id --schema public > app/services/database.types.ts
```

### Supabase Client Setup

```typescript
// utils/supabase.ts
import AsyncStorage from "@react-native-async-storage/async-storage"
import { createClient } from "@supabase/supabase-js"
import { Database } from "@/services/database.types"

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!
const supabasePublishableKey = process.env.EXPO_PUBLIC_SUPABASE_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabasePublishableKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
```

### Service Layer Pattern

```typescript
// services/users.ts
import { supabase } from "@/utils/supabase"
import { Database } from "./database.types"

type User = Database["public"]["Tables"]["users"]["Row"]
type UserInsert = Database["public"]["Tables"]["users"]["Insert"]

export type ServiceResult<T> = {
  data: T | null
  error: string | null
}

export const getUserProfile = async (userId: string): Promise<ServiceResult<User>> => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return {
      data: null,
      error: error instanceof Error ? error.message : "Unknown error"
    }
  }
}

export const updateUserProfile = async (
  updates: Partial<Omit<User, "id" | "created_at" | "updated_at">>
): Promise<ServiceResult<boolean>> => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { data: null, error: "User not authenticated" }
    }

    const { error } = await supabase
      .from("users")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", user.id)

    if (error) {
      return { data: null, error: error.message }
    }

    return { data: true, error: null }
  } catch (error) {
    console.error("Error updating user profile:", error)
    return {
      data: null,
      error: error instanceof Error ? error.message : "Unknown error"
    }
  }
}
```

### Database Guidelines

1. **Always use typed queries** with generated types
2. **Implement proper error handling** with ServiceResult pattern
3. **Use RLS (Row Level Security)** for data protection
4. **Create database views** for complex queries
5. **Use database functions** for complex business logic

## Data Fetching with React Query

### Query Client Configuration

```typescript
// providers/QueryProvider.tsx
import React, { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 10, // 10 minutes
      gcTime: 1000 * 60 * 60, // 1 hour
      retry: 2,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: false,
      notifyOnChangeProps: ['data', 'error', 'isLoading'],
    },
    mutations: {
      retry: 1,
      gcTime: 1000 * 60 * 5, // 5 minutes
    },
  },
})

export const QueryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
```

### Query Hooks Pattern

```typescript
// hooks/useProfile.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getCurrentUserProfile, updateCurrentUserProfile } from '@/services/users'
import { showErrorToast, showSuccessToast } from '@/utils/toast'

export const useProfile = () => {
  const queryClient = useQueryClient()

  // Query for fetching current user profile
  const profileQuery = useQuery({
    queryKey: ['profile', 'current'],
    queryFn: async () => {
      const { data, error } = await getCurrentUserProfile()
      if (error) throw new Error(error)
      return data
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 2 * 60 * 60 * 1000, // 2 hours
    refetchOnMount: false,
  })

  // Mutation for updating profile
  const updateProfileMutation = useMutation({
    mutationFn: updateCurrentUserProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', 'current'] })
      showSuccessToast('Profile updated successfully!')
    },
    onError: (error: Error) => {
      showErrorToast('Failed to update profile', error.message)
    },
  })

  return {
    // Data
    profile: profileQuery.data,
    isLoading: profileQuery.isLoading,
    error: profileQuery.error,

    // Actions
    updateProfile: updateProfileMutation.mutate,
    isUpdating: updateProfileMutation.isPending,
  }
}
```

### React Query Best Practices

1. **Use semantic query keys** for easy invalidation
2. **Implement optimistic updates** for better UX
3. **Handle loading and error states** in UI
4. **Set appropriate stale times** based on data freshness needs
5. **Use mutations for all write operations**

## Custom Hooks Patterns

### Data Fetching Hook

```typescript
// hooks/useRelationships.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { relationshipService } from "@/services/relationships"

// Query keys for cache management
export const relationshipQueryKeys = {
  all: ["relationships"] as const,
  user: (userId?: string) => [...relationshipQueryKeys.all, "user", userId] as const,
  withLocations: () => [...relationshipQueryKeys.all, "withLocations"] as const,
}

export const useUserRelationships = (userId?: string) => {
  return useQuery({
    queryKey: relationshipQueryKeys.user(userId),
    queryFn: () => relationshipService.getUserRelationships(userId),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export const useCreateRelationship = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: relationshipService.createRelationship,
    onSuccess: (newRelationship) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: relationshipQueryKeys.user() })
      
      // Optimistic update
      queryClient.setQueryData(
        relationshipQueryKeys.user(),
        (oldData: any[]) => oldData ? [newRelationship, ...oldData] : [newRelationship]
      )
    },
  })
}
```

### Authentication Hook

```typescript
// hooks/useAuth.ts
import { useAppStorage } from "@/storage/useAppStorage"
import { supabase } from "@/utils/supabase"
import { Session, User } from "@supabase/supabase-js"
import { useEffect, useState } from "react"

interface AuthState {
  user: User | null
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean
}

export const useAuth = (): AuthState => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    isAuthenticated: false,
  })

  const { setUser } = useAppStorage()

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          console.error("Error getting session:", error)
          setAuthState({
            user: null,
            session: null,
            isLoading: false,
            isAuthenticated: false,
          })
          return
        }

        setAuthState({
          user: session?.user ?? null,
          session,
          isLoading: false,
          isAuthenticated: !!session,
        })

        setUser(session?.user ?? null)
      } catch (error) {
        console.error("Error in getInitialSession:", error)
        setAuthState({
          user: null,
          session: null,
          isLoading: false,
          isAuthenticated: false,
        })
      }
    }

    getInitialSession()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setAuthState({
          user: session?.user ?? null,
          session,
          isLoading: false,
          isAuthenticated: !!session,
        })

        setUser(session?.user ?? null)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [setUser])

  return authState
}
```

## Animation Guidelines

### React Reanimated Patterns

```typescript
// Skeleton Loading Animation
import React, { useEffect } from "react"
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated"

export const SkeletonLoader: React.FC = () => {
  const animatedValue = useSharedValue(0)

  useEffect(() => {
    animatedValue.value = withRepeat(
      withTiming(1, {
        duration: 1500,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    )
  }, [])

  const animatedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      animatedValue.value,
      [0, 1],
      ["rgba(255, 255, 255, 0.1)", "rgba(255, 255, 255, 0.3)"]
    )

    return { backgroundColor }
  })

  return <Animated.View style={[skeletonStyle, animatedStyle]} />
}
```

### Bottom Sheet Animation

```typescript
// Bottom Sheet with Gesture Handler
import { Gesture, GestureDetector } from "react-native-gesture-handler"
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
} from "react-native-reanimated"

export const AnimatedBottomSheet: React.FC<Props> = ({ onClose }) => {
  const translateY = useSharedValue(screenHeight)
  const opacity = useSharedValue(0)

  const openSheet = () => {
    translateY.value = withSpring(0, { damping: 15, stiffness: 150 })
    opacity.value = withTiming(1, { duration: 300 })
  }

  const closeSheet = () => {
    translateY.value = withTiming(screenHeight, { duration: 300 })
    opacity.value = withTiming(0, { duration: 300 }, () => {
      runOnJS(onClose)()
    })
  }

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateY.value = Math.max(0, event.translationY)
    })
    .onEnd((event) => {
      if (event.translationY > 100) {
        runOnJS(closeSheet)()
      } else {
        translateY.value = withSpring(0)
      }
    })

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }))

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.container, animatedStyle]}>
        {/* Content */}
      </Animated.View>
    </GestureDetector>
  )
}
```

### Animation Best Practices

1. **Use `useSharedValue`** for animated values
2. **Prefer `withSpring`** for natural motion
3. **Use `runOnJS`** for callback functions
4. **Implement gesture handlers** for interactive animations
5. **Optimize with `reduceMotion`** for accessibility

## Navigation Patterns

### Navigation Structure

```typescript
// navigation/RootNavigator.tsx
import { NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"

export type RootStackParamList = {
  OnBoarding: undefined
  BottomTabsNavigator: {
    screen?: string
    params?: {
      zoomToRelationship?: {
        relationshipId: string
        latitude: number
        longitude: number
      }
    }
  } | undefined
  AddRelationship: undefined
  Friends: undefined
  Notifications: undefined
  PublicProfile: {
    userId: string
    username?: string
  }
}

const Stack = createNativeStackNavigator<RootStackParamList>()

export const RootNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <LoadingScreen />
  }

  const initialRouteName = isAuthenticated ? "BottomTabsNavigator" : "OnBoarding"

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRouteName}
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="OnBoarding" component={OnBoardingScreen} />
        <Stack.Screen name="BottomTabsNavigator" component={BottomTabsNavigator} />
        
        {/* Modal Screens */}
        <Stack.Screen
          name="AddRelationship"
          component={AddRelationshipScreen}
          options={{
            presentation: "modal",
            gestureDirection: "vertical",
          }}
        />
        <Stack.Screen
          name="PublicProfile"
          component={PublicProfile}
          options={{
            presentation: "modal",
            gestureDirection: "vertical",
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
```

### Typed Navigation Hooks

```typescript
// hooks/useTypedNavigation.ts
import { useNavigation, NavigationProp } from '@react-navigation/native'
import { RootStackParamList } from '@/navigation/RootNavigator'

export const useTypedNavigation = () => {
  return useNavigation<NavigationProp<RootStackParamList>>()
}
```

## Error Handling

### Toast Messages

```typescript
// utils/toast.ts
import Toast from 'react-native-toast-message'

export type ToastType = 'success' | 'error' | 'info'

interface ToastOptions {
  title: string
  message?: string
  duration?: number
  position?: 'top' | 'bottom'
}

export const showToast = (type: ToastType, options: ToastOptions) => {
  Toast.show({
    type,
    text1: options.title,
    text2: options.message,
    visibilityTime: options.duration || 4000,
    position: options.position || 'top',
  })
}

export const showSuccessToast = (title: string, message?: string) => {
  showToast('success', { title, message })
}

export const showErrorToast = (title: string, message?: string) => {
  showToast('error', { title, message })
}
```

### Error Boundaries

```typescript
// components/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react'
import { View, Text } from 'react-native'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Something went wrong</Text>
        </View>
      )
    }

    return this.props.children
  }
}
```

## Internationalization

### i18n Setup

```typescript
// localization/index.ts
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import * as Localization from 'expo-localization'

import en from './translations/en.json'
import fr from './translations/fr.json'

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      fr: { translation: fr },
    },
    lng: Localization.locale.split('-')[0],
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  })

export default i18n
```

### Translation Hook

```typescript
// hooks/useLanguage.ts
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useTranslation } from 'react-i18next'

export type SupportedLanguage = 'en' | 'fr'

const LANGUAGE_STORAGE_KEY = 'app_language'

export const useLanguage = () => {
  const { t, i18n } = useTranslation()

  const changeLanguage = async (language: SupportedLanguage) => {
    try {
      await i18n.changeLanguage(language)
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language)
    } catch (error) {
      console.error('Failed to change language:', error)
    }
  }

  return {
    t,
    currentLanguage: i18n.language as SupportedLanguage,
    changeLanguage,
  }
}
```

## State Management with MMKV + Zustand

### Why Avoid AsyncStorage?

**AsyncStorage limitations:**
- **Performance**: Slower read/write operations (up to 40x slower than MMKV)
- **Security**: No encryption support for sensitive data
- **Memory**: Higher memory usage and potential memory leaks
- **Bridge overhead**: JavaScript-to-native bridge communication bottleneck

**MMKV advantages:**
- **Performance**: Up to 30x faster than AsyncStorage
- **Security**: Built-in encryption support
- **Memory efficient**: Mmap-based, lower memory footprint
- **Synchronous**: Direct native access without bridge overhead

### MMKV Setup

```typescript
// storage/mmkv.ts
import { MMKV } from 'react-native-mmkv'

// Main storage instance
export const storage = new MMKV()

// Encrypted storage for sensitive data
export const secureStorage = new MMKV({
  id: 'secure-storage',
  encryptionKey: 'your-encryption-key-here',
})

// Zustand-compatible storage interface
export const zustandStorage = {
  setItem: (name: string, value: string) => {
    return storage.set(name, value)
  },
  getItem: (name: string) => {
    const value = storage.getString(name)
    return value ?? null
  },
  removeItem: (name: string) => {
    return storage.delete(name)
  },
}

// Secure storage for sensitive data
export const zustandSecureStorage = {
  setItem: (name: string, value: string) => {
    return secureStorage.set(name, value)
  },
  getItem: (name: string) => {
    const value = secureStorage.getString(name)
    return value ?? null
  },
  removeItem: (name: string) => {
    return secureStorage.delete(name)
  },
}
```

### Zustand Store Patterns

#### Basic Persistent Store

```typescript
// storage/useAppStorage.ts
import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import { zustandStorage } from "./mmkv"
import { User } from "@supabase/supabase-js"

interface AppStorage {
  user: User | null
  setUser: (user: User | null) => void
  username: string
  setUsername: (username: string) => void
  clearAll: () => void
}

export const useAppStorage = create(
  persist<AppStorage>(
    (set, get) => ({
      user: null,
      setUser: (user) => set({ user }),
      username: "",
      setUsername: (username) => set({ username }),
      clearAll: () => set({ user: null, username: "" }),
    }),
    {
      name: "app-storage",
      storage: createJSONStorage(() => zustandStorage),
      // Selective persistence
      partialize: (state) => ({ 
        user: state.user, 
        username: state.username 
      }),
    }
  )
)
```

#### Advanced Store with Middleware

```typescript
// stores/useUserStore.ts
import { create } from 'zustand'
import { persist, createJSONStorage, devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { zustandStorage, zustandSecureStorage } from '@/storage/mmkv'

// Logging middleware for development
const logMiddleware = (config) => (set, get, api) =>
  config(
    (...args) => {
      console.log('Previous state:', get())
      set(...args)
      console.log('New state:', get())
    },
    get,
    api
  )

// Error boundary middleware
const errorMiddleware = (config) => (set, get, api) =>
  config(
    (...args) => {
      try {
        set(...args)
      } catch (error) {
        console.error('State update error:', error)
        // Could integrate with error reporting service
      }
    },
    get,
    api
  )

interface UserState {
  profile: User | null
  preferences: UserPreferences
  isLoading: boolean
  error: string | null
}

interface UserActions {
  setProfile: (profile: User | null) => void
  updatePreferences: (preferences: Partial<UserPreferences>) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

type UserStore = UserState & UserActions

const initialState: UserState = {
  profile: null,
  preferences: {
    theme: 'auto',
    language: 'en',
    notifications: true,
  },
  isLoading: false,
  error: null,
}

export const useUserStore = create<UserStore>()(
  devtools(
    persist(
      immer(
        logMiddleware(
          errorMiddleware((set, get) => ({
            ...initialState,
            
            setProfile: (profile) =>
              set((state) => {
                state.profile = profile
                state.error = null
              }),
            
            updatePreferences: (newPreferences) =>
              set((state) => {
                state.preferences = { ...state.preferences, ...newPreferences }
              }),
            
            setLoading: (loading) =>
              set((state) => {
                state.isLoading = loading
              }),
            
            setError: (error) =>
              set((state) => {
                state.error = error
                state.isLoading = false
              }),
            
            reset: () => set(initialState),
          }))
        )
      ),
      {
        name: 'user-store',
        storage: createJSONStorage(() => zustandStorage),
        partialize: (state) => ({
          profile: state.profile,
          preferences: state.preferences,
        }),
      }
    ),
    { name: 'UserStore' }
  )
)
```

#### Secure Store for Sensitive Data

```typescript
// stores/useAuthStore.ts
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { zustandSecureStorage } from '@/storage/mmkv'

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
}

interface AuthActions {
  setTokens: (accessToken: string, refreshToken: string) => void
  clearTokens: () => void
  updateAccessToken: (token: string) => void
}

type AuthStore = AuthState & AuthActions

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      
      setTokens: (accessToken, refreshToken) =>
        set({
          accessToken,
          refreshToken,
          isAuthenticated: true,
        }),
      
      clearTokens: () =>
        set({
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        }),
      
      updateAccessToken: (accessToken) =>
        set({ accessToken }),
    }),
    {
      name: 'auth-tokens',
      storage: createJSONStorage(() => zustandSecureStorage),
    }
  )
)
```

#### Context Replacement Pattern

```typescript
// Instead of React Context, use Zustand for global state
// stores/useAppStateStore.ts
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

interface AppState {
  isOnline: boolean
  currentRoute: string
  notifications: Notification[]
  modals: { [key: string]: boolean }
}

interface AppActions {
  setOnlineStatus: (isOnline: boolean) => void
  setCurrentRoute: (route: string) => void
  addNotification: (notification: Notification) => void
  removeNotification: (id: string) => void
  toggleModal: (modalId: string) => void
  closeAllModals: () => void
}

type AppStateStore = AppState & AppActions

export const useAppStateStore = create<AppStateStore>()(
  subscribeWithSelector((set, get) => ({
    isOnline: true,
    currentRoute: '',
    notifications: [],
    modals: {},
    
    setOnlineStatus: (isOnline) => set({ isOnline }),
    
    setCurrentRoute: (currentRoute) => set({ currentRoute }),
    
    addNotification: (notification) =>
      set((state) => ({
        notifications: [...state.notifications, notification],
      })),
    
    removeNotification: (id) =>
      set((state) => ({
        notifications: state.notifications.filter(n => n.id !== id),
      })),
    
    toggleModal: (modalId) =>
      set((state) => ({
        modals: {
          ...state.modals,
          [modalId]: !state.modals[modalId],
        },
      })),
    
    closeAllModals: () =>
      set((state) => ({
        modals: Object.keys(state.modals).reduce(
          (acc, key) => ({ ...acc, [key]: false }),
          {}
        ),
      })),
  }))
)

// Subscription example for side effects
useAppStateStore.subscribe(
  (state) => state.isOnline,
  (isOnline) => {
    if (isOnline) {
      // Trigger sync when back online
      syncOfflineData()
    }
  }
)
```

#### Performance Optimized Selectors

```typescript
// hooks/useOptimizedSelectors.ts
import { useShallow } from 'zustand/react/shallow'
import { useUserStore } from '@/stores/useUserStore'

// Optimized selector patterns
export const useUserProfile = () => 
  useUserStore(useShallow((state) => state.profile))

export const useUserPreferences = () =>
  useUserStore(useShallow((state) => state.preferences))

export const useUserActions = () =>
  useUserStore(useShallow((state) => ({
    setProfile: state.setProfile,
    updatePreferences: state.updatePreferences,
    setLoading: state.setLoading,
  })))

// Computed selectors
export const useIsUserLoggedIn = () =>
  useUserStore((state) => !!state.profile?.id)

export const useUserDisplayName = () =>
  useUserStore((state) => 
    state.profile?.display_name || state.profile?.username || 'Anonymous'
  )

## Mobile-First & Touch Optimization

### Touch Design Principles

#### Thumb Zone Optimization
```typescript
// Design for thumb-friendly interactions
const ThumbZoneGuidelines = {
  // Primary actions in bottom 1/3 of screen
  primaryActionZone: 'bottom-third',
  
  // Secondary actions in middle third
  secondaryActionZone: 'middle-third',
  
  // Informational content in top third
  informationalZone: 'top-third',
}
```

#### Touch Target Requirements
```typescript
// Minimum touch target sizes
const TouchTargets = {
  minimum: 44, // 44x44 pixels minimum
  recommended: 48, // 48x48 pixels recommended
  spacing: 8, // 8px minimum spacing between targets
}

// Component example with proper touch targets
export const TouchOptimizedButton = ({ title, onPress }) => {
  return (
    <Pressable
      onPress={onPress}
      style={{
        minHeight: TouchTargets.recommended,
        minWidth: TouchTargets.recommended,
        paddingHorizontal: 16,
        paddingVertical: 12,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Text>{title}</Text>
    </Pressable>
  )
}
```

#### Touch Feedback Patterns
```typescript
// Immediate visual feedback for all interactions
export const TouchFeedbackButton = ({ children, onPress }) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        pressed && { 
          opacity: 0.8,
          transform: [{ scale: 0.98 }],
        }
      ]}
    >
      {children}
    </Pressable>
  )
}

// Haptic feedback for important actions
import * as Haptics from 'expo-haptics'

const handleImportantAction = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
  // Action logic
}
```

### Responsive Design with Unistyles

```typescript
// Mobile-first responsive design
const ResponsiveComponent = () => {
  const styles = StyleSheet.create((theme) => ({
    container: {
      padding: theme.spacing(2),
      variants: {
        screen: {
          xs: { padding: theme.spacing(1) },
          sm: { padding: theme.spacing(2) },
          md: { padding: theme.spacing(3) },
        }
      }
    }
  }))

  return <View style={styles.container} />
}
```

## Advanced Performance Optimization

### FlatList Optimization Patterns

```typescript
// Optimized FlatList implementation
export const OptimizedList = ({ data, renderItem }) => {
  const keyExtractor = useCallback((item, index) => item.id || index.toString(), [])
  
  const getItemLayout = useCallback((data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  }), [])

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      getItemLayout={getItemLayout}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      updateCellsBatchingPeriod={100}
      initialNumToRender={10}
      windowSize={10}
      // Memory optimization
      onEndReachedThreshold={0.5}
      // Performance monitoring
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
    />
  )
}
```

### Memory Management

```typescript
// Memory leak prevention patterns
export const useCleanupEffect = () => {
  useEffect(() => {
    // Setup subscriptions, timers, etc.
    const subscription = someService.subscribe(handleData)
    const timer = setInterval(updateData, 1000)
    
    // Cleanup function - CRITICAL for memory management
    return () => {
      subscription.unsubscribe()
      clearInterval(timer)
      // Cancel any pending async operations
    }
  }, [])
}

// Proper async operation cleanup
export const useAsyncOperation = () => {
  useEffect(() => {
    let cancelled = false
    
    const performOperation = async () => {
      try {
        const result = await apiCall()
        if (!cancelled) {
          setData(result)
        }
      } catch (error) {
        if (!cancelled) {
          setError(error)
        }
      }
    }
    
    performOperation()
    
    return () => {
      cancelled = true
    }
  }, [])
}
```

### Image Optimization with Expo Image

```typescript
// Optimized image loading with blurhash and caching
import { Image } from 'expo-image'

export const OptimizedImage = ({ source, blurhash, style, ...props }) => {
  return (
    <Image
      source={source}
      placeholder={blurhash}
      style={style}
      cachePolicy="memory-disk"
      transition={200}
      contentFit="cover"
      // Progressive loading
      priority="high" // for above-the-fold images
      recyclingKey={source.uri} // for list optimization
      {...props}
    />
  )
}

// Blurhash generation pattern for uploaded images
export const uploadImageWithBlurhash = async (imageUri: string) => {
  // Generate blurhash on upload
  const blurhash = await generateBlurhash(imageUri)
  
}

// Image preloading for better UX
export const preloadImages = (imageUris: string[]) => {
  imageUris.forEach(uri => {
    Image.prefetch(uri, { cacheKey: uri })
  })
}
```


## Security & Privacy

### Biometric Authentication

```typescript
// Biometric authentication setup
import * as LocalAuthentication from 'expo-local-authentication'

export const useBiometricAuth = () => {
  const [isBiometricSupported, setIsBiometricSupported] = useState(false)
  const [biometricType, setBiometricType] = useState<string[]>([])

  useEffect(() => {
    checkBiometricSupport()
  }, [])

  const checkBiometricSupport = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync()
    setIsBiometricSupported(compatible)
    
    if (compatible) {
      const types = await LocalAuthentication.supportedAuthenticationTypesAsync()
      setBiometricType(types.map(type => 
        LocalAuthentication.AuthenticationType[type]
      ))
    }
  }

  const authenticate = async (): Promise<boolean> => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to access your account',
        fallbackLabel: 'Use Passcode',
        cancelLabel: 'Cancel',
      })
      
      return result.success
    } catch (error) {
      console.error('Biometric authentication error:', error)
      return false
    }
  }

  return {
    isBiometricSupported,
    biometricType,
    authenticate,
  }
}
```

### Secure Storage Implementation

```typescript
// Secure storage for sensitive data
import * as SecureStore from 'expo-secure-store'

export const SecureStorageService = {
  // Store sensitive data securely
  async setSecureItem(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value, {
        keychainService: 'your-app-keychain',
        touchID: true, // Require biometric for access
        requireAuthentication: true,
      })
    } catch (error) {
      console.error('Secure storage error:', error)
      throw error
    }
  },

  // Retrieve sensitive data
  async getSecureItem(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key, {
        keychainService: 'your-app-keychain',
        requireAuthentication: true,
      })
    } catch (error) {
      console.error('Secure retrieval error:', error)
      return null
    }
  },

  // Delete sensitive data
  async deleteSecureItem(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key, {
        keychainService: 'your-app-keychain',
      })
    } catch (error) {
      console.error('Secure deletion error:', error)
      throw error
    }
  }
}

// Usage for authentication tokens
export const AuthTokenService = {
  async storeAuthToken(token: string): Promise<void> {
    await SecureStorageService.setSecureItem('auth_token', token)
  },

  async getAuthToken(): Promise<string | null> {
    return await SecureStorageService.getSecureItem('auth_token')
  },

  async clearAuthToken(): Promise<void> {
    await SecureStorageService.deleteSecureItem('auth_token')
  }
}
```

### API Security

```typescript
// Certificate pinning for API security
import { NetworkingModule } from 'react-native'

const API_CONFIG = {
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 10000,
  // Certificate pinning configuration
  certificatePinning: {
    hostname: 'your-api.com',
    publicKeyHashes: [
      'your-public-key-hash-1',
      'your-public-key-hash-2', // Backup key
    ]
  }
}

// Secure API client with request/response interceptors
export const createSecureApiClient = () => {
  const client = axios.create(API_CONFIG)
  
  // Request interceptor for auth headers
  client.interceptors.request.use(async (config) => {
    const token = await AuthTokenService.getAuthToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  })
  
  // Response interceptor for error handling
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Handle unauthorized access
        AuthTokenService.clearAuthToken()
        // Navigate to login
      }
      return Promise.reject(error)
    }
  )
  
  return client
}
```

## Offline & Sync Patterns

### React Query Offline Configuration

```typescript
// Enhanced QueryClient for offline-first apps
import { QueryClient } from '@tanstack/react-query'
import NetInfo from '@react-native-community/netinfo'

export const createOfflineQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Aggressive caching for offline support
        staleTime: 1000 * 60 * 30, // 30 minutes
        gcTime: 1000 * 60 * 60 * 24, // 24 hours
        
        // Retry configuration for mobile networks
        retry: (failureCount, error) => {
          // Don't retry on 4xx errors
          if (error.status >= 400 && error.status < 500) {
            return false
          }
          // Retry network errors up to 3 times
          return failureCount < 3
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        
        // Network-aware refetching
        refetchOnReconnect: true,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
      },
      mutations: {
        // Retry mutations for network errors
        retry: 1,
        networkMode: 'offlineFirst', // Use cached data when offline
      },
    },
  })
}

// Network status integration
export const useNetworkAwareQueries = () => {
  const queryClient = useQueryClient()
  
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected) {
        // Resume paused queries when back online
        queryClient.resumePausedMutations()
        queryClient.invalidateQueries()
      }
    })
    
    return unsubscribe
  }, [queryClient])
}
```

### Optimistic Updates with Supabase

```typescript
// Optimistic updates for Supabase operations
export const useOptimisticMutation = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (newItem) => {
      const { data, error } = await supabase
        .from('items')
        .insert(newItem)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    
    // Optimistic update
    onMutate: async (newItem) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['items'] })
      
      // Snapshot previous value
      const previousItems = queryClient.getQueryData(['items'])
      
      // Optimistically update cache
      queryClient.setQueryData(['items'], (old: any[]) => 
        [...(old || []), { ...newItem, id: 'temp-' + Date.now() }]
      )
      
      // Return context for rollback
      return { previousItems }
    },
    
    // Rollback on error
    onError: (err, newItem, context) => {
      queryClient.setQueryData(['items'], context?.previousItems)
      showErrorToast('Failed to add item', err.message)
    },
    
    // Always refetch after success/error
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] })
    },
  })
}
```


## Performance Best Practices

### Component Optimization

1. **React 19+ Automatic Optimization**: The React compiler handles most memoization automatically
2. **Manual optimization only when needed**: For complex computations or third-party library integration
3. **Use `useMemo`** for expensive calculations that the compiler can't optimize
4. **Use `useCallback`** for stable function references required by third-party libraries
5. **Lazy load screens** with React.lazy
6. **Optimize FlatList** with proper keyExtractor and getItemLayout

### React Query Optimization

```typescript
// Optimized cache configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 10, // 10 minutes
      gcTime: 1000 * 60 * 60, // 1 hour  
      notifyOnChangeProps: ['data', 'error', 'isLoading'], // Only re-render when these change
    },
  },
})
```

### Image Optimization

```typescript
// Use expo-image for better performance
import { Image } from 'expo-image'

export const OptimizedImage: React.FC<ImageProps> = ({ source, style, ...props }) => {
  return (
    <Image
      source={source}
      style={style}
      cachePolicy="memory-disk"
      transition={200}
      {...props}
    />
  )
}
```

## Development Workflow Rules

### 🚨 CRITICAL DEVELOPMENT GUIDELINES

**The AI assistant MUST follow these workflow rules:**

#### 1. **Library Installation**
- **ALWAYS** use `npx expo install` or `yarn add` for installing new libraries
- **NEVER** use npm install for React Native/Expo projects
- Follow Expo's compatibility requirements for all dependencies
- Check Expo compatibility with `npx expo install --check` if needed

#### 2. **Unistyles 3.0 Requirements - CRITICAL**
- **ALWAYS** use React Native Unistyles 3.0 for styling and theming
- **NEVER** use `useStyles` hook - IT DOESN'T EXIST IN UNISTYLES 3.0
- **NEVER** use `createStyleSheet` - Use `StyleSheet.create((theme) => ({}))` instead
- **ALWAYS** use pattern: `const styles = StyleSheet.create((theme) => ({ ... }))`
- **ALWAYS** configure global Unistyles setup with themes and breakpoints
- **ALWAYS** read the comprehensive Unistyles documentation when implementing styling features
- **REFERENCE**: Complete LLM-compatible documentation at https://www.unistyl.es/llms-full.txt
- **NEVER** use traditional StyleSheet.create() without Unistyles wrapper
- **ALWAYS** leverage Unistyles design tokens, variants, and responsive features
- **REMEMBER**: Unistyles 3.0 = NO HOOKS, direct style object usage

#### 3. **NO Application Launching**
- **NEVER** run `expo start`, `expo run:ios`, `expo run:android`, or any app launching commands
- **NEVER** suggest running the application to test changes
- App launching is **ALWAYS** a human action
- Focus on code implementation only

#### 4. **NO Database Operations**
- **NEVER** run database reset, seed, or destructive commands
- **NEVER** run `supabase db reset` or similar commands
- For migrations, **ONLY** use: `yarn supabase:migrate`
- Database management is a human responsibility

#### 5. **NO Testing Generation**
- **DO NOT** write unit tests, integration tests, or any test files
- **DO NOT** suggest testing patterns or test creation
- Testing is handled separately by the human

#### 6. **NO Linting Operations**
- **DO NOT** run linting commands or check for linting errors
- **DO NOT** suggest running `expo lint` or similar commands
- **DO NOT** fix linting errors unless specifically asked
- Linting is managed by the human

#### 7. **Supabase Functions Structure**
- **ALWAYS** create ONE function per file in `supabase/functions/`
- **NEVER** put multiple functions in a single file
- Each function should have its own directory with `index.ts`
```
supabase/functions/
├── send-push-notification/
│   └── index.ts
├── process-friend-request/
│   └── index.ts
└── update-user-stats/
    └── index.ts
```

#### 8. **Storage and State Management**
- **ALWAYS** use MMKV instead of AsyncStorage for local storage
- **ALWAYS** use Zustand for state management instead of React Context
- **ALWAYS** combine MMKV with Zustand persist middleware for persistence
- **NEVER** use AsyncStorage for any storage operations


### Development Workflow

When implementing features or fixes:

1. **Code Implementation Only**
   - Write the necessary code changes
   - Update imports and exports
   - Add necessary types and interfaces

2. **Human Actions Required**
   - Running the application for testing
   - Executing database migrations
   - Running linting and fixing issues
   - Testing the implementation

3. **Supabase Function Pattern**
```typescript
// supabase/functions/function-name/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    // Function logic here
    
    return new Response(
      JSON.stringify({ success: true }),
      { headers: { "Content-Type": "application/json" } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      }
    )
  }
})
```

## Security Guidelines

### Environment Variables

```typescript
// Use EXPO_PUBLIC_ prefix for client-side variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_KEY!

// Keep sensitive data server-side only
const secretKey = process.env.SECRET_KEY // This won't be exposed to client
```

### Authentication Security

1. **Use Row Level Security** in Supabase
2. **Validate permissions** on both client and server
3. **Implement proper session management**
4. **Use secure storage** for sensitive data

### Data Validation

```typescript
// Validate input data before API calls
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const validateUsername = (username: string): boolean => {
  const usernameRegex = /^[a-zA-Z0-9_]{4,20}$/
  return usernameRegex.test(username)
}
```

## Additional Best Practices

### Notifications Setup

```typescript
// hooks/useNotifications.ts
import * as Notifications from "expo-notifications"
import { useEffect, useState } from "react"

export const useNotifications = () => {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null)
  const [isPermissionGranted, setIsPermissionGranted] = useState(false)

  const requestPermissions = async (): Promise<boolean> => {
    const { status } = await Notifications.requestPermissionsAsync()
    const isGranted = status === "granted"
    setIsPermissionGranted(isGranted)

    if (isGranted) {
      const token = await Notifications.getExpoPushTokenAsync()
      setExpoPushToken(token.data)
    }

    return isGranted
  }

  return {
    expoPushToken,
    isPermissionGranted,
    requestPermissions,
  }
}
```

### Location Services

```typescript
// hooks/useLocation.ts
import * as Location from 'expo-location'
import { useState, useEffect } from 'react'

export const useCurrentLocation = () => {
  const [location, setLocation] = useState<Location.LocationObject | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getCurrentLocation = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      
      if (status !== 'granted') {
        setError('Permission to access location was denied')
        return
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      })
      
      setLocation(currentLocation)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }

  return {
    location,
    isLoading,
    error,
    getCurrentLocation,
  }
}
```

---

## Summary

This comprehensive guide covers all essential patterns for building production-ready React Native apps with Expo and Supabase. 

### 🚨 **CRITICAL WORKFLOW RULES** (Must Follow):

1. **NEVER run the application** (`expo start`, `expo run:ios`) - Human action only
2. **NEVER run database operations** except `yarn supabase:migrate` for migrations
3. **NEVER write tests** or suggest testing - Human handles testing
4. **NEVER run linting** or fix linting errors unless asked - Human manages linting
5. **ONE function per file** in `supabase/functions/` - Always separate functions
6. **ALWAYS use MMKV + Zustand** - Never use AsyncStorage or React Context for state
7. **NEVER use SafeAreaView from react-native** - ALWAYS use SafeAreaView from react-native-safe-area-context with SafeAreaProvider

### Key Development Principles:

1. **Type Safety**: Use TypeScript extensively with generated database types
2. **Performance**: Implement React Query caching and component optimization
3. **User Experience**: Handle loading states, errors, and provide feedback
4. **Maintainability**: Follow consistent patterns and folder structure
5. **Security**: Implement proper authentication and data validation
6. **Code Only**: Focus on implementation, let humans handle app execution and testing

Follow these patterns consistently across your application for the best development experience and app performance.
