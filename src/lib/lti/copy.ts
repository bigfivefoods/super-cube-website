/**
 * English copy for the LTI screens. Other languages live in lti-messages.ts
 * and are merged into the Learn catalogues. French uses formal vous.
 */
export const lti = {
  nav: "LMS connection",
  connectTitle: "Connect your LMS",
  connectBody:
    "Register the learning platform your organisation uses. Your learners then open Super-Cube® from Moodle, Canvas, Blackboard, Brightspace or Cornerstone with LTI 1.3.",
  platformName: "Platform name",
  platformNameHint: "A name your colleagues will recognise, such as Company Moodle.",
  issuer: "Issuer",
  issuerHint: "The issuer URL your platform shows. For Canvas this is often https://canvas.instructure.com.",
  clientId: "Client ID",
  deploymentId: "Deployment ID",
  loginUrl: "Login URL",
  loginHint: "The platform address that starts sign-in.",
  tokenUrl: "Access token URL",
  tokenHint: "The platform address that issues service tokens.",
  jwksUrl: "Public key set URL",
  jwksHint: "The platform address that publishes its public keys.",
  save: "Save platform",
  registered: "Registered platforms",
  none: "No platform is registered yet.",
  remove: "Remove",
  removeAsk: "Remove this platform?",
  paste: "Values to paste into your LMS",
  toolLogin: "Tool login URL",
  toolLaunch: "Tool launch URL",
  toolJwks: "Tool key set URL",
  redirect: "Redirect URI",
  redirectHint: "Use the same address as the tool launch URL.",
  copy: "Copy",
  copied: "Copied",
  signIn: "Sign in to connect an LMS",
  adminsOnly: "Organisation admins only",
  adminsBody: "This registration is for organisation admins. Ask your Super-Cube® contact for an admin invite.",
  notReady: "LMS connection is not switched on yet",
  notReadyBody:
    "The LTI tables are not on this site yet. Your Super-Cube® contact applies the database migration, then this page can save a platform.",
  loadError: "Could not load LMS settings. Please try again in a moment.",
  openGuide: "Open the setup guide",
  issuerLine: "Issuer: Super-Cube® by Big Five Group.",
  saved: "Platform saved.",
  saveError: "That platform could not be saved. Check the addresses and try again.",
  removed: "Platform removed.",
  chooseOrg: "Choose an organisation",
  yourOrg: "Your organisation",
  httpsHint: "These addresses use https. A platform on this computer may use http://localhost.",
  metaTitle: "Connect an LMS with LTI",
  metaBody:
    "Register Moodle, Canvas, Blackboard, Brightspace or Cornerstone so learners launch Super-Cube® with LTI 1.3. Organisation admins only.",
  guideMeta: "LMS setup guide",
  guideMetaBody:
    "How organisation administrators connect Super-Cube® to Moodle, Canvas, Blackboard, Brightspace or Cornerstone with LTI 1.3 and LTI Advantage.",
  guideTitle: "Connect Super-Cube® to your LMS",
  guideIntro:
    "A guide for organisation administrators. Super-Cube® launches from Moodle, Canvas, Blackboard, Brightspace, Cornerstone and any other platform that speaks LTI 1.3 and LTI Advantage.",
  needH: "What you need",
  needB:
    "An LTI 1.3 platform, the three Super-Cube® addresses on the LMS connection page, and the six values your platform gives you: issuer, client id, deployment id, login URL, access token URL and public key set URL.",
  giveH: "Addresses Super-Cube® gives you",
  giveB: "You paste these three addresses into the platform. You copy the platform's own values back into Super-Cube®.",
  giveDetail:
    "Paste the tool login URL into the platform's initiate-login field. Paste the tool launch URL into the tool URL, the target link URI and the redirect URI. Paste the tool key set URL into the public key set field. Super-Cube® signs grade messages and deep-linking responses with a private key that stays on the server. Only the public key set is shared.",
  backH: "Values you paste into Super-Cube®",
  backB:
    "Copy them from the platform after you create the tool. The issuer is the platform's own address, not Super-Cube®. The client id and deployment id are the identifiers the platform assigns. The login URL, access token URL and public key set URL belong to the platform, and they must be https.",
  moodleH: "Set up Moodle",
  moodleB:
    "As a site administrator, open Site administration, then Plugins, Activity modules, External tool, Manage tools, and configure a tool manually. Set LTI version to LTI 1.3. Paste the Super-Cube® login URL, launch URL and key set URL into the matching Moodle fields. Turn on content selection so teachers can pick courses. Under services, enable assignment and grade services and names and role provisioning. Save, then copy Moodle's platform id, client id, deployment id and the three Moodle URLs into Super-Cube®. In a course, add an activity, choose External tool, choose Super-Cube® and select content. Set the launch container to New window.",
  canvasH: "Set up Canvas",
  canvasB:
    "In Canvas, open Admin, then Developer keys, and add an LTI key. Paste the Super-Cube® redirect URI, login URL and key set URL. Turn the key on and copy the client id. Install the app in the account or course with that client id. Canvas usually uses the issuer https://canvas.instructure.com. Copy the authentication URL, token URL and public key set URL that Canvas shows for your account, and the deployment id, into Super-Cube®. Use content selection to place a course, and open the tool in a new window.",
  othersH: "Blackboard, Brightspace and Cornerstone",
  othersB:
    "Each of these platforms has an LTI 1.3 registration. Paste the same three Super-Cube® addresses, then copy the platform's issuer, client id, deployment id, login URL, token URL and key set URL back into Super-Cube®. Enable deep linking, the assignment and grade service, and names and roles if you want the roster. Open the course in a new window.",
  coursesH: "Courses teachers can place",
  coursesB:
    "Deep linking lists the three Super-Cube® programmes, Kids, Adolescents and Adults, and each of the six faces inside a programme. A programme is the full pathway. A face is one course, such as Choices. Completion and the score return to the gradebook for that item.",
  scoresH: "Scores sent back",
  scoresB:
    "When a learner finishes lessons, Super-Cube® posts a score to the platform's assignment and grade service. The score is the share of that course the learner has completed, from 0 to 1. A finished course is marked completed and fully graded. The platform must have granted the score scope.",
  namesH: "Names and roles",
  namesB:
    "If you enable names and role provisioning, Super-Cube® can read the course roster and place active members into your organisation. Learners join as learners. Instructors join as facilitators of that cohort. People who are already organisation admins stay admins. Journals are not sent to the LMS.",
  privacyH: "Privacy",
  privacyB:
    "Super-Cube® receives the name, email address and role the platform chooses to send, plus the course context. It does not read other courses, files or the rest of the gradebook. Certificates remain Super-Cube® certificates, issued by Super-Cube® by Big Five Group.",
  failH: "When a launch fails",
  failB:
    "Check that the issuer, client id and deployment id match exactly, that the three platform URLs are https, and that the redirect URI is the Super-Cube® launch URL with no extra slash. Then launch from the platform, not from a bookmark.",
  packageLink: "Prefer a live launch instead of a package? Connect your LMS with LTI.",
  pickTitle: "Choose Super-Cube® courses",
  pickBody: "Select the courses to add to your learning platform. You can return here later to add more.",
  addCourses: "Add selected courses",
  fullProgramme: "Full programme",
  oneFace: "One face",
  expired: "This link has expired. Start content selection again from your learning platform.",
  openCourse: "Open Super-Cube®",
  framed:
    "Your learning platform opened Super-Cube® in a frame. Continue in a new window so the course can use the full page.",
  launchFailed: "Super-Cube® could not open this launch. Ask your LMS administrator to check the platform registration.",
  opening: "Opening your course…",
  pickOne: "Select at least one course.",
  pickSingle: "The platform asked for a single item. Choose one course.",
  backTo: "Back to LMS connection",
} as const;

export type LtiString = (typeof lti)[keyof typeof lti];

export const LTI_STRINGS = Object.values(lti);

export const LTI_GUIDE: { heading: LtiString; body: LtiString[] }[] = [
  { heading: lti.needH, body: [lti.needB] },
  { heading: lti.giveH, body: [lti.giveB, lti.giveDetail] },
  { heading: lti.backH, body: [lti.backB] },
  { heading: lti.moodleH, body: [lti.moodleB] },
  { heading: lti.canvasH, body: [lti.canvasB] },
  { heading: lti.othersH, body: [lti.othersB] },
  { heading: lti.coursesH, body: [lti.coursesB] },
  { heading: lti.scoresH, body: [lti.scoresB] },
  { heading: lti.namesH, body: [lti.namesB] },
  { heading: lti.privacyH, body: [lti.privacyB] },
  { heading: lti.failH, body: [lti.failB] },
];
