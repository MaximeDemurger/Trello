/**
 * BottomSheet Component
 * Gorhom bottom sheet wrapper with minimal API
 */

import React, { FC, useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native-unistyles';
import {
  BottomSheetBackdrop,
  BottomSheetScrollView,
  BottomSheetModal as GorhomBottomSheetModal,
  BottomSheetModalProps as GorhomBottomSheetProps,
} from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type BottomSheetProps = GorhomBottomSheetProps & {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  onReady?: (api: { expandTo: (index: number) => void; expandToMax: () => void }) => void;
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

  const handleChange = (index: number) => {
    if (index === -1) {
      onClose();
    }
  };

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

  const renderBackdrop = (propsBackdrop: any) => (
    <BottomSheetBackdrop appearsOnIndex={0} disappearsOnIndex={-1} {...propsBackdrop} />
  );

  return (
    <GorhomBottomSheetModal
      ref={modalRef}
      android_keyboardInputMode="adjustResize"
      backdropComponent={renderBackdrop}
      enableDismissOnClose
      enablePanDownToClose
      handleIndicatorStyle={styles.handleIndicator}
      handleStyle={styles.handle}
      index={0}
      keyboardBehavior="extend"
      keyboardBlurBehavior="restore"
      onChange={handleChange}
      topInset={insets.top}
      {...props}
    >
      <BottomSheetScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom }}
        enableFooterMarginAdjustment
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
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
