import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useBoardStore } from "@/stores/useBoardStore";
import { styles } from "../ItemDetails.styles";

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
          value={draft}
          onChangeText={setDraft}
          onBlur={save}
          placeholder="Enter title"
          style={[styles.input, styles.titleInput]}
          autoFocus
          returnKeyType="done"
          onSubmitEditing={save}
        />
      ) : (
        <Pressable onPress={() => { setDraft(title); setIsEditing(true); }} style={{ flex: 1 }}>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
        </Pressable>
      )}
      <Pressable
        onPress={onClose}
        style={({ pressed }) => [styles.closeButton, pressed && { opacity: 0.7 }]}
      >
        <Ionicons name="close" size={24} color="#6b7280" />
      </Pressable>
    </View>
  );
};
