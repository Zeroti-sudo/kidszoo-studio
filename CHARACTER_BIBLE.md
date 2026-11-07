# Kidszoo — Character Bible (canonical)

Source: frame-by-frame analysis of the two published Shorts (YgXSwT-h1C0 "Brothers vs Balloons", 27 Oct 2026; PE_fXnKVx-4 "We're SO hungry", 28 Oct 2026). Where the two videos disagree, the **canonical** choice is marked and must be used from now on. The rigs in `engine/engine.js` (`CAST`, `kidSVG`) implement this bible. Never change them in a way that alters the brothers' look.

## Series rules (never break)
- Format: 2D cutout / puppet vector animation, vertical 9:16, 1080×1920, ~20–25 s.
- Thick, uniform black outlines with rounded caps; flat colour fills; one soft ground shadow per character. No gradients on characters, no 3D, no realistic rendering.
- No spoken dialogue. Story is carried by bold on-screen captions, sound effects and an upbeat instrumental.
- The brothers' outfits, hair and colours never change (costume changes only as an *added* item, e.g. a party hat, removed by the end).
- Every episode: hook in 0–2 s, a problem/challenge, an escalation, and a warm or funny payoff with a celebration beat (confetti / hearts / jump).

## Big Bro
- Age look ~8–10. Height = 1.35 × Little Bro (engine: `sc` 1.1 vs 0.78).
- Head: broad rounded oval, soft chin. Eyes: large solid black ovals with one small white highlight; black brows that do most of the acting.
- Hair: jet black `#1A1A1A`, neat bowl cut, blunt fringe slightly swept to one side.
- Skin: warm medium tan `#B8734C` (same family skin tone for everyone).
- Shirt: royal blue `#2970E6` short-sleeve crewneck, **one gold `#F6C343` stripe above one white stripe**.
- Shorts: navy `#1B3A6B` with periwinkle `#5C8FE6` hem trim.
- Shoes: red `#D83838` sneakers, white soles, white ankle socks.
- Personality: confident leader, encouraging, athletic, protective; loses gracefully and shares.
- Signature acting: both-arms-up cheer, pointing encouragement at Little Bro, big open smile.

## Little Bro
- Age look ~5. Head reaches Big Bro's chest/shoulder. Chubbier, rounder face (engine `headScale` 1.16).
- Hair: jet black, spiky tuft on the crown, short choppy fringe.
- Skin: same `#B8734C`.
- Shirt: coral-orange `#F25C3B` crewneck, darker neckband, pale-yellow `#FCD34D` five-point star outlined in black.
- Shorts: teal `#2CA58D` with light-yellow `#F5E050` hem trim.
- Shoes: teal sneakers with a yellow band, white soles, white ankle socks.
- Personality: eager, goofy, determined, a little clumsy, adores his big brother.
- Signature acting: jaw-drop "O" mouth, bouncy jumps, wind-up before trying something, high-five.

## Mom (supporting, optional; puppet not built yet)
- Tall adult, same skin tone, high bun with white plumeria flower, red bindi, magenta sari/tunic with gold dots, gold border, gold earrings and bangles. Warm and calm; appears to resolve or reward, never to scold. If you build her rig, add it to `CAST`/a new SVG builder with the same outline style, and check it on a contact sheet before using it in an episode.

## Home set (default, implemented)
- Wall: vertical cream stripes `#FFF5DC` / `#F8ECC2`; centred window with pink curtains, blue sky; two wall frames (heart, circle).
- Floor: warm wood planks `#DE9E5B`. Oval mint rug `#7FCDBB` with teal border `#3A9692`.
- `set: "party"` adds a bunting garland.

## Typography
- Captions: heavy display font, white fill, thick black outline, slight drop shadow; `{word}` highlights in yellow `#FFD13B`.
- Comic impact words in starbursts: POP!, BOING!, NOM!, CRUNCH!, CHOMP!

## Recurring props / FX
Implemented: table, cupcake (whole/half), tray, idea bulb, "?", bubble wand, soap bubble, floor pillow, fort flag, party balloon, stripy sock, toothbrush, sand timer, play ball (magenta with yellow band), letter/number toy blocks, teal toy box, big cardboard box, terracotta flower pot with sprout / pink flower, blue watering can with water drops, drinking cup, broccoli, white plate, magenta gift box with yellow ribbon (separate lid), party hats (cone; purple for Big Bro, teal for Little Bro); fx burst, hearts, sparkle, confetti, speed lines.
Allowed to add (same style): balloons (magenta `#E63980`, sky `#1EA7FD`, yellow `#FFD13B`, orange `#FF7828`, royal `#2B60DE`), fruit basket and fruits, ball, toy blocks, pillows, kite, bubbles.

## Known glitches to avoid
- Arms clipping through torso line art when pointing.
- Props vanishing between shots instead of being finished/put down (shrink them as they're eaten, or set them down).
- New props appearing without an entrance (use a `back` ease pop-in with a sparkle).
- Camera zoom showing past the set edges (the engine clamps this; keep `z` ≥ 1.25 for normal framing).
