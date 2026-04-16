// screens/HomeScreen.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';

export default function HomeScreen({ navigation }) {
  // Function for Chat (single WhatsApp-like chat button)
  const handleChat = () => {
    Alert.alert(
      'Select Role',
      'Who are you chatting as?',
      [
        { text: 'Farmer 👨‍🌾', onPress: () => navigation.navigate('Chat', { userType: 'farmer' }) },
        { text: 'Industry 🏭', onPress: () => navigation.navigate('Chat', { userType: 'industry' }) },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>FarmWaste360</Text>

      {/* Farmer Login */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#2E7D32' }]}
        onPress={() => navigation.navigate('FarmerLogin')}
      >
        <Text style={styles.btnText}>Farmer Login</Text>
      </TouchableOpacity>

      {/* Industry Login */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#1976D2' }]}
        onPress={() => navigation.navigate('IndustryLogin')}
      >
        <Text style={styles.btnText}>Industry Login</Text>
      </TouchableOpacity>

      {/* Chat Button */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#6A1B9A' }]}
        onPress={handleChat}
      >
        <Text style={styles.btnText}>💬 Chat</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 30 },
  button: { padding: 14, borderRadius: 8, width: 240, alignItems: 'center', marginVertical: 8 },
  btnText: { color: '#fff', fontSize: 18, fontWeight: '600' },
});
