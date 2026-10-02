# Competitor and category-leader features

Snapshot: 2026-10-01. Each site was loaded with WebFetch from its homepage or a main landing page, so observations cover what that page shows. An absent feature means "not visible on the loaded page", not "does not exist on the site".

## Sites loaded (8)

### 1. Theoi Project (https://www.theoi.com/)
Features observed: main nav (Olympians, Other Gods, Titans, Bestiary, Heroes, Miscellany) with dropdowns; Google-powered search; A-Z encyclopedia index; profile pages per figure; thematic groupings (Olympian, Primordial, Sea, Sky, Underworld); eight linked family-tree charts with a name index; Theogony genealogical table; kingdom map; gallery of 1,200+ ancient-art images in four categories; bibliography; classical texts library; star-myth and plant-myth thematic pages.
Does badly: Search is outsourced to Google and the page is a dense link list, with no cross-tradition view (Greek only).

### 2. Mythopedia (https://www.mythopedia.com/)
Features observed: header search; guides for nine mythologies; collections (Greek Olympians, Heroes, Creatures, Titans, pantheons by culture); "Divine Domains" browse by function (solar, war, death, trickster and so on); classic texts list (Theogony, Iliad, Prose Edda and more); 12+ name generators; newsletter. No paywall visible.
Does badly: No citations, maps, family trees, timelines, quizzes or audio were visible; images are small 96px thumbnails.

### 3. Godchecker (https://www.godchecker.com/)
Features observed: God of the Day; Top Ten Gods ranking; 50+ pantheon categories; partial-match text search across a claimed database of nearly four thousand deities; help section; social links.
Does badly: No images, family trees, maps, timelines, quizzes or citations were visible; the homepage reads as a directory.

### 4. World History Encyclopedia, Mythology page (https://www.worldhistory.org/mythology/)
Features observed: site search; breadcrumb; related-content filters (All, Definitions, Articles, Images, Videos); an embedded timeline (c. 4000 BCE to 720 CE, 24 dated entries); captioned images with artist and licence info; cite tool (APA, Chicago, MLA); external links with an "Add External Link" action; "Add Event" for timeline contributions; membership and donation prompts; schema.org markup.
Does badly: Repeated "Remove Ads" membership prompts interrupt reading; the timeline is one shared strip, not per-deity.

### 5. Norse Mythology for Smart People (https://norse-mythology.org/)
Features observed: hierarchical nav (Gods and Creatures, Cosmology, Tales, The Vikings, Runes, Concepts); search; hyperlinked deity names; public-domain paintings (Georg von Rosen, Nicholas Roerich) as illustration; author book promotion.
Does badly: One tradition only; no quizzes, audio, family trees, maps, citations panel or bookmarking visible.

### 6. Perseus Digital Library (https://www.perseus.tufts.edu/hopper/)
Features observed: nav (Collections/Texts, Perseus Catalog, Research, Help); search with advanced options; popular texts in Greek, Latin and English; art and archaeology browse (coins, vases, sculpture, a temple); exhibits (Olympics, Hercules); standardised citation format ("Hom. Od. 9.1"); partner site links.
Does badly: Last news item shown is January 2024 and the layout is text-primary with small thumbnails, so it reads as a research tool, not an exploration site.

### 7. Wikipedia, Portal:Mythology (https://en.wikipedia.org/wiki/Portal:Mythology)
Features observed: search; 22 languages; Selected Article and Selected Creature slots; Did You Know; recognised-content lists with star icons; 50-image gallery; subcategory links (Greek, Mesopotamian, astronomical myths and others); sister-project links (Commons, Wikidata, Wikisource); edit and history tools.
Does badly: The portal carries a June 2018 maintenance stamp, and the featured content is a random sample with no path from orientation into depth.

### 8. Mythology.net (https://mythology.net/)
Features observed: nav by tradition (Greek, Norse, Egyptian, Roman, Japanese, Hindu, Others) with sub-categories (Gods, Creatures, Concepts, Heroes); A-Z directory of 500+ entries; header search; footer Scholarship link.
Does badly: No images, quizzes, family trees, citations or maps were visible; a text directory only.

## Not loaded (not evidence)

- Britannica (https://www.britannica.com/topic/mythology): HTTP 403.
- Pantheon.org / Encyclopedia Mythica (https://www.pantheon.org/): certificate expired.
- GreekMythology.com (https://www.greekmythology.com/): HTTP 403.
- No dedicated "Mythology Atlas" app was loaded; none was searched for within the page budget.

## Feature coverage matrix (observed only)

| Feature | Seen on |
|---|---|
| Text search | Theoi, Mythopedia, Godchecker, WHE, Norse, Perseus, Wikipedia, Mythology.net |
| Browse by tradition or pantheon | Mythopedia, Godchecker, Mythology.net, Norse (single tradition), Wikipedia |
| Browse by domain or function | Theoi (thematic groupings), Mythopedia |
| A-Z index | Theoi, Mythology.net |
| Family trees | Theoi only |
| Map | Theoi (kingdom map) |
| Timeline | World History Encyclopedia only |
| Image gallery by medium | Theoi, Wikipedia (50 images), Perseus (art and archaeology) |
| Source citation or cite tool | WHE (cite tool), Perseus (text citation format), Theoi (bibliography) |
| Primary texts | Theoi, Perseus, Mythopedia (classic texts list) |
| Quiz | None seen |
| Audio | None seen |
| Bookmarking or accounts | None seen (WHE has membership) |
| Cross-tradition comparison | None seen |
| Daily or featured item | Godchecker (God of the Day), Wikipedia (Selected Article) |

Gap read: no loaded site combines family trees, a map, a timeline, quizzes and citations across many traditions. Quizzes, audio, bookmarking and comparison were seen on none of the eight.

## Features ranked by impact on the main action

Main action: exploring from orientation (homepage or tradition page) into deeper study of one deity or story.

Buildable = fits existing content and code. Needs-approval = paid service, new API key, schema change, new routes, billing or auth.

| Rank | Feature | Why it moves the main action | Status |
|---|---|---|---|
| 1 | Tradition and domain browse tiles with example-query search chips | Gets a first-time visitor to a deity list in one click; competitors rely on plain nav lists | buildable |
| 2 | Leader-dot index lines per tradition (A-Z, with domain and tradition in the line) | Scannable path from tradition to a specific deity; Theoi and Mythology.net only offer bare lists | buildable |
| 3 | Mounted-plate deity header with tradition tab, plus related deities and stories rail | Keeps users moving laterally once on a page | buildable |
| 4 | Family-tree view on each deity linking to parents, spouses, children | Only Theoi has trees; the data already exists | buildable |
| 5 | Visible source citations and a cite-this-page block (APA, Chicago, MLA) | Builds trust and supports study; WHE does it, most others do not | buildable if citation data is already in the content model; needs-approval if a new field is required |
| 6 | Per-tradition timeline | Only WHE has one and it is global | needs-approval (needs date fields and a new route) |
| 7 | Map of places by tradition | Only Theoi has a kingdom map | needs-approval (map tiles or library, new coordinate data, new route) |
| 8 | Quizzes as a study step after reading | None seen on competitors; supports deeper study | buildable (quizzes already exist on the product) |
| 9 | Cross-tradition comparison (two deities side by side) | None seen; strong for study | needs-approval (new route and data shape) |
| 10 | Bookmarks or a reading list | None seen; helps return visits | needs-approval (auth or account storage; local-only bookmarks would be buildable) |
| 11 | Audio pronunciations | None seen; useful for names | needs-approval (paid TTS service or recorded assets, new API key) |

Order logic: ranks 1 to 4 act on the orientation-to-depth step directly and use data the atlas already has. Ranks 5 to 8 deepen study once a user is on a page. Ranks 9 to 11 are differentiators that cost schema, auth or paid services.
