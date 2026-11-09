# Toast artwork provenance

Created with Codex's built-in image generation tool, using the user's supplied toast screenshots as visual references. The screenshots are not included in the runnable website.

All three PNGs are 1254 × 1254 with transparent backgrounds. They share the same front-facing slice, placement and silhouette so CSS can blend them. Level 2 is halfway between the light and medium sprites; level 4 is halfway between medium and dark. These are illustrative visual levels, not a scientifically calibrated toast color model.

## Light toast — `toast-light.png`

Reference: `IMG_5965 2.PNG` (user's level 1).

Prompt: Extract only the single very lightly toasted white sandwich bread slice from the reference screenshot. Preserve natural photographic texture, pale ivory crumb, light golden crust, square lower half and rounded double-lobed top. Remove screenshot UI and background. Center the upright front-facing slice on a square transparent canvas, keeping the whole crust. No surface, shadow, text, border or plate. This is the master sprite for darker edits; retain realistic pores and the bread silhouette.

## Medium toast — `toast-medium.png`

Edit target: light master. Color reference: `IMG_5966 2.PNG` (user's level 3).

Prompt: Change only the toasted color of the light master to medium golden browning like the reference: a gentle golden patch in the central upper crumb, warm golden crust and still-creamy edges. Keep exact silhouette, camera angle, pixel dimensions, size, placement, crumb pore pattern and transparent background unchanged for crossfading. No text, background, plate, shadow or labels. Do not make it dark.

## Dark toast — `toast-dark.png`

Edit target: light master. Color reference: `IMG_5967 2.PNG` (user's level 5).

Prompt: Change only browning/color to deep golden-brown crumb, a broad toasted amber center and deeper brown crust like the reference. Do not blacken or burn it. Keep exact silhouette, camera angle, pixel dimensions, scale, position and crumb pore pattern unchanged. Preserve transparency and outside edges for overlaid crossfades. No screenshot UI, text, background, surface, shadows, plate or labels.
