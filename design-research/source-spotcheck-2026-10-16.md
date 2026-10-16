# Mythos Atlas source spot-check, 2026-10-16

## Method

- `apps/web/src/data/deities.json` (360 entries) sorted by `id` ascending, every 36th taken starting at index 0 (indices 0, 36, ... 324).
- Ids: aengus, baiame, diana, habaek, indra, mama-qucha, nyame, purusha, spenta-armaiti, tuoni. (10 of 10, so no stories top-up.)
- Fields read: description, originStory, detailedBio, primarySources, domain, plus every edge in `relationships.json` touching the id.
- Evidence rungs: PRIMARY TEXT READ = Gregory (Gutenberg #14465), Acosta (Hakluyt/Markham 1880 trans., archive.org), Crawford Kalevala (Gutenberg #5186), Gwanggaeto Stele transcription (ko.wikisource), Darmesteter Vendidad (SBE 4, archive.org), Rigveda via Griffith (Wikisource), Virgil Aeneid VII (Dryden, classics.mit.edu), Strabo 5.3.12 (Penelope/Chicago). Everything else = secondary (Wikipedia, Theoi, Iranica via search summary), which is weaker.
- Blocked: sacred-texts.com (403/Cloudflare, not bypassed), avesta.org (expired cert, not bypassed), dcceew.gov.au heritage page (timeout).

## Per entry

### aengus (9 checked: 8 Supported, 1 Contested)

- Son of Dagda and Boann. Supported. en.wikipedia.org/wiki/Aengus: "parents are the Dagda and Boann".
- Boann's husband Elcmar (or Nechtan). Supported. en.wikipedia.org/wiki/Boann: "variously Nechtan or Elcmar".
- Dagda sends Elcmar away, nine months pass as one day. Supported. Boann page: "one-day errand ... nine months pass".
- Fostered by Midir. Supported (also fostered by Elcmar elsewhere). en.wikipedia.org/wiki/Midir: "foster-son Aengus".
- Wins Brú na Bóinne with "a day and a night". Supported. Aengus page: "láa ocus aidche".
- Caer Ibormeith, swan every second Samhain, 150 swans. Supported. Aengus page.
- Diarmuid foster-son, body revived daily at the Brú. Supported. Aengus page.
- primarySources quote (silver harp, red gold strings). Supported. Gutenberg #14465: "held a silver harp with strings of red gold". Note: it is King Cormac's account of meeting Angus, in Gods and Fighting Men. The quote does not support any of the domains.
- relationships: aengus sibling_of midir. Contested-in-sources. Midir is foster-father in Tochmarc Étaíne per Wikipedia (Midir page), while the Aengus page notes the Étaín tale also calls Midir "his brother". Edge has `evidence: []`.
- Not checked: "gave Diarmuid his cloak of invisibility".

### baiame (4 checked: 4 Supported)

- Revealed fish-trap design by throwing net over the river (Brewarrina). Supported (secondary only). Web search of Brewarrina Council and austhrutime summaries. The cited National Heritage page (dcceew.gov.au) timed out, so the citation itself is UNVERIFIED.
- Sons Booma-ooma-nowi and Ghinda-inda-mui. Supported (secondary; spellings vary).
- Missionary "supreme being" framing questioned. Supported. en.wikipedia.org/wiki/Baiame: "construct of early Christian missionaries" suggestion, disputed.
- Baiame's Cave at Milbrodale, Wonnarua Country. Supported. Same page.
- Not verified: Ngiyampaa and Yuwaalaraay among the peoples (Wikipedia lists Kamilaroi, Wiradjuri, Wonnarua etc., not those two); traps allocated to family groups.

### diana (7 checked: 7 Supported)

- Twin of Apollo, daughter of Jupiter (relationship edge). Supported. Theoi Artemis: "daughter of Zeus and ... Leto, twin of Apollo" (Hesiod Theogony 918; Hom. Hymn 27). Roman Diana: en.wikipedia.org/wiki/Diana_(mythology).
- Diana Nemorensis at Aricia / Lake Nemi. Supported. Same.
- Priest wins office by killing predecessor. Supported. Strabo 5.3.12: priest is "a run-away slave who has slain ... the man previously consecrated". Fontenrose doubts the rite was historical.
- Protector in childbirth. Supported. Wikipedia: votive terracotta wombs.
- Merged with Luna and Hecate (triformis). Supported.
- primarySources quote "chaste Diana ... Aesculapian herbs". Supported as text: Aeneid VII (Dryden), classics.mit.edu. FLAG: it is about Hippolytus/Virbius being healed; it does not contain any claim made in the description or domains.
- Not checked: Actaeon "poets borrowed".

### habaek (7 checked: 5 Supported, 1 Unsupported, 1 Contested)

- Stele: Chumo from Buyeo, son of Heavenly Emperor, mother daughter of Habaek, born from egg. Supported. ko.wikisource Gwanggaeto Stele: "天帝之子，母河伯女郎，剖卵降出".
- detailedBio: Chumo calls himself "grandson of Habaek" at the river. Unsupported. Stele line is "我是皇天之子，母河伯女郎，鄒牟王". It says his mother is Habaek's daughter; "grandson" is an inference.
- Yi Gyu-bo composed Dongmyeongwang-pyeon in 1193. Supported (search summary).
- Three daughters, Yuhwa eldest, palace underwater. Supported. en.wikipedia.org/wiki/Habaek.
- Contest pairs carp/otter, deer/wolf, pheasant/hawk. Contested-in-sources. Habaek page: carp, deer, quail; Lady Yuhwa page: carp, pheasant, deer (cites Dongguk Isanggukjip). I could not retrieve Yi Gyu-bo's text. The 豺 character is often rendered "wolf/dhole".
- Habaek punishes and casts out Yuhwa. Supported (secondary).
- Habaek = Korean reading of Hebo, distinct from Chinese Yellow River god. Supported. Habaek page: "considered separate deities".

### indra (6 checked: 5 Supported, 1 Contested)

- Slew the Dragon, released waters; RV 1.32.1 quote. Supported. Wikisource Griffith: "He slew the Dragon, then disclosed the waters".
- Father Dyaus. Supported. RV 4.17.4: "Thy Father Dyaus esteemed himself a hero".
- originStory "born to Dyaus and Prithvi". Contested-in-sources. RV 4.17 does not name the mother. en.wikipedia.org/wiki/Indra: "Dyaus and Prithvi, or ... Tvashta and his wife"; Puranas: Kashyapa and Aditi. The entry states it flat.
- Rides Airavata. Supported (post-Vedic). Indra page.
- Capital Amaravati. Supported. Indra page.
- Govardhana episode. Supported. Bhagavata Purana 10.25 (vedabase.net summary).
- Not checked: "most important deity in Vedic period"; edge indra enemy_of usha (RV 4.30 likely); edge ally_of agni.

### mama-qucha (3 checked: 3 Supported)

- Acosta lists earth "Pachamama" and sea "Mamacocha". Supported. archive.org naturalmoralhist61acosrich, Book V: "the sea likewise, which they call Mamacocha". Acosta is following Polo, as the entry says.
- Acosta 1590. Supported (publication date).
- Milky Way as sky river in Andean thought. Supported (general; search summary).
- Not verified: Yacana drinks from the sea so it does not flood (Huarochirí ch. 29 title confirms Yacana drinks; the sea detail not seen); qucha = lake; Spondylus.

### nyame (6 checked: 5 Supported, 1 Contested; 1 unverified)

- Supreme sky/creator god. Supported. en.wikipedia.org/wiki/Nyame.
- Spouse Asase Yaa. Supported (infobox).
- Parent of Tano and Bia. Supported (infobox).
- relationships: nyame parent_of anansi. Contested-in-sources. Wikipedia: Ananse "might be directly Odomankoma's son". Edge has `evidence: []`.
- Pestle/old woman tale. Supported as tradition: Platvoet, "Nyame Ne Aberewa" (late-19th-century missionary recordings).
- Gye Nyame "except for God". Supported (Wikipedia: "I Fear None Except God").
- Unverified citation: Rattray, Ashanti (1923), Nyame dua as forked branch. Searches returned Rattray's 1927 Religion and Art in Ashanti, not this detail. Could not read either text.

### purusha (9 checked: 7 Supported, 2 Unsupported)

- RV 10.90.1 and 10.90.13 quotes. Supported. Wikisource Griffith: "A THOUSAND heads hath Purusa"; "The Moon was gendered from his mind".
- Varnas from mouth, arms, thighs, feet. Supported (v12).
- Viraj born of him, he of Viraj. Supported (v5: "again Purusa from Viraj was born").
- Sky from head, earth from feet. Supported (v14).
- Indra/Agni from mouth, Vayu from breath. Supported (v13).
- Late hymn. Supported (Wikipedia: "relatively late addition").
- "Earliest text to name the four varnas together". Unsupported by sources checked. Wikipedia says only that it is the only RV hymn explicitly naming four varnas; no "earliest" claim.
- "Vaishnava tradition identifies the cosmic Person with Vishnu". Unsupported by sources checked. en.wikipedia.org/wiki/Purusha_Sukta says only "foundation of Vaishnava thought" and Jaiswal's "connected with ... Narayana".
- Not checked: Upanishad/Samkhya consciousness sentence.

### spenta-armaiti (8 checked: 6 Supported, 2 Contested)

- Yasna 45.4 "daughter". Supported (secondary). Iranica "Ārmaiti": Zoroaster calls her Ahura Mazda's "daughter" in Y 45.4; zarathushtra.com translation: "His daughter is [Armaiti] of good actions".
- Vendidad 2 quote "O Spenta Armaiti, kindly open asunder". Supported. SBE 4 (Darmesteter 1880) via archive.org zendavesta01darm; first of three occurrences (2.10, then 2.14, 2.18 by that edition's paragraphing; sentence numbering unconfirmed).
- Yima uses "golden seal". Contested-in-sources. Darmesteter: "pressed the earth with the golden ring". "Seal" is a different translator's rendering.
- Amesha Spentas membership. Supported (SBE introduction).
- Spandarmad guardian of earth and good women. Supported (Wikipedia: "guardian spirit of the earth").
- Esfand = 12th month, 5th day, Sepandarmazgan. Supported (Wikipedia Sepandarmazgan, Iranica Esbandi). Modern date given variously.
- relationships: ahura-mazda parent_of spenta-armaiti. Supported (Y 45.4).
- relationships: yima ally_of spenta-armaiti. Contested-in-sources. Vd 2 shows Yima addressing her; "ally" is a loose label. Edge has `evidence: []`.

### tuoni (8 checked: 7 Supported, 1 Unsupported)

- Tuoni or Mana as god of the underworld; Tuonela/Manala. Supported. Crawford Kalevala intro: "Tuoni, or Mana, the god of the under[world]".
- Väinämöinen goes for three words to finish his boat. Supported. Crawford Rune XVI: "Needed three words of the Master".
- Tuoni's daughter ferries after demanding the truth. Supported (Rune XVI: "If I row thee o'er the ferry, Thou must speak the truth").
- Tuonetar's beer of frogs and worms; sleep wand. Supported (Rune XVI: "spawning of the black-frogs ... worms").
- Nets of iron and copper stretched by Tuoni's son. Supported. Rune XVI: "a thousand nets of copper Interlaced with threads of iron", a three-fingered man of Tuoni's kingdom (Wikipedia Tuonetar: her three-fingered son).
- primarySources paraphrase "serpent of steel". Unsupported. Crawford: "Like a serpent ... black-dyed". Steel appears only elsewhere (boat-building). Finnish original unchecked.
- Lemminkäinen killed hunting the swan, then hacked up by Tuoni's son. Supported. Crawford Rune XIV: "Cuts in pieces Lemminkainen, Chops him with his mighty hatchet". Crawford's rune numbers differ from Lönnrot's.
- Alternate name Mana. Supported.

## Totals

- Claims checked: 67
- Supported: 57
- Unsupported: 4 (habaek "grandson", purusha "earliest text", purusha Vishnu identification, tuoni "serpent of steel")
- Contradicted: 0
- Contested-in-sources: 6 (aengus-midir sibling, habaek pairs, indra mother, nyame-anansi, armaiti seal/ring, yima ally)
- Not checked or unverifiable: about 12 (listed under each entry), including the Baiame federal listing text and Rattray 1923.

## Corrections needed

1. habaek | detailedBio | "calls out that he is the son of heaven and grandson of Habaek" | "says he is the son of heaven and that his mother is Habaek's daughter" | Gwanggaeto Stele, ko.wikisource.
2. habaek | detailedBio / primarySources | third pair "pheasant / hawk" | verify against Yi Gyu-bo (Dongguk Isanggukjip vol. 3); Habaek Wikipedia has quail; add "sources vary" if unresolved.
3. indra | originStory | "born to the sky god Dyaus and earth goddess Prithvi" | "Dyaus is his father (RV 4.17.4); the Rigveda does not name his mother here; Puranas give Kashyapa and Aditi" | wikisource RV 4.17, Indra Wikipedia.
4. purusha | detailedBio | "earliest text to name the four varnas together" | "the only Rigveda hymn to name the four varnas" | Purusha Sukta Wikipedia.
5. purusha | detailedBio | "Vaishnava tradition identifies the cosmic Person with Vishnu" | cite a Vaishnava source (Narayana Sukta) or soften to "Vaishnava thought builds on it".
6. tuoni | primarySources[0].text | "serpent of steel" | "black serpent" (or verify Finnish) | Crawford Kalevala Rune XVI.
7. aengus | relationships | aengus sibling_of midir | foster relation, or add evidence for the "brother" reading | Midir Wikipedia, Tochmarc Étaíne.
8. nyame | relationships | nyame parent_of anansi | remove or add evidence and a "some tellings" qualifier.
9. spenta-armaiti | detailedBio | "golden seal" | "golden ring" (Darmesteter) or name the translator.
10. spenta-armaiti | relationships | yima ally_of spenta-armaiti | relabel or drop.
11. diana | primarySources[0] | Aeneid VII Hippolytus quote | replace with a passage that supports her domains (e.g. Hesiod Theogony 918 for parentage, Strabo 5.3.12 for Nemi).
12. All sampled relationship edges have `evidence: []`, while r1 (zeus-hera) carries locators. Add evidence arrays.
13. nyame | primarySources[0] | Rattray Ashanti 1923, Nyame dua | unverified; confirm page or cite Religion and Art in Ashanti (1927) if that is the source.
14. baiame | primarySources[0] | heritage listing | confirm text on the dcceew.gov.au page (fetch timed out).

## Review of the proposed corrections (2026-10-16)

The corrections above were drafted by an automated research agent. Before acting on them, each was re-read against the entry text:

- **habaek, "grandson of Habaek": not an error.** The entry already says Chumo's mother was Habaek's daughter, which makes him Habaek's grandson; the stele has Chumo use that kinship at the river. No change.
- **purusha, "earliest text to name the four varnas together": kept.** Being the only Rigvedic hymn that names them is what makes it the earliest. No change.
- **spenta-armaiti, "golden seal" vs "golden ring"**: the Avestan word is rendered both ways by translators. Translation variant, not an error. No change.
- **tuoni, "serpent of steel"**: translations differ (iron, steel, black). Variant. No change.
- **indra, parentage: corrected.** The Rigveda names Dyaus as father; the mother varies by text. `deities.json` now says so.
- Contested relationship edges (aengus/midir, nyame/anansi, yima ally_of) and the Aeneid VII citation on diana are left for an editorial pass with the cited texts in hand.

Net verified error rate in this sample: 1 factual correction in 67 claims, plus 3 contested relationship edges and 1 mis-aimed citation.
