import { supabase } from "../lib/supabase.js";

const PROFILE_TABLE = "profiles";

const toSnake = (key) => {
  if (key.includes("_")) return key;
  return key.replace(/[A-Z]/g, (match) => `_${match.toLowerCase()}`);
};

const toCamel = (key) =>
  key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());

const toSnakeRecord = (data = {}) => {
  const record = {};
  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined) return;
    record[toSnake(key)] = value;
  });
  return record;
};

const toCamelRecord = (data = {}) => {
  const record = {};
  Object.entries(data).forEach(([key, value]) => {
    record[toCamel(key)] = value;
  });
  return record;
};

const mergeProfile = (profile, user) => {
  if (!profile) return null;
  const merged = { ...profile };
  if (user?.email && !merged.email) {
    merged.email = user.email;
  }
  const camel = toCamelRecord(merged);
  return { ...merged, ...camel };
};

const getAuthUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data?.user || null;
};

const getProfileByAuthId = async (authId) => {
  const { data, error } = await supabase
    .from(PROFILE_TABLE)
    .select("*")
    .eq("auth_id", authId)
    .maybeSingle();

  if (error) throw error;
  return data || null;
};

const claimProfileByEmail = async (user) => {
  if (!user?.email) return null;

  const { data: existing, error } = await supabase
    .from(PROFILE_TABLE)
    .select("*")
    .eq("email", user.email)
    .is("auth_id", null)
    .maybeSingle();

  if (error) throw error;
  if (!existing) return null;

  const { data: claimed, error: updateError } = await supabase
    .from(PROFILE_TABLE)
    .update({ auth_id: user.id })
    .eq("id", existing.id)
    .select("*")
    .single();

  if (updateError) throw updateError;
  return claimed || null;
};

const ensureProfile = async (user) => {
  if (!user) return null;

  const linkedProfile = await getProfileByAuthId(user.id);
  if (linkedProfile) return linkedProfile;

  const claimedProfile = await claimProfileByEmail(user);
  if (claimedProfile) return claimedProfile;

  const { data: created, error } = await supabase
    .from(PROFILE_TABLE)
    .insert({ auth_id: user.id, email: user.email })
    .select("*")
    .single();

  if (error) throw error;
  return created || null;
};

const parseSort = (sortField) => {
  if (!sortField) return null;
  let field = sortField;
  let ascending = true;

  if (field.startsWith("-")) {
    ascending = false;
    field = field.slice(1);
  }

  if (field.endsWith(".desc")) {
    ascending = false;
    field = field.slice(0, -5);
  } else if (field.endsWith(".asc")) {
    field = field.slice(0, -4);
  }

  return { field: toSnake(field), ascending };
};

const listProfiles = async (sortField, limit) => {
  let query = supabase.from(PROFILE_TABLE).select("*");

  const sort = parseSort(sortField);
  if (sort) {
    query = query.order(sort.field, { ascending: sort.ascending });
  }
  if (limit) query = query.limit(limit);

  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map((profile) => mergeProfile(profile));
};

const filterProfiles = async (query = {}, sortField, limit) => {
  let q = supabase.from(PROFILE_TABLE).select("*");
  const filters = toSnakeRecord(query);
  Object.entries(filters).forEach(([key, value]) => {
    q = q.eq(key, value);
  });

  const sort = parseSort(sortField);
  if (sort) {
    q = q.order(sort.field, { ascending: sort.ascending });
  }
  if (limit) q = q.limit(limit);

  const { data, error } = await q;
  if (error) throw error;
  return (data || []).map((profile) => mergeProfile(profile));
};

export const auth = {
  async me() {
    const user = await getAuthUser();
    console.log('[auth.me] Auth user:', user?.id, user?.email);
    if (!user) {
      throw new Error("Not authenticated");
    }
    try {
      const profile = await ensureProfile(user);
      console.log('[auth.me] Profile fetched:', profile?.id, profile?.email, profile?.first_name || profile?.firstName);
      const merged = mergeProfile(profile, user);
      console.log('[auth.me] Merged result:', merged?.id, merged?.email, merged?.firstName, merged?.membershipType);
      return merged;
    } catch (error) {
      // If profile fetch fails (e.g., RLS policy issue), return basic user info from auth
      console.warn('[auth.me] Profile fetch failed, using auth user data:', error.message);
      return {
        id: user.id,
        authId: user.id,
        auth_id: user.id,
        email: user.email,
        // Assume onboarding is complete for existing authenticated users
        onboarding_completed: true,
        onboardingCompleted: true,
      };
    }
  },

  async updateMyUserData(data = {}) {
    const user = await getAuthUser();
    if (!user) {
      throw new Error("Not authenticated");
    }
    const profile = await ensureProfile(user);
    if (!profile?.id) {
      throw new Error("No profile available");
    }

    const updates = toSnakeRecord(data);
    const { data: updated, error } = await supabase
      .from(PROFILE_TABLE)
      .update(updates)
      .eq("id", profile.id)
      .select("*")
      .single();

    if (error) throw error;
    return mergeProfile(updated, user);
  },

  async updateMe(data = {}) {
    return this.updateMyUserData(data);
  },

  async signUp({ email, password, options = {}, ...rest }) {
    const redirectBase =
      typeof window !== "undefined" ? window.location.origin : "";
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        ...options,
        emailRedirectTo: `${redirectBase}/verify-email`,
      },
      ...rest,
    });
    if (error) throw error;
    return data;
  },

  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  async resetPassword(email) {
    const redirectBase =
      typeof window !== "undefined" ? window.location.origin : "";
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${redirectBase}/reset-password`,
    });
    if (error) throw error;
    return data;
  },

  async logout() {
    const mainSiteUrl = import.meta.env.VITE_MAIN_SITE_URL || "/";
    if (typeof window !== "undefined") {
      sessionStorage.setItem("logoutRedirectAt", String(Date.now()));
      sessionStorage.setItem("logoutRedirectUrl", mainSiteUrl);
    }
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.warn("[auth.logout] Supabase signOut error:", error.message);
      }
    } catch (error) {
      console.warn("[auth.logout] Supabase signOut threw:", error.message);
    } finally {
      if (typeof window !== "undefined") {
        window.location.replace(mainSiteUrl);
      }
    }
    return { success: true };
  },

  loginWithRedirect(redirectUrl) {
    if (typeof window === "undefined") return;
    if (redirectUrl) {
      sessionStorage.setItem("postLoginRedirectUrl", redirectUrl);
    }

    const portalUrl = import.meta.env.VITE_PORTAL_URL;
    const loginPath = "/login";
    let loginUrl = loginPath;

    if (portalUrl) {
      try {
        const portalOrigin = new URL(portalUrl).origin;
        const loginTarget = new URL(loginPath, portalOrigin);
        if (redirectUrl) {
          loginTarget.searchParams.set("redirect", redirectUrl);
        }

        if (window.location.origin === portalOrigin) {
          loginUrl = `${loginTarget.pathname}${loginTarget.search}${loginTarget.hash}`;
        } else {
          loginUrl = loginTarget.toString();
        }
      } catch (error) {
        loginUrl = loginPath;
      }
    } else if (redirectUrl) {
      const loginTarget = new URL(loginPath, window.location.origin);
      loginTarget.searchParams.set("redirect", redirectUrl);
      loginUrl = `${loginTarget.pathname}${loginTarget.search}${loginTarget.hash}`;
    }

    window.location.href = loginUrl;
  },

  // Alias for compatibility with base44 SDK naming
  redirectToLogin(redirectUrl) {
    return this.loginWithRedirect(redirectUrl);
  },

  async list(sortField, limit) {
    return listProfiles(sortField, limit);
  },

  async filter(query, sortField, limit) {
    return filterProfiles(query, sortField, limit);
  },

  async get(id) {
    const { data, error } = await supabase
      .from(PROFILE_TABLE)
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return mergeProfile(data);
  },

  async create(data) {
    const payload = toSnakeRecord(data);
    const { data: created, error } = await supabase
      .from(PROFILE_TABLE)
      .insert(payload)
      .select("*")
      .single();

    if (error) throw error;
    return mergeProfile(created);
  },

  async update(id, data) {
    const payload = toSnakeRecord(data);
    delete payload.id;

    const { data: updated, error } = await supabase
      .from(PROFILE_TABLE)
      .update(payload)
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw error;
    return mergeProfile(updated);
  },

  async delete(id) {
    const { error } = await supabase.from(PROFILE_TABLE).delete().eq("id", id);
    if (error) throw error;
    return { success: true };
  },

  async find(query = {}) {
    const items = await filterProfiles(query);
    return { items, total: items.length };
  },

  async findOne(id) {
    return this.get(id);
  },

  async findMany(query = {}) {
    return filterProfiles(query);
  },

  async count(query = {}) {
    let q = supabase
      .from(PROFILE_TABLE)
      .select("*", { count: "exact", head: true });
    const filters = toSnakeRecord(query);
    Object.entries(filters).forEach(([key, value]) => {
      q = q.eq(key, value);
    });

    const { count, error } = await q;
    if (error) throw error;
    return count;
  },

  async upsert(query = {}, data = {}) {
    const payload = { ...toSnakeRecord(query), ...toSnakeRecord(data) };
    const { data: result, error } = await supabase
      .from(PROFILE_TABLE)
      .upsert(payload)
      .select("*")
      .single();

    if (error) throw error;
    return mergeProfile(result);
  },
};
