/**
 * ╔══════════════════════════════════════════════════════════╗
 * ║   HASHBYT.COM — Cookie Consent  (External CDN Module)  ║
 * ║   Library : orestbida/cookieconsent v3.0.1             ║
 * ║   Tracks  : GA4 · PostHog · Google Ads · LinkedIn      ║
 * ╚══════════════════════════════════════════════════════════╝
 *
 * HOST THIS FILE on GitHub Pages, Cloudflare Pages, or any CDN.
 *
 * Then in Framer → Site Settings → Custom Code → <head>:
 *
 *   <script type="module" src="https://YOUR_CDN_URL/cookie-consent-cdn.js"></script>
 *
 * BEFORE HOSTING: replace every ← REPLACE placeholder below.
 *
 * Bug fixes vs original cookie-consent-v3.html:
 *   ① ph_ cookie match is now a regex (/^ph_/) not a plain string
 *   ② gtag.js is loaded once via ensureGtag() — no duplicate script tags
 *   ③ LinkedIn opt-out added to onChange when marketing consent is revoked
 */

// ── Inject library CSS ──────────────────────────────────────────────────────
(function () {
  const l = document.createElement('link');
  l.rel  = 'stylesheet';
  l.href = 'https://cdn.jsdelivr.net/gh/orestbida/cookieconsent@3.0.1/dist/cookieconsent.css';
  document.head.appendChild(l);
}());

// ── Load the UMD bundle (sets window.CookieConsent) ────────────────────────
import 'https://cdn.jsdelivr.net/gh/orestbida/cookieconsent@3.0.1/dist/cookieconsent.umd.js';

// ── IDs — replace before hosting ───────────────────────────────────────────
const GA4_ID  = 'G-XXXXXXXXXX';            // ← REPLACE: GA4 Measurement ID
const GADS_ID = 'AW-XXXXXXXXX';            // ← REPLACE: Google Ads Conversion ID
const LI_ID   = 'XXXXXXXXXX';              // ← REPLACE: LinkedIn Partner ID
const PH_KEY  = 'YOUR_POSTHOG_KEY';        // ← REPLACE: PostHog Project API Key
const PH_HOST = 'https://app.posthog.com'; // keep, or change to self-hosted URL

// ── Helpers ─────────────────────────────────────────────────────────────────
function addScript(src, attrs = {}) {
  const s = document.createElement('script');
  s.src   = src;
  s.async = true;
  Object.entries(attrs).forEach(([k, v]) => s.setAttribute(k, v));
  document.head.appendChild(s);
}

/**
 * BUG FIX ②: load gtag.js exactly once.
 * Analytics + marketing destinations are both registered via gtag('config', …)
 * on the same shared script — no second <script> tag needed.
 */
function ensureGtag(fallbackId) {
  if (window._gtagLoaded) return;
  window._gtagLoaded = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  addScript('https://www.googletagmanager.com/gtag/js?id=' + fallbackId);
}

// ── Analytics: GA4 + PostHog ────────────────────────────────────────────────
function initAnalytics() {
  if (window._ga4Init) return;
  window._ga4Init = true;

  // BUG FIX ②: share the single gtag.js with marketing
  ensureGtag(GA4_ID);
  window.gtag('config', GA4_ID, { anonymize_ip: true });

  if (!window._posthogLoaded) {
    window._posthogLoaded = true;
    // PostHog snippet (minified)
    !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]);t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.async=!0,p.src=s.api_host+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+" (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures getActiveMatchingSurveys getSurveys getNextSurveyStep onSessionId setPersonPropertiesForFlags".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
    posthog.init(PH_KEY, { api_host: PH_HOST, autocapture: true });
  }
}

// ── Marketing: Google Ads + LinkedIn ────────────────────────────────────────
function initMarketing() {
  if (window._mktInit) return;
  window._mktInit = true;

  // BUG FIX ②: reuse the existing gtag.js load, just add Ads config
  ensureGtag(GADS_ID);
  window.gtag('config', GADS_ID);

  if (!window._liLoaded) {
    window._liLoaded = true;
    window._linkedin_partner_id       = LI_ID;
    window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
    window._linkedin_data_partner_ids.push(LI_ID);
    (function (l) {
      if (!l) {
        window.lintrk = function (a, b) { window.lintrk.q.push([a, b]); };
        window.lintrk.q = [];
      }
      const s   = document.createElement('script');
      s.type    = 'text/javascript';
      s.async   = true;
      s.src     = 'https://snap.licdn.com/li.lms-analytics/insight.min.js';
      const ref = document.getElementsByTagName('script')[0];
      ref.parentNode.insertBefore(s, ref);
    })(window.lintrk);
  }
}

// ── Cookie Consent config ────────────────────────────────────────────────────
CookieConsent.run({
  cookie: { name: 'cc_cookie', expiresAfterDays: 365 },
  mode: 'opt-in',

  onFirstConsent: ({ cookie }) => {
    if (cookie.categories.includes('analytics')) initAnalytics();
    if (cookie.categories.includes('marketing')) initMarketing();
  },

  onConsent: ({ cookie }) => {
    if (cookie.categories.includes('analytics')) initAnalytics();
    if (cookie.categories.includes('marketing')) initMarketing();
  },

  onChange: ({ cookie, changedCategories }) => {
    if (changedCategories.includes('analytics')) {
      if (CookieConsent.acceptedCategory('analytics')) {
        initAnalytics();
      } else {
        if (window.gtag)    window.gtag('consent', 'update', { analytics_storage: 'denied' });
        if (window.posthog) window.posthog.opt_out_capturing();
      }
    }

    if (changedCategories.includes('marketing')) {
      if (CookieConsent.acceptedCategory('marketing')) {
        initMarketing();
      } else {
        if (window.gtag) window.gtag('consent', 'update', {
          ad_storage:         'denied',
          ad_user_data:       'denied',
          ad_personalization: 'denied',
        });
        // BUG FIX ③: revoke LinkedIn tracking on consent withdrawal
        window._linkedin_partner_id = null;
      }
    }
  },

  guiOptions: {
    consentModal:     { layout: 'box', position: 'bottom right', equalWeightButtons: false, flipButtons: false },
    preferencesModal: { layout: 'box', position: 'right',        equalWeightButtons: false, flipButtons: false },
  },

  categories: {
    necessary: { enabled: true, readOnly: true },

    analytics: {
      enabled: false,
      autoClear: {
        cookies: [
          { name: /^_ga/  },
          { name: '_gid'  },
          { name: /^ph_/  }, // BUG FIX ①: was 'ph_' (string) — regex clears ALL PostHog cookies
        ],
      },
    },

    marketing: {
      enabled: false,
      autoClear: {
        cookies: [
          { name: 'li_gc'    },
          { name: 'li_sugr'  },
          { name: 'bcookie'  },
          { name: 'bscookie' },
          { name: /^_gcl_/   },
          { name: /^_gac_/   },
        ],
      },
    },
  },

  language: {
    default: 'en',
    translations: {
      en: {
        consentModal: {
          title: 'We use cookies',
          description:
            'We use cookies to understand how you use our site and to improve your experience. ' +
            'Some cookies are necessary for the site to work; others help us measure performance and show relevant content. ' +
            'You can accept all, reject optional cookies, or manage your preferences. ' +
            '<a href="/privacy-policy" class="cc-link">Privacy Policy</a>',
          acceptAllBtn:       'Accept all',
          acceptNecessaryBtn: 'Reject optional',
          showPreferencesBtn: 'Manage preferences',
          footer: '<a href="/privacy-policy">Privacy Policy</a> · <a href="/cookie-policy">Cookie Policy</a>',
        },

        preferencesModal: {
          title:               'Cookie preferences',
          acceptAllBtn:        'Accept all',
          acceptNecessaryBtn:  'Reject optional',
          savePreferencesBtn:  'Save preferences',
          closeIconLabel:      'Close',
          serviceCounterLabel: 'Service|Services',
          sections: [
            {
              title: 'Your privacy choices',
              description:
                'We use cookies and similar technologies. Some are essential for the site to function; ' +
                'others help us understand usage and improve your experience. ' +
                'Use the toggles below to opt in or out of each category.',
            },
            {
              title: 'Strictly necessary <span class="pm__badge">Always on</span>',
              description: 'These cookies are required for the site to function. They cannot be disabled.',
              linkedCategory: 'necessary',
              cookieTable: {
                headers: { name: 'Cookie', domain: 'Domain', desc: 'Description' },
                body: [
                  { name: 'cc_cookie', domain: 'hashbyt.com', desc: 'Stores your cookie consent preferences' },
                ],
              },
            },
            {
              title: 'Analytics',
              description: 'Help us understand how visitors interact with our site. Data is anonymised where possible.',
              linkedCategory: 'analytics',
              cookieTable: {
                headers: { name: 'Cookie', domain: 'Domain', desc: 'Description' },
                body: [
                  { name: '_ga, _ga_*', domain: 'google.com',  desc: 'Google Analytics 4 — measures page views and interactions' },
                  { name: '_gid',       domain: 'google.com',  desc: 'Google Analytics — distinguishes users within 24 h' },
                  { name: 'ph_*',       domain: 'posthog.com', desc: 'PostHog — product analytics and session recording' },
                ],
              },
            },
            {
              title: 'Marketing',
              description:
                'Used to track conversions from ads and to serve relevant advertisements. ' +
                'Disabling these has no effect on the ads you see — just on whether they are personalised.',
              linkedCategory: 'marketing',
              cookieTable: {
                headers: { name: 'Cookie', domain: 'Domain', desc: 'Description' },
                body: [
                  { name: '_gcl_*, _gac_*', domain: 'google.com',   desc: 'Google Ads — conversion tracking and remarketing' },
                  { name: 'li_gc, bcookie', domain: 'linkedin.com',  desc: 'LinkedIn Insight Tag — conversion tracking' },
                ],
              },
            },
            {
              title: 'More information',
              description: 'For questions about our use of cookies, please <a class="cc-link" href="/contact">contact us</a>.',
            },
          ],
        },
      },
    },
  },
});
