---
name: thumbnail-design
description: >
  Decide what a thumbnail should SHOW and SAY before anyone builds it:
  choose a click-earning archetype (Duck out of Water, Puzzle to be Solved,
  Level Up, War of 2 Worlds, Cautionary Tale, Cliffhanger and 7 more),
  write the overlay copy, and spec the composition as a concrete brief.
  Use this skill whenever the user is making or judging any image whose job
  is to win a click in a scroll: a YouTube thumbnail, video cover, devlog
  or tutorial thumbnail, OpenGraph or social card, course cover, carousel
  hook slide, podcast episode art, or blog hero — even when they only say
  "make a thumbnail for my Godot video", "what should the cover for this
  look like", or "I need art for this episode". Also use it for critique:
  "is this thumbnail any good", "why isn't this getting clicks", "this
  looks boring, what's wrong with it", "which of these two is stronger".
  In this repo it runs BEFORE react-gimp-design: this skill decides the
  concept, that one builds the frame.
---

# Designing a thumbnail that earns the click

A thumbnail has one job, and it is not to describe the video. It is to
**open a question in the viewer's head that they can only close by
clicking.** Everything below is machinery for opening that question
deliberately instead of hoping one shows up.

The source for this skill is `types-of-thumbnail.pdf` at the repo root —
Internet Stamp's breakdown of the 13 thumbnail formats behind most of
YouTube. The 13 formats live in
[references/archetypes.md](references/archetypes.md) with their mechanism,
their failure mode, and real examples. Read that file when you're choosing
or diagnosing an archetype — which is nearly always. This file is the
method; that file is the vocabulary.

## The gap is the whole game

Before any archetype, any layout, any color: **write the question.**

Not the topic. The question the viewer is left holding. "A video about fan
placement" is a topic. *"Wait — is further away actually better?"* is a
gap. The viewer cannot resolve it from the image, so they click.

Two tests come straight out of the source and will catch most bad
thumbnails:

**The withholding test.** Does the thumbnail state the answer? "How to peel
a watermelon" tells you what happens; there's nothing left to find out.
"How to SKIN a watermelon" promises something you can't picture. A
cautionary tale that says *which* lumber to avoid has nothing left to sell.
Name the problem, show the stakes, withhold the resolution — the video is
where the resolution lives.

**The 87-words test.** A working thumbnail is understood in a glance but
takes paragraphs to explain. The source describes a cyclist crashed into a
police car parked in a bike lane, and needs 87 words to spell out the four
questions your brain fires in a quarter second. If you can describe your
thumbnail's whole payload in one short sentence and nothing else follows
from it, the gap is too small.

## Method

### 1. Find the gap

Ask what the viewer already believes, and what this video contradicts,
threatens, promises, or refuses to explain. Write one sentence in the
viewer's voice, as a question. If you can't, you don't have a thumbnail yet
— you have a topic, and you should keep digging before composing anything.

For a critique request, run this backwards: look at the image and write the
question it actually plants. Often the honest answer is "none," and that is
the finding.

### 2. Pick the premise, then the treatment

The 13 formats are not 13 peers, and seeing the split makes selection much
faster. **Ten are premises** — a claim the picture makes. **Three are
treatments** — how much you put on screen. They compose: a Cautionary Tale
rendered as Text is "STOP USING THIS" over a house wrap; a Cautionary Tale
rendered as Maximalism is sharks, surf and three stacked words about lucid
dreaming. Pick one premise; pick one treatment.

Route to a **premise** by what you actually have:

| What you have | Premise |
|---|---|
| A subject somewhere they visibly don't belong | Duck out of Water |
| A fact or ratio that doesn't add up | Puzzle to be Solved |
| Two mismatched things worth comparing | Apples to Oranges |
| A before and an after, far enough apart | Level Up |
| Two sides in conflict (incl. self vs. nature) | War of 2 Worlds |
| A rebuttal to someone, some idea, or a whole field | Talkback |
| An extreme, absurd, or implausible feat | I Did Something Crazy |
| A mistake the viewer is probably making | Cautionary Tale |
| An object or outcome the viewer will covet | I Want That |
| A frozen moment whose outcome is unknown | Cliffhanger |

Route to a **treatment** by how much the story needs:

- **Text** — when the idea can't be photographed. Entropy, rejection
  emails, sensory deprivation. *When you can't show it, tell it.*
- **Minimalism** — one thing, confidently. Only when that one thing is
  genuinely arresting; you are betting everything on it.
- **Maximalism** — many elements that cohere into one complicated story,
  readable in any order. Hardest to land; the failure mode is mess.

Default to a plain photographic treatment when neither extreme is called
for. Minimalism and Maximalism are both high-variance bets, and the source
is blunt that either can just fail.

### 3. Compose

**The both-boring test** is the most useful craft move in the source, and
it runs in both directions. A man pointing a fan at a window: boring. The
words "Further away is better?": boring. Together they pose a question 8
million people needed answered. Meanwhile "CAMERA ANGLES 101" as text alone
is boring, and a photo grid of famous shots alone is boring — together
they promise a complete guide. Check both halves separately. If either half
is already doing all the work, the other half is decoration you can cut.

**Pick the sharper word.** Peel → skin. Wasted → 7.5 YEARS WASTED. Stopped
using → STOP USING THIS. Word choice is not polish, it is the mechanism;
the more transgressive or concrete verb widens the gap for free.

**Keep it legible at scroll size.** A thumbnail is judged at roughly
210×118 in a sidebar, not at 1280×720. Six words is a lot; three is
comfortable. One clear focal subject. Resolution matters less than you
think — the source's Casey Neistat example is soft and did 30M views — but
contrast between text and whatever sits behind it is non-negotiable, so
plan for a scrim, a solid slab, or a heavy outline rather than hoping the
photo cooperates.

### 4. Sanity-check before handing off

- Does the thumbnail *state the answer*? Cut it back.
- Is there one focal subject, or is the eye lost?
- Read the text alone: boring on its own? Good. Boring *with* the image
  too? Start over.
- Is the premise still fresh? "I did something crazy" has a shelf life —
  garlic bread to space was crazy once. If everyone in the niche has done
  it, this is now the boring option.
- Would *you* click it, sitting between ten other thumbnails?

### 5. Hand off the brief

Output this shape. It is deliberately close to what
[react-gimp-design](../react-gimp-design/SKILL.md) needs to declare a
frame's schema and defaults, so the build step is mechanical:

```
## Thumbnail brief — <slug>

**Gap**        The question the viewer is left holding, in their voice.
**Archetype**  <Premise> rendered as <treatment>.
**Focal**      What owns the eye, and roughly where it sits.
**Text**       The exact overlay words. Count them.
**Contrast**   How the text stays readable — scrim, slab, outline, colour.
**Withheld**   What the video answers that the thumbnail refuses to.
```

Then say plainly that `react-gimp-design` builds it, and offer to continue.
Don't write JSX or a zod schema here — the fields above map onto that
skill's schema-first workflow, and doing it twice in two voices is how the
two drift apart.

## Working in this repo

`react-gimp` renders fixed-size artboards and exports them. The split:
**this skill decides what goes on the artboard; `react-gimp-design` builds
the artboard.** If the user asks for a thumbnail and you jump straight to
code, you will produce a competent-looking image with no gap in it, which
is the exact failure this skill exists to prevent.

Existing thumbnail projects worth looking at before speccing a new one —
`src/projects/thumbnail/Thumbnail.tsx` (photo + gradient scrim + title, the
generic case) and `src/projects/godot-android-thumbnail/`. Reuse the
composition if the brief fits it; a new brief does not always need a new
project.

When several thumbnails share a format and vary only in content, that is a
one-schema, many-frames project, not many projects — say so in the brief so
the build step gets it right the first time.

## Critique mode

Given an existing thumbnail, work in this order and say each part out loud:

1. **What question does it plant?** If none, that is the whole finding;
   everything after it is cosmetic.
2. **Which archetype is it reaching for, and does it land?** Naming the
   attempt is what makes the fix concrete — "this is a Cautionary Tale that
   gives away the answer" tells you what to change, "it's boring" doesn't.
3. **Run the both-boring test on the halves.** Usually one half is carrying
   nothing.
4. **Legibility at scroll size.** Word count, focal clarity, contrast.
5. **Propose the smallest change that opens the gap.** Often it is one
   word, or one line of text added to an image that was already fine.

Be straight about it. A thumbnail that doesn't work is cheap to fix now and
expensive to fix after it ships with the video.
