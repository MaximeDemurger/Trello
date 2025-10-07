import { FooterAction } from "../FooterAction/FooterAction";
import { BottomSheet } from "../BottomSheet/BottomSheet";
import { FC, useState } from "react";
import { View } from "react-native";
import { Text } from "react-native";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { styles } from "./CreateBoardModal.styles";

// Create Board Form Component
type CreateBoardFormProps = {
  title: string;
  description: string;
  onTitleChange: (text: string) => void;
  onDescriptionChange: (text: string) => void;
  visible: boolean;
  onClose: () => void;
  onSubmit: () => void;
  onCancel: () => void;
};

export const CreateBoardModal: FC<CreateBoardFormProps> = ({
  title,
  description,
  onTitleChange,
  onDescriptionChange,
  visible,
  onClose,
  onSubmit,
}) => {
  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      index={1}
      snapPoints={["100%"]}
      footerComponent={() => (
        <FooterAction
          onClose={onClose}
          onCreate={onSubmit}
          title={title}
          submitLabel="Create Board"
        />
      )}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Create New Board</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Title</Text>
          <BottomSheetTextInput
            style={styles.textInput}
            value={title}
            onChangeText={onTitleChange}
            placeholder="Board Title"
            placeholderTextColor="#9ca3af"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Description</Text>
          <BottomSheetTextInput
            style={[styles.textInput, styles.textArea]}
            value={description}
            onChangeText={onDescriptionChange}
            placeholder="Board Description"
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={4}
          />
        </View>
      </View>
    </BottomSheet>
  );
};
