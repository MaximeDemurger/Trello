import React from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useBoardStore } from "@/stores/useBoardStore";
import { styles } from "../ItemDetails.styles";

type Props = {
  itemId: string;
  groups: { id: string; title: string }[];
  currentGroupId: string;
};

export const MoveToSection: React.FC<Props> = ({ itemId, groups, currentGroupId }) => {
  const moveItem = useBoardStore((state) => state.moveItem);

  const moveTo = (targetGroupId: string) => {
    if (currentGroupId === targetGroupId) return;
    const targetGroup = groups.find((g) => g.id === targetGroupId);
    if (!targetGroup) return;

    // Move to end of target group
    moveItem({ itemId, targetGroupId, targetOrder: 0 });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name="swap-vertical-outline" size={20} color="#6b7280" />
        <Text style={styles.sectionTitle}>Move to</Text>
      </View>
      <View style={styles.chipsRow}>
        {groups.map((g) => (
          <Pressable
            key={g.id}
            onPress={() => moveTo(g.id)}
            style={({ pressed }) => [
              styles.chip,
              currentGroupId === g.id && styles.chipActive,
              pressed && { opacity: 0.8 },
            ]}
          >
            <Text style={[styles.chipText, currentGroupId === g.id && styles.chipTextActive]}>
              {g.title}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
};
