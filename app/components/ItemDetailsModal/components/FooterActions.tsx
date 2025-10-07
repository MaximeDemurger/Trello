import React from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "../ItemDetails.styles";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  onDelete: () => void;
};

export const FooterActions: React.FC<Props> = ({ onDelete }) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.footer, { paddingBottom: insets.bottom }]}>
      <Pressable
        onPress={onDelete}
        style={({ pressed }) => [
          styles.deleteButton,
          pressed && { opacity: 0.7 },
        ]}
      >
        <Ionicons name="trash-outline" size={18} color="#ef4444" />
        <Text style={styles.deleteButtonText}>Delete</Text>
      </Pressable>
    </View>
  );
};
