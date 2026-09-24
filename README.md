# biotetris-react

A neon Tetris built in React with custom hooks — collision detection, matrix rotation with wall kicks, and gravity on an interval. Roughly 430 lines of JavaScript.

Built in 2023 while learning React hooks. Kept here because the game logic is real work rather than UI assembly, and because the rotation handling is the part most implementations get wrong.

---

## What it is

A playable Tetris. Arrow keys move and rotate, down soft-drops, the board clears completed rows and speeds up as you level.

```
src/
├── components/         Tetris, Stage, Cell, Display, StartButton
│   └── styles/         one styled-component per component
├── hooks/
│   ├── usePlayer.js    active piece: position, rotation, wall kicks
│   ├── useStage.js     board state, piece merging, row clearing
│   ├── useGameStatus.js  score, rows, level
│   └── useInterval.js  gravity, with a mutable ref for the callback
├── gameHelpers.js      board construction and collision detection
└── tetrominos.js       the seven pieces and their colours
```

---

## What I built

**Collision detection** (`gameHelpers.js`). Every proposed move is tested cell by cell against three conditions: is the move still inside the board vertically, still inside horizontally, and is the target cell actually clear. It runs before the move is committed rather than after, so an illegal move never reaches state.

**Rotation with wall kicks** (`usePlayer.js`). Rotation is a matrix transpose followed by a row reversal:

```js
const mtrx = matrix.map((_, index) => matrix.map(column => column[index]));
if (dir > 0) return mtrx.map(row => row.reverse());
return mtrx.reverse();
```

The harder half is what happens when that rotation would overlap a wall or a settled piece. Rather than refusing the rotation, the piece is nudged sideways and re-tested, alternating direction and widening the offset each time — right one, left two, right three. If the offset exceeds the piece width the rotation is abandoned and the original position restored.

That is what makes rotating against a wall feel correct instead of dead, and it is the part that separates a Tetris that plays well from one that merely runs.

**Gravity on an interval** (`useInterval.js`). `setInterval` inside a component captures the callback from the render it was created in, so the piece keeps falling according to stale state. The hook stores the callback in a ref and updates it on every render, so the interval always calls the current one. This is the classic React timing trap and the reason a custom hook exists rather than a bare `useEffect`.

**Immutable board updates** (`useStage.js`). The stage is rebuilt from scratch each tick rather than mutated, so React reliably re-renders and completed-row clearing is a filter rather than a splice.

---

## Running it

```bash
npm install
npm start
```

---

## What I would do differently now

Three years of writing production code later, these are the things I would change:

**Type it.** Every board cell is `[number, string]` and every piece is a matrix of `0 | string`. That is exactly the shape TypeScript catches mistakes in, and I was tracking it in my head instead.

**Test the pure functions.** `checkCollision`, `rotate` and the row-clearing logic take inputs and return outputs with no React involved. They are trivially testable and I wrote no tests at all. In [netwatch](https://github.com/Autokratz/netwatch) I put 118 tests around logic of exactly this kind, because it is the part that breaks silently.

**`JSON.parse(JSON.stringify(player))` is not a clone strategy.** It works here because the player object is small and plain, but it is slow and it silently destroys anything that is not JSON. `structuredClone` exists now; a shallow copy with a mapped matrix would be better still.

**Separate the game from React.** The rules — collision, rotation, scoring — do not need React at all. As a plain module with the hooks calling into it, the logic would be testable on its own and the components would only render. That separation is the single biggest structural improvement available here.

**Add a wall-kick table.** The offset loop is a reasonable approximation, but real Tetris implementations use the SRS kick tables, which define exactly where each piece moves for each rotation. That is the difference between "feels mostly right" and "behaves the way players expect".

---

MIT · built by [Hector Cabra](https://autokratz.github.io)
