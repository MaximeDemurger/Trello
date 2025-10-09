import React, { useState } from 'react';
import { View } from 'react-native';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';
import { BottomSheet } from '../BottomSheet/BottomSheet';
import { useBoardStore } from '@/stores/useBoardStore';
import { styles } from './ItemDetails.styles';
import { ItemHeader } from './components/ItemHeader';
import { DescriptionSection } from './components/DescriptionSection';
import { DetailsSection } from './components/DetailsSection';
import { MembersSection } from './components/MembersSection';
import { MoveToSection } from './components/MoveToSection';
import { FooterActions } from './components/FooterActions';
import { AddMemberModal } from '../AddMemberModal/AddMemberModal';

const Footer = ({ onDelete }: { onDelete: () => void }) => <FooterActions onDelete={onDelete} />;

type ItemDetailsModalProps = {
  boardId: string;
  itemId: string | null;
  visible: boolean;
  onClose: () => void;
};

export const ItemDetailsModal: React.FC<ItemDetailsModalProps> = ({
  boardId,
  itemId,
  visible,
  onClose,
}) => {
  const getItem = useBoardStore((state) => state.getItem);
  const deleteItem = useBoardStore((state) => state.deleteItem);
  const getBoardWithGroups = useBoardStore((state) => state.getBoardWithGroups);

  const [isMemberVisible, setIsMemberVisible] = useState(false);

  const handleClose = () => {
    onClose();
  };

  const handleDelete = () => {
    if (itemId) {
      deleteItem(itemId);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      handleClose();
    }
  };

  const item = itemId ? getItem(itemId) : undefined;
  const board = getBoardWithGroups(boardId);

  if (!item) return null;

  const renderFooter = () => <Footer onDelete={handleDelete} />;

  return (
    <BottomSheet footerComponent={renderFooter} index={0} onClose={handleClose} visible={visible}>
      <View style={styles.container}>
        <ItemHeader itemId={item.id} onClose={handleClose} title={item.title} />

        <BottomSheetScrollView showsVerticalScrollIndicator={false} style={styles.content}>
          <DescriptionSection description={item.description} itemId={item.id} />

          <DetailsSection
            assignee={item.assignedMembers?.[0]?.name}
            createdAt={item.createdAt}
            dueDate={item.dueDate}
            itemId={item.id}
            priority={item.priority}
            updatedAt={item.updatedAt}
          />

          <MembersSection
            memberIds={item.assignedMembers?.map((m) => m.id) ?? []}
            onOpenMemberModal={() => setIsMemberVisible(true)}
          />

          {board && (
            <MoveToSection
              currentGroupId={item.groupId}
              groups={board.groups.map((g) => ({ id: g.id, title: g.title }))}
              itemId={item.id}
            />
          )}
        </BottomSheetScrollView>
      </View>
      <AddMemberModal
        itemId={item.id}
        onClose={() => setIsMemberVisible(false)}
        visible={isMemberVisible}
      />
    </BottomSheet>
  );
};
