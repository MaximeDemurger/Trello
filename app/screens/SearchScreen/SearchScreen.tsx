import React, { useEffect, useState } from 'react'
import { View, Text, TextInput, FlatList, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StyleSheet } from 'react-native-unistyles'
import { useAuth } from '@/providers/AuthProvider'
import { searchBoardsForUser } from '@/lib/boards'
import { useNavigation } from '@react-navigation/native'
import type { RootStackParamList } from '@/navigation/AppNavigator'

export const SearchScreen: React.FC = () => {
  const { user } = useAuth()
  const navigation = useNavigation()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])

  useEffect(() => {
    const run = setTimeout(async () => {
      if (!user?.id || query.trim().length === 0) {
        setResults([])
        return
      }
      const { boards } = await searchBoardsForUser({ userId: user.id, query: query.trim() })
      setResults(boards ?? [])
    }, 250)
    return () => clearTimeout(run)
  }, [query, user?.id])

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.content}>
        <Text style={styles.title}>Recherche</Text>
        <TextInput value={query} onChangeText={setQuery} placeholder='Rechercher des boards' style={styles.input} />
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Pressable onPress={() => (navigation as any).navigate('BoardDetail' as keyof RootStackParamList, { boardId: item.id })} style={({ pressed }) => [styles.row, pressed && { opacity: 0.6 }]}>
              <Text style={styles.rowText}>{item.title}</Text>
            </Pressable>
          )}
        />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create((theme) => ({
  container: { flex: 1, backgroundColor: theme.colors.white },
  content: { padding: theme.spacing.xl },
  title: { fontSize: theme.typography.fontSize.xxl, fontWeight: theme.typography.fontWeight.bold },
  input: { marginTop: theme.spacing.md, borderWidth: 1, borderColor: theme.colors.gray200, borderRadius: theme.borderRadius.md, paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.md, backgroundColor: theme.colors.white },
  row: { paddingVertical: theme.spacing.md, borderBottomWidth: 1, borderColor: theme.colors.gray100 },
  rowText: { color: theme.colors.gray900 },
}))


