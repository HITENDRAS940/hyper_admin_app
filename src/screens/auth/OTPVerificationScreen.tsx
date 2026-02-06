import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { adminAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation, useRoute } from '@react-navigation/native';

const OTPVerificationScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { login } = useAuth();

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const email = route.params?.email;

  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 4) {
      Alert.alert('Error', 'Please enter a valid OTP');
      return;
    }

    setLoading(true);
    try {
      const { token } = await adminAPI.verifyEmailOtp(email, otp);
      await login(token);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Verification
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Enter the OTP sent to {email}
        </Text>

        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.colors.surface,
              color: theme.colors.text,
              borderColor: theme.colors.border,
            },
          ]}
          placeholder="Enter OTP"
          placeholderTextColor={theme.colors.textSecondary}
          keyboardType="number-pad"
          value={otp}
          onChangeText={setOtp}
          maxLength={6}
        />

        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.colors.primary }]}
          onPress={handleVerifyOtp}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Verifying...' : 'Verify OTP'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
    justifyContent: 'center',
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
  },
  input: {
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 24,
  },
  button: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default OTPVerificationScreen;
