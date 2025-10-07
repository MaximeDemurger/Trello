import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useBoardStore } from "@/stores/useBoardStore";
import { styles } from "../ItemDetails.styles";

type Props = {
  itemId: string;
  createdAt: string;
  updatedAt: string;
  assignee?: string;
  dueDate?: string;
  priority?: "low" | "medium" | "high";
};

export const DetailsSection: React.FC<Props> = ({
  itemId,
  createdAt,
  updatedAt,
  assignee,
  dueDate,
  priority,
}) => {
  const updateItem = useBoardStore((state) => state.updateItem);

  // Assignee state
  const [isEditingAssignee, setIsEditingAssignee] = useState(false);
  const [assigneeDraft, setAssigneeDraft] = useState(assignee ?? "");

  // Due date picker
  const [showDuePicker, setShowDuePicker] = useState(false);

  // Priority picker
  const [showPriorityPicker, setShowPriorityPicker] = useState(false);

  const saveAssignee = () => {
    const trimmed = assigneeDraft.trim();
    updateItem({ id: itemId, assignee: trimmed || undefined });
    Haptics.selectionAsync();
    setIsEditingAssignee(false);
  };

  const setDueDate = (preset: "today" | "tomorrow" | "nextWeek" | "clear") => {
    const now = new Date();
    let due: string | undefined;

    if (preset === "today") {
      due = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        23,
        59,
        0
      ).toISOString();
    } else if (preset === "tomorrow") {
      const d = new Date(now);
      d.setDate(d.getDate() + 1);
      due = new Date(
        d.getFullYear(),
        d.getMonth(),
        d.getDate(),
        23,
        59,
        0
      ).toISOString();
    } else if (preset === "nextWeek") {
      const d = new Date(now);
      d.setDate(d.getDate() + 7);
      due = new Date(
        d.getFullYear(),
        d.getMonth(),
        d.getDate(),
        23,
        59,
        0
      ).toISOString();
    } else {
      due = undefined;
    }

    updateItem({ id: itemId, dueDate: due });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowDuePicker(false);
  };

  const setPriority = (p: "low" | "medium" | "high") => {
    updateItem({ id: itemId, priority: p });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowPriorityPicker(false);
  };

  const resolvedPriority = priority ?? "low";

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name="information-circle-outline" size={20} color="#6b7280" />
        <Text style={styles.sectionTitle}>Details</Text>
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Created</Text>
        <Text style={styles.detailValue}>
          {new Date(createdAt).toLocaleDateString()}
        </Text>
      </View>

      {updatedAt !== createdAt && (
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Last updated</Text>
          <Text style={styles.detailValue}>
            {new Date(updatedAt).toLocaleDateString()}
          </Text>
        </View>
      )}

      {/* Assignee */}
      <Pressable
        onPress={() => {
          setAssigneeDraft(assignee ?? "");
          setIsEditingAssignee(true);
        }}
      >
        {({ pressed }) =>
          isEditingAssignee ? (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Assigned to</Text>
              <BottomSheetTextInput
                value={assigneeDraft}
                onChangeText={setAssigneeDraft}
                placeholder="Assign to"
                style={[styles.input, { minWidth: 160 }]}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={saveAssignee}
                onBlur={saveAssignee}
              />
            </View>
          ) : (
            <View
              style={[styles.detailRow, pressed && styles.detailRowPressable]}
            >
              <Text style={styles.detailLabel}>Assigned to</Text>
              <Text style={styles.detailValue}>{assignee ?? "Unassigned"}</Text>
            </View>
          )
        }
      </Pressable>

      {/* Due date */}
      <Pressable onPress={() => setShowDuePicker((v) => !v)}>
        {({ pressed }) => (
          <View
            style={[styles.detailRow, pressed && styles.detailRowPressable]}
          >
            <Text style={styles.detailLabel}>Due date</Text>
            <Text style={styles.detailValue}>
              {dueDate ? new Date(dueDate).toLocaleDateString() : "None"}
            </Text>
          </View>
        )}
      </Pressable>
      {showDuePicker && (
        <View style={[styles.chipsRow, { marginTop: 8, marginBottom: 8 }]}>
          <Pressable
            onPress={() => setDueDate("today")}
            style={({ pressed }) => [styles.chip, pressed && { opacity: 0.8 }]}
          >
            <Text style={styles.chipText}>Today</Text>
          </Pressable>
          <Pressable
            onPress={() => setDueDate("tomorrow")}
            style={({ pressed }) => [styles.chip, pressed && { opacity: 0.8 }]}
          >
            <Text style={styles.chipText}>Tomorrow</Text>
          </Pressable>
          <Pressable
            onPress={() => setDueDate("nextWeek")}
            style={({ pressed }) => [styles.chip, pressed && { opacity: 0.8 }]}
          >
            <Text style={styles.chipText}>Next week</Text>
          </Pressable>
          <Pressable
            onPress={() => setDueDate("clear")}
            style={({ pressed }) => [
              styles.chip,
              styles.chipDanger,
              pressed && { opacity: 0.8 },
            ]}
          >
            <Text style={[styles.chipText, styles.chipDangerText]}>Clear</Text>
          </Pressable>
        </View>
      )}

      {/* Priority */}
      <Pressable onPress={() => setShowPriorityPicker((v) => !v)}>
        {({ pressed }) => (
          <View
            style={[styles.detailRow, pressed && styles.detailRowPressable]}
          >
            <Text style={styles.detailLabel}>Priority</Text>
            <View
              style={[
                styles.priorityBadge,
                resolvedPriority === "high" && styles.priorityHigh,
                resolvedPriority === "medium" && styles.priorityMedium,
                resolvedPriority === "low" && styles.priorityLow,
              ]}
            >
              <Text style={styles.priorityText}>
                {resolvedPriority.charAt(0).toUpperCase() +
                  resolvedPriority.slice(1)}
              </Text>
            </View>
          </View>
        )}
      </Pressable>
      {showPriorityPicker && (
        <View style={[styles.chipsRow, { marginTop: 8, marginBottom: 8 }]}>
          {(["low", "medium", "high"] as const).map((p) => (
            <Pressable
              key={p}
              onPress={() => setPriority(p)}
              style={({ pressed }) => [
                styles.chip,
                priority === p && styles.chipActive,
                pressed && { opacity: 0.8 },
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  priority === p && styles.chipTextActive,
                ]}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
};
