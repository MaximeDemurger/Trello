import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useBoardStore } from '@/stores/useBoardStore';
import { styles } from '../ItemDetails.styles';

type Props = {
  itemId: string;
  labels: string[];
};

export const LabelsSection: React.FC<Props> = ({ itemId, labels }) => {
  const [newLabel, setNewLabel] = useState('');
  const updateItem = useBoardStore((state) => state.updateItem);

  const addLabel = () => {
    const trimmed = newLabel.trim();
    if (!trimmed || labels.includes(trimmed)) return;
    updateItem({ id: itemId, labels: [...labels, trimmed] });
    setNewLabel('');
    Haptics.selectionAsync();
  };

  const removeLabel = (label: string) => {
    updateItem({ id: itemId, labels: labels.filter((l) => l !== label) });
    Haptics.selectionAsync();
  };

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons color="#6b7280" name="pricetag-outline" size={20} />
        <Text style={styles.sectionTitle}>Labels</Text>
      </View>
      <View style={styles.labelsEditor}>
        <View style={styles.labelsRow}>
          {labels.map((label, idx) => (
            <View key={`${label}-${idx}`} style={styles.labelEditable}>
              <Text style={styles.labelEditableText}>{label}</Text>
              <Pressable
                hitSlop={8}
                onPress={() => removeLabel(label)}
                style={({ pressed }) => [styles.labelRemove, pressed && { opacity: 0.7 }]}
              >
                <Ionicons color="#111827" name="close" size={14} />
              </Pressable>
            </View>
          ))}
        </View>
        <View style={styles.row}>
          <BottomSheetTextInput
            onChangeText={setNewLabel}
            onSubmitEditing={addLabel}
            placeholder="New label"
            returnKeyType="done"
            style={styles.input}
            value={newLabel}
          />
          <Pressable
            onPress={addLabel}
            style={({ pressed }) => [styles.secondaryButton, pressed && { opacity: 0.8 }]}
          >
            <Text style={styles.secondaryButtonText}>Add</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};
