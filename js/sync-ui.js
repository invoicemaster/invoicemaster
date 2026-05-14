import { SyncSession, exportSnapshot, importSnapshot } from './sync.js?v=1778786333403';

export function renderSyncCard(root) {
  root.innerHTML = `
    <div class="sync-card">
      <h3 class="sync-title">Copy your info to another phone or computer</h3>
      <p class="sync-intro">
        Use this to move your business profile, clients, and saved invoices to a different device.
        Nothing goes online — the two devices talk directly to each other, scrambled with a secret only you two know.
      </p>

      <div class="sync-tabs">
        <button type="button" class="sync-tab active" data-mode="send">
          <strong>I want to SEND</strong>
          <span>my info from this device</span>
        </button>
        <button type="button" class="sync-tab" data-mode="receive">
          <strong>I want to RECEIVE</strong>
          <span>info from another device</span>
        </button>
      </div>

      <!-- ============== SEND FLOW ============== -->
      <div class="sync-pane" data-pane="send">
        <p class="sync-help">
          You're on the device that <strong>has</strong> your invoices.
          Follow these 4 steps to send a copy to your other device (phone, laptop, tablet — anything with a browser).
        </p>

        <div class="sync-step">
          <div class="sync-step-num">1</div>
          <div class="sync-step-body">
            <label class="sync-step-title">Pick a secret password</label>
            <p class="sync-step-detail">
              Make up something only you know — like a phrase, a sentence, anything.
              You'll type the <em>same</em> password on your other device. It scrambles everything so nobody else can read it.
            </p>
            <input type="password" id="sync-send-pass" placeholder="e.g. blue-fish-1942" autocomplete="off" />
          </div>
        </div>

        <div class="sync-step">
          <div class="sync-step-num">2</div>
          <div class="sync-step-body">
            <label class="sync-step-title">Make your handoff code</label>
            <p class="sync-step-detail">Click the button. We'll create a long code that you'll send to your other device.</p>
            <button type="button" class="btn-primary sync-action" id="sync-send-generate">Make my handoff code</button>
            <label class="sync-step-subtitle">Your handoff code (copy this and send it to your other device):</label>
            <textarea id="sync-send-offer" rows="4" readonly placeholder="Click the button above to make your code…"></textarea>
            <div class="sync-row">
              <button type="button" class="btn sync-copy" id="sync-send-copy-offer" hidden>Copy code</button>
              <span class="sync-tip">Tip: text it to yourself, AirDrop it, email it — any way you like.</span>
            </div>
          </div>
        </div>

        <div class="sync-step">
          <div class="sync-step-num">3</div>
          <div class="sync-step-body">
            <label class="sync-step-title">Open this same site on your OTHER device</label>
            <p class="sync-step-detail">
              On your other device, open this same page → Business tab → Sync → click <strong>"I want to RECEIVE"</strong>.
              Paste the code you just copied. It'll give you back a <em>reply code</em>. Bring that reply code over here.
            </p>
          </div>
        </div>

        <div class="sync-step">
          <div class="sync-step-num">4</div>
          <div class="sync-step-body">
            <label class="sync-step-title">Paste the reply code from your other device</label>
            <textarea id="sync-send-answer" rows="4" placeholder="Paste the reply code here"></textarea>
            <button type="button" class="btn-primary sync-action" id="sync-send-connect">Send my info now</button>
          </div>
        </div>

        <div class="sync-status" id="sync-send-status"></div>
      </div>

      <!-- ============== RECEIVE FLOW ============== -->
      <div class="sync-pane" data-pane="receive" hidden>
        <p class="sync-help">
          You're on the device that should <strong>get</strong> the invoices.
          Follow these 4 steps to pull a copy from your other device.
        </p>

        <div class="sync-step">
          <div class="sync-step-num">1</div>
          <div class="sync-step-body">
            <label class="sync-step-title">Type the SAME secret password</label>
            <p class="sync-step-detail">Whatever password the sender picked on their device — type the exact same one here.</p>
            <input type="password" id="sync-recv-pass" placeholder="Same password as the sender" autocomplete="off" />
          </div>
        </div>

        <div class="sync-step">
          <div class="sync-step-num">2</div>
          <div class="sync-step-body">
            <label class="sync-step-title">Paste the handoff code from your other device</label>
            <p class="sync-step-detail">The long code the sender made and sent over.</p>
            <textarea id="sync-recv-offer" rows="4" placeholder="Paste the sender's code here"></textarea>
            <button type="button" class="btn-primary sync-action" id="sync-recv-process">Make my reply code</button>
          </div>
        </div>

        <div class="sync-step">
          <div class="sync-step-num">3</div>
          <div class="sync-step-body">
            <label class="sync-step-title">Send your reply code back</label>
            <p class="sync-step-detail">Copy this and send it back to the OTHER device.</p>
            <textarea id="sync-recv-answer" rows="4" readonly placeholder="Your reply code appears after step 2"></textarea>
            <div class="sync-row">
              <button type="button" class="btn sync-copy" id="sync-recv-copy-answer" hidden>Copy reply code</button>
              <span class="sync-tip">Send it back the same way they sent you their code.</span>
            </div>
          </div>
        </div>

        <div class="sync-step">
          <div class="sync-step-num">4</div>
          <div class="sync-step-body">
            <label class="sync-step-title">Wait — your stuff will arrive</label>
            <p class="sync-step-detail">
              As soon as the sender pastes your reply code and clicks "Send my info now", you'll see a popup asking if it's OK to import.
              Click yes, and your invoices appear on this device.
            </p>
          </div>
        </div>

        <div class="sync-status" id="sync-recv-status"></div>
      </div>
    </div>
  `;

  let session = null;
  const setStatus = (paneId, msg, kind) => {
    const el = document.getElementById(paneId);
    if (!el) return;
    el.textContent = msg;
    el.dataset.kind = kind || '';
  };

  root.querySelectorAll('.sync-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      root.querySelectorAll('.sync-tab').forEach((t) => t.classList.toggle('active', t === tab));
      root.querySelectorAll('.sync-pane').forEach((p) => {
        p.hidden = p.dataset.pane !== tab.dataset.mode;
      });
      if (session) { session.close(); session = null; }
    });
  });

  // === Sender flow ===
  document.getElementById('sync-send-generate').addEventListener('click', async () => {
    const pass = document.getElementById('sync-send-pass').value.trim();
    if (!pass) { setStatus('sync-send-status', 'First pick a secret password (step 1).', 'error'); return; }
    setStatus('sync-send-status', 'Making your code… (might take a couple seconds)', 'info');
    try {
      session = new SyncSession();
      const offer = await session.createEncryptedOffer(pass);
      document.getElementById('sync-send-offer').value = offer;
      document.getElementById('sync-send-copy-offer').hidden = false;
      setStatus('sync-send-status', '✓ Code is ready. Copy it and send it to your other device.', 'success');
    } catch (e) {
      setStatus('sync-send-status', `Something went wrong: ${e.message}`, 'error');
    }
  });

  document.getElementById('sync-send-copy-offer').addEventListener('click', () => {
    const v = document.getElementById('sync-send-offer').value;
    navigator.clipboard.writeText(v).then(() => setStatus('sync-send-status', '✓ Code copied. Now paste it on your other device.', 'info'));
  });

  document.getElementById('sync-send-connect').addEventListener('click', async () => {
    if (!session) { setStatus('sync-send-status', 'Start with step 2 first — make your handoff code.', 'error'); return; }
    const pass = document.getElementById('sync-send-pass').value.trim();
    const answer = document.getElementById('sync-send-answer').value.trim();
    if (!answer) { setStatus('sync-send-status', 'Paste the reply code from your other device first (step 4).', 'error'); return; }
    setStatus('sync-send-status', 'Connecting your two devices…', 'info');
    try {
      await session.acceptEncryptedAnswer(pass, answer);
      session.onOpen(async () => {
        setStatus('sync-send-status', 'Connected! Sending your invoices…', 'info');
        const snap = await exportSnapshot();
        await session.sendJson(snap);
        setStatus('sync-send-status', '✓ All done! Your other device has a copy now.', 'success');
        setTimeout(() => { session?.close(); session = null; }, 1500);
      });
    } catch (e) {
      setStatus('sync-send-status', `Couldn't connect: ${e.message}. Double-check the password matches.`, 'error');
    }
  });

  // === Receiver flow ===
  document.getElementById('sync-recv-process').addEventListener('click', async () => {
    const pass = document.getElementById('sync-recv-pass').value.trim();
    const offer = document.getElementById('sync-recv-offer').value.trim();
    if (!pass) { setStatus('sync-recv-status', 'Type the same password the sender used (step 1).', 'error'); return; }
    if (!offer) { setStatus('sync-recv-status', 'Paste the sender\'s handoff code first (step 2).', 'error'); return; }
    setStatus('sync-recv-status', 'Reading the code… (couple seconds)', 'info');
    try {
      session = new SyncSession();
      session.onJson(async (snapshot) => {
        const inv = snapshot.invoices?.length || 0;
        const cl = snapshot.clients?.length || 0;
        if (!confirm(`Your other device sent over:\n• ${inv} invoice${inv === 1 ? '' : 's'}\n• ${cl} client${cl === 1 ? '' : 's'}\n• Business profile\n\nReplace what's on this device with this copy?`)) {
          setStatus('sync-recv-status', 'OK, didn\'t import anything.', 'info');
          return;
        }
        await importSnapshot(snapshot, { mode: 'replace' });
        setStatus('sync-recv-status', '✓ All copied! Reload the page to see your invoices.', 'success');
        document.dispatchEvent(new CustomEvent('invoices:changed'));
      });
      session.onOpen(() => {
        setStatus('sync-recv-status', 'Connected! Waiting for your other device to send the info…', 'info');
      });
      const answer = await session.acceptEncryptedOfferCreateAnswer(pass, offer);
      document.getElementById('sync-recv-answer').value = answer;
      document.getElementById('sync-recv-copy-answer').hidden = false;
      setStatus('sync-recv-status', '✓ Your reply code is ready. Copy it and send it back to your other device.', 'success');
    } catch (e) {
      setStatus('sync-recv-status', `Couldn't read the code: ${e.message}. Check the password matches exactly.`, 'error');
    }
  });

  document.getElementById('sync-recv-copy-answer').addEventListener('click', () => {
    const v = document.getElementById('sync-recv-answer').value;
    navigator.clipboard.writeText(v).then(() => setStatus('sync-recv-status', '✓ Reply code copied. Send it back to the other device.', 'info'));
  });
}
