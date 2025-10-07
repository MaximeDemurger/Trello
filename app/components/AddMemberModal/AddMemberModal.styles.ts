import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.gray900,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.gray100,
    alignItems: "center",
    justifyContent: "center",
  },
  searchInput: {
    backgroundColor: theme.colors.gray50,
    borderWidth: 1,
    borderColor: theme.colors.gray200,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.gray900,
    marginBottom: theme.spacing.lg,
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.gray600,
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
    marginBottom: theme.spacing.md,
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.gray50,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.xs,
  },
  memberRowPressed: {
    backgroundColor: theme.colors.gray100,
  },
  memberInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.white,
  },
  memberName: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.gray900,
  },
  emptyText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.gray500,
    textAlign: "center" as const,
    paddingVertical: theme.spacing.xl,
  },
}));

