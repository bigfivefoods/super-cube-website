# Connect Super-Cube® to a corporate LMS

Organisation administrators use **LMS connection** at `/learn/org/lti`. The setup guide for them is `/learn/org/lti/guide`. This note is for the person who deploys the site.

Super-Cube® is an LTI 1.3 tool with LTI Advantage: OIDC login, resource-link launch, a public key set, Deep Linking 2.0, Assignment and Grade Services, and optional Names and Role Provisioning. A launched learner is mapped into the organisation that registered the platform, and into a cohort when the platform sends a course context. Instructors join that cohort as facilitators. Existing organisation admins are not downgraded.

Certificates stay Super-Cube® certificates. The issuer name is Super-Cube® by Big Five Group.

## Migration — not applied

`supabase/migrations/20261109120000_lti_advantage.sql` is in the repository only. Nothing in this change applies it to a database. Apply it yourself when you are ready, then the organisation-admin page can save a platform. Rollback: `supabase/rollback/20261109120000_lti_advantage.down.sql`.

Until that migration is applied, login and launch storage answer that LMS connection is not switched on yet. The public key set still answers when the signing key is set.

## Environment variables

Set these on the server. Do not commit the private key.

| Variable | Required | Purpose |
|---|---|---|
| `LTI_TOOL_PRIVATE_KEY` | Yes, for deep linking and grade passback | RSA PKCS#8 PEM. Newlines may be written as `\n` in one line. LTI 1.3 signs with RS256, so this is not the Open Badges Ed25519 key. |
| `LTI_TOOL_KEY_ID` | No | Key id in the tool key set. Defaults to `supercube-lti-1`. |

Generate a key:

```bash
openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -outform PEM
```

Inbound launch checks the platform’s key set. It does not use this private key. Outbound messages (the deep-linking response and the service-token assertion) do.

## Addresses to give the platform

- Login: `https://<your host>/api/lti/login`
- Launch and redirect: `https://<your host>/api/lti/launch`
- Public key set: `https://<your host>/api/lti/jwks`

The same three values are shown on the LMS connection page. Ask the platform to open the course in a new window. Deep linking requests that itself.

## Try it with Moodle

1. Apply the migration and set `LTI_TOOL_PRIVATE_KEY`.
2. In Moodle, as a site administrator: Site administration → Plugins → Activity modules → External tool → Manage tools → configure a tool manually.
3. LTI version: 1.3. Paste the three Super-Cube® addresses. Enable content selection, Assignment and Grade Services, and Names and Role Provisioning.
4. Copy Moodle’s platform id (issuer), client id, deployment id, authentication URL, access token URL and public keyset URL into `/learn/org/lti`.
5. In a course, add an External tool activity, choose Super-Cube®, and select content. Set the launch container to New window.
6. Open the activity as a learner. Completing lessons posts a score from 0 to 1 for that course.

## Try it with Canvas

1. Admin → Developer keys → add an LTI key. Paste the redirect URI, login URL and key set URL. Turn the key on and note the client id.
2. Install the app in the account or course with that client id.
3. Canvas usually uses the issuer `https://canvas.instructure.com`. Copy the authentication, token and public key set URLs that Canvas shows for your account, plus the deployment id, into Super-Cube®.
4. Use content selection and open the tool in a new window.

Blackboard, Brightspace and Cornerstone use the same three addresses and the same six values. Hosted and self-hosted sites differ, so copy the URLs the platform shows rather than guessing them.

The automated test in `tests/unit/lti.spec.ts` drives a mock platform through login, launch, deep linking, names and roles, and a grade passback. It does not need the database.
