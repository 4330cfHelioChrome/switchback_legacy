# Game Rules

## Overview
A fast-paced, competitive shedding card game for **4–5 players**. Players take turns playing cards in ascending or descending order based on the central pile. The first player to empty their hand wins the game.

---

## Components & Setup
* **Deck:** 104 numbered cards (1 to 104). *(Optional: 1 to 100 for web implementation)*
* **Players:** 4 to 5 players.

### Dealing & Initial State
1. **Shuffle** the entire deck thoroughly.
2. **Deal** cards evenly to each player based on the formula: `80 / Number of Players`
   * **4 Players:** 20 cards each (80 cards dealt, 24 remaining in the draw pile).
   * **5 Players:** 16 cards each (80 cards dealt, 24 remaining in the draw pile).
3. **Starting Card:** Flip 1 card from the remaining draw pile face-up to form the **Center Pile**.
4. **Initial Direction:** Determine the starting direction based on the Center Pile's value (using **52** as the midpoint):
   * **52 or lower:** **Ascending** (players must play a *higher* number).
   * **53 or higher:** **Descending** (players must play a *lower* number).
5. **Turn Order:** Randomly determine the starting player and the turn direction (Clockwise or Counter-Clockwise).

---

## Gameplay

On your turn, check the current **Center Pile** number and the active **Direction** (Ascending or Descending).

### 1. Playing a Card
* If you have a playable card in your hand, you may play **1 card** onto the Center Pile:
  * **Ascending:** Play a card with a number **strictly higher** than the Center Pile.
  * **Descending:** Play a card with a number **strictly lower** than the Center Pile.
* Play then passes to the next player in turn order.

### 2. Unable to Play (or Choosing Not to Play)
If you cannot play a valid card (or choose not to), you must select one of the following two actions:

* **Draw 1 Card:**
  * Take **1 card** from the draw pile and add it to your hand.
  * Your turn ends immediately.
* **Change:**
  * Flip the active direction (**Ascending $\leftrightarrow$ Descending**).
  * Your turn is **skipped** (ends immediately without playing a card).
  * *Example:* If the Center Pile is **98** (Ascending) and a player declares **Change**, the direction becomes **Descending**, their turn ends, and the next player must play a number **lower than 98**.

---

## Winning the Game
* The game continues until one player successfully plays or discards their **last remaining card**.
* That player is immediately declared the **winner**.
