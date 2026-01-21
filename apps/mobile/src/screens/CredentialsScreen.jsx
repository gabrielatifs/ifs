import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Linking } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { supabase } from "../lib/supabase";

export default function CredentialsScreen() {
  const navigation = useNavigation();
  const [profile, setProfile] = useState(null);
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expiredExpanded, setExpiredExpanded] = useState(false);
  const [selectedCredential, setSelectedCredential] = useState(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setProfile(null);
      setCredentials([]);
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("auth_id", user.id)
      .single();

    const fallbackProfile = {
      display_name: user.user_metadata?.display_name || user.user_metadata?.full_name || "",
      first_name: user.user_metadata?.first_name || user.user_metadata?.firstName || "",
      last_name: user.user_metadata?.last_name || user.user_metadata?.lastName || "",
      email: user.email || "",
    };

    const profileData = data || fallbackProfile;
    setProfile(profileData);

    if (data?.id) {
      const { data: credentialData } = await supabase
        .from("digital_credentials")
        .select("id,title,description,credential_type,issued_date,expiry_date,status,verification_code,badge_image_url")
        .eq("user_id", data.id)
        .order("issued_date", { ascending: false });

      const nextCredentials = credentialData || [];
      setCredentials(nextCredentials);

      const membershipCredential = nextCredentials.find((credential) => {
        const text = `${credential.title || ""} ${credential.credential_type || ""}`.toLowerCase();
        const isMembership = text.includes("membership") || text.includes("member");
        const isGrade = text.includes("associate") || text.includes("full");
        const status = (credential.status || "").toLowerCase();
        const isActive = !status || status === "active";
        return isActive && isMembership && isGrade;
      });

      if (membershipCredential) {
        console.log("Membership badge credential:", membershipCredential);
      } else {
        console.log("Membership badge credential: not found", nextCredentials);
      }
    } else {
      setCredentials([]);
    }

    setLoading(false);
  };

  const displayName = profile?.display_name || profile?.full_name || "";
  const rawFullName = displayName || [profile?.first_name, profile?.last_name].filter(Boolean).join(" ");
  const fallbackName = profile?.email?.split("@")[0] || "Member";
  const fullName = (rawFullName || fallbackName).trim();
  const formattedName = fullName
    ? fullName
        .split(" ")
        .filter(Boolean)
        .map((part) => `${part[0].toUpperCase()}${part.slice(1)}`)
        .join(" ")
    : "Member";

  const formatDate = (value) => {
    if (!value) {
      return "--";
    }

    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? "--" : parsed.toLocaleDateString();
  };

  const formatMonthYear = (value) => {
    if (!value) {
      return "--";
    }

    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime())
      ? "--"
      : parsed.toLocaleDateString(undefined, { month: "short", year: "2-digit" });
  };

  const buildLinkedInUrl = (credential) => {
    if (!credential) {
      return null;
    }

    const issued = credential.issued_date ? new Date(credential.issued_date) : null;
    const expires = credential.expiry_date ? new Date(credential.expiry_date) : null;
    const issuedMonth = issued && !Number.isNaN(issued.getTime()) ? issued.getMonth() + 1 : "";
    const issuedYear = issued && !Number.isNaN(issued.getTime()) ? issued.getFullYear() : "";
    const expMonth = expires && !Number.isNaN(expires.getTime()) ? expires.getMonth() + 1 : "";
    const expYear = expires && !Number.isNaN(expires.getTime()) ? expires.getFullYear() : "";
    const credentialId = credential.verification_code || credential.id || "";
    const credentialName = (credential.title || "Credential")
      .replace(
      /\\s+of the Independent Federation for Safeguarding\\b/i,
      ""
    )
      .trim();

    const params = new URLSearchParams({
      startTask: "CERTIFICATION_NAME",
      name: credentialName,
      organizationName: "Independent Federation for Safeguarding",
      organizationId: "106536291",
      issueMonth: issuedMonth,
      issueYear: issuedYear,
      expirationMonth: expMonth,
      expirationYear: expYear,
      credentialId,
      credentialUrl: credentialId
        ? `https://ifs-safeguarding.co.uk/VerifyCredential?code=${credentialId}`
        : "",
    });

    const url = `https://www.linkedin.com/profile/add?${params.toString()}`;
    console.log("LinkedIn credential URL:", url);
    return url;
  };

  const handleLinkedIn = async (credential) => {
    const url = buildLinkedInUrl(credential);
    if (!url) {
      return;
    }

    await Linking.openURL(url);
  };

  const membershipCredential = credentials.find((credential) => {
    const text = `${credential.title || ""} ${credential.credential_type || ""}`.toLowerCase();
    const isMembership = text.includes("membership") || text.includes("member");
    const isGrade = text.includes("associate") || text.includes("full");
    const status = (credential.status || "").toLowerCase();
    const isActive = !status || status === "active";
    return isActive && isMembership && isGrade;
  });

  const membershipExpires = membershipCredential?.expiry_date
    ? formatDate(membershipCredential.expiry_date)
    : "--";
  const membershipIssued = membershipCredential?.issued_date
    ? formatMonthYear(membershipCredential.issued_date)
    : "--";
  const rawMembership = profile?.membership_type || profile?.membership_status || "Member";
  const membershipGrade = rawMembership
    .replace(/\\bAssociate\\b/i, "Associate Membership")
    .replace(/\\bFull\\b/i, "Full Membership")
    .replace(/\\s+of the Independent Federation for Safeguarding\\b/i, "");

  const getCredentialAccent = (credential) => {
    const text = `${credential.title || ""} ${credential.credential_type || ""}`.toLowerCase();

    if (text.includes("safeguard")) {
      return { bg: "#EFF6FF", color: "#2563EB", icon: "shield-checkmark" };
    }

    if (text.includes("legal") || text.includes("compliance")) {
      return { bg: "#FEF3C7", color: "#D97706", icon: "scale" };
    }

    if (text.includes("trauma") || text.includes("mental")) {
      return { bg: "#ECFDF3", color: "#059669", icon: "sparkles" };
    }

    return { bg: "#EEF2FF", color: "#4F46E5", icon: "ribbon" };
  };

  const now = new Date();
  const activeCredentials = credentials.filter((credential) => {
    if (!credential.expiry_date) {
      return true;
    }

    const expires = new Date(credential.expiry_date);
    return Number.isNaN(expires.getTime()) || expires >= now;
  });

  const expiredCredentials = credentials.filter((credential) => {
    if (!credential.expiry_date) {
      return false;
    }

    const expires = new Date(credential.expiry_date);
    return !Number.isNaN(expires.getTime()) && expires < now;
  });

  const isExpiredCredential = (credential) => {
    if (!credential?.expiry_date) {
      return false;
    }

    const expires = new Date(credential.expiry_date);
    return !Number.isNaN(expires.getTime()) && expires < now;
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 6, paddingBottom: insets.bottom + 32 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="chevron-back" size={18} color="#0F172A" />
            </TouchableOpacity>
            <Text style={styles.title}>Credential Wallet</Text>
          </View>
          <Text style={styles.subtitle}>Verified Safeguarding Professional</Text>
        </View>

        <LinearGradient
          colors={["#7C3AED", "#5B21B6"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.membershipCard}
        >
          <View style={styles.membershipGlow} />
          <View style={styles.membershipContent}>
            <View style={styles.membershipHeader}>
              <View>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusBadgeText}>{membershipGrade}</Text>
                </View>
                <Text style={styles.membershipTitle}>Digital Member Credential</Text>
              </View>
              <Ionicons name="ribbon" size={36} color="rgba(255,255,255,0.85)" />
            </View>
            <View style={styles.membershipFooter}>
              <View>
                <Text style={styles.memberLabel}>Member Name</Text>
                <Text style={styles.memberName}>{formattedName}</Text>
              </View>
              <View style={styles.expiryBlock}>
                <Text style={styles.memberLabel}>Issued</Text>
                <Text style={styles.memberName}>{membershipIssued}</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Professional Certificates</Text>
          <Text style={styles.sectionCount}>{activeCredentials.length} Total</Text>
        </View>

        {loading ? (
          <Text style={styles.loadingText}>Loading credentials...</Text>
        ) : credentials.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No certificates yet</Text>
            <Text style={styles.emptyText}>
              When you complete training, your certificates will appear here.
            </Text>
          </View>
        ) : (
          activeCredentials.map((credential) => {
            const accent = getCredentialAccent(credential);
            return (
              <View key={credential.id} style={styles.credentialCard}>
                <View style={styles.credentialHeader}>
                  <View style={[styles.credentialIcon, { backgroundColor: accent.bg }]}>
                    <Ionicons name={accent.icon} size={22} color={accent.color} />
                  </View>
                  <View style={styles.credentialInfo}>
                    <Text style={styles.credentialTitle}>{credential.title}</Text>
                    <View style={styles.credentialMetaRow}>
                      <Text style={styles.credentialMetaLabel}>
                        {credential.expiry_date
                          ? `Expires ${formatDate(credential.expiry_date)}`
                          : `Issued ${formatDate(credential.issued_date)}`}
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={styles.credentialFooter}>
                  <View style={styles.credentialActions}>
                    <TouchableOpacity
                      style={styles.secondaryButton}
                      onPress={() => handleLinkedIn(credential)}
                    >
                      <Ionicons name="logo-linkedin" size={14} color="#475569" />
                      <Text style={styles.secondaryButtonText}>LinkedIn</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.primaryButton}
                      onPress={() => setSelectedCredential(credential)}
                    >
                      <Ionicons name="eye" size={14} color="#6D28D9" />
                      <Text style={styles.primaryButtonText}>View</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })
        )}

        {expiredCredentials.length > 0 ? (
          <View style={styles.expiredSection}>
            <TouchableOpacity
              style={styles.expiredHeader}
              onPress={() => setExpiredExpanded((prev) => !prev)}
            >
              <View style={styles.expiredHeaderText}>
                <Text style={styles.expiredTitle}>Expired Credentials</Text>
                <Text style={styles.expiredCount}>{expiredCredentials.length}</Text>
              </View>
              <Ionicons
                name={expiredExpanded ? "chevron-up" : "chevron-down"}
                size={18}
                color="#64748B"
              />
            </TouchableOpacity>
            {expiredExpanded
              ? expiredCredentials.map((credential) => {
                  const accent = getCredentialAccent(credential);
                  return (
                    <View key={credential.id} style={styles.expiredCard}>
                      <View style={styles.credentialHeader}>
                        <View style={[styles.credentialIcon, { backgroundColor: accent.bg }]}>
                          <Ionicons name={accent.icon} size={22} color={accent.color} />
                        </View>
                        <View style={styles.credentialInfo}>
                          <Text style={styles.credentialTitle}>{credential.title}</Text>
                          <View style={styles.credentialMetaRow}>
                            <Text style={styles.credentialMetaLabel}>
                              Expired {formatDate(credential.expiry_date)}
                            </Text>
                          </View>
                        </View>
                      </View>
                      <View style={styles.credentialFooter}>
                        <View style={styles.credentialActions}>
                          <TouchableOpacity
                            style={styles.secondaryButton}
                            onPress={() => handleLinkedIn(credential)}
                          >
                            <Ionicons name="logo-linkedin" size={14} color="#475569" />
                            <Text style={styles.secondaryButtonText}>LinkedIn</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.primaryButton}
                            onPress={() => setSelectedCredential(credential)}
                          >
                            <Ionicons name="eye" size={14} color="#6D28D9" />
                            <Text style={styles.primaryButtonText}>View</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  );
                })
              : null}
          </View>
        ) : null}

      </ScrollView>

      <Modal
        transparent
        animationType="fade"
        visible={!!selectedCredential}
        onRequestClose={() => setSelectedCredential(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <LinearGradient
              colors={["#7C3AED", "#5B21B6"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.modalHeader}
            >
              <View style={styles.modalHeaderContent}>
                <View>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusBadgeText}>
                      {(selectedCredential?.status || "active").toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.modalTitle}>{selectedCredential?.title}</Text>
                </View>
                <Ionicons name="ribbon" size={32} color="rgba(255,255,255,0.85)" />
              </View>
              <View style={styles.modalMetaRow}>
                <View>
                  <Text style={styles.memberLabel}>Credential Type</Text>
                  <Text style={styles.memberName}>
                    {selectedCredential?.credential_type || "Credential"}
                  </Text>
                </View>
                <View style={styles.expiryBlock}>
                  <Text style={styles.memberLabel}>Issued</Text>
                  <Text style={styles.memberName}>
                    {formatDate(selectedCredential?.issued_date)}
                  </Text>
                </View>
              </View>
            </LinearGradient>

            <View style={styles.modalBody}>
              <View style={styles.modalStack}>
                <Text style={styles.modalLabel}>Member</Text>
                <Text style={styles.modalValue}>{formattedName}</Text>
              </View>
              <View style={styles.modalStack}>
                <Text style={styles.modalLabel}>Status</Text>
                <Text style={styles.modalValue}>
                  {(selectedCredential?.status || "active").toUpperCase()}
                </Text>
              </View>
              <View style={styles.modalStack}>
                <Text style={styles.modalLabel}>Verification Code</Text>
                <Text style={styles.modalValue}>
                  {selectedCredential?.verification_code || "--"}
                </Text>
              </View>
              {isExpiredCredential(selectedCredential) ? (
                <View style={styles.modalStack}>
                  <Text style={styles.modalLabel}>Expiration Date</Text>
                  <Text style={styles.modalValue}>
                    {formatDate(selectedCredential.expiry_date)}
                  </Text>
                </View>
              ) : null}
            </View>

            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setSelectedCredential(null)}
            >
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  content: {
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0F172A",
  },
  subtitle: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: "500",
    color: "#64748B",
  },
  membershipCard: {
    borderRadius: 24,
    padding: 20,
    overflow: "hidden",
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 18,
    elevation: 8,
  },
  membershipGlow: {
    position: "absolute",
    top: -60,
    right: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  membershipContent: {
    gap: 24,
  },
  membershipHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  statusBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 10,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "#FFFFFF",
  },
  membershipTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    lineHeight: 24,
  },
  membershipFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  memberLabel: {
    fontSize: 10,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.65)",
    fontWeight: "600",
  },
  memberName: {
    marginTop: 6,
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  expiryBlock: {
    alignItems: "flex-end",
  },
  sectionHeader: {
    marginTop: 24,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.6,
    color: "#94A3B8",
  },
  sectionCount: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6D28D9",
  },
  loadingText: {
    fontSize: 13,
    color: "#64748B",
  },
  emptyState: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },
  emptyText: {
    marginTop: 6,
    fontSize: 13,
    color: "#64748B",
  },
  credentialCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 16,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 2,
  },
  credentialHeader: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  credentialIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  credentialInfo: {
    flex: 1,
  },
  credentialTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
    lineHeight: 20,
  },
  credentialMetaRow: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
  },
  credentialMetaLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: "#94A3B8",
  },
  credentialFooter: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    alignItems: "flex-end",
  },
  credentialActions: {
    flexDirection: "row",
    gap: 8,
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#F1F5F9",
    borderRadius: 10,
  },
  secondaryButtonText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#475569",
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "rgba(124, 58, 237, 0.12)",
    borderRadius: 10,
  },
  primaryButtonText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#6D28D9",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.55)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    overflow: "hidden",
    width: "100%",
    maxWidth: 380,
  },
  modalHeader: {
    padding: 18,
  },
  modalHeaderContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  modalTitle: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    maxWidth: 240,
  },
  modalMetaRow: {
    marginTop: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  modalBody: {
    padding: 18,
    gap: 12,
  },
  modalStack: {
    gap: 6,
  },
  modalLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  modalValue: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
  },
  modalClose: {
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    paddingVertical: 14,
    alignItems: "center",
  },
  modalCloseText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#6D28D9",
  },
  expiredSection: {
    marginTop: 8,
    marginBottom: 8,
  },
  expiredHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  expiredHeaderText: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  expiredTitle: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    color: "#64748B",
  },
  expiredCount: {
    fontSize: 12,
    fontWeight: "700",
    color: "#94A3B8",
  },
  expiredCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 16,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 2,
  },
});
