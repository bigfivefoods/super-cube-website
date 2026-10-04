/**
 * True on Vercel preview / development deployments. Form handlers use this to
 * make sure nothing submitted on a preview is forwarded to real people or
 * third-party lists: submissions are logged only.
 */
export function isNonProductionDeploy(): boolean {
  const env = process.env.VERCEL_ENV;
  return env === "preview" || env === "development";
}
