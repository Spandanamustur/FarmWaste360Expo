// screens/ChatScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ChatScreen({ route }) {
  const { userType } = route.params;
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    const loadMessages = async () => {
      const stored = await AsyncStorage.getItem('chatMessages');
      if (stored) setMessages(JSON.parse(stored));
    };
    loadMessages();
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMsg = {
      id: Date.now().toString(),
      text: input,
      sender: userType,
      time: new Date().toLocaleTimeString().slice(0, 5),
    };

    const updated = [...messages, newMsg];
    setMessages(updated);
    await AsyncStorage.setItem('chatMessages', JSON.stringify(updated));
    setInput('');
  };

  const renderItem = ({ item }) => (
    <View
      style={[
        styles.message,
        item.sender === userType ? styles.rightMsg : styles.leftMsg,
      ]}
    >
      <Text style={styles.msgText}>{item.text}</Text>
      <Text style={styles.time}>{item.time}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingVertical: 10 }}
      />

      <View style={styles.inputRow}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Type message..."
          style={styles.input}
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendBtn}>
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9FC', padding: 10 },
  message: { marginVertical: 6, padding: 10, borderRadius: 10, maxWidth: '75%' },
  leftMsg: { backgroundColor: '#E0E0E0', alignSelf: 'flex-start' },
  rightMsg: { backgroundColor: '#C8E6C9', alignSelf: 'flex-end' },
  msgText: { fontSize: 16 },
  time: { fontSize: 12, color: '#555', textAlign: 'right', marginTop: 4 },
  inputRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 5 },
  input: { flex: 1, backgroundColor: '#fff', borderRadius: 20, paddingHorizontal: 12, height: 40 },
  sendBtn: { backgroundColor: '#1976D2', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, marginLeft: 8 },
  sendText: { color: '#fff', fontWeight: '600' },
});
