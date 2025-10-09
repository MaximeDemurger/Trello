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
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/providers/AuthProvider';

export const AuthScreen: React.FC = () => {
  const navigation = useNavigation();
  const { signInWithPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await signInWithPassword({ email: email.trim(), password });
      if (error) Alert.alert('Sign In Failed', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = () => {
    (navigation as any).navigate('Signup');
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
        {/* Header with Gradient */}
        <LinearGradient
          colors={['rgb(99, 102, 241)', 'rgb(59, 130, 246)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          {/* Back Button */}
          <Pressable
            onPress={handleBack}
            style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.7 }]}
          >
            <Ionicons name="arrow-back" size={16} color="white" />
          </Pressable>

          {/* Logo Icon */}
          <View style={styles.logoContainer}>
            <MaterialCommunityIcons name="view-dashboard" size={32} color="rgb(99, 102, 241)" />
          </View>

          {/* Title */}
          <Text style={styles.headerTitle}>Welcome Back</Text>

          {/* Subtitle */}
          <Text style={styles.headerSubtitle}>
            Sign in to continue to your boards
          </Text>
        </LinearGradient>

        {/* Main Content with Rounded Top */}
        <View style={styles.mainContent}>
          {/* Form Section */}
          <View style={styles.formSection}>
            {/* Email Field */}
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
              <Ionicons name="mail-outline" size={16} color="#9ca3af" style={styles.inputIcon} />
            </View>

            {/* Password Field */}
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor="#adaebc"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoComplete="password"
              />
              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={8}
                style={styles.inputIcon}
              >
                <Ionicons
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={16}
                  color="#9ca3af"
                />
              </Pressable>
            </View>

            {/* Forgot Password */}
            <Pressable style={styles.forgotPasswordContainer}>
              <Text style={styles.forgotPasswordText}>Forgot password?</Text>
            </Pressable>

            {/* Submit Button */}
            <Pressable
              onPress={handleSubmit}
              disabled={isSubmitting}
              style={({ pressed }) => [
                styles.submitButton,
                pressed && { opacity: 0.9 },
                isSubmitting && { opacity: 0.6 },
              ]}
            >
              <LinearGradient
                colors={['rgb(99, 102, 241)', 'rgb(139, 92, 246)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.submitGradient}
                >
                  <Text style={styles.submitButtonText}>Sign In</Text>
                </LinearGradient>
            </Pressable>
          </View>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social Login Buttons */}
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
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Don't have an account?{' '}
        </Text>
        <Pressable onPress={handleSignUp}>
          <Text style={styles.footerLink}>Sign up</Text>
        </Pressable>
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

  // Header Section
  header: {
    paddingTop: 48,
    paddingBottom: 32,
    paddingHorizontal: 24,
    minHeight: 304,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: theme.colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: '700',
    color: theme.colors.white,
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },

  // Main Content
  mainContent: {
    flex: 1,
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 32,
    paddingHorizontal: 24,
    marginTop: -24,
  },

  // Form Section
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
    backgroundColor: theme.colors.gray50,
    borderWidth: 1,
    borderColor: theme.colors.gray200,
    borderRadius: 12,
    height: 50,
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.gray900,
  },
  inputIcon: {
    marginLeft: 8,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginTop: 12,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgb(99, 102, 241)',
  },
  submitButton: {
    marginTop: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  submitGradient: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.white,
  },

  // Divider
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.gray200,
  },
  dividerText: {
    fontSize: 14,
    color: theme.colors.gray500,
    paddingHorizontal: 16,
  },

  // Social Buttons
  socialSection: {
    gap: 12,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.gray200,
    borderRadius: 12,
    height: 54,
    gap: 12,
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.gray700,
  },

  // Touch ID
  touchIdSection: {
    marginTop: 12,
    marginBottom: 32,
  },
  touchIdButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.gray50,
    borderRadius: 12,
    height: 52,
    gap: 12,
  },
  touchIdButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.gray700,
  },

  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: theme.colors.white,
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
}));
