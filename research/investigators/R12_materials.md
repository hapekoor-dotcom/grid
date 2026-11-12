# R12 — Materials / Looks

FACT: Project material overrides + Look material + cloned PlayCanvas material + shader material are four layers.
FACT: Shared Look modifiers/shaders apply to each object; Make Unique clones modifier IDs and remaps field links (patched), but runtime ownership remains by modifier ID.
FACT: no-UV meshes use generated/object-space mapping fallbacks; triplanar not a universal automatic.
FACT: opacity chunk now conditional; opaque source guard added; source-transparent remains transparent.
FACT: material signature ignores modifier/shaders; shader assignment can rebuild.
PROPOSAL: explicit material stack/provenance; one ownership key; triplanar/auto mapping contract; field-driven PBR tests.
