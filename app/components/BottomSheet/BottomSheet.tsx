/**
 * BottomSheet Component
 * Gorhom bottom sheet wrapper with minimal API
 */

import React, { FC, useCallback, useEffect, useRef } from "react";
import { StyleSheet } from "react-native-unistyles";
import {
  BottomSheetBackdrop,
  BottomSheetScrollView,
  BottomSheetModal as GorhomBottomSheetModal,
  BottomSheetModalProps as GorhomBottomSheetProps,
} from "@gorhom/bottom-sheet";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type BottomSheetProps = GorhomBottomSheetProps & {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  onReady?: (api: {
    expandTo: (index: number) => void;
    expandToMax: () => void;
  }) => void;
};

export const BottomSheet: FC<BottomSheetProps> = ({
  visible,
  onClose,
  children,
  onReady,
  ...props
}) => {
  const modalRef = useRef<GorhomBottomSheetModal>(null);
  const insets = useSafeAreaInsets();
  const handleChange = useCallback(
    (index: number) => {
      if (index === -1) {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (visible) {
      modalRef.current?.present();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      modalRef.current?.dismiss();
    }
  }, [visible]);

  useEffect(() => {
    if (!onReady) return;
    const api = {
      expandTo: (index: number) => modalRef.current?.snapToIndex(index),
      expandToMax: () => modalRef.current?.snapToIndex(1),
    };
    onReady(api);
  }, [onReady]);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        {...props}
      />
    ),
    []
  );

  return (
    <GorhomBottomSheetModal
      ref={modalRef}
      index={0}
      onChange={handleChange}
      backdropComponent={renderBackdrop}
      keyboardBehavior="extend"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
      enablePanDownToClose
      enableDismissOnClose
      handleIndicatorStyle={styles.handleIndicator}
      handleStyle={styles.handle}
      topInset={insets.top}
      {...props}
    >
      <BottomSheetScrollView
        showsVerticalScrollIndicator={false}
        enableFooterMarginAdjustment
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: insets.bottom }}
        style={styles.contentContainer}
      >
        {children}
      </BottomSheetScrollView>
    </GorhomBottomSheetModal>
  );
};

const styles = StyleSheet.create((theme) => ({
  contentContainer: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  handleIndicator: {
    backgroundColor: theme.colors.gray300,
    width: 40,
  },
  handle: {
    paddingTop: theme.spacing.sm,
  },
}));
