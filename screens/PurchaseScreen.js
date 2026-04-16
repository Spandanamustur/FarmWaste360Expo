import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, TouchableOpacity, Alert, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function PurchaseScreen({ route, navigation }) {
  const { item } = route.params;
  const [paymentMethod, setPaymentMethod] = useState('Cash');

  const handleUPIPayment = () => {
    const upiId = 'farmername@oksbi';
    const name = 'Farmer';
    const amount = '100';
    const note = `Payment for ${item.item}`;
    const upiUrl = `upi://pay?pa=${upiId}&pn=${name}&am=${amount}&cu=INR&tn=${note}`;
    Linking.openURL(upiUrl).catch(() => Alert.alert('Error', 'No UPI app found.'));
  };

  const confirmPurchase = async () => {
    try {
      const saved = await AsyncStorage.getItem('wasteList');
      const parsed = saved ? JSON.parse(saved) : [];
      const remaining = parsed.filter(w => w.id !== item.id);
      await AsyncStorage.setItem('wasteList', JSON.stringify(remaining));

      const purchasedSaved = await AsyncStorage.getItem('purchasedList');
      const purchased = purchasedSaved ? JSON.parse(purchasedSaved) : [];
      const purchaseRecord = { ...item, purchasedAt: new Date().toISOString(), paymentMethod, buyer: 'Industry (local)' };
      purchased.unshift(purchaseRecord);
      await AsyncStorage.setItem('purchasedList', JSON.stringify(purchased));

      const notSaved = await AsyncStorage.getItem('notifications');
      const notifs = notSaved ? JSON.parse(notSaved) : [];
      notifs.unshift({
        title: 'Item Purchased',
        body: `Your item "${item.item}" (${item.quantity} kg) was purchased.`,
        time: new Date().toISOString(),
        read: false,
      });
      await AsyncStorage.setItem('notifications', JSON.stringify(notifs));

      if (paymentMethod === 'UPI') handleUPIPayment();
      Alert.alert('Success', 'Purchase confirmed.');
      navigation.navigate('PurchaseHistory');
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Purchase failed.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Confirm Purchase</Text>
      <Text style={{fontWeight:'700',marginVertical:8}}>{item.item} — {item.quantity} kg</Text>
      <Text style={{color:'#444'}}>{item.description}</Text>

      <Text style={{marginTop:12}}>Choose Payment Method:</Text>
      <View style={{flexDirection:'row',marginTop:8}}>
        {['Cash','UPI','Card'].map(m => (
          <TouchableOpacity key={m} onPress={() => setPaymentMethod(m)} style={[styles.payBtn, paymentMethod===m && {borderWidth:2,borderColor:'#1976D2'}]}>
            <Text style={{color: paymentMethod===m ? '#1976D2' : '#000'}}>{m}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{marginTop:20}}>
        <Button title="Confirm & Pay" onPress={confirmPurchase} color="#1976D2" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:{flex:1,padding:16,backgroundColor:'#fff'},
  header:{fontSize:20,fontWeight:'700'},
  payBtn:{padding:10,backgroundColor:'#f5f5f5',borderRadius:8,marginRight:8}
});
