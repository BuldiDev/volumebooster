// Runs in every frame. Raises the gain on the page's own media elements instead of
// capturing the tab, so the browser keeps treating it as a normal tab — fullscreen included.
const state = (window.__volumeBooster ||= { level: 100, nodes: new WeakMap() });

function apply() {
  if (state.ctx?.state === "suspended") state.ctx.resume();

  for (const el of document.querySelectorAll("video, audio")) {
    let gain = state.nodes.get(el);
    if (!gain) {
      try {
        state.ctx ||= new AudioContext();
        gain = state.ctx.createGain();
        state.ctx.createMediaElementSource(el).connect(gain).connect(state.ctx.destination);
        state.nodes.set(el, gain);
      } catch {
        continue; // element already wired into another audio graph
      }
    }
    gain.gain.value = state.level / 100;
  }
}

function setLevel(level) {
  state.level = level;
  if (level === 100 && !state.ctx) return; // no graph until one is actually needed

  if (!state.watching) {
    state.watching = true;
    // Players swap their media elements on the fly: keep the gain attached to the new ones.
    new MutationObserver(apply).observe(document, { childList: true, subtree: true });
  }
  apply();
}

chrome.runtime.onMessage.addListener((msg) => {
  if (msg?.target === "page") setLevel(msg.level);
});

// Ask the service worker only once something actually starts playing in this frame,
// so the script costs nothing on pages without media.
document.addEventListener(
  "play",
  async () => {
    if (state.asked) return apply();
    state.asked = true;
    const res = await chrome.runtime.sendMessage({ target: "sw", type: "level" }).catch(() => null);
    setLevel(res?.level ?? 100);
  },
  true,
);
