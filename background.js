// Holds the per-tab level and hands it to the frames. Nothing is captured,
// so the tab stays an ordinary tab, fullscreen included.

const STEP = 25;
const clamp = (n) => Math.min(600, Math.max(0, n));
const key = (tabId) => "tab" + tabId;

// storage.session survives a service worker restart, not a browser restart.
async function getLevel(tabId) {
  const stored = await chrome.storage.session.get(key(tabId));
  return stored[key(tabId)] ?? 100;
}

function saveLevel(tabId, level) {
  return level === 100
    ? chrome.storage.session.remove(key(tabId))
    : chrome.storage.session.set({ [key(tabId)]: level });
}

function badge(tabId, level) {
  chrome.action.setBadgeBackgroundColor({ tabId, color: "#ff7a18" });
  chrome.action.setBadgeText({ tabId, text: level === 100 ? "" : String(level) });
}

// Tabs opened before the extension was installed have no content script yet:
// on the first failed message we inject it and retry, so nothing needs reloading.
async function deliver(tabId, level) {
  const msg = { target: "page", level };
  try {
    await chrome.tabs.sendMessage(tabId, msg);
  } catch {
    await chrome.scripting.executeScript({
      target: { tabId, allFrames: true },
      files: ["content.js"],
    });
    await chrome.tabs.sendMessage(tabId, msg);
  }
}

async function setLevel(tabId, level) {
  badge(tabId, level);
  await saveLevel(tabId, level);
  await deliver(tabId, level);
  return { level };
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg?.target !== "sw") return;

  const done = (p) => (p.then(sendResponse, (e) => sendResponse({ error: String(e) })), true);

  switch (msg.type) {
    case "state":
      return done(getLevel(msg.tabId).then((level) => ({ level })));
    case "set":
      return done(setLevel(msg.tabId, msg.level));
    case "level":
      // Asked by a frame that just started playing something.
      return done(getLevel(sender.tab.id).then((level) => ({ level })));
  }
});

// Shortcuts bypass the popup, which is what makes them work in fullscreen.
chrome.commands.onCommand.addListener(async (command) => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;

  const current = await getLevel(tab.id);
  const level = clamp(current + (command === "boost-up" ? STEP : -STEP));
  if (level !== current) await setLevel(tab.id, level).catch(() => {});
});

// The level belongs to the tab: after a navigation we hand it over again.
chrome.tabs.onUpdated.addListener(async (tabId, info) => {
  if (info.status !== "complete") return;
  const level = await getLevel(tabId);
  if (level !== 100) {
    badge(tabId, level);
    deliver(tabId, level).catch(() => {});
  }
});

chrome.tabs.onRemoved.addListener((tabId) => chrome.storage.session.remove(key(tabId)));
