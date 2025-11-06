import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
  Dimensions,
} from 'react-native';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wuhlnkvsoskdgpymdxer.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1aGxua3Zzb3NrZGdweW1keGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzNzA2NjUsImV4cCI6MjA3Nzk0NjY2NX0.eyMbKq-7c3pby2dtRO8_dAxCL0nWWA8p27iq0lgULeY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const { width } = Dimensions.get('window');

export default function App() {
  const [activeTab, setActiveTab] = useState('trending');
  const [bets, setBets] = useState([]);
  const [showAddBet, setShowAddBet] = useState(false);

  // Form state for adding bets
  const [newBet, setNewBet] = useState({
    title: '',
    description: '',
    type: 'parlay',
    odds: '',
    risk_level: 3,
    created_by: 'anonymous'
  });

  useEffect(() => {
    fetchBets();

    // Subscribe to real-time updates
    const subscription = supabase
      .channel('bets')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'bets' },
        () => fetchBets()
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function fetchBets() {
    const { data, error } = await supabase
      .from('bets')
      .select('*')
      .order('timestamp', { ascending: false });

    if (!error && data) {
      setBets(data);
    }
  }

  async function handleAddBet() {
    if (!newBet.title || !newBet.odds) return;

    const { error } = await supabase
      .from('bets')
      .insert([newBet]);

    if (!error) {
      setShowAddBet(false);
      setNewBet({
        title: '',
        description: '',
        type: 'parlay',
        odds: '',
        risk_level: 3,
        created_by: 'anonymous'
      });
      fetchBets();
    }
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes.toString().padStart(2, '0');
    return `${formattedHours}:${formattedMinutes} ${ampm}`;
  };

  const getOddsColor = (odds) => {
    return odds.startsWith('+') ? '#00E676' : '#FF5252';
  };

  const renderRiskDots = (level) => {
    const colors = ['#FF1744', '#FF5722', '#FF9800', '#FFC400', '#FFEB3B'];
    return (
      <View style={styles.riskContainer}>
        {[1, 2, 3, 4, 5].map((dot) => (
          <View
            key={dot}
            style={[
              styles.riskDot,
              { backgroundColor: dot <= level ? colors[level - 1] : '#2A2A2A' }
            ]}
          />
        ))}
      </View>
    );
  };

  const renderTrendingTab = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      {/* Header Section */}
      <View style={styles.headerSection}>
        <View style={styles.profileCircle}>
          <Text style={styles.profileInitial}>D</Text>
        </View>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <Text style={styles.searchPlaceholder}>Search</Text>
        </View>
        <View style={styles.notificationIcon}>
          <Text style={styles.bellIcon}>🔔</Text>
        </View>
      </View>

      {/* Trending Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Trending</Text>
        <TouchableOpacity>
          <Text style={styles.viewAll}>View all →</Text>
        </TouchableOpacity>
      </View>

      {/* Premium Membership Banner */}
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
      {bets.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🎲</Text>
          <Text style={styles.emptyText}>No hot parlays yet</Text>
          <Text style={styles.emptySubtext}>Be the first degen to post</Text>
        </View>
      ) : (
        bets.map((bet) => (
          <View key={bet.id} style={styles.betCard}>
            <View style={styles.betHeader}>
              <View style={styles.betIconCircle}>
                <Text style={styles.betIcon}>🔥</Text>
              </View>
              <View style={styles.betHeaderInfo}>
                <Text style={styles.betTitle}>{bet.title}</Text>
                <Text style={styles.betType}>{bet.type}</Text>
              </View>
              <Text style={[styles.betOdds, { color: getOddsColor(bet.odds) }]}>
                {bet.odds}
              </Text>
            </View>

            {bet.description && (
              <Text style={styles.betDescription}>{bet.description}</Text>
            )}

            <View style={styles.betFooter}>
              <View style={styles.riskSection}>
                <Text style={styles.riskLabel}>Risk </Text>
                {renderRiskDots(bet.risk_level)}
              </View>
              <Text style={styles.betTime}>{formatTime(bet.timestamp)}</Text>
            </View>
          </View>
        ))
      )}

      <View style={{ height: 100 }} />
    </ScrollView>
  );

  const renderBetsTab = () => (
    <View style={styles.content}>
      <View style={styles.centerContent}>
        <Text style={styles.comingSoonIcon}>💰</Text>
        <Text style={styles.comingSoonText}>Place Your Bets</Text>
        <Text style={styles.comingSoonSubtext}>Submit your hottest parlays</Text>
        <TouchableOpacity 
          style={styles.addBetButton}
          onPress={() => setShowAddBet(true)}
        >
          <Text style={styles.addBetButtonText}>+ Add New Bet</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderPortfolioTab = () => (
    <View style={styles.content}>
      <View style={styles.centerContent}>
        <Text style={styles.comingSoonIcon}>📊</Text>
        <Text style={styles.comingSoonText}>Your Portfolio</Text>
        <Text style={styles.comingSoonSubtext}>Track your wins and losses</Text>
        <View style={styles.statsPreview}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Total Bets</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: '#00E676' }]}>$0.00</Text>
            <Text style={styles.statLabel}>Net Profit</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderSettingsTab = () => (
    <View style={styles.content}>
      <View style={styles.centerContent}>
        <Text style={styles.comingSoonIcon}>⚙️</Text>
        <Text style={styles.comingSoonText}>Settings</Text>
        <Text style={styles.comingSoonSubtext}>Customize your experience</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Content */}
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
            styles.navLabel,
            activeTab === 'trending' && styles.navLabelActive
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
            styles.navLabel,
            activeTab === 'bets' && styles.navLabelActive
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
            styles.navLabel,
            activeTab === 'portfolio' && styles.navLabelActive
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
            styles.navLabel,
            activeTab === 'settings' && styles.navLabelActive
          ]}>
            Settings
          </Text>
        </TouchableOpacity>
      </View>

      {/* Add Bet Modal */}
      <Modal
        visible={showAddBet}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddBet(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Bet</Text>
              <TouchableOpacity onPress={() => setShowAddBet(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.inputLabel}>Bet Title *</Text>
              <TextInput
                style={styles.input}
                value={newBet.title}
                onChangeText={(text) => setNewBet({ ...newBet, title: text })}
                placeholder="5-leg midnight parlay"
                placeholderTextColor="#666"
              />

              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={newBet.description}
                onChangeText={(text) => setNewBet({ ...newBet, description: text })}
                placeholder="Lakers, Warriors, Celtics all to win"
                placeholderTextColor="#666"
                multiline
                numberOfLines={3}
              />

              <Text style={styles.inputLabel}>Bet Type</Text>
              <View style={styles.typeSelector}>
                {['parlay', 'prop combo', 'fade', 'straight'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeButton,
                      newBet.type === type && styles.typeButtonActive
                    ]}
                    onPress={() => setNewBet({ ...newBet, type })}
                  >
                    <Text style={[
                      styles.typeButtonText,
                      newBet.type === type && styles.typeButtonTextActive
                    ]}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Odds *</Text>
              <TextInput
                style={styles.input}
                value={newBet.odds}
                onChangeText={(text) => setNewBet({ ...newBet, odds: text })}
                placeholder="+1200"
                placeholderTextColor="#666"
              />

              <Text style={styles.inputLabel}>Risk Level: {newBet.risk_level}</Text>
              <View style={styles.riskSlider}>
                {[1, 2, 3, 4, 5].map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.riskButton,
                      newBet.risk_level === level && styles.riskButtonActive
                    ]}
                    onPress={() => setNewBet({ ...newBet, risk_level: level })}
                  >
                    <Text style={styles.riskButtonText}>{level}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleAddBet}
              >
                <Text style={styles.submitButtonText}>Post Bet</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },

  // Header Section
  headerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 24,
  },
  profileCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1E1E1E',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  profileInitial: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '600',
  },
  searchBar: {
    flex: 1,
    height: 48,
    backgroundColor: '#1E1E1E',
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchPlaceholder: {
    color: '#666',
    fontSize: 15,
  },
  notificationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1E1E1E',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  bellIcon: {
    fontSize: 20,
  },

  // Section Headers
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '700',
  },
  viewAll: {
    color: '#666',
    fontSize: 14,
  },

  // Premium Banner
  premiumBanner: {
    backgroundColor: 'linear-gradient(135deg, #8B4513 0%, #D2691E 100%)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  premiumContent: {
    flex: 1,
  },
  premiumTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  premiumSubtitle: {
    color: '#FFE4B5',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  premiumDescription: {
    color: '#FFE4B5',
    fontSize: 12,
    opacity: 0.9,
  },
  premiumButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  premiumButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },

  // Bet Cards
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
  betIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1E1E1E',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  betIcon: {
    fontSize: 20,
  },
  betHeaderInfo: {
    flex: 1,
  },
  betTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  betType: {
    color: '#999',
    fontSize: 13,
    textTransform: 'capitalize',
  },
  betOdds: {
    fontSize: 16,
    fontWeight: '700',
  },
  betDescription: {
    color: '#CCC',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  betFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  riskSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  riskLabel: {
    color: '#999',
    fontSize: 13,
  },
  riskContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  riskDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  betTime: {
    color: '#666',
    fontSize: 13,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  emptySubtext: {
    color: '#666',
    fontSize: 14,
  },

  // Center Content (Coming Soon)
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  comingSoonIcon: {
    fontSize: 72,
    marginBottom: 20,
  },
  comingSoonText: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  comingSoonSubtext: {
    color: '#999',
    fontSize: 15,
    textAlign: 'center',
  },
  addBetButton: {
    backgroundColor: '#8B4513',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 24,
    marginTop: 24,
  },
  addBetButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // Stats Preview
  statsPreview: {
    flexDirection: 'row',
    marginTop: 32,
    gap: 20,
  },
  statBox: {
    backgroundColor: '#161616',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#222',
    minWidth: 120,
  },
  statValue: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    color: '#999',
    fontSize: 13,
  },

  // Bottom Navigation
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#161616',
    borderTopWidth: 1,
    borderTopColor: '#222',
    paddingBottom: 8,
    paddingTop: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  navIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  navLabel: {
    color: '#666',
    fontSize: 11,
    fontWeight: '500',
  },
  navLabelActive: {
    color: '#FFF',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#161616',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 34,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  modalTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '700',
  },
  modalClose: {
    color: '#999',
    fontSize: 24,
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  inputLabel: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 14,
    color: '#FFF',
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeButton: {
    backgroundColor: '#1E1E1E',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  typeButtonActive: {
    backgroundColor: '#8B4513',
    borderColor: '#8B4513',
  },
  typeButtonText: {
    color: '#999',
    fontSize: 14,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  typeButtonTextActive: {
    color: '#FFF',
  },
  riskSlider: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  riskButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1E1E1E',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  riskButtonActive: {
    backgroundColor: '#FF1744',
    borderColor: '#FF1744',
  },
  riskButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#8B4513',
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 20,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
