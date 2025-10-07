/**
 * CreateItemModal Component
 * Modal for creating new items with ref-based control
 */

import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import * as Haptics from "expo-haptics";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { BottomSheet } from "../BottomSheet/BottomSheet";
import { useBoardStore } from "@/stores/useBoardStore";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { styles } from "./CreateItemModal.styles";
import { FooterAction } from "@/components/FooterAction/FooterAction";

type CreateItemModalProps = {
  boardId: string;
  visible: boolean;
  groupId: string | null;
  onClose: () => void;
  onSuccess?: () => void;
};

export const CreateItemModal: React.FC<CreateItemModalProps> = ({
  boardId,
  visible,
  groupId,
  onClose,
  onSuccess,
}) => {
  const insets = useSafeAreaInsets();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignee, setAssignee] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high" | undefined>(undefined);
  const [labelsText, setLabelsText] = useState("");

  const { createItem } = useBoardStore();

  const handleClose = () => {
    onClose();
    setTitle("");
    setDescription("");
    setAssignee("");
    setDueDate("");
    setPriority(undefined);
    setLabelsText("");
  };

  const handleCreate = () => {
    if (title.trim() && groupId) {
      createItem({
        title: title.trim(),
        description: description.trim(),
        groupId,
        boardId,
        assignee: assignee.trim() || undefined,
        dueDate: dueDate.trim() || undefined,
        priority,
        labels: labelsText
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s.length > 0),
      });

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      handleClose();

      if (onSuccess) {
        onSuccess();
      }
    }
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={handleClose}
      index={1}
      footerComponent={() => (
        <FooterAction
          onClose={handleClose}
          onCreate={handleCreate}
          title={title}
          submitLabel="Create"
        />
      )}
      snapPoints={["80%"]}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Create Item</Text>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Title</Text>
          <BottomSheetTextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter item title"
            placeholderTextColor="#9ca3af"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Description</Text>
          <BottomSheetTextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Enter item description"
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Assignee</Text>
          <BottomSheetTextInput
            style={styles.input}
            value={assignee}
            onChangeText={setAssignee}
            placeholder="Assignee name (optional)"
            placeholderTextColor="#9ca3af"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Due date</Text>
          <BottomSheetTextInput
            style={styles.input}
            value={dueDate}
            onChangeText={setDueDate}
            placeholder="YYYY-MM-DD (optional)"
            placeholderTextColor="#9ca3af"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Priority</Text>
          <View style={styles.chipsRow}>
            {["low", "medium", "high"].map((p) => (
              <Pressable
                key={p}
                onPress={() => setPriority(p as any)}
                style={[styles.chip, priority === p && styles.chipActive]}
              >
                <Text style={[styles.chipText, priority === p && styles.chipTextActive]}>
                  {p}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Labels</Text>
          <BottomSheetTextInput
            style={styles.input}
            value={labelsText}
            onChangeText={setLabelsText}
            placeholder="Comma-separated labels (optional)"
            placeholderTextColor="#9ca3af"
          />
        </View>
      </View>
    </BottomSheet>
  );
};
