// screens/PurchaseHistory.js
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function PurchaseHistory({ navigation }) {
  const [purchased, setPurchased] = useState([]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', load);
    load();
    return unsubscribe;
  }, [navigation]);

  const load = async () => {
    try {
      const saved = await AsyncStorage.getItem('purchasedList');
      if (saved) {
        const list = JSON.parse(saved);
        // remove duplicate IDs just in case
        const unique = list.filter(
          (item, index, self) => index === self.findIndex(t => t.id === item.id)
        );
        setPurchased(unique);
      } else {
        setPurchased([]);
      }
    } catch (err) {
      console.error('Error loading purchase history:', err);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>🧾 Purchase History</Text>
        <Button title="Back" onPress={() => navigation.goBack()} />
      </View>

      <FlatList
        data={purchased}
        keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {item.image && <Image source={{ uri: item.image }} style={styles.img} />}
            <Text style={styles.itemTitle}>{item.item} — {item.quantity} kg</Text>
            {item.cost && <Text style={styles.cost}>💰 ₹{item.cost}</Text>}
            <Text style={styles.detail}>Buyer: {item.buyer || 'Industry'}</Text>
            <Text style={styles.detail}>Payment: {item.paymentMethod}</Text>
            <Text style={styles.detail}>Purchased: {new Date(item.purchasedAt).toLocaleString()}</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No purchases yet</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, backgroundColor: '#F9FFF9' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  header: { fontSize: 20, fontWeight: '700', color: '#2E7D32' },
  card: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
    elevation: 1
  },
  img: { width: '100%', height: 140, borderRadius: 8, marginBottom: 8 },
  itemTitle: { fontWeight: '700', fontSize: 16, color: '#222' },
  cost: { color: '#2E7D32', marginTop: 4, fontWeight: '600' },
  detail: { color: '#555', marginTop: 2 },
  emptyText: { textAlign: 'center', marginTop: 20, color: '#888' }
});
