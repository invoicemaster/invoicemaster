/* Passphrase-authenticated AES-256-GCM.
   Used to encrypt SDP blobs that get copy-pasted out-of-band between two
   devices during the WebRTC handshake. The passphrase the two users agree
   on (over a secure side channel) doubles as the authentication factor:
   wrong passphrase ⇒ GCM auth tag fails ⇒ decryption errors. */

const PBKDF2_ITERATIONS = 250_000;
const SALT_LEN = 16;
const IV_LEN = 12;
const KEY_LEN = 256;
const VERSION = 1;

async function deriveKey(passphrase, salt) {
  const enc = new TextEncoder();
  const baseKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey'],
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    baseKey,
    { name: 'AES-GCM', length: KEY_LEN },
    false,
    ['encrypt', 'decrypt'],
  );
}

export async function encryptWithPassphrase(passphrase, plaintext) {
  if (!passphrase || passphrase.length < 1) throw new Error('Passphrase required');
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LEN));
  const iv = crypto.getRandomValues(new Uint8Array(IV_LEN));
  const key = await deriveKey(passphrase, salt);
  const encoded = new TextEncoder().encode(plaintext);
  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded),
  );
  // Pack: version(1) || salt(16) || iv(12) || ciphertext+tag
  const out = new Uint8Array(1 + SALT_LEN + IV_LEN + ciphertext.byteLength);
  out[0] = VERSION;
  out.set(salt, 1);
  out.set(iv, 1 + SALT_LEN);
  out.set(ciphertext, 1 + SALT_LEN + IV_LEN);
  return bytesToBase64(out);
}

export async function decryptWithPassphrase(passphrase, base64) {
  if (!passphrase) throw new Error('Passphrase required');
  const data = base64ToBytes(base64);
  if (data[0] !== VERSION) throw new Error('Unknown payload version');
  const salt = data.slice(1, 1 + SALT_LEN);
  const iv = data.slice(1 + SALT_LEN, 1 + SALT_LEN + IV_LEN);
  const ciphertext = data.slice(1 + SALT_LEN + IV_LEN);
  const key = await deriveKey(passphrase, salt);
  let plaintext;
  try {
    plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
  } catch {
    throw new Error('Wrong passphrase or corrupted payload');
  }
  return new TextDecoder().decode(plaintext);
}

function bytesToBase64(bytes) {
  let s = '';
  for (let i = 0; i < bytes.byteLength; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s);
}

function base64ToBytes(b64) {
  const s = atob(b64.replace(/\s+/g, ''));
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
  return out;
}
