## 01 art-institute

URL: https://www.artic.edu/collection

Page title: Discover Art & Artists | The Art Institute of Chicago

H1 recorded: The Collection

Screenshots: shots/second-pass/refs/01-art-institute-desktop.png, shots/second-pass/refs/01-art-institute-mobile.png, shots/second-pass/refs/01-art-institute-detail.png

Status: 200. Desktop/mobile rendered and scrolled. Interpretation and eligibility recorded below after image inspection.

01 interpretation: Question 3. The collection retains artwork-led discovery on mobile, with separate search and filter controls near the bottom of the viewport. Scrolled desktop/mobile; control activation was not tested. Retain Mythos's image-led cards and compact toolbar. A fixed bottom toolbar is unnecessary for our smaller filter set and could compete with browser controls.

## 02 perseus

URL: https://www.perseus.tufts.edu/hopper/

Page title: Perseus Digital Library

H1 recorded: no hero headline

Screenshots: shots/second-pass/refs/02-perseus-desktop.png, shots/second-pass/refs/02-perseus-mobile.png, shots/second-pass/refs/02-perseus-detail.png

Status: 200. Desktop/mobile rendered and scrolled. Interpretation and eligibility recorded below after image inspection.

02 interpretation: Question 3. The library exposes collections, language-specific texts and search directly. Its two-column mobile layout compresses text heavily and clips the brand. Retain Mythos's responsive article/sidebar reflow and source links; do not import this desktop-first density. Desktop/mobile scrolling inspected, no search or text navigation tested. No hero headline; the visible welcome is an introduction.

## 03 scaife

URL: https://scaife.perseus.org/library/

Page title: Oh noes!

H1 recorded: Oh noes!

Screenshots: shots/second-pass/refs/03-scaife-desktop.png, shots/second-pass/refs/03-scaife-mobile.png, shots/second-pass/refs/03-scaife-detail.png

Status: 200. Desktop/mobile rendered and scrolled. Interpretation and eligibility recorded below after image inspection.

03 excluded: The Scaife URL returned an access-protection error rather than a library, despite HTTP 200. No bypass attempted. It is not counted as an inspected reference.

## 04 mdn-history

URL: https://developer.mozilla.org/en-US/docs/Web/API/History_API/Working_with_the_History_API

Page title: Working with the History API - Web APIs | MDN

H1 recorded: Working with the History API

Screenshots: shots/second-pass/refs/04-mdn-history-desktop.png, shots/second-pass/refs/04-mdn-history-mobile.png, shots/second-pass/refs/04-mdn-history-detail.png

Status: 200. Desktop/mobile rendered and scrolled. Interpretation and eligibility recorded below after image inspection.

04 interpretation: Question 1. The browser documentation distinguishes replacing the current entry from adding an entry and documents the popstate event. Retain URL-addressed catalog state, replace filter edits without filling Back history, and read the restored URL on return. Documentation inspected at desktop/mobile; no embedded application journey tested. The implementation also follows the installed Next.js native-history contract.

## 05 wai-combobox

URL: https://www.w3.org/WAI/ARIA/apg/patterns/combobox/

Page title: Combobox Pattern | APG | WAI | W3C

H1 recorded:

              Combobox Pattern

Screenshots: shots/second-pass/refs/05-wai-combobox-desktop.png, shots/second-pass/refs/05-wai-combobox-mobile.png, shots/second-pass/refs/05-wai-combobox-detail.png

Status: 200. Desktop/mobile rendered and scrolled. Interpretation and eligibility recorded below after image inspection.

05 interpretation: Question 2. The official combobox pattern keeps typed input editable while arrow keys move through options and Enter accepts the active choice. Retain cmdk and its existing semantics; use selectable rows for recovery instead of buttons inside the listbox. Documentation scrolled at both widths, no sample interaction tested here. Visual styling comes from Mythos, not the documentation site.

## 06 cmdk

URL: https://github.com/dip/cmdk

Page title: GitHub - dip/cmdk: Fast, unstyled command menu React component. · GitHub

H1 recorded: ⌘K

Screenshots: shots/second-pass/refs/06-cmdk-desktop.png, shots/second-pass/refs/06-cmdk-mobile.png, shots/second-pass/refs/06-cmdk-detail.png

Status: 200. Desktop/mobile rendered and scrolled. Interpretation and eligibility recorded below after image inspection.

06 interpretation: Question 2. The requested demo redirects to the component's public repository. Its documented composition uses Input, List, Group and Item. This supports reusing our existing command primitive for recovery rows. Desktop/mobile documentation inspected and scrolled; no live demo interaction was available at this URL. The repository image is indirect evidence and is not treated as a tested demo. Retain the current dependency and styling.

## Research conclusion

Five accessible references were inspected, including two adjacent content products. One protection screen was excluded. These references support preserving the visual identity and responsive article structure. The changes address independently reproduced local behavior, rather than borrowing another product's identity. No external account, form submission or write action was used.
