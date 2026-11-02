/**
 * Parsed with the document head. A finished profile stays on /learn/start.
 * Anyone else is sent to welcome with a real navigation, before the app bundle runs,
 * so the document never holds two canonical links.
 */
export const WELCOME_REDIRECT_SCRIPT =
  `(function(){try{var raw=localStorage.getItem("supercube_lms_v1");var p=raw?JSON.parse(raw).profile:null;` +
  `var ok=!!(p&&String(p.displayName||"").trim()&&p.ageBand&&p.role&&p.context&&p.profileCompletedAt);` +
  `if(ok)return;var m=location.pathname.match(/^\\/(fr|ar|pt|sw|zu|af)(?=\\/)/);` +
  `location.replace((m?m[0]:"")+"/learn/welcome");}catch(e){}})();`;
