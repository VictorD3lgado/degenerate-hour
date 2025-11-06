import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wuhlnkvsoskdgpymdxer.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1aGxua3Zzb3NrZGdweW1keGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzNzA2NjUsImV4cCI6MjA3Nzk0NjY2NX0.eyMbKq-7c3pby2dtRO8_dAxCL0nWWA8p27iq0lgULeY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function App() {
  const [bets, setBets] = useState([]);
  const [activeTab, setActiveTab] = useState('Trending');

  useEffect(() => {
    fetchBets();
  }, []);

  async function fetchBets() {
    let { data, error } = await supabase
      .from('bets')
      .select('*')
      .order('timestamp', { ascending: false });

    if (data) {
      setBets(data);
    }
  }

  const getRiskColor = (level) => {
    if (level >= 4) return '#FF1744';
    if (level >= 3) return '#FF9800';
    return '#FFC400';
  };

  const getOddsColor = (odds) => {
    if (!odds) return '#999999';
    return odds.includes('+') ? '#00E676' : '#FF5252';
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.profileCircle}>
        <Text style={styles.profileText}>D</Text>
      </View>
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          placeholderTextColor="#666666"
        />
      </View>
      <View style={styles.notificationCircle}>
        <Text style={styles.notificationIcon}>🔔</Text>
      </View>
    </View>
  );

  const renderPremiumBanner = () => (
    <View style={styles.premiumBanner}>
      <View style={styles.premiumContent}>
        <Text style={styles.premiumTitle}>Degenerate Hour Premium</Text>
        <Text style={styles.premiumSubtitle}>Membership</Text>
        <Text style={styles.premiumDescription}>
          Unlocking the secrets to successful betting
        </Text>
      </View>
      <TouchableOpacity style={styles.premiumButton}>
        <Text style={styles.premiumButtonText}>Get Now</Text>
      </TouchableOpacity>
    </View>
  );

  const renderBetCard = ({ item }) => (
    <View style={styles.betCard}>
      <View style={styles.betHeader}>
        <View style={styles.betIconCircle}>
          <Text style={styles.betIcon}>🔥</Text>
        </View>
        <View style={styles.betHeaderInfo}>
          <Text style={styles.betTitle}>{item.title || 'Untitled Bet'}</Text>
          <Text style={styles.betType}>{item.type || 'Parlay'}</Text>
        </View>
        <View style={styles.betOddsContainer}>
          <Text style={[styles.betOdds, { color: getOddsColor(item.odds) }]}>
            {item.odds || '+0'}
          </Text>
        </View>
      </View>

      <Text style={styles.betDescription} numberOfLines={2}>
        {item.description || 'No description'}
      </Text>

      <View style={styles.betFooter}>
        <View style={styles.riskContainer}>
          <Text style={styles.riskLabel}>Risk </Text>
          {[1, 2, 3, 4, 5].map((level) => (
            <View
              key={level}
              style={[
                styles.riskDot,
                {
                  backgroundColor:
                    level <= (item.risk_level || 1)
                      ? getRiskColor(item.risk_level)
                      : '#2A2A2A',
                },
              ]}
            />
          ))}
        </View>
        <Text style={styles.betTime}>
          {item.timestamp
            ? new Date(item.timestamp).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              })
            : 'Now'}
        </Text>
      </View>
    </View>
  );

  const renderContent = () => {
    if (activeTab === 'Trending') {
      return (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Trending</Text>
            <TouchableOpacity>
              <Text style={styles.viewAll}>View all →</Text>
            </TouchableOpacity>
          </View>

          {renderPremiumBanner()}

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>HOT Parlays</Text>
            <TouchableOpacity>
              <Text style={styles.viewAll}>View all →</Text>
            </TouchableOpacity>
          </View>

          {bets.length > 0 ? (
            bets.map((item) => (
              <View key={item.id}>{renderBetCard({ item })}</View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🎲</Text>
              <Text style={styles.emptyText}>No hot parlays yet!</Text>
              <Text style={styles.emptySubtext}>
                Be the first degen to post a wild bet
              </Text>
            </View>
          )}
        </ScrollView>
      );
    }

    return (
      <View style={styles.centerContent}>
        <Text style={styles.comingSoon}>{activeTab}</Text>
        <Text style={styles.comingSoonSub}>Coming soon...</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      {renderContent()}

      <View style={styles.bottomNav}>
        {['Trending', 'Bets', 'Portfolio', 'Settings'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={styles.navItem}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={styles.navIcon}>
              {tab === 'Trending'
                ? '📈'
                : tab === 'Bets'
                ? '💰'
                : tab === 'Portfolio'
                ? '📊'
                : '⚙️'}
            </Text>
            <Text
              style={[
                styles.navLabel,
                activeTab === tab && styles.navLabelActive,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
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
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1E1E1E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 44,
    gap: 8,
  },
  searchIcon: {
    fontSize: 16,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
  },
  notificationCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1E1E1E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationIcon: {
    fontSize: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  viewAll: {
    color: '#999999',
    fontSize: 14,
  },
  premiumBanner: {
    backgroundColor: '#8B4513',
    borderRadius: 16,
    padding: 20,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  premiumContent: {
    flex: 1,
  },
  premiumTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  premiumSubtitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  premiumDescription: {
    color: '#FFCCCC',
    fontSize: 13,
    lineHeight: 18,
  },
  premiumButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  premiumButtonText: {
    color: '#8B4513',
    fontWeight: 'bold',
    fontSize: 14,
  },
  betCard: {
    backgroundColor: '#161616',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  betHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  betIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  betIcon: {
    fontSize: 20,
  },
  betHeaderInfo: {
    flex: 1,
  },
  betTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  betType: {
    color: '#999999',
    fontSize: 13,
  },
  betOddsContainer: {
    alignItems: 'flex-end',
  },
  betOdds: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  betDescription: {
    color: '#CCCCCC',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  betFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  riskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  riskLabel: {
    color: '#999999',
    fontSize: 12,
    marginRight: 6,
  },
  riskDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  betTime: {
    color: '#666666',
    fontSize: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubtext: {
    color: '#999999',
    fontSize: 14,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  comingSoon: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  comingSoonSub: {
    color: '#999999',
    fontSize: 16,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#0A0A0A',
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
    paddingBottom: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 12,
  },
  navIcon: {
    fontSize: 24,
    marginBottom: 4,
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
