import React from "react";
import { View, Text, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";

type Props = {
  onClose: () => void;
  onCreate: () => void;
  title: string;
  cancelLabel?: string;
  submitLabel?: string;
};

export const FooterAction: React.FC<Props> = ({
  onClose,
  onCreate,
  title,
  cancelLabel = "Cancel",
  submitLabel = "Create",
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.buttonContainer, { paddingBottom: insets.bottom }]}> 
      <Pressable
        onPress={onClose}
        style={({ pressed }) => [
          styles.button,
          styles.cancelButton,
          pressed && { opacity: 0.7 },
        ]}
        accessibilityRole="button"
        accessibilityLabel={cancelLabel}
      >
        <Text style={styles.cancelButtonText}>{cancelLabel}</Text>
      </Pressable>

      <Pressable
        onPress={onCreate}
        disabled={!title.trim()}
        style={({ pressed }) => [
          styles.button,
          styles.submitButton,
          !title.trim() && styles.disabledButton,
          pressed && { opacity: 0.7 },
        ]}
        accessibilityRole="button"
        accessibilityLabel={submitLabel}
      >
        <Text style={styles.submitButtonText}>{submitLabel}</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  buttonContainer: {
    flexDirection: "row",
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  button: {
    flex: 1,
    height: theme.components.button.height.md,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.components.button.borderRadius,
  },
  cancelButton: {
    backgroundColor: theme.colors.gray100,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cancelButtonText: {
    color: theme.colors.gray700,
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.fontSize.md,
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
  },
  submitButtonText: {
    color: theme.colors.white,
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: theme.typography.fontSize.md,
  },
  disabledButton: {
    opacity: 0.5,
  },
}));


