/**
 * Persistence for LTI registrations, one-time login state, launches and the
 * org/cohort mapping. The memory store is what the mock-platform test drives.
 * Production uses the Supabase store (service role) after the migration.
 */
import { randomUUID } from "node:crypto";

export type LtiRole = "learner" | "facilitator";

export type LtiPlatform = {
  id: string;
  orgId: string;
  orgCode: string | null;
  name: string;
  issuer: string;
  clientId: string;
  deploymentId: string;
  authLoginUrl: string;
  tokenUrl: string;
  jwksUrl: string;
};

export type PlatformInput = Omit<LtiPlatform, "id" | "orgCode"> & { id?: string; orgCode?: string | null };

export type LoginState = {
  state: string;
  nonce: string;
  platformId: string;
  targetLinkUri: string;
  expiresAt: number;
};

export type LaunchRecord = {
  id: string;
  platformId: string;
  userLinkId: string | null;
  messageType: string;
  resourceLinkId: string | null;
  programmeId: string | null;
  courseId: string | null;
  contextId: string | null;
  subject: string;
  deploymentId: string;
  agsLineitemUrl: string | null;
  agsScopes: string[];
  nrpsUrl: string | null;
  returnUrl: string | null;
  dlData: string | null;
  acceptMultiple: boolean;
  locale: string | null;
  fullName: string | null;
  email: string | null;
};

export type UserLink = {
  id: string;
  platformId: string;
  subject: string;
  userId: string | null;
  orgId: string;
  cohortId: string | null;
  email: string | null;
  fullName: string | null;
  role: LtiRole;
};

export type MemberInput = {
  platform: LtiPlatform;
  subject: string;
  email: string | null;
  fullName: string | null;
  role: LtiRole;
  contextId: string | null;
  contextTitle: string | null;
  programmeId: string | null;
};

export type LaunchToken = { token: string; launchId: string; kind: "enter" | "deep"; expiresAt: number };

export type GradePass = {
  launchId: string;
  scoreGiven: number;
  scoreMaximum: number;
  activityProgress: string;
  gradingProgress: string;
  status: "sent" | "failed" | "skipped";
  httpStatus: number | null;
};

export type PlatformLookup = { issuer: string; clientId?: string | null; deploymentId?: string | null };

export interface LtiStore {
  findForLogin(query: PlatformLookup): Promise<LtiPlatform | "ambiguous" | null>;
  getPlatform(id: string): Promise<LtiPlatform | null>;
  listPlatforms(orgIds: string[]): Promise<LtiPlatform[]>;
  savePlatform(input: PlatformInput): Promise<LtiPlatform>;
  deletePlatform(id: string, orgId: string): Promise<boolean>;
  putState(row: LoginState): Promise<void>;
  takeState(state: string, now: number): Promise<LoginState | null>;
  saveLaunch(row: LaunchRecord): Promise<void>;
  getLaunch(id: string): Promise<{ launch: LaunchRecord; platform: LtiPlatform } | null>;
  putToken(row: LaunchToken): Promise<void>;
  getToken(token: string, now: number): Promise<LaunchToken | null>;
  mapMember(input: MemberInput): Promise<UserLink>;
  listMembers(platformId: string): Promise<UserLink[]>;
  saveGrade(row: GradePass): Promise<void>;
}

type ContextRow = { platformId: string; contextId: string; cohortId: string; programmeId: string | null; title: string | null };

export function createMemoryStore(): LtiStore {
  const platforms = new Map<string, LtiPlatform>();
  const states = new Map<string, LoginState>();
  const launches = new Map<string, LaunchRecord>();
  const tokens = new Map<string, LaunchToken>();
  const users = new Map<string, UserLink>();
  const contexts = new Map<string, ContextRow>();
  const grades: GradePass[] = [];

  return {
    async getPlatform(id) {
      return platforms.get(id) ?? null;
    },
    async findForLogin(query) {
      const rows = [...platforms.values()].filter((row) => {
        if (row.issuer !== query.issuer) return false;
        if (query.clientId && row.clientId !== query.clientId) return false;
        if (query.deploymentId && row.deploymentId !== query.deploymentId) return false;
        return true;
      });
      if (query.deploymentId) return rows[0] ?? null;
      if (rows.length > 1) return "ambiguous";
      return rows[0] ?? null;
    },
    async listPlatforms(orgIds) {
      const want = new Set(orgIds);
      return [...platforms.values()].filter((row) => want.has(row.orgId));
    },
    async savePlatform(input) {
      const clash = [...platforms.values()].find(
        (row) => row.issuer === input.issuer && row.clientId === input.clientId && row.deploymentId === input.deploymentId && row.id !== input.id,
      );
      if (clash) {
        const error = new Error("duplicate");
        (error as Error & { code?: string }).code = "23505";
        throw error;
      }
      const row: LtiPlatform = {
        id: input.id || randomUUID(),
        orgId: input.orgId,
        orgCode: input.orgCode ?? null,
        name: input.name,
        issuer: input.issuer,
        clientId: input.clientId,
        deploymentId: input.deploymentId,
        authLoginUrl: input.authLoginUrl,
        tokenUrl: input.tokenUrl,
        jwksUrl: input.jwksUrl,
      };
      platforms.set(row.id, row);
      return row;
    },
    async deletePlatform(id, orgId) {
      const row = platforms.get(id);
      if (!row || row.orgId !== orgId) return false;
      platforms.delete(id);
      return true;
    },
    async putState(row) {
      states.set(row.state, row);
    },
    async takeState(state, now) {
      const row = states.get(state);
      if (!row) return null;
      states.delete(state);
      if (row.expiresAt <= now) return null;
      return row;
    },
    async saveLaunch(row) {
      launches.set(row.id, row);
    },
    async getLaunch(id) {
      const launch = launches.get(id);
      if (!launch) return null;
      const platform = platforms.get(launch.platformId);
      if (!platform) return null;
      return { launch, platform };
    },
    async putToken(row) {
      tokens.set(row.token, row);
    },
    async getToken(token, now) {
      const row = tokens.get(token);
      if (!row || row.expiresAt <= now) return null;
      return row;
    },
    async mapMember(input) {
      const key = `${input.platform.id}\n${input.subject}`;
      const previous = users.get(key);
      let cohortId = previous?.cohortId ?? null;
      if (input.contextId) {
        const ctxKey = `${input.platform.id}\n${input.contextId}`;
        let ctx = contexts.get(ctxKey);
        if (!ctx) {
          ctx = {
            platformId: input.platform.id,
            contextId: input.contextId,
            cohortId: randomUUID(),
            programmeId: input.programmeId,
            title: input.contextTitle,
          };
          contexts.set(ctxKey, ctx);
        }
        cohortId = ctx.cohortId;
      }
      const role = previous?.role === "facilitator" ? "facilitator" : input.role;
      const link: UserLink = {
        id: previous?.id || randomUUID(),
        platformId: input.platform.id,
        subject: input.subject,
        userId: previous?.userId || randomUUID(),
        orgId: input.platform.orgId,
        cohortId,
        email: input.email ?? previous?.email ?? null,
        fullName: input.fullName ?? previous?.fullName ?? null,
        role,
      };
      users.set(key, link);
      return link;
    },
    async listMembers(platformId) {
      return [...users.values()].filter((row) => row.platformId === platformId);
    },
    async saveGrade(row) {
      grades.push(row);
    },
  };
}
