# TheSullivanCodeBlog — TODO

Two tracks.

**Phases 0-6** are the punch list from the post-Go-transition review, ordered so
that earlier phases make later ones smaller — in particular, do Phase 2 (layout)
before Phase 5 (dropping Tailwind), or you'll rewrite the same markup twice.

**Gallery Backlog** at the bottom is content work on the JavaScript Mini-Program
Gallery. It runs in parallel and doesn't wait on the phases above, though Phase 1
makes new pages route themselves.

---

## Phase 0 — Unbreak the build

Nothing in the CSS pipeline currently runs. `output.css` is a stale committed
artifact that happens to contain the classes the pages need, because the deleted
`.templ` files used the same class strings. It will silently fail to pick up the
first new utility class added to a `.handlebars` file.

^^^^^ this is ok. I don't plan on rebuilding the css, I just want the existing css 
to continue working till I am done using tailwind.

- [X] Delete `Makefile` — it runs `templ generate` and `go run server.go`, neither of which exists
- [-] Install Tailwind locally (`npm i -D tailwindcss @tailwindcss/cli`) — there is no `tailwindcss` in `node_modules/.bin` and none on PATH

^^^^ I decided not to do this. I don't need to rebuild the css document.

- [X] Add `scripts` to `package.json` (there are none today):
      - `dev`: `node --watch TheSullivanCodeBlog.js`
      - `css:watch`: `tailwindcss -i ./input.css -o ./public/styles/output.css --watch`
      - `build`: `tailwindcss -i ./input.css -o ./public/styles/output.css --minify`

- [X] Delete `tailwind.config.js` — 25KB verbatim dump of Tailwind's default theme with `presets: []`, exactly equivalent to no config. `tailwind.config.js.original` is the intended file. (Moot if going to v4, which needs no config.)
- [X] Fix the content glob if keeping v3 — currently `./templates/**/*.templ`, a directory deleted in 6677228, so it scans zero files and emits only preflight
- [X] Decide deliberately: commit `public/styles/output.css`, or gitignore it and build on deploy. Right now it's committed *and* stale — worst of both.
- [X] Commit or discard the modified `package-lock.json`

---

## Phase 1 — Server correctness

- [X] **Set `NODE_ENV=production` on the deployed server.** Express only enables `view cache` when `env === 'production'` (`node_modules/express/lib/application.js:138`), and `NODE_ENV` is set nowhere in this project. Templates are currently re-read and recompiled from disk on every render, in every environment. Bigger real win than any other item here.
^^^^ this will be done by the script I added to the package.json file

- [X] Replace the per-request `autoViews` middleware (`TheSullivanCodeBlog.js:51`) with a boot-time walk of `views/`:
      ```js
      const pages = new Set(
        fs.readdirSync(viewsDir, { recursive: true })
          .filter(f => f.endsWith('.handlebars'))
          .map(f => f.slice(0, -'.handlebars'.length))
          .filter(f => !f.startsWith('layouts/') && !f.startsWith('partials/'))
      );
      ```
      Zero per-request filesystem calls, no hand-rolled cache, correct 404s, and it
      fixes the partials leak below in the same six lines. 25 view files today.
      (Avoid the `res.render` callback + `next()` variant: it turns Handlebars
      syntax errors into 404s, hiding real template bugs.)
- [X] **Stop serving partials and layouts publicly.** Verified: `GET /partials/nav` → 200 with the nav wrapped in a bare `<html>`; `GET /layouts/main` → 200 with a doubly-nested doctype. Both indexable by search engines. Fixed by the filter above.
^^^ this should be fixed now that the new boot time page connector is completed

- [X] Delete the seven explicit routes (`/blog`, `/project`, `/tutorial`, `/note`, `/resume`, `/support`, and `/`) — each only renders a view whose name matches its path, which is what the auto-view lookup already does. Server drops from ~90 lines to ~50.

- [X] Change `505` to `500` in the error handler (`TheSullivanCodeBlog.js:76`) — 505 means "HTTP Version Not Supported"

- [X] Drop the `.toLowerCase()` on the request path, or redirect to canonical lowercase. Verified `/BLOG` and `/blog` both return 200 — duplicate content, and it breaks the day a view filename has a capital.

- [X] Build real `404.handlebars` and `500.handlebars` views — both are commented out and currently send plain text
- [X] Remove the unused `fs` require comment referencing `./lib/fortunes.js` (`TheSullivanCodeBlog.js:5`)

---

## Phase 2 — Fix the inside-out layout

`views/layouts/main.handlebars` emits only `<html>{{{body}}}</html>`. Every view
then re-declares `{{>header}}`, the `<body class="...">` string, `{{> nav}}`,
`<main>`, and `{{>footer}}`. That `<body>` class string is pasted in **17 times**,
and two files (`project.handlebars`, `note.handlebars`) have already drifted to
`sm:justify-center` while the other nine say `sm:justify-start`.

**Do this before Phase 5.** It is what makes the Tailwind removal small.

- [X] Move `<head>`, `<body>`, `nav`, `<main>`, and `footer` into `layouts/main.handlebars`
- [X] Reduce every view to just its content — drops ~6 lines from each of 11 files
- [X] Reconcile the `sm:justify-start` vs `sm:justify-center` drift while consolidating
- [X] Delete `views/partials/button-text-reveal.handlebars` — unused, and has `href="page"` hardcoded
- [X] Sweep the 22 instances of `class=""`

---

## Phase 3 — Bugs

- [ ] `public/javascript/fetch.js:87` — `removeComponent(component)` ignores its parameter and always splices the first component named `"Ball"`. Works only because balls are the sole thing ever removed.
- [ ] `public/javascript/sudoku.js:152` and `:163` — both index cells as `row*board.rows+col`; should be `board.cols`. Identical for a 9x9, so latent, but it bites on generalizing.
- [ ] `public/javascript/sudoku-board.js:69` — `/[1-9]/.test(...)` is unanchored, so `"a1"` passes. Only `maxlength="1"` saves it. Make it `/^[1-9]$/`.
- [ ] `views/note.handlebars` — three `hx-get` attributes point at `/note/open/useful-links`, `/note/open/python`, `/note/open/golang`. No such views exist, so HTMX fires on every click, 404s, and declines to swap. Either build the partial endpoints or strip the attributes. (This is why "htmx integration" is still unchecked in the README.)
- [ ] `public/javascript/fetch.js:910` — `gen_num = () => {...}` has no declaration keyword, creating an implicit global. Fine in a classic script, throws in a module.
- [ ] `public/javascript/fetch.js:63` — `gameLoop` drives itself with `setTimeout` against a manual 80fps budget. Use `requestAnimationFrame`: correct primitive, and it stops burning CPU on a hidden tab.
- [ ] `public/javascript/fetch.js:906` — no guard for a missing `#tutorial` canvas
- [ ] Rebind the collapsible handler after HTMX swaps — `views/partials/header.handlebars` binds once at load

---

## Phase 4 — Features worth adding, highest value first

- [ ] **RSS/Atom feed.** It's a blog with zero syndication. Highest value per line of code, and posts are already files under `views/blog/`, so the Phase 1 directory walk hands you the list.
- [ ] **Generate the blog index from the filesystem.** `views/blog.handlebars` hardcodes the single post in *two* places — "Recent Articles" and the 2026/January collapsible tree. Every new post is currently two manual edits plus a file. Reuse the Phase 1 walk.
- [ ] **Per-page `<title>` and meta description.** Every project page, every 8-bit-adder chapter, and the blog post are all titled "The Sullivan Code Blog". Costliest easy fix for a site whose purpose is being found.
- [ ] **Tests.** There are none. `SudokuBoard.isValid` / `isFull` / `checkBlock` are pure and DOM-free, so `node:test` is nearly free — and would have caught the `rows`/`cols` mixup above.
- [ ] **Speed up the solver.** "Solving... This can take a while." is a design consequence, not a property of backtracking. `sudoku-worker.js` `structuredClone`s the whole board at every node, then tries all nine digits blindly, calling `isValid()` (which rescans 27 groups) at each level. Mutate-and-undo instead of cloning, and only try digits legal for that cell. Orders of magnitude, not percent.
- [ ] `compression` middleware
- [ ] Static cache headers — `express.static(..., { maxAge: '1y' })` for `/media`
- [ ] `express-rate-limit` — still unchecked in the README from the Go days
- [ ] `morgan` request logging
- [ ] `helmet`, or set CSP manually

---

## Phase 5 — Replace Tailwind with hand-written CSS

Measured usage across all 25 views: **103 distinct classes**, 15 responsive
variants, 5 state variants, 3 arbitrary values, 12 colors. A rounding error of
Tailwind's surface area for the cost of a whole build pipeline.

The repeat counts show the real structure is components, not utilities:

| count | class string | wants to be |
|---|---|---|
| 66 | `text-slate-100` | `.prose p` |
| 19 | `flex-grow justify-start` | `.content` |
| 18 | `text-slate-100 pb-5` | `.prose p` |
| 17 | `transition-all text-slate-100 hover:font-semibold hover:text-blue-500` | `.link-item` |
| 17 | `min-h-svh h-full bg-slate-800 flex flex-col justify-start sm:justify-start sm:items-center` | `.page` |
| 15 | `text-2xl text-orange-500 block pb-5` | `.section-heading` |

**Two rules to avoid rebuilding a worse Tailwind:**

1. **Do not hand-roll a variant matrix.** The trap is recreating `sm:`/`md:`/`lg:` x every property; that's where DIY utility CSS becomes a slog and the output ends up larger than Tailwind's. There are only 15 responsive variants total — put them in media queries *inside* the component classes and the problem disappears.
2. **Keep the constrained scale.** Tailwind's real value isn't the names, it's that `padding: 13px` is untypeable. Preserve it with custom properties.

- [ ] Define tokens in `input.css` — spacing ramp, type scale, and the 12 colors as custom properties. `oklch()` is already in use (`sudoku.js:21`).
- [ ] Write the ~6 component classes from the table above, media queries inline
- [ ] Add a small set of genuine utilities only where a component doesn't fit
- [ ] Port views to the new classes, one at a time
- [ ] Drop the one arbitrary value (`sm:w-[640px]` in `partials/section.handlebars`) into a token
- [ ] Remove Tailwind from `package.json`, delete `input.css`'s `@tailwind` directives, delete the config, and simplify the `build` script to a plain copy or minify

---

## Phase 6 — Housekeeping

- [ ] Rewrite `.gitignore` — still the Go template (`*.exe`, `*.dll`, `go.work`, `*templ.go`) with `node_modules` appended
- [ ] Rewrite `README.md` — still describes "golang net/http for routing, templ for html templating" and tracks a Go-era roadmap
- [ ] Decide what `ideas/screen_recording.txt` is: a future blog post, or scratch to move out of the repo

---

# Gallery Backlog — JavaScript Mini-Programs

A **parallel track**, not a phase that waits on Phase 6. New views go at
`views/project/js-practice/<name>.handlebars` plus one `<li>` in the gallery
section of `views/project.handlebars`; after Phase 1 the route appears on its own.

Framing note: `fetch-box.handlebars` opens with *"The goal for this project was
to learn how to make interactive learning aids for the Homebrew Computer
series."* So this gallery is a workshop for teaching widgets, not a JS practice
dump. Items that feed the 8-bit-adder chapters are worth more than generic demos.

**Suggested order:** pathfinding (biggest payoff, reuses the grid code) → Game of
Life (quick win) → logic sandbox (unblocks the main series).

---

## Cross-cutting technique: generator functions

Write the algorithms as generators. `yield` after each comparison, swap, or node
visit and you get play/pause/step/scrub for free without restructuring anything:

```js
function* bubbleSort(a) {
  for (let i = 0; i < a.length; i++)
    for (let j = 0; j < a.length - i - 1; j++) {
      yield { compare: [j, j + 1] };
      if (a[j] > a[j + 1]) { [a[j], a[j + 1]] = [a[j + 1], a[j]]; yield { swap: [j, j + 1] }; }
    }
}
```

- [ ] Learn/apply the generator-driven stepping pattern — it upgrades sorting, pathfinding, and the MENACE demos below
- [ ] **Retrofit it onto the existing sudoku solver.** That page currently says "Solving... This can take a while" with no feedback. A generator-based solver can yield each placement and animate the backtracking, turning the slowest page into the most interesting one. (Pairs with the solver speedup in Phase 4.)

---

## Logic gate sandbox — the strategic pick

Drag gates onto a canvas, wire them, toggle inputs, watch signals propagate.
Build a half adder from XOR + AND, then chain them into the 8-bit adder.

Top recommendation: the eight `8-bit-adder` chapters are 11-line stubs today, and
this one widget serves all of them — it builds the thing that makes the rest of
the series writable.

- [ ] Gate primitives (AND, OR, NOT, XOR, NAND) with input/output pins
- [ ] Wiring UI + click-to-toggle inputs
- [ ] Signal propagation via topological ordering of the gate graph
- [ ] Half adder → full adder → 8-bit ripple-carry as saved presets
- [ ] Stretch: allow cycles, which is how you get latches — where the homebrew series goes next

---

## Graphs: grid pathfinding — BFS vs DFS vs Dijkstra vs A*

Best value per hour. Two reasons: `create_board()` in `sudoku.js` already builds
a DOM grid of cells, so a maze grid is the same function with different
dimensions and divs instead of inputs. And it answers stacks-vs-queues with a
*purpose* instead of in the abstract.

The punchline: BFS and DFS are the same twelve lines. The only difference is
whether the frontier is a queue or a stack. Swap the container, get a completely
different search shape on screen. Dijkstra makes it a priority queue.

- [ ] Grid of cells, mouse-paint walls
- [ ] One search function, pluggable frontier container
- [ ] Render frontier / visited / final path in three colors
- [ ] Dijkstra with weighted terrain, then A* with a Manhattan heuristic
- [ ] Side-by-side nodes-expanded counter, so the heuristic's value is visible
- [ ] Companion: **maze generation** by recursive backtracking — same technique as the sudoku solver, which makes a nice callback in the write-up
- [ ] Stretch: Kruskal's maze generation, to motivate union-find

---

## Sorting visualizer

Cliché because it works — but only the stepping controls make it educational
rather than decorative.

- [ ] Bars + generator-driven step/pause/scrub (see above)
- [ ] Make the *invariant* visible, not just the motion: insertion sort's sorted/unsorted boundary, quicksort's partition walls, merge sort's merge frontier
- [ ] Comparison and swap counters, so O(n²) vs O(n log n) is something you feel rather than something you're told
- [ ] Bubble, insertion, selection, merge, quick, heap
- [ ] Stretch: adversarial inputs — already-sorted, reversed, all-equal — to show why naive quicksort pivots hurt

---

## Stacks vs queues: expression evaluator

Skip the standalone "here's a stack" demo; it's inert. Infix → RPN via
shunting-yard (one stack), then evaluate the RPN (another stack), with both
stacks drawn and animating as `3 + 4 * 2` resolves.

Chosen over bracket-matching because it's a stepping stone toward the homebrew
series — parsing and evaluating an expression is a sketch of what a CPU does.

- [ ] Tokenizer
- [ ] Shunting-yard with visible operator stack and precedence rules
- [ ] RPN evaluation with visible value stack
- [ ] Stretch: unary minus and parentheses, the two things that break naive implementations

Second good framing of the same pair:

- [ ] **Undo/redo as two stacks** in a small drawing app — concrete, obviously useful, and it pairs naturally with the Command pattern

---

## Mini-games

- [ ] **Snake** — secretly a deque demo. Push a new head, shift the tail; growing is just *skipping* the shift. Fun game and reinforcement of the data structure at once.
- [ ] **Conway's Game of Life** — cheapest to build, mesmerizing, and it teaches double-buffering the hard way: compute the next generation from a snapshot, not in place. Everyone writes that bug once, and it transfers to real graphics work.
- [ ] **Minesweeper** — flood fill, which is BFS/DFS again, so it pays off the graph section
- [ ] **Tetris** — if you want a meatier one: matrix rotation and collision resolution
- [ ] ~~Pong / Breakout~~ — skip for now; ball physics is already done in `fetch.js`, so there's little new to learn

---

## Patterns: finish what Fetch Box started

Both of these are named in the Improvements section of `fetch-box.handlebars`, so
make them sequels rather than new projects.

- [ ] **State machine** — refactor the Person/Dog states into an explicit FSM, then draw the state graph beside the simulation with the active node highlighted in real time. Shows why the pattern earns its keep, which prose can't.
- [ ] **Component composition (ECS)** — same entities, composition-driven, with checkboxes to add and remove components live. Drop `Gravity` onto the dog mid-run; strip `Renderable` and watch it still move. Composition-over-inheritance stops being an argument and becomes a thing you can poke.
- [ ] Fixes `Game.removeComponent`'s hardcoded `"Ball"` bug (Phase 3) as a side effect
- [ ] **Command pattern** — pairs with the undo/redo drawing app above

---

## MENACE — Donald Michie's matchbox tic-tac-toe (1961)

You have a head start here: per your resume you already built the physical
version — 304 matchboxes, 1000+ beads, plus the graph-generation code that prunes
rotations and reflections and emits printable operator instructions. So the web
version is largely a port plus a visualization layer.

The interesting content isn't the RL, it's the **data structures**: tic-tac-toe
has 8 symmetries (the dihedral group D4 — 4 rotations × 2 reflections), and
collapsing the game graph by those symmetries is what gets you from thousands of
positions down to 304 boxes. That reduction is the whole reason the physical
machine fits on a table.

- [ ] Port the state-graph generation, with symmetry-class canonicalization
- [ ] Draw the matchboxes as a live grid — bead counts per cell, updating as it learns
- [ ] Reinforcement loop: +3 beads on a win, +1 on a draw, −1 on a loss (Michie's original schedule)
- [ ] Play-against-it mode, plus a train-against-random mode to fast-forward thousands of games
- [ ] Win/draw/loss rate chart over time — the "it's learning" moment
- [ ] Show a box emptying out and the move being abandoned — resignation is the most striking behavior
- [ ] Link the write-up to the physical build; photos of the real matchboxes would be the best asset on the site

---

## MENACE for Connect Four — and why it breaks

Worth building, but go in knowing the tabular approach does **not** scale, because
that limitation is the most interesting thing to write about.

Why it breaks: 7×6 Connect Four has roughly 4.5 trillion legal positions, versus
a few thousand for tic-tac-toe. Gravity also destroys most of the symmetry —
tic-tac-toe gives you 8 equivalent positions to collapse, Connect Four gives you
exactly one non-trivial symmetry (the left-right mirror), because you can't
rotate a board that pieces fall down. So the trick that made MENACE tractable
mostly stops working.

Recommended arc for the write-up: hold the matchbox metaphor as long as it
survives, then hit the wall deliberately and explain the wall.

- [ ] Connect Four board + win detection (4-in-a-row across 4 directions)
- [ ] **Reduced board first** (e.g. 5 wide × 4 tall) — the matchbox metaphor still holds, so the same MENACE visualization works
- [ ] Instrument the state count as the board grows: 4×4, 5×4, 6×5, 7×6 — plot it, and let the curve make the argument
- [ ] Mirror-symmetry canonicalization, and note it buys ~2× where tic-tac-toe's D4 bought ~8×
- [ ] Hit the wall on the full 7×6 board, then write the "why tabular RL doesn't scale" section — this is the actual lesson
- [ ] Then show what replaces it: feature-based evaluation (threats, center control, odd/even squares) instead of one box per position
- [ ] Stretch: minimax + alpha-beta with a transposition table, as the contrast to the learned approach
- [ ] Footnote for the write-up: Connect Four was solved in 1988 (Allis, and independently Allen) — the first player wins by opening in the center column







A catch neither of you mentioned: Express only enables view cache when env === 'production' (application.js:138), and NODE_ENV is not set anywhere in your project. So the view cache is currently off in every environment you run, including deployment. Every render re-reads and recompiles the template from disk. Your autoViews cache doesn't help with that — it caches the wrong layer. Setting NODE_ENV=production on your server is a bigger real win than anything in this debate.

What I'd actually do: skip both. Walk views/ once at boot:

const pages = new Set(
  fs.readdirSync(viewsDir, { recursive: true })
    .filter(f => f.endsWith('.handlebars'))
    .map(f => f.slice(0, -'.handlebars'.length))
    .filter(f => !f.startsWith('layouts/') && !f.startsWith('partials/'))
);
