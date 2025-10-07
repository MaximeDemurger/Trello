/**
 * ItemDetailsModal Component
 * Modal for viewing and editing item details
 */

import React, { useState, useRef } from "react";
import { View } from "react-native";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import * as Haptics from "expo-haptics";
import { BottomSheet } from "../BottomSheet/BottomSheet";
import { useBoardStore } from "@/stores/useBoardStore";
import type { Item } from "@/types/board.types";
import { styles } from "./ItemDetails.styles";
import { ItemHeader } from "./components/ItemHeader";
import { DescriptionSection } from "./components/DescriptionSection";
import { DetailsSection } from "./components/DetailsSection";
import { MembersSection } from "./components/MembersSection";
import { MoveToSection } from "./components/MoveToSection";
import { FooterActions } from "./components/FooterActions";
import { AddMemberModal } from "../AddMemberModal/AddMemberModal";
type ItemDetailsModalProps = {
  boardId: string;
  itemId: string | null;
  visible: boolean;
  onClose: () => void;
};

export const ItemDetailsModal: React.FC<ItemDetailsModalProps> = ({
  boardId,
  itemId,
  visible,
  onClose,
}) => {

  const getItem = useBoardStore((state) => state.getItem);
  const deleteItem = useBoardStore((state) => state.deleteItem);
  const getBoardWithGroups = useBoardStore((state) => state.getBoardWithGroups);

  const [isMemberVisible, setIsMemberVisible] = useState(false);
  const sheetApiRef = useRef<{
    expandTo: (index: number) => void;
  } | null>(null);

  const handleClose = () => {
    onClose();
  };

  const handleDelete = () => {
    if (itemId) {
      deleteItem(itemId);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      handleClose();
    }
  };

  const item = itemId ? getItem(itemId) : undefined;
  const board = getBoardWithGroups(boardId);

  if (!item) return null;

  return (
    <BottomSheet
      visible={visible}
      onClose={handleClose}
      onReady={(api) => {
        sheetApiRef.current = api;
      }}
      footerComponent={() => <FooterActions onDelete={handleDelete} />}
    >
      <View style={styles.container}>
        <ItemHeader title={item.title} itemId={item.id} onClose={handleClose} />

        <BottomSheetScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <DescriptionSection itemId={item.id} description={item.description} />

          <DetailsSection
            itemId={item.id}
            createdAt={item.createdAt}
            updatedAt={item.updatedAt}
            assignee={item.assignee}
            dueDate={item.dueDate}
            priority={item.priority}
          />

          <MembersSection
            itemId={item.id}
            memberIds={item.assignedMembers ?? []}
            onOpenMemberModal={() => setIsMemberVisible(true)}
          />

          {board && (
            <MoveToSection
              itemId={item.id}
              groups={board.groups.map((g) => ({ id: g.id, title: g.title }))}
              currentGroupId={item.groupId}
            />
          )}
        </BottomSheetScrollView>
      </View>
      <AddMemberModal
        boardId={boardId}
        itemId={item.id}
        visible={isMemberVisible}
        onClose={() => setIsMemberVisible(false)}
        onClosed={() => {
          sheetApiRef.current?.expandTo(1);
        }}
      />
    </BottomSheet>
  );
};
