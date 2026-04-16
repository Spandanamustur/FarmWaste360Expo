// screens/IndustryLogin.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function IndustryLogin({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // ✅ Email format check
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // ✅ Login handler
  const handleLogin = async () => {
    if (!validateEmail(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }
    if (!password) {
      Alert.alert('Empty Password', 'Please enter your password.');
      return;
    }

    try {
      const storedUsers = await AsyncStorage.getItem('industryUsers');
      const users = storedUsers ? JSON.parse(storedUsers) : [];

      const foundUser = users.find((u) => u.email === email && u.password === password);

      if (foundUser) {
        await AsyncStorage.setItem('userType', 'industry');
        await AsyncStorage.setItem('currentUser', email);
        navigation.replace('IndustryDashboard');
      } else {
        Alert.alert('Login Failed', 'Incorrect email or password. Please register first.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Something went wrong. Please try again later.');
    }
  };

  // ✅ Register handler
  const handleRegister = async () => {
    if (!validateEmail(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }
    if (!password) {
      Alert.alert('Empty Password', 'Please enter a password.');
      return;
    }

    try {
      const storedUsers = await AsyncStorage.getItem('industryUsers');
      const users = storedUsers ? JSON.parse(storedUsers) : [];

      const existing = users.find((u) => u.email === email);
      if (existing) {
        Alert.alert('Already Registered', 'This email is already registered.');
        return;
      }

      users.push({ email, password });
      await AsyncStorage.setItem('industryUsers', JSON.stringify(users));

      Alert.alert('Success', 'Registration successful! You can now log in.');
      setEmail('');
      setPassword('');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Registration failed. Try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>🏭 Industry Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
        <Text style={styles.btnText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.registerBtn} onPress={handleRegister}>
        <Text style={styles.registerText}>Register</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.replace('Home')}>
        <Text style={{ color: '#1976D2', marginTop: 20, textAlign: 'center' }}>← Back to Home</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#F3F9FF' },
  header: { fontSize: 24, fontWeight: 'bold', color: '#1976D2', textAlign: 'center', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 10, padding: 10, marginBottom: 15, backgroundColor: '#fff' },
  loginBtn: { backgroundColor: '#1976D2', padding: 14, borderRadius: 10, alignItems: 'center', marginBottom: 10 },
  registerBtn: { backgroundColor: '#BBDEFB', padding: 14, borderRadius: 10, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  registerText: { color: '#0D47A1', fontWeight: '600', fontSize: 16 },
});
