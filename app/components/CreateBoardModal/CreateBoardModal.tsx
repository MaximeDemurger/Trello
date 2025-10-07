import { FooterAction } from "../FooterAction/FooterAction";
import { BottomSheet } from "../BottomSheet/BottomSheet";
import { FC, useState } from "react";
import { View, Pressable } from "react-native";
import { Text } from "react-native";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { styles } from "./CreateBoardModal.styles";

// Create Board Form Component
type CreateBoardFormProps = {
  title: string;
  description: string;
  onTitleChange: (text: string) => void;
  onDescriptionChange: (text: string) => void;
  color: string;
  onColorChange: (color: string) => void;
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
  color,
  onColorChange,
  visible,
  onClose,
  onSubmit,
}) => {
  const COLOR_OPTIONS = [
    "#FFE4E6", // rose-100
    "#FEF3C7", // amber-100
    "#E0E7FF", // indigo-100
    "#EDE9FE", // violet-100
    "#E0F2FE", // sky-100
    "#DCFCE7", // green-100
    "#D1FAE5", // emerald-100
    "#FCE7F3", // pink-100
    "#E9D5FF", // violet-200
    "#BFDBFE", // blue-200
  ];
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

        <View style={[styles.inputContainer, styles.colorSection]}>
          <Text style={styles.label}>Background color</Text>
          <View style={styles.colorGrid}>
            {COLOR_OPTIONS.map((c) => (
              <Pressable
                key={c}
                accessibilityRole="button"
                accessibilityLabel={`Select color ${c}`}
                onPress={() => onColorChange(c)}
                style={[
                  styles.colorSwatch,
                  { backgroundColor: c },
                  color === c && styles.colorSwatchSelected,
                ]}
              />
            ))}
          </View>
        </View>
      </View>
    </BottomSheet>
  );
};
