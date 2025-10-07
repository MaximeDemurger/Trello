/**
 * CreateGroupModal Component
 * Modal for creating new groups with ref-based control
 */

import React, { useState } from "react";
import { View, Text } from "react-native";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import * as Haptics from "expo-haptics";
import { BottomSheet } from "../BottomSheet/BottomSheet";
import { useBoardStore } from "@/stores/useBoardStore";
import { styles } from "./CreateGroupModal.styles";
import { FooterAction } from "@/components/FooterAction/FooterAction";

type CreateGroupModalProps = {
  boardId: string;
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

export const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
  boardId,
  visible,
  onClose,
  onSuccess,
}) => {
  const [title, setTitle] = useState("");

  const { createGroup } = useBoardStore();

  const handleClose = () => {
    onClose();
    setTitle("");
  };

  const handleCreate = () => {
    if (title.trim()) {
      createGroup({
        title: title.trim(),
        boardId,
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
      snapPoints={["80%"]}
      index={1}
      footerComponent={() => (
        <FooterAction
          onClose={handleClose}
          onCreate={handleCreate}
          title={title}
        />
      )}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Create Group</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Group Name</Text>
          <BottomSheetTextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter group name"
            placeholderTextColor="#9ca3af"
          />
        </View>
      </View>
    </BottomSheet>
  );
};
