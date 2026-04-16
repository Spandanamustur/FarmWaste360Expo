// screens/IndustryDashboard.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Linking,
  Button,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';

// Utility function to calculate distance
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function IndustryDashboard({ navigation }) {
  const [wasteList, setWasteList] = useState([]);
  const [industryLocation, setIndustryLocation] = useState(null);
  const [nearbyOnly, setNearbyOnly] = useState(false);

  useEffect(() => {
    loadData();
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        let loc = await Location.getCurrentPositionAsync({});
        setIndustryLocation(loc.coords);
      }
    })();
  }, []);

  // Load farmer data from AsyncStorage
  const loadData = async () => {
    const saved = await AsyncStorage.getItem('wasteList');
    if (saved) {
      const parsed = JSON.parse(saved).filter((w) => !w.purchased);
      setWasteList(parsed);
    }
  };

  const toggleNearby = () => setNearbyOnly(!nearbyOnly);

  // Filter by nearby (10 km)
  const filtered = wasteList.filter((item) => {
    if (
      !nearbyOnly ||
      !industryLocation ||
      !item.latitude ||
      !item.longitude
    )
      return true;
    const dist = getDistance(
      industryLocation.latitude,
      industryLocation.longitude,
      item.latitude,
      item.longitude
    );
    return dist <= 10;
  });

  // Call and WhatsApp
  const openCall = (phone) => {
    if (!phone) {
      Alert.alert('No contact');
      return;
    }
    Linking.openURL(`tel:${phone}`);
  };
  const openWhatsApp = (phone) => {
    if (!phone) {
      Alert.alert('No contact');
      return;
    }
    const url = `https://wa.me/${phone.replace(/\D/g, '')}`;
    Linking.openURL(url);
  };

  // Navigate to purchase screen
  const startPurchase = (item) => {
    navigation.navigate('PurchaseScreen', { item });
  };

  // 🔹 Logout function
  const handleLogout = async () => {
    await AsyncStorage.removeItem('industryLoggedIn');
    Alert.alert('Logged out', 'You have been logged out successfully.');
    navigation.replace('IndustryLogin');
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>🏭 Industry Dashboard</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Text style={{ color: '#fff', fontWeight: '600' }}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View
        style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 8 }}
      >
        <Button
          title={nearbyOnly ? 'Show All' : 'Show Nearby (10km)'}
          onPress={toggleNearby}
        />
        <Button title="Refresh" onPress={loadData} />
        <Button
          title="History"
          onPress={() => navigation.navigate('PurchaseHistory')}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {item.image && (
              <Image source={{ uri: item.image }} style={styles.image} />
            )}
            <Text style={styles.title}>
              {item.item} — {item.quantity} kg
            </Text>
            <Text style={{ color: '#444' }}>{item.description}</Text>
            <Text style={{ color: '#666', marginTop: 6 }}>
              Contact: {item.contact || 'N/A'}
            </Text>
            <View style={{ flexDirection: 'row', marginTop: 8 }}>
              <TouchableOpacity
                onPress={() => openCall(item.contact)}
                style={styles.actionBtn}
              >
                <Text style={{ color: '#fff' }}>Call</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => openWhatsApp(item.contact)}
                style={[
                  styles.actionBtn,
                  { backgroundColor: '#25D366', marginLeft: 8 },
                ]}
              >
                <Text style={{ color: '#fff' }}>WhatsApp</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => startPurchase(item)}
                style={[
                  styles.actionBtn,
                  { backgroundColor: '#1976D2', marginLeft: 8 },
                ]}
              >
                <Text style={{ color: '#fff' }}>Purchase</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', marginTop: 20 }}>
            No waste available
          </Text>
        }
      />

      <Text style={{ marginTop: 8, fontWeight: '700' }}>
        Map (filtered shown)
      </Text>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: industryLocation ? industryLocation.latitude : 20.5937,
          longitude: industryLocation ? industryLocation.longitude : 78.9629,
          latitudeDelta: 5,
          longitudeDelta: 5,
        }}
      >
        {filtered.map((i) =>
          i.latitude && i.longitude ? (
            <Marker
              key={i.id}
              coordinate={{ latitude: i.latitude, longitude: i.longitude }}
              title={i.item}
              description={`${i.quantity} kg`}
            />
          ) : null
        )}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, backgroundColor: '#F3F9FF' },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  header: { fontSize: 20, fontWeight: '700', textAlign: 'center', marginVertical: 8 },
  logoutBtn: {
    backgroundColor: '#D32F2F',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  card: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    marginVertical: 6,
    elevation: 1,
  },
  image: { width: '100%', height: 140, borderRadius: 8, marginBottom: 8 },
  title: { fontSize: 16, fontWeight: '700' },
  actionBtn: { backgroundColor: '#2E7D32', padding: 8, borderRadius: 6 },
  map: { height: 220, marginTop: 8, borderRadius: 8 },
});
