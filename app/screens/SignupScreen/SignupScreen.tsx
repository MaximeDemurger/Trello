import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native-unistyles';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/providers/AuthProvider';

export const SignupScreen: React.FC = () => {
  const navigation = useNavigation();
  const { signUpWithPassword } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordStrength =
    password.length >= 8 ? 'strong' : password.length >= 4 ? 'medium' : 'weak';

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    // Validation
    if (!fullName || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await signUpWithPassword({
        email: email.trim(),
        password,
        displayName: fullName.trim(),
      });

      if (error) {
        Alert.alert('Sign Up Failed', error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignIn = () => {
    (navigation as any).navigate('Auth', { initialMode: 'login' });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={handleBack}
            style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.7 }]}
          >
            <Ionicons name="arrow-back" size={18} color="#374151" />
          </Pressable>

          <View style={styles.headerContent}>
            {/* Logo */}
            <View style={styles.logoContainer}>
              <MaterialCommunityIcons name="view-dashboard" size={24} color="rgb(99, 102, 241)" />
            </View>

            {/* Title */}
            <Text style={styles.headerTitle}>Join BoardFlow</Text>
            <Text style={styles.headerSubtitle}>Create your account to start organizing</Text>
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Social Buttons */}
          <View style={styles.socialSection}>
            <Pressable style={styles.socialButton}>
              <Ionicons name="logo-google" size={18} color="#ea4335" />
              <Text style={styles.socialButtonText}>Continue with Google</Text>
            </Pressable>

            <Pressable style={styles.socialButton}>
              <Ionicons name="logo-apple" size={18} color="#000" />
              <Text style={styles.socialButtonText}>Continue with Apple</Text>
            </Pressable>
          </View>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Form */}
          <View style={styles.formSection}>
            {/* Full Name */}
            <Text style={styles.label}>Full Name</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                placeholderTextColor="#adaebc"
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
                autoComplete="name"
              />
              <Ionicons name="person-outline" size={16} color="#9ca3af" />
            </View>

            {/* Email Address */}
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor="#adaebc"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
              />
              <Ionicons name="mail-outline" size={16} color="#9ca3af" />
            </View>

            {/* Password */}
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Create a password"
                placeholderTextColor="#adaebc"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoComplete="password"
              />
              <Pressable onPress={() => setShowPassword(!showPassword)} hitSlop={8}>
                <Ionicons
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={16}
                  color="#9ca3af"
                />
              </Pressable>
            </View>

            {/* Password Strength Indicator */}
            <View style={styles.passwordStrengthContainer}>
              <View style={styles.passwordStrengthBar}>
                <View
                  style={[
                    styles.passwordStrengthFill,
                    password.length === 0 && { width: 0 },
                    passwordStrength === 'weak' && { width: '33%', backgroundColor: '#ef4444' },
                    passwordStrength === 'medium' && { width: '66%', backgroundColor: '#f59e0b' },
                    passwordStrength === 'strong' && {
                      width: '100%',
                      backgroundColor: '#10b981',
                    },
                  ]}
                />
              </View>
              <Text style={styles.passwordHint}>Password must be at least 8 characters</Text>
            </View>

            {/* Confirm Password */}
            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Confirm your password"
                placeholderTextColor="#adaebc"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoComplete="password"
              />
              <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)} hitSlop={8}>
                <Ionicons name="lock-closed-outline" size={16} color="#9ca3af" />
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
      <View style={styles.footerContainer}>
        <Pressable
          onPress={handleSubmit}
          disabled={isSubmitting}
          style={({ pressed }) => [
            styles.submitButton,
            pressed && { opacity: 0.9 },
            isSubmitting && { opacity: 0.5 },
          ]}
        >
          <Text style={styles.submitButtonText}>Create Account</Text>
        </Pressable>
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Pressable onPress={handleSignIn}>
            <Text style={styles.footerLink}>Sign In</Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  scrollContent: {
    flexGrow: 1,
  },

  // Header
  header: {
    backgroundColor: theme.colors.white,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 24,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerContent: {
    alignItems: 'center',
    marginTop: 36,
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.gray900,
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: theme.colors.gray500,
    textAlign: 'center',
  },

  // Main Content
  mainContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },

  // Social Buttons
  socialSection: {
    gap: 12,
    marginBottom: 24,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.gray300,
    borderRadius: 12,
    height: 54,
    gap: 12,
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.gray700,
  },

  // Divider
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.gray300,
  },
  dividerText: {
    fontSize: 14,
    color: theme.colors.gray500,
    paddingHorizontal: 16,
  },

  // Form
  formSection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.gray700,
    marginBottom: 8,
    marginTop: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.gray300,
    borderRadius: 12,
    height: 50,
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.gray900,
    marginRight: 8,
  },

  // Password Strength
  passwordStrengthContainer: {
    marginTop: 12,
  },
  passwordStrengthBar: {
    height: 4,
    backgroundColor: theme.colors.gray200,
    borderRadius: 9999,
    overflow: 'hidden',
  },
  passwordStrengthFill: {
    height: '100%',
    borderRadius: 9999,
  },
  passwordHint: {
    fontSize: 12,
    color: theme.colors.gray500,
    marginTop: 8,
  },

  // Checkbox
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 16,
    gap: 12,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderWidth: 1,
    borderColor: theme.colors.gray900,
    borderRadius: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkboxLabelContainer: {
    flex: 1,
  },
  checkboxLabel: {
    fontSize: 14,
    color: theme.colors.gray600,
    lineHeight: 20,
  },
  checkboxLink: {
    color: 'rgb(99, 102, 241)',
    fontWeight: '500',
  },

  // Submit Button
  footerContainer: {
    borderTopWidth: 1,
    borderColor: theme.colors.gray100,
    paddingTop: 12,
  },
  submitButton: {
    backgroundColor: 'rgb(99, 102, 241)',
    height: 48,
    borderRadius: 12,
    marginHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.white,
  },

  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  footerText: {
    fontSize: 14,
    color: theme.colors.gray600,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgb(99, 102, 241)',
  },

  // Benefits Section
  benefitsSection: {
    marginTop: 24,
    marginBottom: 32,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.gray900,
    textAlign: 'center',
    marginBottom: 24,
  },
  benefitsList: {
    gap: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.gray50,
    padding: 12,
    borderRadius: 8,
    gap: 12,
  },
  benefitIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  benefitTextContainer: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.gray900,
    marginBottom: 2,
  },
  benefitDescription: {
    fontSize: 12,
    color: theme.colors.gray500,
  },
}));
