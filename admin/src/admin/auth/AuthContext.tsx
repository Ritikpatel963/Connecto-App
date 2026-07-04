import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "../../lib/supabase";
import { AdminPermission, CurrentAdmin } from "../types";

interface AuthContextValue {
  session: Session | null;
  admin: CurrentAdmin | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function getAdminProfile(userId: string): Promise<CurrentAdmin> {
  const { data: admin, error } = await supabase
    .from("admins")
    .select("id, name, email, role_id, is_active")
    .eq("auth_user_id", userId)
    .maybeSingle();

  if (error) throw error;
  if (!admin) throw new Error("This account is not registered as an administrator.");
  if (!admin.is_active) throw new Error("This administrator account is disabled.");

  const [{ data: role, error: roleError }, { data: assignments, error: assignmentsError }] = await Promise.all([
    supabase.from("roles").select("name").eq("id", admin.role_id).maybeSingle(),
    supabase.from("role_permissions").select("permission_id").eq("role_id", admin.role_id),
  ]);

  if (roleError) throw roleError;
  if (assignmentsError) throw assignmentsError;

  const permissionIds = (assignments || []).map((item) => item.permission_id);
  let permissions: AdminPermission[] = [];

  if (permissionIds.length) {
    const { data, error: permissionsError } = await supabase
      .from("permissions")
      .select("name")
      .in("id", permissionIds);
    if (permissionsError) throw permissionsError;
    permissions = (data || []).map((item) => item.name as AdminPermission);
  }

  return {
    id: admin.id,
    name: admin.name,
    email: admin.email,
    role: role?.name || "Admin",
    permissions,
  };
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [admin, setAdmin] = useState<CurrentAdmin | null>(null);
  const [loading, setLoading] = useState(true);

  const hydrate = useCallback(async (nextSession: Session | null) => {
    if (!nextSession) {
      setSession(null);
      setAdmin(null);
      setLoading(false);
      return;
    }

    try {
      const profile = await getAdminProfile(nextSession.user.id);
      setSession(nextSession);
      setAdmin(profile);
    } catch {
      setSession(null);
      setAdmin(null);
      await supabase.auth.signOut({ scope: "local" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (mounted) void hydrate(data.session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (mounted) void hydrate(nextSession);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [hydrate]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    try {
      const profile = await getAdminProfile(data.user.id);
      setSession(data.session);
      setAdmin(profile);
      void supabase.from("admins").update({ last_login_at: new Date().toISOString() }).eq("auth_user_id", data.user.id);
    } catch (profileError) {
      await supabase.auth.signOut({ scope: "local" });
      throw profileError;
    }
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut({ scope: "local" });
    if (error) throw error;
    setSession(null);
    setAdmin(null);
  }, []);

  const value = useMemo(() => ({ session, admin, loading, signIn, signOut }), [session, admin, loading, signIn, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
};
