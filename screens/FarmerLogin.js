// screens/FarmerLogin.js
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function FarmerLogin({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [farmers, setFarmers] = useState([]);

  useEffect(() => {
    const loadFarmers = async () => {
      const savedFarmers = await AsyncStorage.getItem('farmers');
      if (savedFarmers) setFarmers(JSON.parse(savedFarmers));
    };
    loadFarmers();
  }, []);

  const handleLogin = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    if (password.trim().length < 4) {
      Alert.alert('Weak Password', 'Password must be at least 4 characters.');
      return;
    }

    // Check if user already exists
    const existingFarmer = farmers.find(
      (f) => f.email.toLowerCase() === email.toLowerCase() && f.password === password
    );

    if (existingFarmer) {
      // ✅ Login success
      await AsyncStorage.setItem('userType', 'farmer');
      await AsyncStorage.setItem('farmerEmail', email);
      navigation.replace('FarmerDashboard');
    } else {
      Alert.alert(
        'Account Not Found',
        'No account found with this email. Would you like to register?',
        [
          {
            text: 'Register',
            onPress: async () => {
              const newFarmer = { email, password };
              const updatedFarmers = [...farmers, newFarmer];
              setFarmers(updatedFarmers);
              await AsyncStorage.setItem('farmers', JSON.stringify(updatedFarmers));

              await AsyncStorage.setItem('userType', 'farmer');
              await AsyncStorage.setItem('farmerEmail', email);

              Alert.alert('Success', 'Account created successfully!');
              navigation.replace('FarmerDashboard');
            },
          },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>👨‍🌾 Farmer Login</Text>

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
        <Text style={styles.btnText}>Login / Register</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.replace('Home')}>
        <Text style={{ color: '#2E7D32', marginTop: 20 }}>← Back to Home</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#F9FFF9' },
  header: { fontSize: 24, fontWeight: 'bold', color: '#2E7D32', textAlign: 'center', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 10, padding: 10, marginBottom: 15, backgroundColor: '#fff' },
  loginBtn: { backgroundColor: '#2E7D32', padding: 14, borderRadius: 10, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
