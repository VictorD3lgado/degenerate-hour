import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, SafeAreaView, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wuhlnkvsoskdgpymdxer.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1aGxua3Zzb3NrZGdweW1keGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzNzA2NjUsImV4cCI6MjA3Nzk0NjY2NX0.eyMbKq-7c3pby2dtRO8_dAxCL0nWWA8p27iq0lgULeY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const { width } = Dimensions.get('window');

export default function App() {
  const [bets, setBets] = useState([]);
  const [activeTab, setActiveTab] = useState('trending');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBets();
  }, []);

  async function fetchBets() {
    setLoading(true);
    let { data, error } = await supabase
      .from('bets')
      .select('*')
      .order('timestamp', { ascending: false });

    if (data) {
      setBets(data);
    }
    setLoading(false);
  }

  const getRiskColor = (level) => {
    if (level >= 4) return '#FF1744';
    if (level === 3) return '#FF9800';
    return '#FFC400';
  };

  const getOddsColor = (odds) => {
    return odds && odds.startsWith('+') ? '#00E676' : '#FF5252';
  };

  const renderBetCard = ({ item }) => (
    <TouchableOpacity style={styles.betCard} activeOpacity={0.8}>
      <View style={styles.cardHeader}>
        <View style={styles.iconCircle}>
          <Text style={styles.iconText}>🔥</Text>
        </View>
        <View style={styles.cardTitleContainer}>
          <Text style={styles.betTitle}>{item.title}</Text>
          <Text style={styles.betType}>{item.type || 'Parlay'}</Text>
        </View>
        <View style={styles.oddsContainer}>
          <Text style={[styles.oddsText, { color: getOddsColor(item.odds) }]}>
            {item.odds || '+1000'}
          </Text>
        </View>
      </View>

      <Text style={styles.betDescription}>{item.description}</Text>

      <View style={styles.cardFooter}>
        <View style={styles.riskIndicator}>
          <Text style={styles.riskLabel}>Risk</Text>
          <View style={styles.riskDots}>
            {[1, 2, 3, 4, 5].map((dot) => (
              <View
                key={dot}
                style={[
                  styles.riskDot,
                  {
                    backgroundColor:
                      dot <= (item.risk_level || 3)
                        ? getRiskColor(item.risk_level || 3)
                        : '#2A2A2A',
                  },
                ]}
              />
            ))}
          </View>
        </View>
        <Text style={styles.timestamp}>
          {new Date(item.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.profileCircle}>
          <Text style={styles.profileText}>D</Text>
        </View>
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <Text style={styles.searchText}>Search</Text>
        </View>
        <TouchableOpacity style={styles.notificationCircle}>
          <Text style={styles.notificationText}>🔔</Text>
        </TouchableOpacity>
      </View>

      {/* Section Title */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Trending</Text>
        <TouchableOpacity>
          <Text style={styles.viewAllText}>View all →</Text>
        </TouchableOpacity>
      </View>

      {/* Bet List */}
      <FlatList
        data={bets}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderBetCard}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>🎲</Text>
            <Text style={styles.emptySubtext}>No wild bets yet!</Text>
            <Text style={styles.emptyHint}>Be the first degen</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('trending')}
        >
          <Text style={styles.navIcon}>📈</Text>
          <Text
            style={[
              styles.navLabel,
              activeTab === 'trending' && styles.navLabelActive,
            ]}
          >
            Trending
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('market')}
        >
          <Text style={styles.navIcon}>💰</Text>
          <Text
            style={[
              styles.navLabel,
              activeTab === 'market' && styles.navLabelActive,
            ]}
          >
            Market
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('portfolio')}
        >
          <Text style={styles.navIcon}>📊</Text>
          <Text
            style={[
              styles.navLabel,
              activeTab === 'portfolio' && styles.navLabelActive,
            ]}
          >
            Portfolio
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('settings')}
        >
          <Text style={styles.navIcon}>⚙️</Text>
          <Text
            style={[
              styles.navLabel,
              activeTab === 'settings' && styles.navLabelActive,
            ]}
          >
            Settings
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  profileCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#1E1E1E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  searchIcon: {
    fontSize: 16,
  },
  searchText: {
    color: '#666666',
    fontSize: 15,
  },
  notificationCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#1E1E1E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationText: {
    fontSize: 18,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  viewAllText: {
    color: '#666666',
    fontSize: 14,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  betCard: {
    backgroundColor: '#161616',
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#222222',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#242424',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 20,
  },
  cardTitleContainer: {
    flex: 1,
  },
  betTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  betType: {
    color: '#666666',
    fontSize: 13,
    textTransform: 'capitalize',
  },
  oddsContainer: {
    backgroundColor: '#1E1E1E',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  oddsText: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  betDescription: {
    color: '#999999',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 14,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  riskIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  riskLabel: {
    color: '#666666',
    fontSize: 12,
  },
  riskDots: {
    flexDirection: 'row',
    gap: 4,
  },
  riskDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  timestamp: {
    color: '#666666',
    fontSize: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptySubtext: {
    color: '#666666',
    fontSize: 18,
    marginBottom: 4,
  },
  emptyHint: {
    color: '#444444',
    fontSize: 14,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#0F0F0F',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#1A1A1A',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  navIcon: {
    fontSize: 20,
  },
  navLabel: {
    color: '#666666',
    fontSize: 11,
    fontWeight: '500',
  },
  navLabelActive: {
    color: '#FFFFFF',
  },
});
