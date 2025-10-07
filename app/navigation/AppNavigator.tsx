/**
 * AppNavigator
 * Main navigation structure for BoardFlow
 */

import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import * as Linking from 'expo-linking'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { BoardListScreen, BoardDetailScreen } from '@/screens'

export type RootStackParamList = {
  BoardList: undefined
  BoardDetail: { boardId: string }
}

const Stack = createNativeStackNavigator<RootStackParamList>()

export const AppNavigator: React.FC = () => {
  const linking = {
    prefixes: [Linking.createURL('/')],
    config: {
      screens: {
        BoardList: 'boards',
        BoardDetail: 'board/:boardId',
      },
    },
  } as const

  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator
        initialRouteName="BoardList"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="BoardList" component={BoardListScreen} />
        <Stack.Screen name="BoardDetail" component={BoardDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

