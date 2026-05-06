/**
 * ╔══════════════════════════════════════════════════════════╗
 * ║   HASHBYT.COM — Cookie Consent  (External CDN Module)  ║
 * ║   Library : orestbida/cookieconsent v3.0.1             ║
 * ║   Architecture: GTM-only (consent signals only)        ║
 * ║   All tags (GA4, PostHog, Ads, LinkedIn) live in GTM   ║
 * ╚══════════════════════════════════════════════════════════╝
 *
 * This file ONLY manages the consent banner UI and fires
 * gtag('consent', 'update', ...) signals to GTM.
 * GTM handles loading every tracking tag based on those signals.
 *
 * HOST on GitHub → served via jsDelivr:
 *   https://cdn.jsdelivr.net/gh/sparklineIT/temp-assets@main/cookie-consent-cdn.js
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

// ── GTM consent signal helpers ──────────────────────────────────────────────
// GTM is already on the page (loaded via Framer custom code).
// These functions just update the consent state — GTM fires or blocks
// tags automatically based on these signals.

function grantAnalytics() {
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  window.gtag('consent', 'update', { analytics_storage: 'granted' });
}

function revokeAnalytics() {
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  window.gtag('consent', 'update', { analytics_storage: 'denied' });
}

function grantMarketing() {
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  window.gtag('consent', 'update', {
    ad_storage:         'granted',
    ad_user_data:       'granted',
    ad_personalization: 'granted',
  });
}

function revokeMarketing() {
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  window.gtag('consent', 'update', {
    ad_storage:         'denied',
    ad_user_data:       'denied',
    ad_personalization: 'denied',
  });
}

// ── Cookie Consent config ────────────────────────────────────────────────────
CookieConsent.run({
  cookie: { name: 'cc_cookie', expiresAfterDays: 365 },
  mode: 'opt-in',

  // Fires on FIRST visit (user just made a choice)
  onFirstConsent: ({ cookie }) => {
    if (cookie.categories.includes('analytics')) grantAnalytics();
    if (cookie.categories.includes('marketing')) grantMarketing();
  },

  // Fires on RETURN visits (reads stored consent and restores signals)
  onConsent: ({ cookie }) => {
    if (cookie.categories.includes('analytics')) grantAnalytics();
    if (cookie.categories.includes('marketing')) grantMarketing();
  },

  // Fires when user CHANGES preferences via the modal
  onChange: ({ changedCategories }) => {
    if (changedCategories.includes('analytics')) {
      CookieConsent.acceptedCategory('analytics') ? grantAnalytics() : revokeAnalytics();
    }
    if (changedCategories.includes('marketing')) {
      CookieConsent.acceptedCategory('marketing') ? grantMarketing() : revokeMarketing();
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
