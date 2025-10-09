import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useBoardStore } from '@/stores/useBoardStore';
import { styles } from '../ItemDetails.styles';

type ItemHeaderProps = {
  title: string;
  itemId: string;
  onClose: () => void;
};

export const ItemHeader: React.FC<ItemHeaderProps> = ({ title, itemId, onClose }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(title);
  const updateItem = useBoardStore((state) => state.updateItem);

  const save = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== title) {
      updateItem({ id: itemId, title: trimmed });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setIsEditing(false);
  };

  return (
    <View style={styles.header}>
      {isEditing ? (
        <BottomSheetTextInput
          autoFocus
          onBlur={save}
          onChangeText={setDraft}
          onSubmitEditing={save}
          placeholder="Enter title"
          returnKeyType="done"
          style={[styles.input, styles.titleInput]}
          value={draft}
        />
      ) : (
        <Pressable
          onPress={() => {
            setDraft(title);
            setIsEditing(true);
          }}
          style={styles.container}
        >
          <Text numberOfLines={2} style={styles.title}>
            {title}
          </Text>
        </Pressable>
      )}
      <Pressable
        onPress={onClose}
        style={({ pressed }) => [styles.closeButton, pressed && { opacity: 0.7 }]}
      >
        <Ionicons color="#6b7280" name="close" size={24} />
      </Pressable>
    </View>
  );
};
