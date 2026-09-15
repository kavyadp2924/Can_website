const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit';
const WEB3FORMS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_KEY ?? '';

export interface SubmitResult {
  ok: boolean;
  message?: string;
}

/**
 * Shared submit path for every form on the site (contact, quote tool).
 *
 * This is a static export with no backend of its own, so submissions go
 * straight from the browser to Web3Forms — a third-party service built for
 * exactly this (free tier, no signup friction, built-in spam filtering).
 * `subject` becomes the email subject line Web3Forms sends to the inbox tied
 * to the access key; everything else in `data` is included as form fields.
 *
 * Pass `file` (e.g. a reference drawing from the quote tool) to switch to a
 * multipart submission — Web3Forms accepts either JSON or multipart, but a
 * File can only travel as multipart/form-data.
 */
export async function submitForm(
  subject: string,
  data: Record<string, unknown>,
  file?: File | null,
): Promise<SubmitResult> {
  if (!WEB3FORMS_KEY) {
    throw new Error('NEXT_PUBLIC_WEB3FORMS_KEY is not set — see .env.example');
  }

  let response: Response;

  if (file) {
    const body = new FormData();
    body.append('access_key', WEB3FORMS_KEY);
    body.append('subject', subject);
    for (const [key, value] of Object.entries(data)) {
      if (value != null) body.append(key, String(value));
    }
    body.append('attachment', file);
    response = await fetch(WEB3FORMS_ENDPOINT, { method: 'POST', headers: { Accept: 'application/json' }, body });
  } else {
    response = await fetch(WEB3FORMS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ access_key: WEB3FORMS_KEY, subject, ...data }),
    });
  }

  const json = (await response.json().catch(() => null)) as { success?: boolean; message?: string } | null;
  return { ok: response.ok && json?.success === true, message: json?.message };
}
