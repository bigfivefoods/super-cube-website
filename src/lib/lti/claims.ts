/** IMS claim names for LTI 1.3, Deep Linking 2.0, AGS and NRPS. */

export const LTI_VERSION = "1.3.0";

export const MSG_RESOURCE = "LtiResourceLinkRequest";
export const MSG_DEEP = "LtiDeepLinkingRequest";
export const MSG_DEEP_RESPONSE = "LtiDeepLinkingResponse";

export const CLAIM_MESSAGE_TYPE = "https://purl.imsglobal.org/spec/lti/claim/message_type";
export const CLAIM_VERSION = "https://purl.imsglobal.org/spec/lti/claim/version";
export const CLAIM_DEPLOYMENT_ID = "https://purl.imsglobal.org/spec/lti/claim/deployment_id";
export const CLAIM_TARGET_LINK_URI = "https://purl.imsglobal.org/spec/lti/claim/target_link_uri";
export const CLAIM_RESOURCE_LINK = "https://purl.imsglobal.org/spec/lti/claim/resource_link";
export const CLAIM_ROLES = "https://purl.imsglobal.org/spec/lti/claim/roles";
export const CLAIM_CONTEXT = "https://purl.imsglobal.org/spec/lti/claim/context";
export const CLAIM_CUSTOM = "https://purl.imsglobal.org/spec/lti/claim/custom";
export const CLAIM_LAUNCH_PRESENTATION = "https://purl.imsglobal.org/spec/lti/claim/launch_presentation";
export const CLAIM_AGS = "https://purl.imsglobal.org/spec/lti-ags/claim/endpoint";
export const CLAIM_NRPS = "https://purl.imsglobal.org/spec/lti-nrps/claim/namesroleservice";
export const CLAIM_DL_SETTINGS = "https://purl.imsglobal.org/spec/lti-dl/claim/deep_linking_settings";
export const CLAIM_CONTENT_ITEMS = "https://purl.imsglobal.org/spec/lti-dl/claim/content_items";
export const CLAIM_DL_DATA = "https://purl.imsglobal.org/spec/lti-dl/claim/data";

export const AGS_SCORE_SCOPE = "https://purl.imsglobal.org/spec/lti-ags/scope/score";
export const AGS_LINEITEM_SCOPE = "https://purl.imsglobal.org/spec/lti-ags/scope/lineitem";
export const NRPS_SCOPE = "https://purl.imsglobal.org/spec/lti-nrps/scope/contextmembership.readonly";

export const SCORE_MIME = "application/vnd.ims.lis.v1.score+json";
export const NRPS_MIME = "application/vnd.ims.lti-nrps.v2.membershipcontainer+json";

export const CLIENT_ASSERTION_TYPE = "urn:ietf:params:oauth:client-assertion-type:jwt-bearer";

export const ACTIVITY = ["Initialized", "Started", "InProgress", "Submitted", "Completed"] as const;
export const GRADING = ["FullyGraded", "Pending", "PendingManual", "Failed", "NotReady"] as const;

export type ActivityProgress = (typeof ACTIVITY)[number];
export type GradingProgress = (typeof GRADING)[number];
