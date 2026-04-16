// screens/FarmerDashboard.js
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, Button, FlatList, Image,
  TouchableOpacity, Alert, Modal, ScrollView
} from 'react-native';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

export default function FarmerDashboard({ navigation }) {
  const [wasteItem, setWasteItem] = useState('');
  const [quantity, setQuantity] = useState('');
  const [description, setDescription] = useState('');
  const [contact, setContact] = useState('');
  const [cost, setCost] = useState('');
  const [wasteList, setWasteList] = useState([]);
  const [location, setLocation] = useState(null);
  const [imageUri, setImageUri] = useState(null);

  const [notifications, setNotifications] = useState([]);
  const [notifModalVisible, setNotifModalVisible] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem('wasteList');
      if (saved) setWasteList(JSON.parse(saved));

      const savedNotifs = await AsyncStorage.getItem('notifications');
      const notifs = savedNotifs ? JSON.parse(savedNotifs) : [];
      setNotifications(notifs);
      setUnreadCount(notifs.filter(n => !n.read).length);

      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          let loc = await Location.getCurrentPositionAsync({});
          setLocation(loc.coords);
        }
      } catch (e) { }
    })();
  }, []);

  // 📸 Pick image
  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.status !== 'granted') {
      Alert.alert('Permission Denied', 'We need access to your photos!');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  // 📍 Get location
  const getLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Location permission is required.');
      return;
    }
    let currentLocation = await Location.getCurrentPositionAsync({});
    setLocation(currentLocation.coords);
    Alert.alert('Location captured');
  };

  // ➕ Add new waste
  const addWaste = async () => {
    if (!wasteItem.trim() || !quantity.trim() || !contact.trim() || !cost.trim()) {
      Alert.alert('Missing Info', 'Please fill all required fields including cost.');
      return;
    }

    const newWaste = {
      id: Date.now().toString(),
      item: wasteItem.trim(),
      quantity: quantity.trim(),
      description: description.trim(),
      contact: contact.trim(),
      cost: cost.trim(),
      image: imageUri,
      latitude: location ? location.latitude : null,
      longitude: location ? location.longitude : null,
      createdAt: new Date().toISOString(),
      purchased: false,
    };

    const updated = [...wasteList, newWaste];
    setWasteList(updated);
    await AsyncStorage.setItem('wasteList', JSON.stringify(updated));

    setWasteItem('');
    setQuantity('');
    setDescription('');
    setContact('');
    setCost('');
    setImageUri(null);
    Alert.alert('Added', 'Waste item saved successfully.');
  };

  // 🔔 Notifications
  const openNotifications = async () => {
    const newNotifs = notifications.map(n => ({ ...n, read: true }));
    setNotifications(newNotifs);
    setUnreadCount(0);
    await AsyncStorage.setItem('notifications', JSON.stringify(newNotifs));
    setNotifModalVisible(true);
  };

  const goToSold = () => navigation.navigate('PurchaseHistory');

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userType');
    navigation.replace('Home');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.header}>🌾 Farmer Dashboard</Text>

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={openNotifications} style={{ marginRight: 12 }}>
            <Ionicons name="notifications-outline" size={28} color="#2E7D32" />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={goToSold} style={{ marginRight: 12 }}>
            <Ionicons name="receipt-outline" size={28} color="#2E7D32" />
          </TouchableOpacity>

          <TouchableOpacity onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={28} color="#D32F2F" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Inputs */}
      <TextInput style={styles.input} placeholder="Waste Item" value={wasteItem} onChangeText={setWasteItem} />
      <TextInput style={styles.input} placeholder="Quantity (kg)" value={quantity} onChangeText={setQuantity} keyboardType="numeric" />
      <TextInput style={styles.input} placeholder="Description" value={description} onChangeText={setDescription} />
      <TextInput style={styles.input} placeholder="Cost (₹)" value={cost} onChangeText={setCost} keyboardType="numeric" />
      <TextInput style={styles.input} placeholder="Contact number" value={contact} onChangeText={setContact} keyboardType="phone-pad" />

      <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
        <Text style={{ color: '#2E7D32', fontWeight: '600' }}>📸 Upload Image</Text>
      </TouchableOpacity>

      {imageUri ? <Image source={{ uri: imageUri }} style={styles.previewImage} /> : null}

      <TouchableOpacity style={styles.imagePicker} onPress={getLocation}>
        <Text style={{ color: '#2E7D32', fontWeight: '600' }}>📍 Capture Location</Text>
      </TouchableOpacity>

      <Button title="Add Waste" onPress={addWaste} color="#2E7D32" />

      {/* Waste List */}
      <Text style={{ marginTop: 14, marginBottom: 6, fontWeight: '700' }}>My Posted Waste</Text>
      <FlatList
        data={wasteList.filter(w => !w.purchased)}
        keyExtractor={(item, index) => item.id ? item.id + index : index.toString()} // ✅ unique key fix
        renderItem={({ item }) => (
          <View style={styles.card}>
            {item.image && <Image source={{ uri: item.image }} style={styles.cardImage} />}
            <Text style={{ fontWeight: '700' }}>{item.item} — {item.quantity} kg</Text>
            {item.description ? <Text style={{ color: '#444' }}>{item.description}</Text> : null}
            <Text style={{ color: '#2E7D32', fontWeight: '600', marginTop: 4 }}>💰 ₹{item.cost}</Text>
            <Text style={{ color: '#666', marginTop: 4 }}>
              📍 {item.latitude ? `${item.latitude.toFixed(4)}, ${item.longitude.toFixed(4)}` : 'No location'}
            </Text>
            <Text style={{ color: '#999', marginTop: 4 }}>Posted: {new Date(item.createdAt).toLocaleString()}</Text>
          </View>
        )}
      />

      {/* Notifications modal */}
      <Modal visible={notifModalVisible} animationType="slide" onRequestClose={() => setNotifModalVisible(false)}>
        <View style={{ flex: 1, padding: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 20, fontWeight: '700' }}>Notifications</Text>
            <Button title="Close" onPress={() => setNotifModalVisible(false)} />
          </View>
          <ScrollView style={{ marginTop: 12 }}>
            {notifications.length === 0 ? (
              <Text style={{ marginTop: 20, color: '#666' }}>No notifications</Text>
            ) : (
              notifications.map((n, idx) => (
                <View
                  key={idx}
                  style={{
                    padding: 12,
                    backgroundColor: n.read ? '#f5f5f5' : '#e8f5e9',
                    borderRadius: 8,
                    marginBottom: 10,
                  }}
                >
                  <Text style={{ fontWeight: '700' }}>{n.title}</Text>
                  <Text style={{ color: '#333', marginTop: 6 }}>{n.body}</Text>
                  <Text style={{ color: '#777', marginTop: 8 }}>{new Date(n.time).toLocaleString()}</Text>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FFF9', padding: 16 },
  header: { fontSize: 20, fontWeight: '700', color: '#2E7D32' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, marginBottom: 8, backgroundColor: '#fff' },
  imagePicker: { backgroundColor: '#E8F5E9', padding: 10, borderRadius: 8, alignItems: 'center', marginBottom: 8 },
  previewImage: { width: '100%', height: 160, borderRadius: 8, marginBottom: 8 },
  card: { backgroundColor: '#fff', padding: 10, borderRadius: 8, marginBottom: 8, elevation: 1 },
  cardImage: { width: '100%', height: 140, borderRadius: 8, marginBottom: 8 },
  badge: { position: 'absolute', right: -6, top: -6, backgroundColor: '#D32F2F', borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2 },
  badgeText: { color: '#fff', fontWeight: '700' },
});
