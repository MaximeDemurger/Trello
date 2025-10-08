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
  addMemberButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  membersList: {
    flexDirection: "row",
    alignItems: "center",
    gap: -theme.spacing.xs,
  },
  memberAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: theme.colors.white,
  },
  memberAvatarText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.white,
  },
  addMemberText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.gray600,
    fontWeight: theme.typography.fontWeight.medium,
  },
  datePicker: {
    marginTop: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.white,
    padding: theme.spacing.sm,
    gap: theme.spacing.xs,
  },
  dateHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  dateHeaderTitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.gray800,
    fontWeight: theme.typography.fontWeight.semiBold,
  },
  dateNavButton: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: theme.colors.gray100,
  },
  dateWeekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 2,
  },
  dateWeekDay: {
    width: 32,
    textAlign: "center",
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.gray500,
    fontWeight: theme.typography.fontWeight.medium,
  },
  dateGridRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  dateCellBlank: {
    width: 32,
    height: 32,
  },
  dateCell: {
    width: 32,
    height: 32,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.gray100,
  },
  dateCellSelected: {
    backgroundColor: theme.colors.primary,
  },
  dateCellToday: {
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  dateCellText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.gray800,
    fontWeight: theme.typography.fontWeight.semiBold,
  },
}));
