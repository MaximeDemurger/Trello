import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native-unistyles';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation();

  const handleNext = () => {
    (navigation as any).navigate('Signup');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Icon Circle */}
        <View style={styles.iconCircle}>
          <Ionicons name="rocket" size={48} color="white" />
        </View>

        {/* Title */}
        <Text style={styles.title}>Welcome to{'\n'}BoardFlow</Text>

        {/* Description */}
        <Text style={styles.description}>
          Organize your projects, collaborate{'\n'}with your team, and achieve your{'\n'}goals with
          ease.
        </Text>

        {/* Feature Cards */}
        <View style={styles.featuresContainer}>
          {/* Visual Boards */}
          <View style={[styles.featureCard, { backgroundColor: 'rgba(99, 102, 241, 0.1)' }]}>
            <View style={[styles.featureIconBox, { backgroundColor: 'rgba(99, 102, 241, 0.2)' }]}>
              <MaterialCommunityIcons name="view-dashboard" size={24} color="rgb(99, 102, 241)" />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Visual Boards</Text>
              <Text style={styles.featureDescription}>Organize tasks in intuitive boards</Text>
            </View>
          </View>

          {/* Team Collaboration */}
          <View style={[styles.featureCard, { backgroundColor: 'rgba(6, 182, 212, 0.1)' }]}>
            <View style={[styles.featureIconBox, { backgroundColor: 'rgba(6, 182, 212, 0.2)' }]}>
              <Ionicons name="people" size={24} color="rgb(6, 182, 212)" />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Team Collaboration</Text>
              <Text style={styles.featureDescription}>Work together seamlessly</Text>
            </View>
          </View>

          {/* Progress Tracking */}
          <LinearGradient
            colors={['rgba(16, 185, 129, 0.1)', 'rgba(34, 197, 94, 0.1)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.featureCard}
          >
            <View style={[styles.featureIconBox, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
              <Ionicons name="trending-up" size={24} color="rgb(16, 185, 129)" />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Progress Tracking</Text>
              <Text style={styles.featureDescription}>Monitor your project progress</Text>
            </View>
          </LinearGradient>
        </View>
      </ScrollView>

      {/* Footer with Next Button */}
      <View style={styles.footer}>
        <Pressable
          onPress={handleNext}
          style={({ pressed }) => [styles.nextButton, pressed && { opacity: 0.9 }]}
        >
          <Text style={styles.nextButtonText}>Next</Text>
          <Ionicons name="arrow-forward" size={16} color="white" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: 'center',
  },

  // Icon Circle
  iconCircle: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: 'rgb(99, 102, 241)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },

  // Title
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: theme.colors.gray900,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 36,
  },

  // Description
  description: {
    fontSize: 18,
    color: theme.colors.gray600,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 29.25,
  },

  // Features Container
  featuresContainer: {
    width: '100%',
    gap: 16,
  },

  // Feature Card
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 16,
  },

  featureIconBox: {
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },

  featureTextContainer: {
    flex: 1,
  },

  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.gray900,
    marginBottom: 4,
  },

  featureDescription: {
    fontSize: 14,
    color: theme.colors.gray600,
  },

  // Footer
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    backgroundColor: theme.colors.white,
    alignItems: 'flex-end',
  },

  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgb(99, 102, 241)',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 9999,
    gap: 8,
  },

  nextButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.white,
  },
}));
