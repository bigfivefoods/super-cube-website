/**
 * Production wiring. Keys come from the environment. Rows go through the
 * service role when Supabase is configured. Nothing here is sent to the browser.
 */
import { createAdminClient } from "@/lib/supabase/admin";
import { LtiProtocolError } from "@/lib/lti/errors";
import type { LtiDeps } from "@/lib/lti/flow";
import { loadLtiKeys } from "@/lib/lti/keys";
import type { LtiStore } from "@/lib/lti/store";
import { createSupabaseLtiStore } from "@/lib/lti/supabase-store";
import { requestOrigin } from "@/lib/lti/urls";

export async function productionDeps(request: Request): Promise<LtiDeps> {
  const admin = createAdminClient();
  return {
    store: admin ? createSupabaseLtiStore(admin) : unconfiguredStore(),
    keys: loadLtiKeys(),
    now: () => Date.now(),
    fetch: globalThis.fetch.bind(globalThis),
    origin: requestOrigin(request),
  };
}

function unconfiguredStore(): LtiStore {
  const fail = async (): Promise<never> => {
    throw new LtiProtocolError(503, "not_configured", "LMS launch is not configured on this server yet.");
  };
  return {
    findForLogin: fail,
    getPlatform: fail,
    listPlatforms: fail,
    savePlatform: fail,
    deletePlatform: fail,
    putState: fail,
    takeState: fail,
    saveLaunch: fail,
    getLaunch: fail,
    putToken: fail,
    getToken: fail,
    mapMember: fail,
    listMembers: fail,
    saveGrade: fail,
  };
}
