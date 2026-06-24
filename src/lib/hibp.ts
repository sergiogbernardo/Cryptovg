// Have I Been Pwned "Pwned Passwords" check using k-anonymity.
//
// The password is hashed locally with SHA-1; only the first 5 hex characters of
// the hash are sent to the API. The full password — and the rest of the hash —
// never leave the browser. The API returns every suffix sharing that prefix and
// the match is done here.

const RANGE_URL = 'https://api.pwnedpasswords.com/range/';

async function sha1Hex(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-1', data);
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();
}

export interface BreachResult {
  found: boolean;
  count: number;
  prefix: string;
}

export async function checkPassword(password: string): Promise<BreachResult> {
  const hash = await sha1Hex(password);
  const prefix = hash.slice(0, 5);
  const suffix = hash.slice(5);

  // "Add-Padding" hides the real result size; padded rows report count 0.
  const response = await fetch(`${RANGE_URL}${prefix}`, {
    headers: { 'Add-Padding': 'true' },
  });
  if (!response.ok) throw new Error(`HIBP respondeu ${response.status}`);

  const body = await response.text();
  for (const line of body.split('\n')) {
    const [hashSuffix, countRaw] = line.trim().split(':');
    if (hashSuffix === suffix) {
      const count = Number(countRaw);
      return { found: count > 0, count, prefix };
    }
  }
  return { found: false, count: 0, prefix };
}
