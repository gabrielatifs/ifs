import { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';

export default function EventDetailsScreen({ route, navigation }) {
  const { eventId } = route.params || {};
  const insets = useSafeAreaInsets();
  const [event, setEvent] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('about');
  const [registrationState, setRegistrationState] = useState('idle');

  useEffect(() => {
    loadEvent();
    loadProfile();
  }, [eventId]);

  const loadEvent = async () => {
    if (!eventId) {
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    setEvent(data || null);
    if (data) {
      console.log('Event details loaded:', data);
    } else {
      console.log('Event details: not found');
    }
    setLoading(false);
  };

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setProfile(null);
      return;
    }

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('auth_id', user.id)
      .single();

    const fallbackProfile = {
      id: user.id,
      email: user.email || '',
      display_name:
        user.user_metadata?.display_name || user.user_metadata?.full_name || '',
      full_name:
        user.user_metadata?.full_name || user.user_metadata?.display_name || '',
    };

    setProfile(data || fallbackProfile);
  };

  useEffect(() => {
    if (event?.id && profile?.id) {
      checkRegistration();
    }
  }, [event?.id, profile?.id]);

  const checkRegistration = async () => {
    console.log('Checking registration in community_event_signups for event', event?.id);
    const { data } = await supabase
      .from('community_event_signups')
      .select('id')
      .eq('event_id', event.id)
      .eq('user_id', profile.id)
      .maybeSingle();

    if (data?.id) {
      setRegistrationState('confirmed');
    }
  };

  const registerForEvent = async () => {
    if (registrationState === 'confirmed' || !event?.id || !profile?.id) {
      return;
    }

    setRegistrationState('loading');
    console.log('Registering via community_event_signups for event', event.id);
    console.log('Invoking edge function registerForCommunityEvent');

    const { data: edgeSignup, error: edgeError } = await supabase.functions.invoke(
      'registerForCommunityEvent',
      { body: { eventId: event.id } }
    );

    if (edgeError) {
      console.log('registerForCommunityEvent error:', edgeError);
    } else {
      console.log('registerForCommunityEvent response:', edgeSignup);
    }

    const { data: existing } = await supabase
      .from('community_event_signups')
      .select('id')
      .eq('event_id', event.id)
      .eq('user_id', profile.id)
      .maybeSingle();

    if (existing?.id) {
      setRegistrationState('confirmed');
      return;
    }

    const signupId = `signup_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
    const userName =
      profile.display_name || profile.full_name || profile.first_name || 'Member';

    const { error } = await supabase
      .from('community_event_signups')
      .insert({
        id: signupId,
        user_id: profile.id,
        user_email: profile.email,
        user_name: userName,
        event_id: event.id,
        event_title: event.title,
        event_date: event.date,
        event_type: event.type,
        created_by_id: profile.id,
        created_by_email: profile.email,
      });

    if (error) {
      setRegistrationState('idle');
      console.log('Event registration failed:', error);
      return;
    }

    setRegistrationState('confirmed');
    console.log('Event registration confirmed:', event.id);

    console.log('Invoking edge function sendEmail');
    const subject = `Registration Confirmed: ${event.title || 'Event'}`;
    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0F172A;">
        <h2 style="margin: 0 0 12px;">You're registered</h2>
        <p>Thanks for registering for <strong>${event.title || 'this event'}</strong>.</p>
        <p><strong>Date:</strong> ${event.date || 'TBC'}</p>
        <p><strong>Time:</strong> ${event.time || displayTime || 'TBC'}</p>
        <p>We'll see you there.</p>
      </div>
    `;

    const { data: emailResult, error: emailError } = await supabase.functions.invoke(
      'sendEmail',
      { body: { to: profile.email, subject, html } }
    );

    if (emailError) {
      console.log('sendEmail error:', emailError);
    } else {
      console.log('sendEmail response:', emailResult);
    }
  };

  const cancelRegistration = async () => {
    if (registrationState !== 'confirmed' || !event?.id || !profile?.id) {
      return;
    }

    setRegistrationState('loading');
    console.log('Cancelling via community_event_signups for event', event.id);
    console.log('Invoking edge function cancelCommunityEventRegistration');

    const { data: edgeCancel, error: edgeCancelError } = await supabase.functions.invoke(
      'cancelCommunityEventRegistration',
      { body: { eventId: event.id } }
    );

    if (edgeCancelError) {
      console.log('cancelCommunityEventRegistration error:', edgeCancelError);
    } else {
      console.log('cancelCommunityEventRegistration response:', edgeCancel);
    }

    const { error } = await supabase
      .from('community_event_signups')
      .delete()
      .eq('event_id', event.id)
      .eq('user_id', profile.id);

    if (error) {
      setRegistrationState('confirmed');
      console.log('Cancel registration failed:', error);
      return;
    }

    setRegistrationState('idle');
    console.log('Event registration cancelled:', event.id);
  };

  const displayDate = useMemo(() => {
    const raw = event?.date;
    if (!raw) {
      return 'Date TBC';
    }
    const parsed = new Date(raw);
    return Number.isNaN(parsed.getTime())
      ? 'Date TBC'
      : parsed.toLocaleDateString('en-GB', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });
  }, [event]);

  const displayTime = useMemo(() => {
    if (event?.start_time && event?.end_time) {
      return `${event.start_time} - ${event.end_time}`;
    }
    return event?.start_time || 'Time TBC';
  }, [event]);

  const extraSections = [
    { key: 'who_is_this_for', label: 'Audience', value: event?.who_is_this_for },
    { key: 'what_to_expected', label: 'Preview', value: event?.what_to_expected },
    { key: 'what_you_will_learn', label: 'Objectives', value: event?.what_you_will_learn },
  ].filter((item) => item.value && String(item.value).trim().length > 0);
  const rawObjectives = extraSections
    .find((section) => section.key === 'what_you_will_learn')
    ?.value;

  const formatObjectives = (value) => {
    if (!value) {
      return [];
    }

    let objectivesList = [];
    if (Array.isArray(value)) {
      objectivesList = value;
    } else {
      const rawString = String(value).trim();
      if (rawString.startsWith('[') && rawString.endsWith(']')) {
        try {
          const parsed = JSON.parse(rawString);
          objectivesList = Array.isArray(parsed) ? parsed : [rawString];
        } catch {
          objectivesList = rawString.slice(1, -1).split(',');
        }
      } else {
        objectivesList = rawString.split('\n');
      }
    }

    return objectivesList
      .map((item) => String(item).replace(/^[\[\]\s"']+|[\[\]\s"']+$/g, '').trim())
      .filter(Boolean);
  };

  if (rawObjectives) {
    const formattedObjectives = formatObjectives(rawObjectives)
      .map((item) => `✓ ${item}`)
      .join('\n');
    console.log('Event objectives:\n' + formattedObjectives);
  }

  const tabs = [
    { key: 'about', label: 'About' },
    ...(extraSections.length > 0 ? extraSections.map(({ key, label }) => ({ key, label })) : []),
    { key: 'speakers', label: 'Speakers' },
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#7C3AED" />
      </View>
    );
  }

  const title = event?.title || 'Event Details';
  const description =
    event?.description ||
    'Details for this session will be shared soon. Check back for updates.';
  const imageUrl =
    event?.image_url ||
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCXzN48S2qV1IwOG5qlcCfmf6n7dauH9PC3SqNMdQImOdI7JVYx1Zs4eJujWzyZplGz4B3SmlGt6KDeWqc20qnwbmLW1L1MwlbZdLPFPk0jiOvGV1WI5oa9eBcEb03O88vThCFSrSA4KRZ_xRZn0ugZeLd_KCjC6L7JA2vRuN2w2aXneNbxy5ZSQX8fSVwRaVcH5vsZIJxya88u5VlNBK-4Y_CEIvsLeYE52q7Y2ArCpuBdGw7HkdXUMnYU486QbW7n4hxrzH9LmEvO';

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: 0, paddingBottom: insets.bottom + 32 },
        ]}
      >
        <View style={styles.hero}>
          <Image source={{ uri: imageUrl }} style={styles.heroImage} />
          <LinearGradient
            colors={['rgba(15,23,42,0)', 'rgba(15,23,42,0.85)']}
            style={styles.heroOverlay}
          />
          <View style={[styles.heroBack, { top: insets.top + 12 }]}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="chevron-back" size={18} color="#0F172A" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.badgeRow}>
            <View style={[styles.badge, styles.badgePrimary]}>
              <Text style={styles.badgeText}>{event?.type || 'Masterclass'}</Text>
            </View>
            <View style={[styles.badge, styles.badgeSuccess]}>
              <Text style={styles.badgeText}>Free for Members</Text>
            </View>
          </View>

          <Text style={styles.title}>{title}</Text>

          <View style={styles.metaList}>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Date</Text>
              <Text style={styles.metaValue}>{displayDate}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Time</Text>
              <Text style={styles.metaValue}>{displayTime}</Text>
            </View>
          </View>

          <View style={styles.registrationRow}>
            <TouchableOpacity
              style={[
                styles.registerButton,
                registrationState === 'confirmed' && styles.registerButtonConfirmed,
              ]}
              onPress={registerForEvent}
              disabled={registrationState === 'confirmed' || registrationState === 'loading'}
            >
              <Text style={styles.registerButtonText}>
                {registrationState === 'confirmed'
                  ? 'Place confirmed'
                  : registrationState === 'loading'
                    ? 'Confirming...'
                    : 'Register'}
              </Text>
            </TouchableOpacity>
            {registrationState === 'confirmed' ? (
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={cancelRegistration}
                disabled={registrationState === 'loading'}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabs}
          >
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tabButton, activeTab === tab.key && styles.tabButtonActive]}
                onPress={() => setActiveTab(tab.key)}
              >
                <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {activeTab === 'about' ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About the Event</Text>
              <Text style={styles.sectionBody}>{description}</Text>
            </View>
          ) : null}

          {extraSections.map((section) =>
            activeTab === section.key ? (
              <View key={section.key} style={styles.section}>
                <Text style={styles.sectionTitle}>{section.label}</Text>
                {section.key === 'what_you_will_learn' ? (
                  <View style={styles.list}>
                    {formatObjectives(section.value).map((item, index) => (
                      <View key={`${section.key}-${index}`} style={styles.listRow}>
                        <Ionicons name="checkmark" size={16} color="#10B981" />
                        <Text style={styles.listText}>{item}</Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.sectionBody}>{section.value}</Text>
                )}
              </View>
            ) : null
          )}

          {activeTab === 'speakers' ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Speakers</Text>
              <View style={styles.speakerRow}>
                <View>
                  <Text style={styles.speakerName}>
                    {event?.facilitator || 'IFS Speaker'}
                  </Text>
                </View>
              </View>
              {event?.facilitator_bio ? (
                <Text style={styles.sectionBody}>{event.facilitator_bio}</Text>
              ) : null}
            </View>
          ) : null}

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: 32,
  },
  hero: {
    height: 260,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
  },
  heroBack: {
    position: 'absolute',
    left: 20,
  },
  body: {
    paddingHorizontal: 20,
    marginTop: -32,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgePrimary: {
    backgroundColor: '#7C3AED',
  },
  badgeSuccess: {
    backgroundColor: '#10B981',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 12,
    marginBottom: 8,
  },
  metaList: {
    marginBottom: 20,
  },
  metaRow: {
    paddingVertical: 6,
  },
  metaLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: '#94A3B8',
    marginBottom: 4,
  },
  metaValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  registerButton: {
    flex: 1,
    backgroundColor: '#7C3AED',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  registerButtonConfirmed: {
    backgroundColor: '#10B981',
  },
  registerButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  registrationRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 18,
  },
  cancelButton: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
  tabs: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 2,
    borderRadius: 0,
    backgroundColor: 'transparent',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    backgroundColor: 'transparent',
    borderBottomColor: '#7C3AED',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#0F172A',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 10,
  },
  sectionBody: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  list: {
    marginTop: 6,
    gap: 10,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  listText: {
    flex: 1,
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  subSection: {
    marginTop: 16,
  },
  subSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  speakerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  speakerName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  speakerRole: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  stepCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  stepMuted: {
    backgroundColor: '#F8FAFC',
    borderStyle: 'dashed',
    opacity: 0.7,
  },
  stepMutedMore: {
    backgroundColor: '#F8FAFC',
    borderStyle: 'dashed',
    opacity: 0.5,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  stepSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 6,
    marginBottom: 16,
  },
  primaryCta: {
    backgroundColor: '#7C3AED',
    paddingVertical: 14,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryCtaText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  stepHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  stepField: {
    marginBottom: 12,
  },
  stepLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: '#94A3B8',
    marginBottom: 6,
  },
  stepValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
  },
  reviewBox: {
    backgroundColor: 'rgba(124, 58, 237, 0.08)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.15)',
    padding: 14,
    marginBottom: 16,
  },
  reviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  reviewLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  reviewValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#16A34A',
  },
  reviewTotal: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  disabledCta: {
    backgroundColor: '#CBD5F5',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  disabledCtaText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  detailRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  detailKey: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: '#94A3B8',
    marginBottom: 6,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
});
