import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';

const tabs = ['Paid Courses', 'Free Events', 'Forums', 'Masterclasses'];

export default function LearningHubScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [courses, setCourses] = useState([]);
  const [masterclasses, setMasterclasses] = useState([]);
  const [communityEvents, setCommunityEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHubData();
  }, []);

  const loadHubData = async () => {
    const { data: courseData, error: courseError } = await supabase
      .from('courses')
      .select('id,title,level,price,cpd_hours,certification,tags')
      .order('created_at', { ascending: false })
      .limit(4);

    const today = new Date().toISOString().split('T')[0];
    const { data: masterclassData, error: masterclassError } = await supabase
      .from('events')
      .select('*')
      .gte('date', today)
      .order('date', { ascending: true });

    const { data: eventData, error: eventError } = await supabase
      .from('community_events')
      .select('id,title,description,type,date,start_time,end_time,status,image_url')
      .gte('date', today)
      .order('date', { ascending: true })
      .limit(8);

    setCourses(courseData || []);
    const masterclassMatches = masterclassData || [];
    console.log('Learning Hub masterclasses:', masterclassMatches.length);
    setMasterclasses(masterclassMatches);
    setCommunityEvents(eventData || []);
    setLoading(false);

    if (courseError) {
      console.log('Learning Hub courses error:', courseError);
    }
    if (masterclassError) {
      console.log('Learning Hub masterclasses error:', masterclassError);
    }
    if (eventError) {
      console.log('Learning Hub community events error:', eventError);
    }
  };

  const toNumber = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const formatPrice = (value) => {
    const parsed = toNumber(value);
    return parsed === null ? 'Price TBC' : `GBP ${parsed.toFixed(2)}`;
  };

  const getCourseTone = (course) => {
    const tag = `${course.level || ''} ${course.tags || ''}`.toLowerCase();
    if (tag.includes('advanced')) {
      return { bg: '#F3E8FF', text: '#7C3AED' };
    }
    if (tag.includes('legal')) {
      return { bg: '#FEF3C7', text: '#D97706' };
    }
    return { bg: '#EEF2FF', text: '#4F46E5' };
  };

  const getCommunityBuckets = () => {
    const forums = communityEvents.filter((event) =>
      String(event.type || '').toLowerCase().includes('forum')
    );
    const freeEvents = communityEvents.filter(
      (event) => !forums.includes(event)
    );
    return { forums, freeEvents };
  };

  const { forums, freeEvents } = getCommunityBuckets();

  const formatEventDate = (value) => {
    if (!value) {
      return 'Date TBC';
    }
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime())
      ? 'Date TBC'
      : parsed.toLocaleDateString('en-GB', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });
  };

  const formatEventTime = (event) => {
    if (event?.start_time && event?.end_time) {
      return `${event.start_time} - ${event.end_time}`;
    }
    return event?.start_time || 'Time TBC';
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 10, paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Learning Hub</Text>
            <Text style={styles.subtitle}>Upskill and connect</Text>
          </View>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="search" size={18} color="#64748B" />
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabRow}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tabButton,
                activeTab === tab && styles.tabButtonActive,
              ]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {activeTab === 'Paid Courses' ? (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionLabel}>Featured Courses</Text>
              <Text style={styles.sectionAction}>View All</Text>
            </View>
            {courses.map((course) => {
              const tone = getCourseTone(course);
              return (
                <View key={course.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View style={[styles.cardIcon, { backgroundColor: tone.bg }]}>
                      <Ionicons name="school" size={22} color={tone.text} />
                    </View>
                    <View style={styles.cardBody}>
                      <View style={styles.cardTopRow}>
                        <View style={styles.levelBadge}>
                          <Text style={styles.levelText}>{course.level || 'Course'}</Text>
                        </View>
                        <Text style={styles.cardPrice}>{formatPrice(course.price)}</Text>
                      </View>
                      <Text style={styles.cardTitle}>{course.title}</Text>
                      <View style={styles.cardMeta}>
                        <View style={styles.metaItem}>
                          <Ionicons name="time" size={12} color="#64748B" />
                          <Text style={styles.metaText}>
                            {course.cpd_hours ? `${course.cpd_hours} Hours` : 'Duration TBC'}
                          </Text>
                        </View>
                        <View style={styles.metaItem}>
                          <Ionicons name="ribbon" size={12} color="#64748B" />
                          <Text style={styles.metaText}>
                            {course.certification || 'CPD Certified'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                  <View style={styles.cardActions}>
                    <TouchableOpacity style={styles.primaryButton}>
                      <Text style={styles.primaryButtonText}>Book Now</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.secondaryButton}>
                      <Text style={styles.secondaryButtonText}>Details</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </>
        ) : null}

        {activeTab === 'Free Events' ? (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionLabel}>Free Community Events</Text>
            </View>
            {freeEvents.map((event) => (
              <View key={event.id} style={styles.featuredCard}>
                <View style={styles.featuredImageContainer}>
                  <Image
                    source={{
                      uri:
                        event.image_url ||
                        'https://lh3.googleusercontent.com/aida-public/AB6AXuCXzN48S2qV1IwOG5qlcCfmf6n7dauH9PC3SqNMdQImOdI7JVYx1Zs4eJujWzyZplGz4B3SmlGt6KDeWqc20qnwbmLW1L1MwlbZdLPFPk0jiOvGV1WI5oa9eBcEb03O88vThCFSrSA4KRZ_xRZn0ugZeLd_KCjC6L7JA2vRuN2w2aXneNbxy5ZSQX8fSVwRaVcH5vsZIJxya88u5VlNBK-4Y_CEIvsLeYE52q7Y2ArCpuBdGw7HkdXUMnYU486QbW7n4hxrzH9LmEvO',
                    }}
                    style={styles.featuredImage}
                  />
                  <View style={styles.featuredBadges}>
                    <View style={[styles.badgePill, styles.badgePrimary]}>
                      <Text style={styles.badgeText}>{event.type || 'Event'}</Text>
                    </View>
                    <View style={[styles.badgePill, styles.badgeSuccess]}>
                      <Text style={styles.badgeText}>Free for Members</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.featuredContent}>
                  <Text style={styles.featuredTitle}>{event.title}</Text>
                  <View style={styles.featuredMeta}>
                    <View style={styles.featuredMetaRow}>
                      <Text style={styles.metaText}>{formatEventDate(event.date)}</Text>
                    </View>
                    <View style={styles.featuredMetaRow}>
                      <Text style={styles.metaText}>{formatEventTime(event)}</Text>
                    </View>
                  </View>
                  <TouchableOpacity style={styles.featuredButton}>
                    <Text style={styles.featuredButtonText}>View Details</Text>
                    <Ionicons name="chevron-forward" size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </>
        ) : null}

        {activeTab === 'Masterclasses' ? (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionLabel}>Masterclasses</Text>
            </View>
            {masterclasses.map((event) => (
              <View key={event.id} style={styles.masterclassCard}>
                <Image
                  source={{
                    uri:
                      event.image_url ||
                      'https://lh3.googleusercontent.com/aida-public/AB6AXuCXzN48S2qV1IwOG5qlcCfmf6n7dauH9PC3SqNMdQImOdI7JVYx1Zs4eJujWzyZplGz4B3SmlGt6KDeWqc20qnwbmLW1L1MwlbZdLPFPk0jiOvGV1WI5oa9eBcEb03O88vThCFSrSA4KRZ_xRZn0ugZeLd_KCjC6L7JA2vRuN2w2aXneNbxy5ZSQX8fSVwRaVcH5vsZIJxya88u5VlNBK-4Y_CEIvsLeYE52q7Y2ArCpuBdGw7HkdXUMnYU486QbW7n4hxrzH9LmEvO',
                  }}
                  style={styles.masterclassImage}
                />
                <View style={styles.masterclassBody}>
                  <Text style={styles.cardTitle}>{event.title}</Text>
                  <Text style={styles.cardMetaText}>{event.description || ''}</Text>
                  <View style={styles.discussionFooter}>
                    <View style={styles.metaItem}>
                      <Ionicons name="calendar" size={12} color="#94A3B8" />
                      <Text style={styles.metaText}>{event.date || 'Date TBC'}</Text>
                    </View>
                    <TouchableOpacity style={styles.linkButton}>
                      <Text style={styles.linkButtonText}>View Details</Text>
                      <Ionicons name="chevron-forward" size={14} color="#7C3AED" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </>
        ) : null}

        {activeTab === 'Forums' ? (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionLabel}>Active Discussions</Text>
            </View>
            {forums.map((discussion) => (
              <View key={discussion.id} style={styles.card}>
                <Text style={styles.cardTitle}>{discussion.title}</Text>
                <Text style={styles.cardMetaText}>
                  {discussion.description || 'Join the discussion in the community.'}
                </Text>
                <View style={styles.discussionFooter}>
                  <View style={styles.discussionStats}>
                    <View style={styles.metaItem}>
                      <Ionicons name="chatbubbles" size={12} color="#94A3B8" />
                      <Text style={styles.metaText}>--</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Ionicons name="eye" size={12} color="#94A3B8" />
                      <Text style={styles.metaText}>--</Text>
                    </View>
                  </View>
                  <TouchableOpacity style={styles.linkButton}>
                    <Text style={styles.linkButtonText}>Join Discussion</Text>
                    <Ionicons name="chevron-forward" size={14} color="#7C3AED" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    paddingHorizontal: 20,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabRow: {
    paddingBottom: 4,
    gap: 16,
  },
  tabButton: {
    paddingVertical: 10,
  },
  tabButtonActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#7C3AED',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94A3B8',
  },
  tabTextActive: {
    color: '#7C3AED',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  sectionAction: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7C3AED',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    gap: 12,
  },
  cardIcon: {
    width: 54,
    height: 54,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: {
    flex: 1,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  levelBadge: {
    backgroundColor: '#DBEAFE',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  levelText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2563EB',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  cardPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  cardMeta: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: '#64748B',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 3,
  },
  primaryButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  secondaryButton: {
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  eventCard: {
    backgroundColor: '#ECFDF5',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  eventTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  eventInfo: {
    flex: 1,
  },
  eventTag: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#10B981',
    marginBottom: 6,
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  dateBadge: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 6,
    alignItems: 'center',
    minWidth: 46,
  },
  dateMonth: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
  },
  dateDay: {
    fontSize: 16,
    fontWeight: '800',
    color: '#7C3AED',
  },
  eventDescription: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 10,
    lineHeight: 18,
  },
  eventActions: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatarGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#E2E8F0',
    borderWidth: 2,
    borderColor: '#F8FAFC',
    marginRight: -6,
  },
  avatarCount: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#F8FAFC',
    marginLeft: -6,
  },
  avatarCountText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  eventButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  eventButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10B981',
  },
  featuredCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  featuredImageContainer: {
    height: 160,
    backgroundColor: '#F1F5F9',
    position: 'relative',
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  featuredBadges: {
    position: 'absolute',
    left: 12,
    top: 12,
    flexDirection: 'row',
    gap: 8,
  },
  badgePill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
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
  featuredContent: {
    padding: 16,
  },
  featuredTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  featuredMeta: {
    marginTop: 10,
    gap: 6,
  },
  featuredMetaRow: {
    flexDirection: 'row',
  },
  featuredButton: {
    marginTop: 14,
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  featuredButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cardMetaText: {
    marginTop: 8,
    fontSize: 12,
    color: '#64748B',
  },
  discussionFooter: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  masterclassCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  masterclassImage: {
    width: '100%',
    height: 150,
  },
  masterclassBody: {
    padding: 16,
  },
  discussionStats: {
    flexDirection: 'row',
    gap: 12,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  linkButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7C3AED',
  },
});
