import React, { useEffect, useMemo, useState } from 'react'
import { View, Text, TextInput, Pressable, ScrollView, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StyleSheet } from 'react-native-unistyles'
import { Ionicons } from '@expo/vector-icons'
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native'
import type { RootStackParamList } from '@/navigation/AppNavigator'
import { useBoardStore } from '@/stores/useBoardStore'
import { BOARD_COLORS } from '@/constants'
import { updateBoard as updateBoardApi } from '@/lib/boards'

type BoardSettingsRouteProp = RouteProp<RootStackParamList, 'BoardSettings'>

export const BoardSettingsScreen: React.FC = () => {
  const navigation = useNavigation()
  const route = useRoute<BoardSettingsRouteProp>()
  const { boardId } = route.params
  const { getBoardWithGroups, updateBoard } = useBoardStore()

  const board = getBoardWithGroups(boardId)

  const [title, setTitle] = useState(board?.title ?? '')
  const [description, setDescription] = useState(board?.description ?? '')
  const [color, setColor] = useState<string>(board?.color ?? BOARD_COLORS[0])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (board) {
      setTitle(board.title)
      setDescription(board.description ?? '')
      setColor(board.color ?? BOARD_COLORS[0])
    }
  }, [board?.id])

  const handleSave = async () => {
    if (!board) return
    setSaving(true)
    const { error } = await updateBoardApi({ id: board.id, title: title.trim(), description: description.trim() || null, color })
    if (error) {
      Alert.alert('Unable to save', error)
    } else {
      updateBoard(board.id, { title: title.trim(), description: description.trim(), color })
      navigation.goBack()
    }
    setSaving(false)
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.7 }]}>
          <Ionicons name="chevron-back" size={20} color="#374151" />
        </Pressable>
        <Text style={styles.headerTitle}>Board Settings</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>General</Text>
          <Text style={styles.label}>Title</Text>
          <TextInput value={title} onChangeText={setTitle} placeholder="Board title" style={styles.input} />
          <Text style={styles.label}>Description</Text>
          <TextInput value={description} onChangeText={setDescription} placeholder="Board description" style={[styles.input, { height: 88 }]} multiline />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Color</Text>
          <View style={styles.colorsRow}>
            {BOARD_COLORS.map((c) => (
              <Pressable key={c} onPress={() => setColor(c)} style={({ pressed }) => [styles.colorSwatch, { backgroundColor: c }, pressed && { transform: [{ scale: 0.96 }] }, color === c && styles.colorSelected]} />
            ))}
          </View>
        </View>

        <Pressable onPress={handleSave} disabled={saving} style={({ pressed }) => [styles.saveButton, pressed && { opacity: 0.9 }, saving && { opacity: 0.6 }]}>
          <Text style={styles.saveText}>{saving ? 'Saving…' : 'Save changes'}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create((theme) => ({
  container: { flex: 1, backgroundColor: theme.colors.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray200,
    backgroundColor: theme.colors.white,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.gray100,
  },
  headerTitle: { fontSize: 16, fontWeight: '600', color: theme.colors.gray900 },
  content: { padding: 16, gap: 16 },
  card: { borderWidth: 1, borderColor: theme.colors.gray200, borderRadius: 12, backgroundColor: theme.colors.white, padding: 12, gap: 12 },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: theme.colors.gray800 },
  label: { fontSize: 12, color: theme.colors.gray600 },
  input: { borderWidth: 1, borderColor: theme.colors.gray300, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, color: theme.colors.gray900 },
  colorsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  colorSwatch: { width: 36, height: 36, borderRadius: 8, borderWidth: 2, borderColor: 'transparent' },
  colorSelected: { borderColor: '#6366f1' },
  saveButton: { height: 44, borderRadius: 22, backgroundColor: 'rgb(99, 102, 241)', alignItems: 'center', justifyContent: 'center' },
  saveText: { color: theme.colors.white, fontSize: 14, fontWeight: '600' },
}))



