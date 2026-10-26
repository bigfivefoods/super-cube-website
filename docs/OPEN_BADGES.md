# Open Badges 3.0 and live cohorts

Super-Cube® certificates keep their existing id and `/verify/<id>` page. When a certificate is issued, the server also stores an Open Badges 3.0 verifiable credential. Milestone badges from the learning record get one too.

## Secrets

| Name | Where | Notes |
| --- | --- | --- |
| `OB3_SIGNING_PRIVATE_KEY` | Vercel, server only | Ed25519 PKCS#8 PEM, or base64 of that DER, or base64 of the 32-byte seed. PEM newlines may be `\n`. |
| `OB3_SIGNING_PUBLIC_KEY` | Optional | SPKI PEM. Set this only if a deployment should verify and must not hold the private key. If both are set, they must be the same key. |

Do not commit either value. Rotating the private key makes older proofs fail until the previous public key is also published on the issuer profile. Treat the key as long-lived.

The issuer id inside every credential is `https://www.super-cube.me/issuer/super-cube` (or `NEXT_PUBLIC_SITE_URL` + `/issuer/super-cube`). Preview hosts serve the same profile; they do not become a second issuer.

## What a verifier fetches

- `GET /issuer/super-cube` — issuer profile for Super-Cube® by Big Five Group, including the Multikey when a key is configured.
- `GET /achievements/certificate-adults` (also `certificate-kids`, `certificate-adolescents`, and `milestone-<badge>`) — the achievement definition.
- `GET /credentials/<id>` — the JSON-LD credential (`application/vc+ld+json`). `?download=1` sets a download filename.
- `GET /credentials/<id>/status` — `{ revoked, signature }`. Revocation follows the certificate row, so it matches `/verify/<id>`.
- `GET /credentials/<id>/image` — the Super-Cube® mark with the credential baked into a PNG `iTXt` chunk named `openbadgecredential`.

The proof is a W3C Data Integrity `DataIntegrityProof` using `eddsa-jcs-2022` (Ed25519 over JCS, from the Data Integrity EdDSA Cryptosuites). The email is stored only as an Open Badges `sha256$` IdentityHash. The holder name stays on `/verify`, which already shows the name printed on the certificate.

`open_badge_credential(id)` is callable by the service role only. It returns one row and folds in certificate or milestone revocation. Visitors use the site routes above, not the database API.

## Live cohorts

Migration `supabase/migrations/20261026120100_open_badges_and_cohorts.sql` adds cohort, session, attendance and discussion tables. It is additive. Apply it to a Supabase branch and review it before production. Rollback: `supabase/rollback/20261026120100_open_badges_and_cohorts.down.sql`.

A cohort is visible only to its members, its facilitators, and that organisation's admins. Another coach in the same organisation does not see it. Learners see their own attendance, not anyone else's. Join links are https only. Discussion posts can be hidden or the thread locked by a facilitator or an organisation admin.
