"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const KEY = "sc_org_admin_v1";

/**
 * True when the signed-in user administers or owns at least one organisation.
 * Only decides whether to SHOW links to /learn/org/results; access itself is
 * enforced by org_results() in Postgres. Reads the user's own membership rows
 * through RLS, cached per user for the browser session.
 */
export function useOrgAdmin(): boolean {
  const [admin, setAdmin] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;
    let alive = true;
    void (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        try {
          sessionStorage.removeItem(KEY);
        } catch {}
        return;
      }
      try {
        const cached = JSON.parse(sessionStorage.getItem(KEY) || "null") as { u: string; a: boolean } | null;
        if (cached && cached.u === user.id) {
          if (alive) setAdmin(cached.a);
          return;
        }
      } catch {}
      const [{ data: mem }, { data: own }] = await Promise.all([
        supabase.from("org_members").select("org_id").eq("user_id", user.id).eq("role", "admin").limit(1),
        supabase.from("organisations").select("id").eq("owner_user_id", user.id).limit(1),
      ]);
      const a = Boolean(mem?.length || own?.length);
      try {
        sessionStorage.setItem(KEY, JSON.stringify({ u: user.id, a }));
      } catch {}
      if (alive) setAdmin(a);
    })();
    return () => {
      alive = false;
    };
  }, []);

  return admin;
}
