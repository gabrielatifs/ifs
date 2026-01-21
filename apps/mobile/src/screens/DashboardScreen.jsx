import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';

export default function DashboardScreen({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [featuredEvent, setFeaturedEvent] = useState(null);
  const [loadingEvent, setLoadingEvent] = useState(true);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadUserData();
    loadFeaturedEvent();
  }, []);

  const loadUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      console.log('Supabase user:', {
        id: user.id,
        email: user.email,
        metadata: user.user_metadata,
      });
    } else {
      console.log('Supabase user: not logged in');
    }

    if (!user) {
      return;
    }

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('auth_id', user.id)
      .single();

    if (data) {
      console.log('Supabase profile display name:', data.display_name || data.full_name || data.name);
    } else {
      console.log('Supabase profile: not found');
    }

    const fallbackProfile = {
      display_name: user.user_metadata?.display_name || user.user_metadata?.full_name || '',
      first_name: user.user_metadata?.first_name || user.user_metadata?.firstName || '',
      last_name: user.user_metadata?.last_name || user.user_metadata?.lastName || '',
      email: user.email || '',
    };

    setProfile(data || fallbackProfile);
  };

  const loadFeaturedEvent = async () => {
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('events')
      .select('*')
      .gte('date', today)
      .order('date', { ascending: true })
      .limit(1);

    const nextEvent = data?.[0] || null;
    setFeaturedEvent(nextEvent);
    setLoadingEvent(false);

    if (nextEvent) {
      console.log('Featured event:', nextEvent);
    } else {
      console.log('Featured event: not found');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserData();
    await loadFeaturedEvent();
    setRefreshing(false);
  };

  const displayName = profile?.display_name || profile?.full_name || '';
  const rawFullName = displayName || [profile?.first_name, profile?.last_name].filter(Boolean).join(' ');
  const fallbackName = profile?.email?.split('@')[0] || 'Member';
  const fullName = (rawFullName || fallbackName).trim();
  const formattedName = fullName
    ? fullName
        .split(' ')
        .filter(Boolean)
        .map((part) => `${part[0].toUpperCase()}${part.slice(1)}`)
        .join(' ')
    : 'Member';
  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 10 }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View>
              <Text style={styles.welcomeText}>Welcome back</Text>
              <Text style={styles.userName}>{formattedName}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.notificationBtn}>
            <Text style={styles.notificationIcon}>🔔</Text>
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
        </View>

        {/* Membership Card */}
        <View style={styles.section}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => navigation.navigate('Credentials')}
          >
            <LinearGradient
              colors={['#7C3AED', '#5B21B6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.membershipCard}
            >
              <View style={styles.membershipLeft}>
                <View style={styles.membershipIcon}>
                  <Text style={{ fontSize: 20 }}>ƒo"</Text>
                </View>
                <View>
                  <Text style={styles.membershipLabel}>Active Status</Text>
                  <Text style={styles.membershipTitle}>Digital Member Credential</Text>
                </View>
              </View>
              <Text style={styles.chevron}>ƒ?§</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Featured Event */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Event</Text>
            <TouchableOpacity onPress={() => navigation.navigate('EventsList')}>
              <Text style={styles.viewAllText}>View all</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.eventCard}>
            <View style={styles.eventImageContainer}>
              <Image
                source={{
                  uri:
                    featuredEvent?.image_url ||
                    'https://lh3.googleusercontent.com/aida-public/AB6AXuCXzN48S2qV1IwOG5qlcCfmf6n7dauH9PC3SqNMdQImOdI7JVYx1Zs4eJujWzyZplGz4B3SmlGt6KDeWqc20qnwbmLW1L1MwlbZdLPFPk0jiOvGV1WI5oa9eBcEb03O88vThCFSrSA4KRZ_xRZn0ugZeLd_KCjC6L7JA2vRuN2w2aXneNbxy5ZSQX8fSVwRaVcH5vsZIJxya88u5VlNBK-4Y_CEIvsLeYE52q7Y2ArCpuBdGw7HkdXUMnYU486QbW7n4hxrzH9LmEvO',
                }}
                style={styles.eventImage}
              />
              <View style={styles.eventBadges}>
                <View style={styles.badgePrimary}>
                  <Text style={styles.badgeText}>{featuredEvent?.type || 'Event'}</Text>
                </View>
                <View style={styles.badgeGreen}>
                  <Text style={styles.badgeText}>Free for Members</Text>
                </View>
              </View>
            </View>
            <View style={styles.eventContent}>
              <Text style={styles.eventTitle}>
                {featuredEvent?.title ||
                  (loadingEvent ? 'Loading event...' : 'Event details coming soon')}
              </Text>
              <View style={styles.eventMeta}>
                <View style={styles.eventMetaRow}>
                  <Text style={styles.metaText}>
                    {featuredEvent?.date
                      ? new Date(featuredEvent.date).toLocaleDateString('en-GB', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })
                      : 'Date TBC'}
                  </Text>
                </View>
                <View style={styles.eventMetaRow}>
                  <Text style={styles.metaText}>
                    {featuredEvent?.start_time && featuredEvent?.end_time
                      ? `${featuredEvent.start_time} - ${featuredEvent.end_time}`
                      : featuredEvent?.start_time || 'Time TBC'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.eventButton}
                onPress={() =>
                  featuredEvent
                    ? navigation.navigate('EventDetails', { eventId: featuredEvent.id })
                    : null
                }
                disabled={!featuredEvent}
              >
                <Text style={styles.eventButtonText}>View Details</Text>
                <Ionicons name="chevron-forward" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Bottom spacing */}
        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  welcomeText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationIcon: {
    fontSize: 20,
  },
  notificationBadge: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 2,
    borderColor: '#F1F5F9',
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7C3AED',
  },
  membershipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  membershipLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  membershipIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  membershipLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  membershipTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  chevron: {
    fontSize: 24,
    color: 'rgba(255,255,255,0.5)',
  },
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  eventImageContainer: {
    height: 180,
    position: 'relative',
  },
  eventImage: {
    width: '100%',
    height: '100%',
  },
  eventBadges: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    gap: 8,
  },
  badgePrimary: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeGreen: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  eventContent: {
    padding: 20,
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  eventMeta: {
    gap: 8,
    marginBottom: 16,
  },
  eventMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaIcon: {
    fontSize: 14,
  },
  metaText: {
    fontSize: 14,
    color: '#64748B',
  },
  eventButton: {
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  eventButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  eventButtonArrow: {
    color: '#fff',
    fontSize: 16,
  },
});
