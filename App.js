import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, SafeAreaView } from 'react-native';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wuhlnkvsoskdgpymdxer.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1aGxua3Zzb3NrZGdweW1keGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzNzA2NjUsImV4cCI6MjA3Nzk0NjY2NX0.eyMbKq-7c3pby2dtRO8_dAxCL0nWWA8p27iq0lgULeY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function App() {
  const [bets, setBets] = useState([]);

  useEffect(() => {
    async function fetchBets() {
      let { data, error } = await supabase
        .from('bets')
        .select('*')
        .order('timestamp', { ascending: false });
      setBets(data || []);
    }
    fetchBets();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>🔥 Degenerate Hour 🔥</Text>
      <FlatList
        data={bets}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.bet}>
            <Text style={styles.title}>{item.title}</Text>
            <Text>{item.description}</Text>
            <Text style={styles.oddType}>Odds: {item.odds} | Type: {item.type}</Text>
            <Text style={styles.risk}>Risk Level: {item.risk_level}</Text>
          </View>
        )}
        ListEmptyComponent={<Text>No wild bets yet!</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#171717', padding: 20 },
  header: { color: '#fff', fontSize: 28, fontWeight: 'bold', marginBottom: 14, alignSelf: 'center' },
  bet: { backgroundColor: '#2e2e2e', padding: 16, borderRadius: 8, marginBottom: 12 },
  title: { fontSize: 18, color: '#fff', fontWeight: 'bold' },
  oddType: { color: '#c6ff00', marginTop: 6 },
  risk: { color: '#ff1744', marginTop: 2 }
});
