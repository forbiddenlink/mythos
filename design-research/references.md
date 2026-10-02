# Design references for the Mythos Atlas redesign

Snapshot: 2026-10-01. Each site below was loaded with WebFetch (a summarising fetch, so descriptions are what the page text and structure showed, not pixel inspection). Anything not loaded is listed under BLOCKED and is not used as evidence.

Target moves: mounted plates (mat, gilt keyline, tradition-colour tab), running heads with Roman section numerals, leader-dot index lines.

## References (12 loaded)

### Print, editorial and physical-object references

1. David Rumsey Map Collection
   URL: https://www.davidrumsey.com/
   Does well: Treats a large atlas collection (about 151,000 items, per the page) as browsable by region, map type and subject, with a text-on-maps search and example queries such as "Find maps with compass roses". Whitespace-heavy grid tiles with a category label on each.
   Take: Subject and type browse tiles as the orientation layer, and example-query chips under search. Avoid: the flat tile grid on its own, since it has no plate or mat treatment and so does not read as an atlas page.

2. The Public Domain Review
   URL: https://publicdomainreview.org/
   Does well: Serif headlines over sans body, a featured essay with a large hero image, essays and collections as separate sections, category and date tags on cards.
   Take: The essay-plus-collection split (a story page and a plate collection are different things) and tag metadata under images. Avoid: rounded-corner image thumbnails, which fight the square, keylined plate look.

3. The Folio Society
   URL: https://www.foliosociety.com/
   Does well: Sells books by naming the physical production ("six full-page colour illustrations", a wraparound slipcase landscape) and offers browse by genre, author, series and illustrator.
   Take: Plate-count and illustrator language in captions ("Plate 14 of 26"), and illustrator as a browse axis. Avoid: product-card grids with price and basket buttons, which make the page a shop.

4. Pitt Rivers Museum
   URL: https://www.prm.ox.ac.uk/
   Does well: Separates visiting, collections, research and learning in a tiered nav and sends users to online object and photograph collection browsers. Large landscape photography with text overlays.
   Take: Plain-language "browse the objects" entry points under a collections heading. Avoid: the homepage itself, which per the load does not show cases or labels; do not cite it for case or label design.

5. TASCHEN
   URL: https://www.taschen.com/en/
   Does well: A rotating carousel for featured volumes, product cards on white with edition tags such as "New" and "Baby Sumo", sparing all-caps section headers, a wishlist.
   Take: Edition-style tags (a small label on a card marking a tradition's volume or a featured plate) and the wishlist idea. Avoid: the carousel as the main orientation device; it hides the atlas structure.

### Outside mythology and encyclopedias

6. Rijksmuseum
   URL: https://www.rijksmuseum.nl/en
   Does well: Leads with named masterpieces ("Home of The Night Watch"), card grid for exhibitions, 9-language selector, mega-menu with Collection and Stories as peers.
   Take: Naming the one famous object per section to orient quickly, and Collection and Stories as sibling top-level routes (maps to deities and stories). Avoid: a search icon only, with no browse interface on the homepage.

7. Wellcome Collection
   URL: https://wellcomecollection.org/
   Does well: Image-above-text cards, sections titled "This week", "In focus" and "Latest stories", restrained colour so the imagery carries the page.
   Take: An "In focus" slot that spotlights one tradition or deity with a story. Avoid: pure dark-on-white restraint, which is already what a generic museum does; the atlas needs the gold and parchment palette doing real work.

8. Stripe Press
   URL: https://press.stripe.com/
   Does well: Books as a long vertical list, each entry holding title, author, description, buy links, author bio and praise as one unit; zine covers and posters break up text.
   Take: One self-contained entry unit per object with every fact stacked beneath it, which suits a deity index entry. Avoid: sans-only typography and the absence of search or filters.

9. Blue Note Records
   URL: https://www.bluenote.com/
   Does well: A Timeline nav item with expandable date ranges from 1939 to present, square album art as the consistent unit, named reissue series ("Classic Vinyl", "Tone Poet"), dark ground with white text.
   Take: A Timeline route and named series as collection labels, which maps to traditions as series. Avoid: heavy all-caps headlines at large size; they compete with Cinzel.

10. Sir John Soane's Museum
    URL: https://www.soane.org/
    Does well: Conveys a dense, layered collection with curated interior photography (vases, gold-framed paintings, models on walls) instead of a full catalogue grid.
    Take: A "crowded wall" hero image for the homepage that implies depth before the user searches. Avoid: its generic top nav (Visit, What's On, Shop), which is irrelevant to a free reference site.

11. Hades (Supergiant Games)
    URL: https://www.supergiantgames.com/games/hades/
    Does well: Presents gods (Ares, Aphrodite, Poseidon, Chaos, Dionysus, the Furies) as individual character portraits with minimal text on a dark palette, alternating text and high-contrast image sections.
    Take: Deity portraits as the unit of delight, minimal overlay text. Avoid: action-screenshot galleries and platform purchase buttons.

### Mythology reference

12. Theoi Project
    URL: https://www.theoi.com/
    Does well: A-Z encyclopedia index, eight linked family-tree charts with a central name index, a kingdom map, more than 1,200 images from ancient art (vases, statues, frescoes, mosaics), a bibliography page and a classical texts library.
    Take: Genealogy tables as a first-class destination and the bibliography as a visible route. Avoid: Google-powered site search and the dense link-list look, which the redesign should replace with the plate system.

## BLOCKED (not loaded, not used as evidence)

- Biodiversity Heritage Library, https://www.biodiversitylibrary.org/ : HTTP 403 via WebFetch, bot challenge via wigolo.
- Metropolitan Museum Open Access / collection, https://www.metmuseum.org/art/collection : HTTP 429 via both tools.
- The Criterion Collection, https://www.criterion.com/ : HTTP 403 and bot challenge.
- Aesop, https://www.aesop.com/us/ : HTTP 403.
- Land-book, https://land-book.com/ : HTTP 403.
- Library of Congress Maps, https://www.loc.gov/maps/ : HTTP 403.
- Cooper Hewitt collection (via si.edu redirect), https://www.si.edu/collections/cooper-hewitt : HTTP 403.
- NYPL Digital Collections, https://digitalcollections.nypl.org/ : returned no page content.
- Britannica, Pantheon.org and GreekMythology.com are blocked or failed too; they are listed in features.md.

Not followed: https://godly.website/ returned a 301 to recent.design and was not pursued.

## Discovery sources actually loaded

- Awwwards illustration category (https://www.awwwards.com/websites/illustration/): returned names only (for example "197 Historias Ilustradas", "The Tuscan Journey Begins"), no URLs, so none are cited.
- SiteInspire (https://www.siteinspire.com/): returned names only (for example "The Surfer's Journal Archives"), no URLs, so none are cited.

## Take-aways mapped to the three signature moves

- Mounted plates: no loaded reference has a mat plus keyline plus coloured tab. Folio Society's plate-count language and Taschen's edition tags give the caption and tab vocabulary; the visual treatment is original to Mythos.
- Running heads with Roman numerals: no loaded reference shows one in a screenshot-level sense. Public Domain Review's essay-and-collection split and Blue Note's timeline supply the section structure the numerals would sit on.
- Leader-dot index lines: Theoi's A-Z index and the Stripe Press stacked-entry unit are the closest content models; the dot leader is a typographic addition.
