/** Fields an organisation admin submits when registering a platform. */
import { LtiProtocolError } from "@/lib/lti/errors";
import type { PlatformInput } from "@/lib/lti/store";
import { isAllowedPlatformUrl } from "@/lib/lti/urls";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function registrationFrom(body: Record<string, unknown>, orgId: string): PlatformInput {
  if (!UUID.test(orgId)) throw new LtiProtocolError(400, "bad_org", "Choose an organisation.");
  const name = clean(body.name, 120);
  if (name.length < 2) throw new LtiProtocolError(400, "bad_name", "Give the platform a name.");
  const issuer = requiredUrl(body.issuer, "bad_issuer");
  const clientId = clean(body.clientId, 255);
  const deploymentId = clean(body.deploymentId, 255);
  if (!clientId || !deploymentId) throw new LtiProtocolError(400, "bad_client", "Enter the client id and the deployment id.");
  return {
    orgId,
    name,
    issuer,
    clientId,
    deploymentId,
    authLoginUrl: requiredUrl(body.authLoginUrl, "bad_login"),
    tokenUrl: requiredUrl(body.tokenUrl, "bad_token"),
    jwksUrl: requiredUrl(body.jwksUrl, "bad_jwks"),
  };
}

function requiredUrl(value: unknown, code: string): string {
  const text = typeof value === "string" ? value.trim() : "";
  if (!isAllowedPlatformUrl(text) || text.length > 500) {
    throw new LtiProtocolError(400, code, "Use an https address. A platform on this computer may use http://localhost.");
  }
  return text;
}

function clean(value: unknown, max: number): string {
  return typeof value === "string" ? value.replace(/[\u0000-\u001f]/g, "").trim().slice(0, max) : "";
}
