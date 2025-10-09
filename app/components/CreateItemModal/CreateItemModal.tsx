import React, { useMemo, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { BottomSheet } from '../BottomSheet/BottomSheet';
import { AddMemberModal } from '../AddMemberModal/AddMemberModal';
import { useBoardStore } from '@/stores/useBoardStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { styles } from './CreateItemModal.styles';
import { FooterAction } from '@/components/FooterAction/FooterAction';
import { Member } from '@/types/board.types';

type CreateItemModalProps = {
  boardId: string;
  visible: boolean;
  groupId: string | null;
  onClose: () => void;
  onSuccess?: () => void;
};

export const CreateItemModal: React.FC<CreateItemModalProps> = ({
  boardId,
  visible,
  groupId,
  onClose,
  onSuccess,
}) => {
  const insets = useSafeAreaInsets();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignee, setAssignee] = useState<Member[]>([]);
  const [isMemberVisible, setIsMemberVisible] = useState(false);
  const [dueDate, setDueDate] = useState('');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const d = dueDate ? new Date(dueDate) : new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | undefined>(undefined);
  const [labelsText, setLabelsText] = useState('');

  const { createItem } = useBoardStore();

  const handleClose = () => {
    onClose();
    setTitle('');
    setDescription('');
    setAssignee([]);
    setDueDate('');
    setPriority(undefined);
    setLabelsText('');
  };

  const handleCreate = () => {
    if (title.trim() && groupId) {
      createItem({
        title: title.trim(),
        description: description.trim(),
        groupId,
        boardId,
        assignedMembers: assignee,
        dueDate: dueDate.trim() || undefined,
        priority,
        labels: labelsText
          .split(',')
          .map((s) => s.trim())
          .filter((s) => s.length > 0),
      });

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      handleClose();

      if (onSuccess) {
        onSuccess();
      }
    }
  };

  const formatDisplayDate = (iso?: string) => {
    if (!iso) return 'Select a date (optional)';
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const daysMatrix = useMemo(() => {
    const year = visibleMonth.getFullYear();
    const month = visibleMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: Array<{ key: string; date?: Date; label: string }>[] = [];
    let current: Array<{ key: string; date?: Date; label: string }> = [];
    for (let i = 0; i < firstDay; i++) {
      current.push({ key: `blank-${i}`, label: '' });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      current.push({ key: `d-${d}`, date, label: String(d) });
      if (current.length === 7) {
        days.push(current);
        current = [];
      }
    }
    if (current.length) days.push(current);
    return days;
  }, [visibleMonth]);

  const isSameDay = (a?: Date, bIso?: string) => {
    if (!a || !bIso) return false;
    const b = new Date(bIso);
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={handleClose}
      index={0}
      footerComponent={() => (
        <FooterAction
          onClose={handleClose}
          onCreate={handleCreate}
          title={title}
          submitLabel="Create"
        />
      )}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Create Item</Text>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Title</Text>
          <BottomSheetTextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter item title"
            placeholderTextColor="#9ca3af"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Description</Text>
          <BottomSheetTextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Enter item description"
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Members</Text>
          <Pressable
            onPress={() => setIsMemberVisible(true)}
            style={({ pressed }) => [styles.addMemberButton, pressed && { opacity: 0.8 }]}
          >
            <View style={styles.membersList}>
              {assignee.length > 0 ? (
                assignee.slice(0, 5).map((member) => (
                  <View
                    key={member.id}
                    style={[styles.memberAvatar, { backgroundColor: member.color }]}
                  >
                    <Text style={styles.memberAvatarText}>{member.initials}</Text>
                  </View>
                ))
              ) : (
                <Ionicons name="person-add-outline" size={20} color="#6b7280" />
              )}
              {assignee.length > 5 && (
                <View style={[styles.memberAvatar, { backgroundColor: '#6b7280' }]}>
                  <Text style={styles.memberAvatarText}>+{assignee.length - 5}</Text>
                </View>
              )}
            </View>
            <Text style={styles.addMemberText}>
              {assignee.length > 0 ? 'Manage members' : 'Add members'}
            </Text>
          </Pressable>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Due date</Text>
          <Pressable
            onPress={() => setIsDatePickerOpen((v) => !v)}
            style={({ pressed }) => [styles.input, pressed && { opacity: 0.9 }]}
          >
            <Text style={{ color: dueDate ? '#111827' : '#9ca3af' }}>
              {formatDisplayDate(dueDate || undefined)}
            </Text>
          </Pressable>
          {isDatePickerOpen && (
            <View
              style={{
                marginTop: 8,
                borderWidth: 1,
                borderColor: '#e5e7eb',
                borderRadius: 12,
                backgroundColor: '#fff',
                padding: 8,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingHorizontal: 4,
                  marginBottom: 4,
                }}
              >
                <Pressable
                  accessibilityRole="button"
                  onPress={() =>
                    setVisibleMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
                  }
                  style={{
                    width: 28,
                    height: 28,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 14,
                    backgroundColor: '#f3f4f6',
                  }}
                >
                  <Ionicons name="chevron-back" size={18} color="#374151" />
                </Pressable>
                <Text style={{ fontSize: 12, color: '#1f2937', fontWeight: '600' }}>
                  {visibleMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={() =>
                    setVisibleMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
                  }
                  style={{
                    width: 28,
                    height: 28,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 14,
                    backgroundColor: '#f3f4f6',
                  }}
                >
                  <Ionicons name="chevron-forward" size={18} color="#374151" />
                </Pressable>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  paddingHorizontal: 2,
                }}
              >
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                  <Text
                    key={d}
                    style={{
                      width: 32,
                      textAlign: 'center',
                      fontSize: 12,
                      color: '#6b7280',
                      fontWeight: '500',
                    }}
                  >
                    {d}
                  </Text>
                ))}
              </View>
              {daysMatrix.map((row, i) => (
                <View
                  key={i}
                  style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}
                >
                  {row.map((cell) => {
                    const selected = isSameDay(cell.date, dueDate || undefined);
                    const today = cell.date
                      ? isSameDay(cell.date, new Date().toISOString())
                      : false;
                    if (!cell.date) {
                      return <View key={cell.key} style={{ width: 32, height: 32 }} />;
                    }
                    return (
                      <Pressable
                        key={cell.key}
                        onPress={() => {
                          const iso = cell.date!.toISOString();
                          setDueDate(iso);
                          setIsDatePickerOpen(false);
                        }}
                        style={({ pressed }) => [
                          {
                            width: 32,
                            height: 32,
                            borderRadius: 6,
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: '#f3f4f6',
                          },
                          selected && { backgroundColor: '#6366f1' },
                          today && { borderWidth: 1, borderColor: '#6366f1' },
                          pressed && { opacity: 0.9 },
                        ]}
                      >
                        <Text
                          style={{
                            fontSize: 12,
                            color: selected ? '#ffffff' : '#1f2937',
                            fontWeight: '600',
                          }}
                        >
                          {cell.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Priority</Text>
          <View style={styles.chipsRow}>
            {['low', 'medium', 'high'].map((p) => (
              <Pressable
                key={p}
                onPress={() => setPriority(p as any)}
                style={[styles.chip, priority === p && styles.chipActive]}
              >
                <Text style={[styles.chipText, priority === p && styles.chipTextActive]}>{p}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Labels</Text>
          <BottomSheetTextInput
            style={styles.input}
            value={labelsText}
            onChangeText={setLabelsText}
            placeholder="Comma-separated labels (optional)"
            placeholderTextColor="#9ca3af"
          />
        </View>
      </View>
      <AddMemberModal
        boardId={boardId}
        visible={isMemberVisible}
        onClose={() => setIsMemberVisible(false)}
        initialSelectedMembers={assignee}
        onConfirm={(members) => setAssignee(members)}
      />
    </BottomSheet>
  );
};
