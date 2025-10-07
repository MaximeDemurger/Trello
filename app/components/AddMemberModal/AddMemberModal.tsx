/**
 * AddMemberModal Component
 * Modal for adding members to items
 */

import React, { useState, useMemo, useRef, useEffect } from "react";
import { View, Text, Pressable } from "react-native";
import {
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { BottomSheet } from "../BottomSheet/BottomSheet";
import { useBoardStore } from "@/stores/useBoardStore";
import { styles } from "./AddMemberModal.styles";
import { Member } from "@/types/board.types";

type AddMemberModalProps = {
  boardId: string;
  itemId?: string | null;
  visible: boolean;
  onClose: () => void;
  onClosed?: () => void;
  // When itemId is not provided, the modal works in selection mode
  initialSelectedMembers?: Member[];
  onConfirm?: (members: Member[]) => void;
};

export const AddMemberModal: React.FC<AddMemberModalProps> = ({
  boardId,
  itemId,
  visible,
  onClose,
  onClosed,
  initialSelectedMembers,
  onConfirm,
}) => {

  const members = useBoardStore((state) => state.members);
  const assignedMemberIdsStore = useBoardStore((state) => {
    if (!itemId) return undefined as Member[] | undefined;
    return state.items.find((i) => i.id === itemId)?.assignedMembers;
  });

  const initialAssigned: Member[] = useMemo(() => {
    if (itemId) return assignedMemberIdsStore ?? [];
    return initialSelectedMembers ?? [];
  }, [itemId, assignedMemberIdsStore, initialSelectedMembers]);

  const [assignedMemberIds, setAssignedMemberIds] = useState<Member[]>(initialAssigned);
  const [nonAssignedMemberIds, setNonAssignedMemberIds] = useState<Member[]>(
    members.filter((m) => !initialAssigned.some((a) => a.id === m.id))
  );
  const [newMemberName, setNewMemberName] = useState("");
  const updateItem = useBoardStore((state) => state.updateItem);


  const hasConfirmedRef = useRef(false);
  useEffect(() => {
    if (visible) {
      hasConfirmedRef.current = false;
    }
  }, [visible]);

  const handleClose = () => {
    // In selection mode (no itemId), return selected members once
    if (!itemId && onConfirm && !hasConfirmedRef.current) {
      hasConfirmedRef.current = true;
      onConfirm(assignedMemberIds);
    }
    onClose();
    if (onClosed) onClosed();
  };

  const addMember = (member: Member) => {
    const current = assignedMemberIds;
    if (current.find((m) => m.id === member.id)) return;

    setAssignedMemberIds((prev) => [...prev, member]);
    setNonAssignedMemberIds((prev) => prev.filter((m) => m.id !== member.id));
    if (itemId) {
      updateItem({ id: itemId, assignedMembers: [...current, member] });
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const removeMember = (member: Member) => {
    const current = assignedMemberIds;
    const updated = current.filter((m) => m.id !== member.id);
    if (itemId) {
      updateItem({ id: itemId, assignedMembers: updated });
    }
    setAssignedMemberIds(updated);
    setNonAssignedMemberIds((prev) => [member, ...prev]);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <BottomSheet visible={visible} onClose={handleClose} snapPoints={["100%"]} stackBehavior="push">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Members</Text>
          <Pressable
            onPress={handleClose}
            style={({ pressed }) => [
              styles.closeButton,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Ionicons name="close" size={24} color="#6b7280" />
          </Pressable>
        </View>
        <BottomSheetScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {assignedMemberIds.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Card members</Text>
              {assignedMemberIds.map((member) => (
                <Pressable
                  key={member.id}
                  onPress={() => removeMember(member)}
                  style={({ pressed }) => [
                    styles.memberRow,
                    pressed && styles.memberRowPressed,
                  ]}
                >
                  <View style={styles.memberInfo}>
                    <View
                      style={[styles.avatar, { backgroundColor: member.color }]}
                    >
                      <Text style={styles.avatarText}>{member.initials}</Text>
                    </View>
                    <Text style={styles.memberName}>{member.name}</Text>
                  </View>
                  <Ionicons name="close" size={20} color="#6b7280" onPress={() => removeMember(member)} />
                </Pressable>
              ))}
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Board members</Text>
            {nonAssignedMemberIds.map((member) => (
              <Pressable
                key={member.id}
                onPress={() => addMember(member)}
                style={({ pressed }) => [
                  styles.memberRow,
                  pressed && styles.memberRowPressed,
                ]}
              >
                <View style={styles.memberInfo}>
                  <View
                    style={[styles.avatar, { backgroundColor: member.color }]}
                  >
                    <Text style={styles.avatarText}>{member.initials}</Text>
                  </View>
                  <Text style={styles.memberName}>{member.name}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </BottomSheetScrollView>
      </View>
    </BottomSheet>
  );
};
