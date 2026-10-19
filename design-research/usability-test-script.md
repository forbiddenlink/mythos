# Usability test script: Mythos Atlas

Written 2026-10-16. Five participants, 30 minutes each, remote with screen
share. Two on a phone, three on a laptop. Recruit people who read about
mythology for fun (a game, a book, a show), not designers or developers.

## Before you start

- Use the production site in a fresh private window, so no bookmarks or
  progress carry over.
- Say: "We are testing the site, not you. Please think aloud. If you get stuck,
  that tells us what to fix."
- Do not help. If they ask, reply: "What would you try?"
- Record: time per task, completed without help (yes/no), the first place they
  clicked, and anything they said out loud that surprised you.

## Tasks

Read each task aloud. Do not use the site's own labels in the wording.

1. **Find a god.** "You heard there is a Norse god of war. Find out who it is
   and one thing they are known for."
   Success: reaches Týr (or Odin as a war god) and states one fact.
2. **Save it.** "You want to come back to that god later. Make sure you can
   find them again on this site."
   Success: uses the bookmark control and finds it under Bookmarks.
3. **Compare.** "Is that god like the Greek god of war? Find out how they
   compare."
   Success: reaches a comparison of the two (compare tool or a /compare page).
4. **Follow a family.** "Who were Zeus's parents, and who were theirs?"
   Success: names Cronus and Rhea, then Uranus and Gaia.
5. **Read a myth to the end.** "Pick any story about the underworld and read
   until you know how it ends."
   Success: finishes one story; note whether they found it by search, menu or links.
6. **Check a source.** "How do we know that story? Find where it comes from."
   Success: reaches the source notes or the sources page.

## After the tasks

- "What was the most confusing moment?"
- "What would you call this site if you described it to a friend?"
- "Would you come back? What would bring you back?"

## Pass bar

At least 4 of 5 participants complete each task without help. Any task under
that bar becomes the top fix. Record results next to
`design-research/baseline-2026-10-16.md`.

## October 18 improvement follow-up

Use the deployed build containing the improvements, or the local production
preview. Do not test the older production site and attribute its results to
these changes. The protected [October 18 improvement preview](https://mythos-ivmxbsu2r-elizabeth-emersons-projects.vercel.app)
contains the current improvements; use an account with preview access. No
participant sessions have been completed for this update.

Keep sessions to 30 minutes: rotate the tasks below across participants rather
than adding all of them to the six tasks above. Include at least two phone users.

| Task prompt                                                                                                   | Success observation                                                                                        |
| ------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| "Find a god connected with healing. Then find another from a different tradition."                            | Uses browsing categories and reaches two relevant records without losing their place.                      |
| "How is Athena connected to Zeus? What evidence does this site give for that relationship?"                   | Finds the connection, reads its direction correctly, and locates the attached passage.                     |
| "Explore the sculpture of Shiva dancing. What does the drum mean, and where does that explanation come from?" | Opens the artwork, zooms and resets, finds the drum explanation and museum record, then closes the viewer. |
| "Do all the sources tell Medusa's story the same way? Find one difference."                                   | Distinguishes accounts and identifies a source; does not treat absence from a source as contradiction.     |
| "Follow Odysseus's journey. Find a stop you want to read more about and explain how certain its location is." | Uses the itinerary, finds its source or story link, and recognizes uncertain locations.                    |

Repeat one artwork task using only the keyboard. Check that zoom, image scrolling,
Escape, and return focus work. In a separate device check, inspect the journey
with map tiles unavailable; the reading itinerary must remain usable.

Record anonymous participant labels (P1–P5), device/browser, task, completion
without help, time, first action, confusion, and the next proposed fix. Do not
store names, recordings, or identifying quotes in this public repository.
Mark untested tasks explicitly. Automated browser checks do not count as
participant success or physical-device/screen-reader validation.
