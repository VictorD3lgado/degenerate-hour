import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  StatusBar,
} from 'react-native';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wuhlnkvsoskdgpymdxer.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1aGxua3Zzb3NrZGdweW1keGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzNzA2NjUsImV4cCI6MjA3Nzk0NjY2NX0.eyMbKq-7c3pby2dtRO8_dAxCL0nWWA8p27iq0lgULeY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function App() {
  const [activeTab, setActiveTab] = useState('trending');
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddBet, setShowAddBet] = useState(false);
  const [newBet, setNewBet] = useState({
    title: '',
    description: '',
    type: 'parlay',
    odds: '',
    risk_level: 3,
  });

  useEffect(() => {
    fetchBets();
    // Setup realtime subscription
    const subscription = supabase
      .channel('bets_channel')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'bets' },
        (payload) => {
          console.log('Change received!', payload);
          fetchBets();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function fetchBets() {
    setLoading(true);
    let { data, error } = await supabase
      .from('bets')
      .select('*')
      .order('timestamp', { ascending: false });

    if (!error && data) {
      setBets(data);
    }
    setLoading(false);
  }

  async function submitBet() {
    if (!newBet.title || !newBet.odds) {
      alert('Please fill in title and odds');
      return;
    }

    const { data, error } = await supabase
      .from('bets')
      .insert([{
        title: newBet.title,
        description: newBet.description,
        type: newBet.type,
        odds: newBet.odds,
        risk_level: newBet.risk_level,
        created_by: 'mobile_user',
      }]);

    if (!error) {
      setShowAddBet(false);
      setNewBet({
        title: '',
        description: '',
        type: 'parlay',
        odds: '',
        risk_level: 3,
      });
      fetchBets();
    } else {
      alert('Error submitting bet: ' + error.message);
    }
  }

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${minutes} ${ampm}`;
  };

  const getRiskColor = (level) => {
    if (level >= 4) return '#FF1744';
    if (level >= 3) return '#FF9800';
    return '#FFC400';
  };

  const getOddsColor = (odds) => {
    if (!odds) return '#999';
    return odds.toString().includes('+') ? '#00E676' : '#FF5252';
  };

  const renderTrendingTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.profileCircle}>
          <Text style={styles.profileInitial}>D</Text>
        </View>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <Text style={styles.searchPlaceholder}>Search</Text>
        </View>
        <View style={styles.bellIcon}>
          <Text style={styles.bellEmoji}>🔔</Text>
        </View>
      </View>

      {/* Trending Section Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Trending</Text>
        <TouchableOpacity>
          <Text style={styles.viewAll}>View all →</Text>
        </TouchableOpacity>
      </View>

      {/* Premium Banner */}
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

      {/* HOT Parlays Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>HOT Parlays</Text>
        <TouchableOpacity>
          <Text style={styles.viewAll}>View all →</Text>
        </TouchableOpacity>
      </View>

      {/* Bets List */}
      {loading ? (
        <Text style={styles.loadingText}>Loading hot parlays...</Text>
      ) : bets.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🎲</Text>
          <Text style={styles.emptyText}>No hot parlays yet!</Text>
          <Text style={styles.emptySubtext}>Be the first degen to post</Text>
        </View>
      ) : (
        bets.map((bet, index) => (
          <TouchableOpacity key={bet.id || index} style={styles.betCard}>
            <View style={styles.betHeader}>
              <View style={styles.betIconContainer}>
                <Text style={styles.betIcon}>🔥</Text>
              </View>
              <View style={styles.betInfo}>
                <Text style={styles.betTitle}>{bet.title}</Text>
                <Text style={styles.betType}>{bet.type || 'Parlay'}</Text>
              </View>
              <View style={styles.betOddsContainer}>
                <Text style={[styles.betOdds, { color: getOddsColor(bet.odds) }]}>
                  {bet.odds}
                </Text>
              </View>
            </View>

            {bet.description && (
              <Text style={styles.betDescription} numberOfLines={2}>
                {bet.description}
              </Text>
            )}

            <View style={styles.betFooter}>
              <View style={styles.riskContainer}>
                <Text style={styles.riskLabel}>Risk</Text>
                {[1, 2, 3, 4, 5].map((dot) => (
                  <View
                    key={dot}
                    style={[
                      styles.riskDot,
                      {
                        backgroundColor:
                          dot <= (bet.risk_level || 3)
                            ? getRiskColor(bet.risk_level || 3)
                            : '#333',
                      },
                    ]}
                  />
                ))}
              </View>
              <Text style={styles.betTime}>{formatTime(bet.timestamp)}</Text>
            </View>
          </TouchableOpacity>
        ))
      )}

      <View style={{ height: 100 }} />
    </ScrollView>
  );

  const renderBetsTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.tabTitle}>Submit Your Bet</Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          <Text style={styles.label}>Bet Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 5-leg midnight parlay"
            placeholderTextColor="#666"
            value={newBet.title}
            onChangeText={(text) => setNewBet({ ...newBet, title: text })}
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe your bet..."
            placeholderTextColor="#666"
            multiline
            numberOfLines={4}
            value={newBet.description}
            onChangeText={(text) => setNewBet({ ...newBet, description: text })}
          />

          <Text style={styles.label}>Bet Type</Text>
          <View style={styles.typeContainer}>
            {['parlay', 'prop combo', 'fade', 'straight'].map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeButton,
                  newBet.type === type && styles.typeButtonActive,
                ]}
                onPress={() => setNewBet({ ...newBet, type })}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    newBet.type === type && styles.typeButtonTextActive,
                  ]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Odds *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., +2500 or -150"
            placeholderTextColor="#666"
            value={newBet.odds}
            onChangeText={(text) => setNewBet({ ...newBet, odds: text })}
          />

          <Text style={styles.label}>Risk Level: {newBet.risk_level}/5</Text>
          <View style={styles.riskSliderContainer}>
            {[1, 2, 3, 4, 5].map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.riskSliderDot,
                  {
                    backgroundColor:
                      level <= newBet.risk_level ? getRiskColor(newBet.risk_level) : '#333',
                  },
                ]}
                onPress={() => setNewBet({ ...newBet, risk_level: level })}
              />
            ))}
          </View>

          <TouchableOpacity style={styles.submitButton} onPress={submitBet}>
            <Text style={styles.submitButtonText}>🔥 Post Bet</Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );

  const renderPortfolioTab = () => {
    const totalBets = bets.length;
    const avgRisk = bets.length > 0 
      ? (bets.reduce((sum, bet) => sum + (bet.risk_level || 3), 0) / bets.length).toFixed(1)
      : 0;

    return (
      <View style={styles.tabContent}>
        <Text style={styles.tabTitle}>Your Portfolio</Text>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{totalBets}</Text>
              <Text style={styles.statLabel}>Total Bets</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statValue}>{avgRisk}</Text>
              <Text style={styles.statLabel}>Avg Risk</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Recent Activity</Text>

          {bets.slice(0, 5).map((bet, index) => (
            <View key={bet.id || index} style={styles.activityCard}>
              <Text style={styles.activityTitle}>{bet.title}</Text>
              <Text style={styles.activityOdds} style={{ color: getOddsColor(bet.odds) }}>
                {bet.odds}
              </Text>
            </View>
          ))}
          <View style={{ height: 100 }} />
        </ScrollView>
      </View>
    );
  };

  const renderSettingsTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.tabTitle}>Settings</Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingText}>👤 Profile</Text>
          <Text style={styles.settingArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingText}>🔔 Notifications</Text>
          <Text style={styles.settingArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingText}>🎨 Theme</Text>
          <Text style={styles.settingArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingText}>📊 Stats</Text>
          <Text style={styles.settingArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingText}>ℹ️ About</Text>
          <Text style={styles.settingArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.settingItem, styles.logoutItem]}>
          <Text style={styles.logoutText}>🚪 Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />

      {/* Render active tab content */}
      {activeTab === 'trending' && renderTrendingTab()}
      {activeTab === 'bets' && renderBetsTab()}
      {activeTab === 'portfolio' && renderPortfolioTab()}
      {activeTab === 'settings' && renderSettingsTab()}

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('trending')}
        >
          <Text style={styles.navIcon}>📈</Text>
          <Text style={[
            styles.navText,
            activeTab === 'trending' && styles.navTextActive
          ]}>
            Trending
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('bets')}
        >
          <Text style={styles.navIcon}>💰</Text>
          <Text style={[
            styles.navText,
            activeTab === 'bets' && styles.navTextActive
          ]}>
            Bets
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('portfolio')}
        >
          <Text style={styles.navIcon}>📊</Text>
          <Text style={[
            styles.navText,
            activeTab === 'portfolio' && styles.navTextActive
          ]}>
            Portfolio
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('settings')}
        >
          <Text style={styles.navIcon}>⚙️</Text>
          <Text style={[
            styles.navText,
            activeTab === 'settings' && styles.navTextActive
          ]}>
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
  tabContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 16,
  },
  profileCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1E1E1E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  profileInitial: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginRight: 12,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchPlaceholder: {
    color: '#666',
    fontSize: 15,
  },
  bellIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1E1E1E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bellEmoji: {
    fontSize: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '700',
  },
  viewAll: {
    color: '#999',
    fontSize: 14,
  },
  premiumBanner: {
    backgroundColor: '#8B4513',
    borderRadius: 16,
    padding: 20,
    marginBottom: 8,
  },
  premiumContent: {
    marginBottom: 16,
  },
  premiumTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  premiumSubtitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  premiumDescription: {
    color: '#FFE4C4',
    fontSize: 13,
  },
  premiumButton: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  premiumButtonText: {
    color: '#8B4513',
    fontSize: 16,
    fontWeight: '700',
  },
  betCard: {
    backgroundColor: '#161616',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#222',
  },
  betHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  betIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1E1E1E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  betIcon: {
    fontSize: 24,
  },
  betInfo: {
    flex: 1,
  },
  betTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  betType: {
    color: '#999',
    fontSize: 13,
    textTransform: 'capitalize',
  },
  betOddsContainer: {
    marginLeft: 12,
  },
  betOdds: {
    fontSize: 18,
    fontWeight: '700',
  },
  betDescription: {
    color: '#999',
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
    color: '#999',
    fontSize: 12,
    marginRight: 8,
  },
  riskDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  betTime: {
    color: '#666',
    fontSize: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    color: '#666',
    fontSize: 14,
  },
  loadingText: {
    color: '#999',
    textAlign: 'center',
    paddingVertical: 40,
    fontSize: 15,
  },
  tabTitle: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 24,
  },
  formContainer: {
    paddingBottom: 20,
  },
  label: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#161616',
    borderRadius: 12,
    padding: 14,
    color: '#FFF',
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#222',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeButton: {
    backgroundColor: '#161616',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#222',
  },
  typeButtonActive: {
    backgroundColor: '#8B4513',
    borderColor: '#8B4513',
  },
  typeButtonText: {
    color: '#999',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  typeButtonTextActive: {
    color: '#FFF',
  },
  riskSliderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    marginTop: 8,
  },
  riskSliderDot: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#333',
  },
  submitButton: {
    backgroundColor: '#8B4513',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '700',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#161616',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#222',
  },
  statValue: {
    color: '#FFF',
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  statLabel: {
    color: '#999',
    fontSize: 13,
  },
  activityCard: {
    backgroundColor: '#161616',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#222',
  },
  activityTitle: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  activityOdds: {
    fontSize: 16,
    fontWeight: '700',
  },
  settingItem: {
    backgroundColor: '#161616',
    borderRadius: 12,
    padding: 18,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#222',
  },
  settingText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  settingArrow: {
    color: '#666',
    fontSize: 18,
  },
  logoutItem: {
    marginTop: 16,
    backgroundColor: '#1E1E1E',
  },
  logoutText: {
    color: '#FF5252',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#0F0F0F',
    paddingTop: 12,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: '#1E1E1E',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  navIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  navText: {
    color: '#666',
    fontSize: 11,
    fontWeight: '600',
  },
  navTextActive: {
    color: '#FFF',
  },
});