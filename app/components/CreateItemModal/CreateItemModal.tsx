import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { BottomSheet } from "../BottomSheet/BottomSheet";
import { AddMemberModal } from "../AddMemberModal/AddMemberModal";
import { useBoardStore } from "@/stores/useBoardStore";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { styles } from "./CreateItemModal.styles";
import { FooterAction } from "@/components/FooterAction/FooterAction";
import { Member } from "@/types/board.types";

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
  const [assignee, setAssignee] = useState<Member[]>([]);
  const [isMemberVisible, setIsMemberVisible] = useState(false);
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high" | undefined>(undefined);
  const [labelsText, setLabelsText] = useState("");

  const { createItem } = useBoardStore();

  const handleClose = () => {
    onClose();
    setTitle("");
    setDescription("");
    setAssignee([]);
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
        assignedMembers: assignee,
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
      index={0}
      footerComponent={() => (
        <FooterAction
          onClose={handleClose}
          onCreate={handleCreate}
          title={title}
          submitLabel="Create"
        />
      )}
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
          <Text style={styles.label}>Members</Text>
          <Pressable
            onPress={() => setIsMemberVisible(true)}
            style={({ pressed }) => [styles.addMemberButton, pressed && { opacity: 0.8 }]}
          >
            <View style={styles.membersList}>
              {assignee.length > 0 ? (
                assignee.slice(0, 5).map((member) => (
                  <View key={member.id} style={[styles.memberAvatar, { backgroundColor: member.color }]}>
                    <Text style={styles.memberAvatarText}>{member.initials}</Text>
                  </View>
                ))
              ) : (
                <Ionicons name="person-add-outline" size={20} color="#6b7280" />
              )}
              {assignee.length > 5 && (
                <View style={[styles.memberAvatar, { backgroundColor: "#6b7280" }]}>
                  <Text style={styles.memberAvatarText}>+{assignee.length - 5}</Text>
                </View>
              )}
            </View>
            <Text style={styles.addMemberText}>
              {assignee.length > 0 ? "Manage members" : "Add members"}
            </Text>
          </Pressable>
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
      <AddMemberModal
        boardId={boardId}
        visible={isMemberVisible}
        onClose={() => setIsMemberVisible(false)}
        initialSelectedMembers={assignee}
        onConfirm={(members) => setAssignee(members)}
      />
    </BottomSheet>
  );
};
