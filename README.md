Project: Silent Wing
Short description
Silent Wing is a short third-person stealth-puzzle horror prototype (10–15 min runtime) built in Unreal Engine (Blueprints). The player sneaks through an abandoned asylum wing to recover patient records and uncover their identity while avoiding a sound-driven Warden. Focus: polished lighting, AI perception (sight + hearing), environmental puzzles (valves, pressure plates), and tight level design.

Key features

Third-person stealth gameplay (crouch, sprint, hide, throw distractions)
Sound- and sight-based AI (Warden) with patrol, alert, and chase states
Three connected areas: Cellblock Entry, Records Room, Treatment Hall
Puzzle types: valve/generator, pressure-plate weight puzzles, cable/pulley interactions
Collectible records & simple journal UI for story beats
Blueprint-first implementation; modular Blender assets + Megascans/materials
Repo structure

/Game/ → Unreal project content (referenced; add large assets via Git LFS)
/Assets/ → modular/ props/ (blend files and export helpers)
/Docs/ → design-doc.md, level-flow.png, asset-list.csv
README.md → this file

Move: WASD / Left Stick
Look: Mouse / Right Stick
Crouch: C
Sprint: Left Shift
Interact: E
Throw: Left Mouse Button (when holding throwable)
Pause/Menu: Esc
Development notes & workflow

Prototype in /Content/Greybox first before replacing with final assets.
Use Blueprint interfaces and modular Actor Blueprints for puzzles (valves, pressure plates) to simplify reuse.
AI Perception: use Sight + Hearing sense; dispatch NoiseEvents for throwables and running.
Checkpoints: autosave at area transitions to reduce lengthy retests.
Import/export Blender → UE: export FBX with applied transforms, set correct axis, and create lightmap UVs.
Assets & credits

Core assets in /BlenderAssets created by developer.
Textures/materials: Quixel Megascans (free for Unreal).
Animations/characters: Mixamo / Marketplace packs (list specifics in Docs/asset-list.csv).
Audio: freesound.org / purchased SFX packs (see Docs/asset-list.csv).
How to contribute / issues

Create issues for features/bugs and assign to GitHub Project columns.
Branch workflow: feature/ → PR to main; small, frequent commits recommended.
Labeling: use labels {feature, bug, art, audio, design, blocked, high-priority}.
License

Code & Blueprints: MIT (or specify preferred license)
Art & third-party assets: follow vendor licenses (see Docs/asset-list.csv for details)
Contact / author

Developer: Alexia Gurunlian
Repo: https://github.com/Alexxia01/SilentWing 
Notes: See Docs/design-doc.md for full design details and level flow diagram.