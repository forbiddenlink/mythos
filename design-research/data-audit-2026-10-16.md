# Mythos Atlas catalog data audit

Snapshot: 2026-10-16, branch `feature/illustrated-atlas-polish` (working tree dirty, data files unmodified per git status at session start). Read-only. Data: `apps/web/src/data/*.json`. Scripts: `/private/tmp/claude-501/-Volumes-LizsDisk-mythos/ec1f1f00-12a9-4ad2-8d5a-8d60adbd4169/scratchpad/` (`dom.py`, `vocab.py`, `final.py`, `scan2.py`, `scan3.py`). All counts below come from those scripts, not estimates. Evidence rung: 4 (ran code against the real data). The domain mapping is regex rules plus 60-odd hand overrides, and I read all 622 rows; it is a proposal, not reviewed by a domain expert.

Entity totals: 360 deities, 103 creatures, 76 artifacts, 184 locations, 162 stories, 27 pantheons, 362 relationships, 37 heroes (heroes used only for reference checks).

## 1. Deity `domain`

Schema: `domain: z.array(z.string())` at `apps/web/src/lib/schemas.ts:120`, no enum or length limit. Type is in `apps/web/src/types/Entity.ts`.

### Counts

| Metric                             | Value                                                  |
| ---------------------------------- | ------------------------------------------------------ |
| Deities                            | 360                                                    |
| Domain tokens (deity x value)      | 1373                                                   |
| Distinct raw values                | 622 (matches the QA walkthrough)                       |
| Domains per deity                  | min 1, max 7; 1:8, 2:32, 3:106, 4:107, 5:89, 6:16, 7:2 |
| Deities with an empty domain array | 0                                                      |

Frequency distribution of the 622 values, by number of deities using the value:

| Used by     | Distinct values | Share                              |
| ----------- | --------------- | ---------------------------------- |
| 1 deity     | 453             | 72.8% of values, 33% of all tokens |
| 2 deities   | 59              |                                    |
| 3-5 deities | 62              |                                    |
| 6+ deities  | 48              |                                    |

Top values: fertility 38, war 31, creation 26, death 25, kingship 23, agriculture 21, wisdom 19, fire 17, healing 16, protection 16, rain 16, storms 15, thunder 14, motherhood 14.

262 of 360 deities carry at least one value that no other deity has.

### Current UI mitigation and what it leaves broken

`app/deities/DeitiesPageClient.tsx:129-135` already hides options used by fewer than 2 deities (within the chosen tradition). Measured effect with no tradition selected: 169 options remain (values with n>=2), and 43 deities have no domain at all that appears in the dropdown, so they can never be reached by the domain filter. The 169 options still contain the near-duplicates below ("sun" and "the sun" are separate entries). `domain` is also rendered raw on deity pages (`app/deities/[slug]/page.tsx:335`), passed as article tags (`:165`), and fed to `godsOfLinksForDomains` (`:220`), so a canonical field needs those callers checked.

### Values over 30 characters: 37 (36 deities)

Longest, with deity id:

- `winter (by later association with his brother Baldr's death)` (60) : hodr
- `sky, earth, and the underworld (per the chroniclers' gloss)` (59) : triglav
- `uncertain; possibly plants or a protective/messenger role` (57) : simargl
- `the waters: rivers, creeks, and billabongs (Kulin)` (50) : pallian
- `the rivers, lakes, and wetlands of Noongar Country` (50) : wagyl
- `the sole grant of immortality among mortals` (43) : utnapishtim
- `the dying-and-returning agricultural cycle` (42) : dumuzi
- `the warriors of the Kuniya and Liru story` (41) : liru
- `misfortune (per a single hostile source)` (40) : chernobog
- `passage between the living and the dead` (39) : shapash
- `creation of the land and people (Kulin)` (39) : bunjil
- `kingship-granting (scholarly reading)` (37) : medb
- `uncertain; possibly the sun or moon` (35) : khors

Other prose markers: 25 values contain parentheses (scholarly hedges such as "(later tradition)", "(in some tellings)", "(disputed)"); 7 contain `;` or `,`; 133 start with "the ".

### Near-duplicates

Exact after case folding (2 groups): `the Golden Age` / `the golden age`; `the Sky World` / `the sky world`.

Plural or number pairs (8): art/arts, craft/crafts, forest/forests, sea/seas, water/waters, fresh water/fresh waters, messenger/messengers, heaven/heavens.

Article-only variants: `sun` 10 + `the sun` 9; `earth` 8 + `the earth` 8; `moon` 10 + `the moon` 3; `sea` 10 + `the sea` 3; `sky` 10 + `the sky` 3; `underworld` 9 + `the underworld` 5; `harvest` 5 + `the harvest` 2; `hunt` 2 + `the hunt` 2 (+ `hunting` 5); `forests` 2 + `the forest` 2 + `forest` 1; `rivers` 7 + `the waters` 2 + `waters` 1 + `water` 6.

Synonym clusters that the UI treats as different filters:

- Sky: sky, the sky, the sky world, the Sky World, heaven, heavens, the heavens, the upper air, air, the air.
- Death: death, the dead, the afterlife, afterlife, the bones of the dead, mortality, souls, ghosts; and underworld, the underworld, otherworld, the underworld (Tuonela), the underworld Adlivun.
- Freshwater: fresh water, fresh waters, freshwater, waters, the waters, lakes, rivers, rivers and springs.
- Smithing: smithcraft 3, smithing 2, metalworking 2, metalwork 1, craft 2, crafts 5, craftsmanship, craftsmen.
- Kingship: kingship 23, sovereignty 5, kingship among the gods, kingship over the gods, kingship among the Titans, kingship in heaven, the first kingship in heaven, rakshasa kingship, ideal kingship, queenship, imperial authority.
- Hunting: hunt, the hunt, hunting, game and hunting, wild game, fishing and hunting, the success or failure of hunting.

### Proposed controlled vocabulary: 69 canonical domains

Proposed data shape (keeps all nuance; nothing discarded):

```
domain: CanonicalDomain[]            // enum of the 69 slugs below, drives filter, chips, tags
domainNotes?: string[]               // the original raw strings, verbatim, shown as a caption on the deity page
```

`domainNotes` keeps every raw value whose text differs from its canonical label (for example `winter (by later association with his brother Baldr's death)` maps to `time-and-seasons` and stays as a note). Values with no canonical home (12, listed below) are note-only.

Canonical term list with the number of deities that would carry each (a deity counts once per canonical):

fertility 52, creation 47, kingship-and-sovereignty 47, war-and-warriors 45, agriculture 43, death 36, protection 35, craft-and-smithing 32, rivers-and-freshwater 32, sky 31, law-and-justice 30, animals 29, earth 29, wisdom 28, time-and-seasons 28, sea 26, hunting-and-fishing 26, motherhood-and-women 25, storms-and-weather 25, sun 23, cosmic-order 21, underworld 21, magic 20, rain 20, trade-and-wealth 19, light-and-dawn 19, thunder-and-lightning 18, healing-and-medicine 18, love-and-desire 18, purification-and-ritual 18, strength-and-endurance 18, family-and-home 17, birth-and-childbirth 17, fire 17, knowledge-and-learning 17, moon 15, nature-and-wilderness 15, arts-and-performance 15, fate-and-fortune 15, truth-and-oaths 15, culture-hero-and-founding 14, poetry-and-writing 13, courage-and-heroism 13, rebirth-and-renewal 13, music-and-dance 12, trickery-and-mischief 12, transformation 12, night-and-darkness 12, prophecy-and-divination 11, beauty 11, mountains-and-volcanoes 11, marriage-and-chastity 9, destruction 9, travel-and-crossroads 8, chaos 8, wind 8, children-and-youth 7, stars 7, sexuality 6, joy-and-festivity 6, afterlife 6, victory 6, immortality 6, hospitality-and-peace 5, disease-and-plague 5, sacrifice 5, madness 4, life-and-vitality 4, monsters-and-dragons 4.

Smallest canonical has 4 deities, so no option is a one-off. Canonical domains per deity: 1:15, 2:48, 3:110, 4:114, 5:53, 6:16, 7:2 (average about 3.5).

### Outcome of the mapping

- **Deities with zero canonical domains: 2.** `khors` (only domain: `uncertain; possibly the sun or moon`) and `simargl` (only domain: `uncertain; possibly plants or a protective/messenger role`). Both values say the scholarship is unsure, so the honest choice is note-only, not forcing sun/moon or plants. If you prefer coverage over caution, map khors to `sun` + `moon` and simargl to `agriculture` + `protection`, which takes the zero-domain count to 0.
- Deities left with exactly 1 canonical: 15.
- Raw values mapped: 610 of 622 (691 value-to-canonical links, because compound values such as `love and sexuality` map to two).
- 12 raw values are note-only (no canonical term): `autonomy`, `loneliness`, `service`, `trial and recognition`, `the useful and the good`, `the abosom`, `the Former Gods`, `the north`, `the west`, `the North (Pohjola)`, and the two `uncertain; ...` values. Each is used by exactly one deity. Ten of those deities keep other canonical domains; only khors and simargl are left with none.
- Judgment calls to review: `homosexuality` maps to love-and-desire + sexuality; `civilization`, `Tenochtitlan`, the four "founding of ..." values map to culture-hero-and-founding; `earthquakes` maps to `earth`; `beginnings` (3) maps to `creation`; `power` and `supreme deity` map to kingship-and-sovereignty; `the Great Flood` maps to rivers-and-freshwater + destruction.

### Mapping table (canonical : raw values with deity count when above 1)

Every raw value appears under each canonical it maps to. Value in parentheses is the number of deities using that raw value.

**fertility** (52 deities, 13 raw): fertility (38); abundance (4); sustenance (2); nourishment; fertility of flocks; agricultural abundance; fertility of the soil; the fertility of the land; fertility of herds; drought and sterility; the fertility of women; fertility and birth; fertility of the land

**creation** (47 deities, 25 raw): creation (26); beginnings (3); universe (2); creativity (2); primordial creation (2); separation of heaven and earth; primordial being; foundation; the origin of the frost giants; the material of creation; creation through thought and speech; the origin of the gods; the created world; trickery and creation; the cosmos; creation of humans; the making of the land at Tikiġaq; creation of the land and people (Kulin); the making of the first women; creation (south-eastern Australia); the shaping of the land; the origin of the two spirits; the forging of the sky; the separation of heaven and earth; the first age of the world

**kingship-and-sovereignty** (47 deities, 27 raw): kingship (23); sovereignty (5); pharaonic power; state; power; ideal kingship; imperial authority; bureaucracy; authority; political power; supreme power; supreme deity; kingship among the Titans; rakshasa kingship; kingship-granting (scholarly reading); leadership of the divine army; the protection of the Hittite state; kingship in heaven; the first kingship in heaven; kingship among the gods; kingship over the gods; the divine assembly; a failed claim to kingship; leadership in the lower worlds; the queen (coya); sovereignty over the world; heaven's rule on earth

**war-and-warriors** (45 deities, 17 raw): war (31); warfare (4); strategy (2); violence (2); bloodshed; military prowess; military; samurai; weapons; warriors; fighting; the antagonist role in the Ramayana; boxing; leadership of the divine army; the warriors of the Kuniya and Liru story; war and courage; protection in battle

**agriculture** (43 deities, 24 raw): agriculture (21); harvest (5); maize (3); grain (2); flowers (2); the harvest (2); rice; cotton; maguey; pulque; peaches; cultivated plants; herbs; farmers; vegetation; cacao; the dying-and-returning agricultural cycle; growth; agricultural abundance; the food plants; ripening; corn, beans, and squash; the growth of crops; irrigation and terraces

**death** (36 deities, 16 raw): death (25); the dead (3); mummification; cemeteries; embalming; mourning; mortality; decay; death and rebirth; victory over death; the bones of the dead; passage between the living and the dead; souls; death (in some tellings); the dead and their passage; ghosts

**protection** (35 deities, 22 raw): protection (16); vigilance; loyalty; divine favor; protection of children; personal god; protection of the household; warding off evil; rescue at sea; rescue; protection from underwater monsters; watching over the people; the protection of the Hittite state; loyalty to Baal; intercession with El; watching over people's conduct; protection of kin; protection of the Diné; help and protection; protection in battle; protection of the soul; the protection of cattle in the woods

**earth** (32 deities, 18 raw): earth (8); the earth (8); earthquakes (4); separation of heaven and earth; the earth (later identification); the space between sky and earth; earthquakes (as his 'laughter'); sky, earth, and the underworld (per the chroniclers' gloss); fertility of the soil; the post that holds up the earth; the fertility of the land; the making of the land at Tikiġaq; creation of the land and people (Kulin); the shaping of the land; the earth and its tremors; the hot lowland (yunca) world; fertility of the land; the separation of heaven and earth

**craft-and-smithing** (32 deities, 34 raw): crafts (5); smithcraft (3); weaving (3); metalworking (2); craft (2); smithing (2); women's work (2); sculpture; mining; industry; skill; brewing; obsidian; turquoise; engineering; goldsmiths; tapa cloth; iron; labor; technology; honest labor; nation-building; craftsmen; architects; sculptors; spinning; woodworking; canoes; craftsmanship; metalwork; building; white shell; spinning and weaving; the Sampo

**rivers-and-freshwater** (32 deities, 26 raw): rivers (7); water (6); fresh water (2); the waters (2); Nile; freshwater; primordial waters; lakes; swamps; primordial mud; the Great Flood; fresh waters; rivers and springs; the river Ganges; the Tano River; the Bia River; chaotic waters; irrigation (disputed); the waters: rivers, creeks, and billabongs (Kulin); water, rain, and waterholes; the rivers, lakes, and wetlands of Noongar Country; lakes and waters; irrigation water; irrigation and terraces; the sea and waters; waters

**sky** (31 deities, 19 raw): sky (10); heaven (4); the sky (3); air (2); the heavens (2); separation of heaven and earth; heavens; the air (Ogdoad origin); the space between sky and earth; sky, earth, and the underworld (per the chroniclers' gloss); the sky world; the Sky World; the celestial tree; the upper air; kingship in heaven; the first kingship in heaven; air and weather; the air; the separation of heaven and earth

**law-and-justice** (30 deities, 15 raw): justice (9); judgment (6); law (5); judgment of souls (2); sacred law; vengeance; virtue; duty; righteousness; punishment; honest labor; the observance of taboos; the enforcement of taboos; life and law; retribution

**animals** (29 deities, 22 raw): horses (4); cattle (3); fish (3); salmon (2); cats; crocodiles; foxes; animals; jaguars; birds; bats; shepherds; fertility of flocks; horsemanship; fertility of herds; wild animals; the caribou and other land animals; the wedge-tailed eagle; the woma python; venomous snakes; the protection of cattle in the woods; fish and fishing

**wisdom** (28 deities, 12 raw): wisdom (19); compassion (2); intellect; mercy; elder wisdom; forethought; consciousness; intuition; wise counsel; wisdom and awareness; serenity; wisdom and magic

**time-and-seasons** (28 deities, 16 raw): time (10); spring (4); the calendar (2); winter (2); summer; the Golden Age; time (later folk association); winter (by later association with his brother Baldr's death); the months; renewal of days; the warm season; the everlasting spring; an earlier age; the golden age; the first age of the world; the present age of the world

**sea** (26 deities, 20 raw): sea (10); ocean (3); the sea (3); sailors (2); seafaring; salt sea; marine life; waves; ocean creatures; ocean depths; rescue at sea; seas; protection from underwater monsters; the tides; the sea and its animals; the tides and hunting; whaling; the coast; the primeval sea; the sea and waters

**hunting-and-fishing** (26 deities, 14 raw): archery (5); hunting (5); fishing (4); hunt (2); the hunt (2); fishermen; wild game; fishing and hunting; the success or failure of hunting; the tides and hunting; whaling; the Brewarrina fish traps; game and hunting; fish and fishing

**motherhood-and-women** (25 deities, 12 raw): motherhood (14); women (2); female immortals; fatherhood; motherhood of the Titans and Giants; primordial motherhood; motherhood of the gods; queenship; the making of the first women; women's strength and sisterhood; the relationship of women and men; fatherhood of the Hero Twins

**storms-and-weather** (25 deities, 11 raw): storms (15); weather (3); fog (2); snow; ice; cold; dew; air and weather; hail; rain and storm; the weather

**sun** (23 deities, 7 raw): sun (10); the sun (9); sunshine; the Fifth Sun; the burning sun; sunlight; the daily solar cycle

**cosmic-order** (21 deities, 15 raw): order (6); dharma (3); cosmic order (2); duality (2); class structure; harmony; balance; the Eight Trigrams; the social order; the older order of gods; the order of the world; the ordering of the world; the ordering of peoples; the ordering of animals; due measure

**underworld** (21 deities, 8 raw): underworld (9); the underworld (5); otherworld (2); sky, earth, and the underworld (per the chroniclers' gloss); the underworld Adlivun; leadership in the lower worlds; the lower worlds and the emergence; the underworld (Tuonela)

**magic** (20 deities, 9 raw): magic (11); sorcery (3); divine energy; druidry; magic (later tradition); magic and incantation; shape-changing magic; wisdom and magic; magic song

**rain** (20 deities, 5 raw): rain (16); dryness; drought and sterility; water, rain, and waterholes; rain and storm

**trade-and-wealth** (19 deities, 7 raw): wealth (10); prosperity (7); commerce (4); trade (2); merchants (2); trade routes; giving

**light-and-dawn** (19 deities, 11 raw): light (6); dawn (3); daylight (3); clarity; morning light; the morning light; light and warmth; the east; the dawn and the east; the light of dawn; brightness

**thunder-and-lightning** (18 deities, 2 raw): thunder (14); lightning (12)

**healing-and-medicine** (18 deities, 4 raw): healing (16); medicine (5); health; physicians

**love-and-desire** (18 deities, 10 raw): love (12); desire (2); tenderness; lust; pleasure; homosexuality; love and sexuality; love (in later Phoenician cult); pursuit and desire; love and seduction

**purification-and-ritual** (18 deities, 9 raw): devotion (4); purification (4); purity (3); meditation (2); sacred law; priesthood; ritual purification; ritual purity; prayer

**strength-and-endurance** (18 deities, 10 raw): strength (8); endurance (3); obstacles (2); manliness; masculinity; steadfastness; hidden power; hard and difficult things; women's strength and sisterhood; power used for good and ill

**family-and-home** (17 deities, 17 raw): family (6); hearth (3); home (2); kitchen (2); domesticity; domestic arts; filial defiance; brotherhood; domestic harmony; ancestors; ancestry; protection of the household; ancestry of the Eagle clans; the Eagle moiety; protection of kin; the origin of the clans; the household

**birth-and-childbirth** (17 deities, 5 raw): childbirth (9); twins (3); birth (3); the fertility of women; fertility and birth

**fire** (17 deities, 2 raw): fire (17); forges

**knowledge-and-learning** (17 deities, 11 raw): knowledge (7); learning (4); secrets; mystery; stories; scholarship (per tradition); the Eight Trigrams; sight; seeing and searching; knowledge and guidance; guidance and teaching

**nature-and-wilderness** (15 deities, 11 raw): wilderness (4); desert (2); forests (2); the forest (2); wild foods; ohia trees; forest; wild game; the western forests; the celestial tree; wild animals

**moon** (15 deities, 4 raw): moon (10); the moon (3); the moon (later tradition); the moon (in some tellings)

**arts-and-performance** (15 deities, 11 raw): arts (6); festivity (2); theater (2); ballgame (2); revelry; performance; art; games; skaldic art; skiing; the Kinaaldá

**fate-and-fortune** (15 deities, 6 raw): fate (6); destiny (5); fortune (2); foreknowledge; luck; misfortune (per a single hostile source)

**truth-and-oaths** (15 deities, 8 raw): oaths (5); truth (5); confession; truth and oaths; truth (asha); the lie (druj); contracts and oaths; obedience to the divine word

**culture-hero-and-founding** (14 deities, 13 raw): humanity (3); the founding of Cusco (2); Tenochtitlan; culture hero; trickster; nation-building; culture-founding; the ordering of peoples; civilization; the founding of Joseon; the Korean people; the founding of Goguryeo; the founding of Silla

**poetry-and-writing** (13 deities, 6 raw): poetry (6); eloquence (4); writing (2); language; communication; song and poetry

**courage-and-heroism** (13 deities, 10 raw): heroism (5); courage (2); military prowess; culture hero; monster-slaying; the destruction of the monsters; war and courage; the Hero Twins' partnership; fatherhood of the Hero Twins; adventure

**rebirth-and-renewal** (13 deities, 10 raw): rebirth (3); renewal (2); resurrection; preservation; death and rebirth; regeneration; the dying-and-returning agricultural cycle; renewal of days; the renewal of life and the seasons; preservation of life

**music-and-dance** (12 deities, 6 raw): music (6); dance (4); hula; music and dance; song and poetry; the kantele

**trickery-and-mischief** (12 deities, 8 raw): trickery (6); thieves (2); mischief; divine play; rebellion; trickster; hubris; trickery and creation

**transformation** (12 deities, 7 raw): transformation (7); transitions; change; liberation; awakening; shape-changing magic; disorder and change

**night-and-darkness** (12 deities, 3 raw): night (8); darkness (3); night terrors

**prophecy-and-divination** (11 deities, 6 raw): divination (4); prophecy (3); dreams; the helping spirits of angakkuit; oracles; the patron of shamans

**beauty** (11 deities, 1 raw): beauty (11)

**mountains-and-volcanoes** (11 deities, 8 raw): volcanoes (4); Mauna Kea; caves; mountains; mountains and foothills; the south side of Uluṟu; the snow mountain; the mountains (as mountain god)

**marriage-and-chastity** (9 deities, 3 raw): marriage (6); virginity (2); chastity

**destruction** (9 deities, 5 raw): destruction (5); filth; disaster; the Great Flood; the destruction of the monsters

**travel-and-crossroads** (8 deities, 10 raw): boundaries (3); messengers (2); travelers (2); crossroads (2); foreigners; gates; doorways; endings; messenger; navigation

**chaos** (8 deities, 4 raw): chaos (5); primordial chaos; chaotic waters; disorder and change

**wind** (8 deities, 2 raw): wind (7); the gentle wind

**children-and-youth** (7 deities, 5 raw): youth (4); innocence; children; childhood; protection of children

**stars** (7 deities, 8 raw): evening star; stars; the stars; the morning star; the Seven Sisters songline; the Pleiades; the scattering of the stars; the star Sirius

**sexuality** (6 deities, 5 raw): sexuality (2); lust; homosexuality; love and sexuality; love and seduction

**joy-and-festivity** (6 deities, 6 raw): wine (2); festivity (2); joy (2); ecstasy; intoxication; revelry

**afterlife** (6 deities, 7 raw): judgment of souls (2); afterlife; resurrection; the afterlife; liberation of the dead; passage between the living and the dead; the dead and their passage

**victory** (6 deities, 2 raw): victory (5); victory over death

**immortality** (6 deities, 4 raw): immortality (4); female immortals; the apples that keep the gods young; the sole grant of immortality among mortals

**hospitality-and-peace** (5 deities, 3 raw): peace (3); friendship; hospitality

**disease-and-plague** (5 deities, 4 raw): disease (2); plague (2); sickness; smallpox

**sacrifice** (5 deities, 1 raw): sacrifice (5)

**madness** (4 deities, 3 raw): madness (2); pride; night terrors

**life-and-vitality** (4 deities, 2 raw): life (3); nature

**monsters-and-dragons** (4 deities, 4 raw): monsters; dragons; protection from underwater monsters; the destruction of the monsters

Note-only (stay in `domainNotes`): autonomy; loneliness; service; trial and recognition; the useful and the good; the abosom; the Former Gods; the north; the west; the North (Pohjola); uncertain; possibly the sun or moon; uncertain; possibly plants or a protective/messenger role.

## 2. Other facets

### Deity `symbols` (free-text array, `schemas.ts:121`)

- 1126 tokens, 850 distinct. Used by 1 deity: 696; 2: 95; 3-5: 52; 6+: 7.
- Top: fire 10, sword 9, lotus 9, spear 7, sun 7, wings 6, crescent moon 6.
- Over 30 chars: 53 (e.g. `winged dog or bird-dog hybrid, by analogy with the Iranian Simurgh`, `the solar disc she swallows and births each day`, `mistletoe (as the instrument of Baldr's death)`). 49 values carry a parenthetical gloss (`fire serpent (Xiuhcoatl)` and `xiuhcoatl (fire serpent)` are the same symbol written two ways).
- Article-only duplicates (25 pairs found), e.g. `thunderbolt`/`the thunderbolt`, `a sword`/`sword`, `eagle`/`the eagle`, `sun`/`the sun`, `a staff`/`staff`, `a club`/`club`, `sun disk`/`the sun disk`.
- Plural pairs (19): spear/spears, serpent/serpents, horse/horses, bow and arrow/bow and arrows, flame/flames, river/rivers, mountain/mountains, and others.
- Symbols per deity: 1:25, 2:80, 3:107, 4:115, 5:32, 0:1 (`rhea`).
- Not a facet in the UI I inspected; only reader-visible as chips. Whether any page filters on symbols: not checked.

### Creatures: there is no type or category field

Creature fields are `habitat`, `abilities`, `dangerLevel`, `imageUrl`, `detailedBio`, `primarySources`. A reader cannot filter creatures by kind (dragon, serpent, hybrid, giant).

- `habitat`: 101 distinct values over 103 creatures, free text; only "The sea" repeats (3). 47 are over 30 chars.
- `abilities`: 284 distinct, 265 used once. Case duplicates (5 pairs): `Shapeshifting`/`shapeshifting`, `Fire Breath`/`fire breath`, `Flight`/`flight`, `Invisibility`/`invisibility`, `Great Strength`/`Great strength`.
- `dangerLevel`: integers 1-10; 1:6, 2:7, 3:5, 4:5, 5:6, 6:12, 7:20, 8:20, 9:13, 10:9. Fine.

### Artifact `type` (string, `schemas.ts:234`): 18 distinct for 76 artifacts

weapon 28, tool 10, relic 10, armor 5, vessel 4, jewelry 3, idol 3, other 2, instrument 2, then 9 singletons: vehicle, ritual vessel, weapon and fishhook, sacred baskets, voyaging canoe, staff, banner, regalia, elixir. Inconsistencies: `vessel` vs `ritual vessel`; `vehicle` vs `voyaging canoe`; `weapon and fishhook` is two types in one string; `staff`, `banner`, `regalia` are sub-kinds beside broad kinds. Core set would be about 9 values.
`ownerKind`: deity 53, hero 4, absent 19.

### Location `locationType` (string, `schemas.ts:270`): 28 distinct for 184 locations

sacred_site 36, realm 33, city 24, mountain 21, temple 11, underworld 10, island 10, region 5, lake 4, body_of_water 3, tomb 3, strait 3, palace 3, monument 2, mythical_realm 2, coast 2, then 12 singletons (cave, harbor, desert, horizon, gate, hall, grove, marsh, garden, waterfall, river, battlefield). Inconsistencies: `realm` (33) vs `mythical_realm` (2) vs `underworld` (10); `body_of_water` vs `lake`/`river`/`strait`/`coast`/`waterfall`; `sacred_site` vs `temple`/`monument`/`tomb`/`grove`. Snake_case keys, so the UI must humanize them; unverified whether it does for all 28.
`geography`: physical 108, mythic 48, identified 28 (clean, 3 values).

### Story `category` (string, `schemas.ts:181`): 19 distinct for 162 stories

creation 27, myth 24, tragedy 15, origin 14, legend 12, epic 11, hero 10, romance 9, war 8, trickster 5, death 4, quest 4, rivalry 4, cosmology 3, afterlife 3, transformation 3, adventure 3, apocalypse 2, heroic 1.
The set mixes genre (myth, legend, epic, tragedy, romance), theme (creation, death, war, rivalry, transformation) and role (hero, trickster, quest). Overlaps: creation/origin/cosmology; hero/heroic/adventure/quest; death/afterlife; `myth` (24) is a generic bucket.

### Story `moralThemes` (optional array, `schemas.ts:182`)

- 569 tokens, 502 distinct. Used by 1 story: 466; 2: 24; 3-5: 8; 6+: 4. Effectively free text, not a facet.
- Top: sacrifice 8, transformation 8, fate 7, cosmic order 6, justice 4, honor 4.
- 81 values over 30 chars and are sentences: `sacrifice keeps the world alive`, `celestial law versus human emotion`, `death can be defeated through sacrifice`.
- Absent on 4 stories: `anansi-bought-stories`, `oduduwa-creation-earth`, `first-twins-ibeji`, `house-of-bats`. Per story: 0:4, 2:12, 3:67, 4:51, 5:28.
- A second, separate `themes` array exists on 10 stories (40 tokens, 36 distinct, e.g. wisdom, perseverance, cleverness). Two theme fields with different shapes; which one the UI reads: not checked.

## 3. Missing or empty fields

Checked every entity for absent or empty `description`/`summary`, `detailedBio`/`fullNarrative`, `imageUrl` (and whether the file exists under `apps/web/public`), the source fields, and `pantheonId`.

| Check                                           | Result                                                                                                                                                                                         |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pantheonId` pointing to a nonexistent pantheon | 0 of 360 deities, 103 creatures, 76 artifacts, 184 locations, 162 stories                                                                                                                      |
| Duplicate ids within a type                     | 0 in every type; no duplicate slugs; slug equals id for deities, creatures, artifacts, stories                                                                                                 |
| Empty description/summary, or under 60 chars    | 0 in every type                                                                                                                                                                                |
| `imageUrl` missing                              | 1: deity `rhea` (also the only deity with an empty `symbols` array)                                                                                                                            |
| `imageUrl` file not on disk                     | 0 across all types; no shared image between two entities                                                                                                                                       |
| Primary source field empty                      | 0 (deities, creatures, artifacts, locations: `primarySources`; stories, pantheons: `citationSources`)                                                                                          |
| Thin biography under 400 chars                  | deities 7 (heimdall 380, fenrir 392, sif 362, ra 397, horus 356, set 370, maat 352); locations 4 (muspelheim 380, mauna-kea 376, igbo-orun 391, ceryneia 389); creatures, artifacts, stories 0 |
| Deity names duplicated                          | `Apollo` x2: `apollo` (greek-pantheon) and `apollo-roman` (roman-pantheon); legitimate but identical titles in lists                                                                           |
| Location `slug`                                 | present on 36 of 184; optional in schema (`schemas.ts:269`), so by design, but 148 locations have no slug field                                                                                |
| Location coordinates                            | 48 null lat/lng = exactly the 48 `mythic` locations; 0 physical or identified without coordinates; 0 mythic with coordinates. Clean.                                                           |
| Pantheon with no deities                        | `african-pantheon` (`isCollection: true`): 0 deities, 6 creatures. Probably intentional; the other 26 have 5 to 34 deities                                                                     |

Citation depth (a reader sees one source where scholarship has more):

- Deities: `primarySources` is non-empty for all 360, but 256 have exactly one entry. Extra fields are sparse: `sources` on 38, `furtherReading` on 80 (plus `bunjil` where it is an empty array), `primarySourceExcerpts` on 16.
- Stories: `citationSources` has 1 entry on 58, 2 on 87, 3+ on 17. `furtherReading` present on 32 (11 of those are empty arrays: `susanoo-banishment`, `okuninushi-trials`, `atrahasis-flood`, `etana-and-the-eagle`, `maui-and-hina-death`, `hina-maui-lengthened-day`, and 5 more); `sources` on 5.
- Creatures 93 of 103, locations 171 of 184, artifacts 58 of 76 have a single source.

Type drift: `apps/web/src/types/Entity.ts:76` types deity `gender` as `"male" | "female" | "other"`, but the data holds male 224, female 122, none 10, androgynous 4 (and the schema is `z.string()`). The UI handles `none` as "unspecified" (`DeitiesPageClient.tsx:157`). The 10 `none` deities: olodumare, ori, simargl, turtle, raven, dew-eagle, sila, tornarsuk, rainbow-serpent, wagyl.

## 4. Referential integrity

| Reference                                            | Checked                        | Missing |
| ---------------------------------------------------- | ------------------------------ | ------- |
| `relationships.fromDeityId`                          | 362                            | 0       |
| `relationships.toDeityId`                            | 362                            | 0       |
| Self-relationships, exact duplicate (from, to, type) | 362                            | 0, 0    |
| `stories.featuredDeities`                            | all entries                    | 0       |
| `stories.featuredLocations`                          | all entries                    | 0       |
| `stories.relatedStories`                             | all entries                    | 0       |
| `stories.featuredHeroes`                             | all entries (vs `heroes.json`) | 0       |
| `artifacts.ownerId` (deity or hero per `ownerKind`)  | 57                             | 0       |
| `artifacts.relatedStories`                           | all entries                    | 0       |
| `deities.heroParallels[].heroId`                     | all entries                    | 0       |
| `heroes.relatedDeityIds`                             | all entries                    | 0       |
| `deities.crossPantheonParallels[].deityId`           | all entries                    | **2**   |

The 2 dead links, both on Greek deities:

- `hades` points to `pluto` (no deity with that id exists).
- `persephone` points to `proserpina` (no such id).
  Roman counterpart ids need to be found (neither `pluto` nor `proserpina` appears in any deity id).

Coverage gaps (not broken references):

- Relationships: 329 of 362 have no `evidence`; 87 have no `description`. Types: parent_of 145, ally_of 67, sibling_of 51, spouse_of 46, enemy_of 35, aspect_of 13, lover_of 5. Confidence: high 251, medium 97, low 14. 10 are `isDisputed`.
- 35 of 360 deities appear in no relationship at all.
- 37 of 162 stories have no `featuredDeities`.
- 19 of 76 artifacts have no `ownerId` (all 19 have an `ownerLabel` string instead).
- Not checked: `pantheon-rosters.json`, `collections.json`, `journeys.json`, `myth-versions.json`, `cosmologies.json` references; `sources.json` ids behind `sourceId`/`sourceUrl`; the `Entity.ts`-vs-Zod consistency beyond `gender`.

## Ranked fixes by reader impact

1. **Canonicalize deity `domain` (69 terms plus `domainNotes`).** It is the only filter on `/deities`, 453 of 622 values are one-offs, 43 deities are unreachable through the dropdown today, and synonyms ("sun" vs "the sun", "heaven" vs "sky") split the same deities across entries. Only 2 deities end up with no canonical domain. Callers to update: `DeitiesPageClient.tsx:108-160`, `[slug]/page.tsx:138,157,165,220,335,408`, `opengraph-image.tsx:46`.
2. **Collapse the small-set facets: story `category` (19), location `locationType` (28), artifact `type` (18).** Each mixes genre, theme and kind, with 1-use values, so a filter built on them shows near-empty groups. Target about 8 to 10 values each (merge `heroic` into `hero`, `mythical_realm` into `realm`, `ritual vessel` into `vessel`, the 12 singleton location types into 5 or 6 parents) and keep the specific value as a subtype note.
3. **Fix the two broken parallels and the visible holes.** `hades`->`pluto`, `persephone`->`proserpina` are dead links on two of the most-visited Greek deities; `rhea` has no image and no symbols; `african-pantheon` shows 0 deities (confirm that is intended for a collection page). Small, fast, visible.
4. **Normalize `symbols` and `moralThemes`.** Strip leading articles and fold plurals in `symbols` (850 distinct, 696 one-offs, 25 article pairs, 19 plural pairs); turn `moralThemes` from 502 sentence-like strings into a short tag list (about 40) with the sentence kept as the displayed gloss, and decide between `moralThemes` and `themes`. Add a creature kind field (dragon, serpent, hybrid, giant, spirit) since creatures have no type to browse by.
5. **Source depth where a reader notices thin evidence.** 329 of 362 relationships cite nothing, 256 of 360 deities have a single primary source, 11 stories ship an empty `furtherReading`, 35 deities sit outside the relationship graph. Highest value first: add `evidence` to the `confidenceLevel: "low"` and `isDisputed` relationships (14 and 10), then the 7 deities and 4 locations with bios under 400 characters.
