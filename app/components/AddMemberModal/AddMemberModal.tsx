/**
 * AddMemberModal Component
 * Modal for adding members to items
 */

import React, { useEffect, useState } from "react";
import { View, Text, Pressable } from "react-native";
import {
  BottomSheetScrollView,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { BottomSheet } from "../BottomSheet/BottomSheet";
import { useBoardStore } from "@/stores/useBoardStore";
import { styles } from "./AddMemberModal.styles";

type AddMemberModalProps = {
  boardId: string;
  itemId?: string | null;
  visible: boolean;
  onClose: () => void;
  onClosed?: () => void;
};

export const AddMemberModal: React.FC<AddMemberModalProps> = ({
  boardId,
  itemId,
  visible,
  onClose,
  onClosed,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const getItem = useBoardStore((state) => state.getItem);
  const updateItem = useBoardStore((state) => state.updateItem);
  const getBoardWithGroups = useBoardStore((state) => state.getBoardWithGroups);
  const members = useBoardStore((state) => state.members);

  useEffect(() => {
    if (visible) {
      setSearchQuery("");
    }
  }, [visible]);

  const handleClose = () => {
    onClose();
    setSearchQuery("");
    if (onClosed) onClosed();
  };

  const item = itemId ? getItem(itemId) : undefined;
  const board = getBoardWithGroups(boardId);

  const itemMembers = members.filter((m) =>
    item?.assignedMembers?.includes(m.id)
  );

  const boardMembers = members.filter(
    (m) =>
      board?.members?.includes(m.id) && !item?.assignedMembers?.includes(m.id)
  );

  const filteredBoardMembers = boardMembers.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addMember = (memberId: string) => {
    if (!item) return;
    const current = item.assignedMembers ?? [];
    if (current.includes(memberId)) return;

    updateItem({ id: item.id, assignedMembers: [...current, memberId] });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const removeMember = (memberId: string) => {
    if (!item) return;
    const current = item.assignedMembers ?? [];
    updateItem({
      id: item.id,
      assignedMembers: current.filter((id) => id !== memberId),
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <BottomSheet visible={visible} onClose={handleClose} snapPoints={["100%"]}>
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

        <BottomSheetTextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search members"
          style={styles.searchInput}
          placeholderTextColor="#9ca3af"
        />

        <BottomSheetScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Card members */}
          {itemMembers.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Card members</Text>
              {itemMembers.map((member) => (
                <Pressable
                  key={member.id}
                  onPress={() => removeMember(member.id)}
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
                  <Ionicons name="close" size={20} color="#6b7280" />
                </Pressable>
              ))}
            </View>
          )}

          {/* Board members */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Board members</Text>
            {filteredBoardMembers.map((member) => (
              <Pressable
                key={member.id}
                onPress={() => addMember(member.id)}
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
            {filteredBoardMembers.length === 0 && (
              <Text style={styles.emptyText}>
                {searchQuery
                  ? "No members found"
                  : "No board members available"}
              </Text>
            )}
          </View>
        </BottomSheetScrollView>
      </View>
    </BottomSheet>
  );
};
