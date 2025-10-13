/**
 * AppNavigator
 * Main navigation structure for BoardFlow
 */

import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import * as Linking from 'expo-linking'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '@/providers/AuthProvider'
import { BoardListScreen, BoardDetailScreen, OnboardingScreen, AuthScreen, SignupScreen, NotificationsScreen, SearchScreen, AccountScreen, ManageOrganizationScreen, BoardSettingsScreen, BoardMembersScreen } from '@/screens'

export type RootStackParamList = {
  // Auth flow
  Onboarding: undefined
  Auth: { initialMode?: 'login' | 'signup' } | undefined
  Signup: undefined
  // Boards stack
  BoardList: undefined
  BoardDetail: { boardId: string }
  ManageOrganization: { organizationId: string }
  BoardSettings: { boardId: string }
  BoardMembers: { boardId: string }
}

const Stack = createNativeStackNavigator<RootStackParamList>()
const Tab = createBottomTabNavigator()

const BoardsStack: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="BoardList"
      screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
    >
      <Stack.Screen name="BoardList" component={BoardListScreen} />
      <Stack.Screen name="BoardDetail" component={BoardDetailScreen} />
      <Stack.Screen name="ManageOrganization" component={ManageOrganizationScreen} />
      <Stack.Screen name="BoardSettings" component={BoardSettingsScreen} />
      <Stack.Screen name="BoardMembers" component={BoardMembersScreen} />
    </Stack.Navigator>
  )
}

export const AppNavigator: React.FC = () => {
  const { session, isLoading } = useAuth()

  const linking = {
    prefixes: [Linking.createURL('/')],
    config: {
      screens: {
        Onboarding: 'onboarding',
        Auth: 'auth',
        Signup: 'signup',
        BoardList: 'boards',
        BoardDetail: 'board/:boardId',
      },
    },
  }

  if (isLoading) {
    return null
  }

  return (
    <NavigationContainer linking={linking}>
      {session ? (
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarIcon: ({ color, size }) => {
              const map: Record<string, keyof typeof Ionicons.glyphMap> = {
                Boards: 'grid-outline',
                Notifications: 'notifications-outline',
                Search: 'search-outline',
                Account: 'person-outline',
              }
              const iconName = map[route.name] ?? 'ellipse-outline'
              return <Ionicons name={iconName} color={color} size={size} />
            },
          })}
        >
          <Tab.Screen name="Boards" component={BoardsStack} />
          <Tab.Screen name="Search" component={SearchScreen} />
          <Tab.Screen name="Notifications" component={NotificationsScreen} />
          <Tab.Screen name="Account" component={AccountScreen} />
        </Tab.Navigator>
      ) : (
        <Stack.Navigator initialRouteName="Onboarding" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="Auth" component={AuthScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  )
}

