import { FooterAction } from '../FooterAction/FooterAction';
import { BottomSheet } from '../BottomSheet/BottomSheet';
import { FC } from 'react';
import { View, Pressable } from 'react-native';
import { Text } from 'react-native';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { styles } from './CreateBoardModal.styles';

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
    '#FFE4E6',
    '#FEF3C7',
    '#E0E7FF',
    '#EDE9FE',
    '#E0F2FE',
    '#DCFCE7',
    '#D1FAE5',
    '#FCE7F3',
    '#E9D5FF',
    '#BFDBFE',
  ];

  const renderFooter = () => (
    <FooterAction onClose={onClose} onCreate={onSubmit} submitLabel="Create Board" title={title} />
  );

  return (
    <BottomSheet
      footerComponent={renderFooter}
      index={1}
      onClose={onClose}
      snapPoints={['100%']}
      visible={visible}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Create New Board</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Title</Text>
          <BottomSheetTextInput
            onChangeText={onTitleChange}
            placeholder="Board Title"
            placeholderTextColor="#9ca3af"
            style={styles.textInput}
            value={title}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Description</Text>
          <BottomSheetTextInput
            multiline
            numberOfLines={4}
            onChangeText={onDescriptionChange}
            placeholder="Board Description"
            placeholderTextColor="#9ca3af"
            style={[styles.textInput, styles.textArea]}
            value={description}
          />
        </View>

        <View style={[styles.inputContainer, styles.colorSection]}>
          <Text style={styles.label}>Background color</Text>
          <View style={styles.colorGrid}>
            {COLOR_OPTIONS.map((c) => (
              <Pressable
                key={c}
                accessibilityLabel={`Select color ${c}`}
                accessibilityRole="button"
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
