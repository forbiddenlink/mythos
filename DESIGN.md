# Design contracts

The existing visual direction is unchanged. Canonical tokens and components are documented in `apps/web/public/design-system.txt`; token values live in `apps/web/src/app/globals.css` and design philosophy in `.impeccable.md`.

## Catalog navigation

Search, facets, view, sorting and pagination must survive entry navigation, browser Back and reload. Serialize supported catalog state in the URL. Replace filter edits in the current history entry; reset pagination when a filter or sort changes. Validate discrete values and page numbers. Preserve server-rendered pagination links where they already exist.

## Global search recovery

Use the existing command menu's selectable rows for onward destinations, including empty and unavailable search states. Keep status text outside the listbox, distinguish data failure from zero matches, retain arrow/Enter selection and provide at least 44px recovery rows with the existing readable text tokens. Escape returns focus to the element that opened search, including keyboard invocation.

These rules address observed usability failures. They do not change imagery, fonts, palette, card layouts or article hierarchy.

## Enlarged text

Header actions, catalog controls and optional footer tools can wrap when enlarged text needs more space. Keep the normal-size layout intact. Bound select controls to their container and allow long footer labels to wrap, so a 320px viewport remains usable with text enlarged to 200%.

## Failed local operations

A saved-state control can reflect the current in-memory choice, but a failed browser-storage write must show a visible warning with retry and backup recovery. Keep the warning visible while the reader scrolls. Backups include the latest unsaved learning changes. Do not describe a failed clipboard operation or unavailable review data as a successful result. Popovers must stay within the viewport and restore focus when dismissed with Escape.
