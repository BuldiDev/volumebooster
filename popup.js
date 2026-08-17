const slider = document.getElementById("slider");
const value = document.getElementById("value");
const reset = document.getElementById("reset");
const error = document.getElementById("error");
const hint = document.getElementById("hint");

let tabId = null;

const send = (msg) => chrome.runtime.sendMessage({ target: "sw", ...msg });

function render(level) {
  value.textContent = level + "%";
  value.classList.toggle("boosted", level > 100);
  slider.value = level;
}

function fail(message) {
  document.body.classList.add("blocked");
  error.textContent = message;
  error.hidden = false;
}

// One request at a time: while dragging, only the latest value matters.
let pending = null;
let busy = false;
async function push(level) {
  pending = level;
  if (busy) return;
  busy = true;
  try {
    while (pending !== null) {
      const next = pending;
      pending = null;
      const res = await send({ type: "set", tabId, level: next });
      if (res?.error) throw new Error(res.error);
    }
  } catch {
    fail("This tab can't be boosted.");
  } finally {
    busy = false;
  }
}

slider.addEventListener("input", () => {
  let level = Number(slider.value);
  if (Math.abs(level - 100) < 15) level = 100; // snap to 100%
  render(level);
  push(level);
});

reset.addEventListener("click", () => {
  render(100);
  push(100);
});

(async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return fail("No active tab.");
  tabId = tab.id;

  const res = await send({ type: "state", tabId }).catch(() => null);
  render(res?.level ?? 100);

  // Surface the real shortcuts: in fullscreen they are the only usable control.
  const commands = await chrome.commands.getAll();
  const up = commands.find((c) => c.name === "boost-up")?.shortcut;
  const down = commands.find((c) => c.name === "boost-down")?.shortcut;
  if (up && down) hint.textContent = up.slice(0, up.lastIndexOf("+") + 1) + "↑ ↓";
})();
