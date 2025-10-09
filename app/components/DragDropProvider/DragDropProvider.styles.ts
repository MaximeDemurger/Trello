import { StyleSheet } from 'react-native-unistyles';

export const styles = StyleSheet.create((theme) => ({
  draggingCard: {
    pointerEvents: 'none',
    width: 280,
    zIndex: 1000,
  },
  draggingShadow: {
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
  },
}));
