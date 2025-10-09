import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBoardStore } from '@/stores/useBoardStore';
import { styles } from '../ItemDetails.styles';

type Props = {
  memberIds: string[];
  onOpenMemberModal: () => void;
};

export const MembersSection: React.FC<Props> = ({ memberIds, onOpenMemberModal }) => {
  const members = useBoardStore((state) => state.members);

  const assignedMembers = members.filter((m) => memberIds.includes(m.id));

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons color="#6b7280" name="people-outline" size={20} />
        <Text style={styles.sectionTitle}>Members</Text>
      </View>

      <Pressable
        onPress={onOpenMemberModal}
        style={({ pressed }) => [styles.addMemberButton, pressed && { opacity: 0.8 }]}
      >
        <View style={styles.membersList}>
          {assignedMembers.length > 0 ? (
            assignedMembers.slice(0, 5).map((member) => (
              <View
                key={member.id}
                style={[styles.memberAvatar, { backgroundColor: member.color }]}
              >
                <Text style={styles.memberAvatarText}>{member.initials}</Text>
              </View>
            ))
          ) : (
            <Ionicons color="#6b7280" name="person-add-outline" size={20} />
          )}
          {assignedMembers.length > 5 && (
            <View style={styles.memberAvatar}>
              <Text style={styles.memberAvatarText}>+{assignedMembers.length - 5}</Text>
            </View>
          )}
        </View>
        <Text style={styles.addMemberText}>
          {assignedMembers.length > 0 ? 'Manage members' : 'Add members'}
        </Text>
      </Pressable>
    </View>
  );
};
