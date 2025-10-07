import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
  },
  title: {
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.gray900,
    marginBottom: theme.spacing.xl,
  },
  inputContainer: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.gray700,
    marginBottom: theme.spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.white,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.gray900,
    minHeight: 48,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  chip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.gray100,
  },
  chipActive: {
    backgroundColor: theme.colors.primary,
  },
  chipText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.gray800,
    fontWeight: theme.typography.fontWeight.semiBold,
  },
  chipTextActive: {
    color: theme.colors.white,
  },
}));
