'use client';

export type SanitizeOptions = {
  privacyMode: boolean;
};

type RedactionCounts = {
  emails: number;
  phones: number;
  urls: number;
  addresses: number;
  companies: number;
};

/**
 * Sanitizes a string by removing Personally Identifiable Information (PII).
 * @param input The raw string to sanitize.
 * @param opts Options for sanitization, e.g., privacyMode for stricter redaction.
 * @returns An object containing the sanitized string and counts of redactions.
 */
export function sanitizeText(
  input: string,
  opts: SanitizeOptions
): { sanitized: string; redactions: RedactionCounts } {
  if (!input) {
    return {
      sanitized: '',
      redactions: { emails: 0, phones: 0, urls: 0, addresses: 0, companies: 0 },
    };
  }

  let sanitized = input;
  const redactions: RedactionCounts = {
    emails: 0,
    phones: 0,
    urls: 0,
    addresses: 0,
    companies: 0,
  };

  const standardRules = [
    {
      name: 'emails',
      regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
      token: '[REDACTED_EMAIL]',
    },
    {
      name: 'phones',
      regex: /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
      token: '[REDACTED_PHONE]',
    },
    {
      name: 'urls',
      regex: /(?:https?:\/\/)?(?:www\.)?(?:linkedin\.com|github\.com|[a-zA-Z0-9-]+\.(?:com|org|net|io|dev|co|us|info|biz))\b(?:[-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g,
      token: '[REDACTED_URL]',
    },
    {
      name: 'addresses',
      regex: /\b\d{1,5}\s+(?:[A-Z][a-z]+\s+)*[A-Z][a-z]+\s+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Court|Ct|Boulevard|Blvd)\b\.?/g,
      token: '[REDACTED_ADDRESS]',
    },
  ];

  for (const rule of standardRules) {
    const key = rule.name as keyof Omit<RedactionCounts, 'companies'>;
    const matches = sanitized.match(rule.regex);
    if (matches) {
      redactions[key] = (redactions[key] || 0) + matches.length;
      sanitized = sanitized.replace(rule.regex, rule.token);
    }
  }

  if (opts.privacyMode) {
    const companyRules = [
      {
        name: 'companies',
        regex: /\b([A-Z][a-zA-Z-&']+(?:\s+[A-Z][a-zA-Z-&']+)*\s+(?:Inc|LLC|Corp|Ltd|Co|Group|Solutions|Technologies))\b\.?/g,
        token: '[REDACTED_COMPANY]',
      },
      {
        name: 'companies',
        regex: /\b(Microsoft|Google|Amazon|Meta|Facebook|Apple|Netflix|Oracle|Salesforce)\b/gi,
        token: '[REDACTED_COMPANY]',
      },
    ];

    for (const rule of companyRules) {
      const matches = sanitized.match(rule.regex);
      if (matches) {
        redactions.companies = (redactions.companies || 0) + matches.length;
        sanitized = sanitized.replace(rule.regex, rule.token);
      }
    }
  }

  return { sanitized, redactions };
}

/*
// UNIT TEST-LIKE EXAMPLES

// --- Standard Redactions ---
const text1 = "Contact me at john.doe@example.com or by phone at (123) 456-7890. My address is 123 Main Street, Anytown. My profile is on https://linkedin.com/in/johndoe";
const result1 = sanitizeText(text1, { privacyMode: false });
console.log(result1.sanitized);
// Expected: "Contact me at [REDACTED_EMAIL] or by phone at [REDACTED_PHONE]. My address is [REDACTED_ADDRESS], Anytown. My profile is on [REDACTED_URL]";
console.log(result1.redactions);
// Expected: { emails: 1, phones: 1, urls: 1, addresses: 1, companies: 0 }


// --- Privacy Mode Redactions ---
const text2 = "I worked at Google and then moved to Data Systems Inc. My old email was old@google.com";
const result2 = sanitizeText(text2, { privacyMode: true });
console.log(result2.sanitized);
// Expected: "I worked at [REDACTED_COMPANY] and then moved to [REDACTED_COMPANY]. My old email was [REDACTED_EMAIL]";
console.log(result2.redactions);
// Expected: { emails: 1, phones: 0, urls: 0, addresses: 0, companies: 2 }

// --- No PII ---
const text3 = "This is a simple sentence with no personal information.";
const result3 = sanitizeText(text3, { privacyMode: true });
console.log(result3.sanitized);
// Expected: "This is a simple sentence with no personal information."
console.log(result3.redactions);
// Expected: { emails: 0, phones: 0, urls: 0, addresses: 0, companies: 0 }

// --- Edge Case: No space after company designator ---
const text4 = "I worked at FutureTech, a division of OldCorp. Contact me at 555.555.5555."
const result4 = sanitizeText(text4, { privacyMode: true });
console.log(result4.sanitized);
// Expected: "I worked at FutureTech, a division of [REDACTED_COMPANY]. Contact me at [REDACTED_PHONE]."
console.log(result4.redactions);
// Expected: { emails: 0, phones: 1, urls: 0, addresses: 0, companies: 1 }

*/
