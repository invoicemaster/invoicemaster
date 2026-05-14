/* Device-to-device sync over WebRTC.
   - Encrypted SDP exchanged out-of-band (paste into the UI on the other device)
   - Once the SDP handshake completes, the live channel runs over standard
     WebRTC DTLS-SRTP, so all subsequent data is encrypted end-to-end by the
     browser regardless of our payload.
   - Data is chunked so large IndexedDB snapshots (logos as data URLs etc.)
     don't hit per-message size caps. */
import { encryptWithPassphrase, decryptWithPassphrase } from './crypto.js?v=1778729412855';
import { getAll, get, put } from './db.js?v=1778729412855';

const RTC_CONFIG = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
};
const CHUNK_SIZE = 16 * 1024; // 16KB — safely below the typical 64KB message cap

export class SyncSession {
  constructor() {
    this.pc = new RTCPeerConnection(RTC_CONFIG);
    this.channel = null;
    this.iceComplete = waitForIce(this.pc);
    this._onmessage = null;
    this._onopen = null;
    this._receiveBuffer = '';
  }

  /** Offerer: produces an encrypted offer blob to share with the receiver. */
  async createEncryptedOffer(passphrase) {
    this.channel = this.pc.createDataChannel('invoicemaster-sync', { ordered: true });
    this._wireChannel(this.channel);
    const offer = await this.pc.createOffer();
    await this.pc.setLocalDescription(offer);
    await this.iceComplete;
    return encryptWithPassphrase(passphrase, JSON.stringify(this.pc.localDescription));
  }

  /** Answerer: decrypts offer, returns encrypted answer blob. */
  async acceptEncryptedOfferCreateAnswer(passphrase, encryptedOffer) {
    const sdp = await decryptWithPassphrase(passphrase, encryptedOffer);
    this.pc.ondatachannel = (e) => {
      this.channel = e.channel;
      this._wireChannel(this.channel);
    };
    await this.pc.setRemoteDescription(JSON.parse(sdp));
    const answer = await this.pc.createAnswer();
    await this.pc.setLocalDescription(answer);
    await this.iceComplete;
    return encryptWithPassphrase(passphrase, JSON.stringify(this.pc.localDescription));
  }

  /** Offerer: applies the encrypted answer to complete the handshake. */
  async acceptEncryptedAnswer(passphrase, encryptedAnswer) {
    const sdp = await decryptWithPassphrase(passphrase, encryptedAnswer);
    await this.pc.setRemoteDescription(JSON.parse(sdp));
  }

  /** Send a JSON-serializable object, chunked into 16KB messages. */
  async sendJson(obj) {
    const json = JSON.stringify(obj);
    const total = Math.ceil(json.length / CHUNK_SIZE);
    this.channel.send(JSON.stringify({ kind: 'begin', total, length: json.length }));
    for (let i = 0; i < total; i++) {
      const chunk = json.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
      this.channel.send(JSON.stringify({ kind: 'chunk', index: i, data: chunk }));
      // Yield to keep the buffer manageable on large transfers
      if (i % 8 === 7) await new Promise((r) => setTimeout(r, 0));
    }
    this.channel.send(JSON.stringify({ kind: 'end' }));
  }

  /** Listen for assembled JSON payloads. cb(obj) fires once per complete payload. */
  onJson(cb) {
    let chunks = [];
    let expectedTotal = 0;
    this._onmessage = (raw) => {
      try {
        const msg = JSON.parse(raw);
        if (msg.kind === 'begin') {
          chunks = new Array(msg.total);
          expectedTotal = msg.total;
        } else if (msg.kind === 'chunk') {
          chunks[msg.index] = msg.data;
        } else if (msg.kind === 'end') {
          const json = chunks.join('');
          chunks = [];
          expectedTotal = 0;
          cb(JSON.parse(json));
        }
      } catch (e) {
        console.error('sync onJson parse error', e);
      }
    };
  }

  onOpen(cb) {
    this._onopen = cb;
    if (this.channel && this.channel.readyState === 'open') cb();
  }

  close() {
    try { this.channel?.close(); } catch {}
    try { this.pc.close(); } catch {}
  }

  _wireChannel(ch) {
    ch.binaryType = 'arraybuffer';
    ch.onopen = () => this._onopen?.();
    ch.onmessage = (e) => this._onmessage?.(e.data);
    ch.onerror = (e) => console.error('sync channel error', e);
  }
}

function waitForIce(pc) {
  return new Promise((resolve) => {
    if (pc.iceGatheringState === 'complete') return resolve();
    const check = () => {
      if (pc.iceGatheringState === 'complete') {
        pc.removeEventListener('icegatheringstatechange', check);
        resolve();
      }
    };
    pc.addEventListener('icegatheringstatechange', check);
  });
}

/* Snapshot / restore — works against the same stores db.js manages. */

export async function exportSnapshot() {
  const [business, clients, invoices, industryPrefs] = await Promise.all([
    get('business', 'me'),
    getAll('clients'),
    getAll('invoices'),
    getAll('industryPrefs'),
  ]);
  return {
    version: 1,
    exportedAt: Date.now(),
    business: business || null,
    clients: clients || [],
    invoices: invoices || [],
    industryPrefs: industryPrefs || [],
  };
}

export async function importSnapshot(snapshot, { mode = 'replace' } = {}) {
  // mode 'replace' overwrites existing records by primary key.
  // mode 'merge' only writes records that don't already exist (by id).
  if (snapshot.business) {
    await put('business', { ...snapshot.business, id: 'me' });
  }
  for (const c of snapshot.clients || []) {
    if (mode === 'merge') {
      const existing = await get('clients', c.id);
      if (existing) continue;
    }
    await put('clients', c);
  }
  for (const inv of snapshot.invoices || []) {
    if (mode === 'merge') {
      const existing = await get('invoices', inv.id);
      if (existing) continue;
    }
    await put('invoices', inv);
  }
  for (const pref of snapshot.industryPrefs || []) {
    await put('industryPrefs', pref);
  }
}
