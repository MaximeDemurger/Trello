import { FooterAction } from "../FooterAction/FooterAction";
import { BottomSheet } from "../BottomSheet/BottomSheet";
import { FC } from "react";
import { View } from "react-native";
import { Text } from "react-native";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { styles } from "./CreateOrganizationModal.styles";

type CreateOrganizationModalProps = {
  name: string;
  onNameChange: (text: string) => void;
  visible: boolean;
  onClose: () => void;
  onSubmit: () => void;
};

export const CreateOrganizationModal: FC<CreateOrganizationModalProps> = ({
  name,
  onNameChange,
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
          title={name}
          submitLabel="Create Organization"
        />
      )}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Create Organization</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Organization Name</Text>
          <BottomSheetTextInput
            style={styles.textInput}
            value={name}
            onChangeText={onNameChange}
            placeholder="e.g. Acme Inc"
            placeholderTextColor="#9ca3af"
          />
        </View>
      </View>
    </BottomSheet>
  );
};


