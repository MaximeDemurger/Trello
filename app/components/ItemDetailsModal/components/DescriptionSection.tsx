import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useBoardStore } from "@/stores/useBoardStore";
import { styles } from "../ItemDetails.styles";

type Props = {
  itemId: string;
  description?: string;
};

export const DescriptionSection: React.FC<Props> = ({ itemId, description }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(description ?? "");
  const updateItem = useBoardStore((state) => state.updateItem);

  const save = () => {
    const trimmed = draft.trim();
    updateItem({ id: itemId, description: trimmed });
    Haptics.selectionAsync();
    setIsEditing(false);
  };

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name="document-text-outline" size={20} color="#6b7280" />
        <Text style={styles.sectionTitle}>Description</Text>
      </View>
      {isEditing ? (
        <BottomSheetTextInput
          value={draft}
          onChangeText={setDraft}
          onBlur={save}
          placeholder="Add more details..."
          style={[styles.input, styles.textarea]}
          multiline
          autoFocus
        />
      ) : (
        <Pressable onPress={() => { setDraft(description ?? ""); setIsEditing(true); }}>
          {({ pressed }) => (
            description ? (
              <Text style={[styles.descriptionText, pressed && { opacity: 0.8 }]}>{description}</Text>
            ) : (
              <Text style={[styles.mutedText, pressed && { opacity: 0.8 }]}>Tap to add a description</Text>
            )
          )}
        </Pressable>
      )}
    </View>
  );
};
