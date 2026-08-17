# Privacy Policy — Volume Booster

_Last updated: 17 August 2026_

## Summary

Volume Booster does not collect, store, transmit, or sell any user data.

## What the extension does with data

The extension has one function: amplifying the audio volume of a browser tab.
To do that it keeps a single piece of information — the volume level you chose
for a tab, such as `250` for 250%.

That number is held in `chrome.storage.session`, a browser-managed store that
lives only for the current browsing session. It never leaves your device, it is
never written to disk, and it is discarded when you close the browser. It is
also deleted as soon as you close the tab or set the level back to 100%.

## What the extension does not do

- It makes **no network requests of any kind**. It has no server, no analytics,
  no telemetry, no error reporting, and no external dependencies.
- It does **not** read, store, or transmit page content, browsing history,
  URLs, cookies, form data, credentials, or personal information.
- It does **not** track your activity across sites.
- It does **not** contain remote code. All JavaScript that runs is bundled in
  the published package.
- It does **not** sell or share data with third parties, because it holds no
  data to sell or share.

## Why the extension needs access to all sites

Video and audio players are frequently embedded in cross-origin iframes: the
page you are looking at is one origin, while the `<video>` element lives in
another. Browser security only allows an extension to change a media element's
volume from inside the frame containing it. Access limited to the top-level
site would therefore make the extension useless on most video and streaming
sites.

That access is used for exactly one operation: locating `<video>` and `<audio>`
elements and connecting them to a Web Audio gain node. Nothing on the page is
read or sent anywhere.

## Source code

The extension is open source and can be inspected in full at
<https://github.com/BuldiDev/volumebooster>.

## Changes

If this policy ever changes, the updated version will be published in this
repository with a new date at the top.

## Contact

For any question about this policy, open an issue at
<https://github.com/BuldiDev/volumebooster/issues>.
