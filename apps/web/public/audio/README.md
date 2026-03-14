# Audio Assets for Mythos Atlas

This directory contains audio files for the immersive audio system.

## Required Audio Files

### Ambient Tracks (`/ambient/`)
Background music that loops based on current pantheon. All tracks should be:
- Format: MP3 (128-192kbps for web)
- Duration: 30-60 seconds (looping)
- Volume: Normalized to -14 LUFS

| File | Description | Mood |
|------|-------------|------|
| `base-drone.mp3` | Base ambient layer | Mysterious, ethereal |
| `greek-ambiance.mp3` | Greek mythology | Lyre, temple ambiance |
| `norse-ambiance.mp3` | Norse mythology | Wind, distant thunder |
| `egyptian-ambiance.mp3` | Egyptian mythology | Desert winds, ceremonial |
| `japanese-ambiance.mp3` | Japanese mythology | Bamboo flute, rain |
| `celtic-ambiance.mp3` | Celtic mythology | Harp, forest sounds |
| `hindu-ambiance.mp3` | Hindu mythology | Sitar, temple bells |
| `aztec-ambiance.mp3` | Aztec mythology | Drums, jungle |
| `chinese-ambiance.mp3` | Chinese mythology | Guzheng, flowing water |
| `roman-ambiance.mp3` | Roman mythology | Similar to Greek |
| `default.mp3` | Fallback track | Neutral mythic atmosphere |

### Deity Effects (`/effects/`)
Short one-shot sounds triggered on deity pages. All effects should be:
- Format: MP3
- Duration: 1-5 seconds
- Volume: Normalized

| File | Triggered By | Description |
|------|--------------|-------------|
| `thunder.mp3` | Zeus, Thor, Jupiter | Thunder rumble |
| `lightning.mp3` | Zeus, Thor | Lightning crack |
| `ocean-wave.mp3` | Poseidon, Neptune | Ocean waves |
| `fire-crackle.mp3` | Hephaestus, Vulcan | Forge fire |
| `wind-howl.mp3` | Aeolus, storm gods | Wind howling |
| `owl-hoot.mp3` | Athena, Minerva | Owl call |
| `war-drums.mp3` | Ares, Mars | Battle drums |
| `harp-gliss.mp3` | Apollo, muses | Harp glissando |
| `raven-call.mp3` | Odin, Morrigan | Raven caw |
| `desert-wind.mp3` | Ra, Egyptian gods | Hot desert wind |
| `temple-bell.mp3` | Generic | Temple bell ring |
| `divine-presence.mp3` | Major deities | Ethereal whoosh |

### UI Sounds (`/ui/`)
Micro-interaction sounds. All UI sounds should be:
- Format: MP3
- Duration: 0.1-0.5 seconds
- Volume: Quiet, subtle

| File | Triggered By | Description |
|------|--------------|-------------|
| `click.mp3` | Button clicks | Soft click |
| `hover.mp3` | Interactive hover | Subtle whoosh |
| `page-turn.mp3` | Page navigation | Paper rustle |
| `achievement.mp3` | Achievement unlock | Triumphant chime |
| `success.mp3` | Quiz correct | Positive tone |
| `error.mp3` | Quiz incorrect | Gentle negative |
| `open.mp3` | Modal/menu open | Soft open |
| `close.mp3` | Modal/menu close | Soft close |

## Free Audio Sources

- [Freesound.org](https://freesound.org) - CC0 and CC-BY sounds
- [Pixabay Music](https://pixabay.com/music/) - Royalty-free music
- [Incompetech](https://incompetech.com) - Kevin MacLeod's music (CC-BY)
- [Soundsnap](https://www.soundsnap.com) - Professional SFX (subscription)

## Audio Implementation Notes

1. **Lazy Loading**: Audio is only loaded when user enables sound
2. **Crossfading**: Ambient tracks crossfade over 1 second
3. **Reduced Motion**: Respect `prefers-reduced-motion` for audio autoplay
4. **Muted by Default**: Audio starts muted until user opts in
5. **Volume Control**: Global volume affects all audio layers

## Included Audio Files

All audio files sourced from [OpenGameArt.org](https://opengameart.org) under CC0 license (public domain).

### Sources

**UI Sounds** - From "RPG Sound Pack" by Kenney (CC0)
- interface sounds for click, hover, success, error, open, close
- inventory sounds for achievement, page-turn

**Deity Effects** - Various CC0 artists:
- `thunder.mp3`, `lightning.mp3` - Rain/thunder ambient by p0ss (CC0)
- `ocean-wave.mp3` - Beach waves by jasinski (CC0)
- `fire-crackle.mp3` - Fire by p0ss (CC0)
- `wind-howl.mp3` - Wind whoosh by SketchMan3 (CC0)
- `war-drums.mp3` - Horde war drums by William Hector (CC0)
- `harp-gliss.mp3` - "A New Town" by The Cynic Project (CC0)
- `raven-call.mp3` - Crow caw by zeroisnotnull (CC0)
- `owl-hoot.mp3` - Placeholder (using raven call)
- `temple-bell.mp3` - Gong by rubberduck (CC0)
- `divine-presence.mp3` - Magic spell by JaggedStone (CC0)
- `desert-wind.mp3` - Wind variant

**Ambient Tracks** - Various CC0 artists:
- `base-drone.mp3` - "Monoliths" ambient track (CC0)
- `greek-ambiance.mp3` - "A New Town" harp theme by The Cynic Project (CC0)
- `norse-ambiance.mp3` - Rain loop by p0ss (CC0)
- `egyptian-ambiance.mp3` - Desert/caravan theme by yd (CC0)
- `japanese-ambiance.mp3` - Rain ambient by p0ss (CC0)
- `celtic-ambiance.mp3` - Forest ambience by TinyWorlds (CC0)
- `hindu-ambiance.mp3` - Ambient drone placeholder
- `aztec-ambiance.mp3` - Jungle music (CC0)
- `chinese-ambiance.mp3` - Ambient drone placeholder
- `roman-ambiance.mp3` - Greek theme variant
- `default.mp3` - Dungeon ambience by JaggedStone (CC0)

### Notes

- Hindu and Chinese ambient tracks use base-drone as placeholder - replace with culturally authentic music when available
- Owl-hoot uses raven-call as placeholder - replace with actual owl sound when found
- All tracks trimmed to 25-45 seconds for web-optimized looping
