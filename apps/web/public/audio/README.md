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
