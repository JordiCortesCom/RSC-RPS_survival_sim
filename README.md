# Rock-Paper-Scissors Simulator

An interactive, visually appealing HTML canvas simulation where Rock, Paper, and Scissors entities battle for survival in an enclosed arena.

## Features

- **Mass Simulation**: Capable of smoothly rendering hundreds of moving entities on the screen using HTML5 Canvas.
- **Dynamic Physics**: Entities move at a controlled speed and bounce off the boundaries of the main arena with built-in slight repelling forces to prevent overwhelming clustering.
- **Real-time Statistics**: Live population tracking of all three types (🪨, 📄, ✂️). Watch as the ecosystem balances itself or cascades into single-species dominance!
- **Interactive Controls**: Users can spawn more entities of a specific type or inject a mixed batch to reignite the conflict. There are also live sliders to control both the simulation's movement speed and the visual size of the emojis.
- **Premium Design**: Built with modern CSS techniques like glassmorphism and a responsive dark-mode gradient layout.

## How it Works

The interaction follows the classic Rock-Paper-Scissors rules, implemented directly in the code logic. When two entities collide, they resolve their encounter immediately:

1. **Rock (🪨)** crushes Scissors.
2. **Scissors (✂️)** cuts Paper.
3. **Paper (📄)** covers Rock.

### The Survival Mechanics

The simulation acts as a chaotic zero-sum ecosystem. When an entity of a winning type collides with a losing type (e.g., a Rock collides with Scissors), **the loser instantly transforms into the winner's type**. This creates a continuous infection-like spread across the arena.

Because movement is currently randomized, the statistical outcome is highly variable:
- **Equilibrium**: If populations are roughly equal and well-distributed, they naturally keep each other in check (Rocks eat Scissors, but are quickly eaten by Paper).
- **Cascades**: Because entities multiply their numbers upon winning, slight numerical or positional advantages can lead to rapid extinction events. If Paper manages to eliminate all Rocks, then the remaining Scissors will quickly sweep the board uncontested, as their only predator has vanished.
- **Convergence**: Most default scenarios will eventually end with a single state dominating the entire canvas, as it statistically becomes harder for the minority survivor to bounce back.

## Getting Started

1. Open `index.html` in any modern web browser.
2. Use the control panel to add entities and observe the interaction.
3. Adjust the slider settings to speed up or visually resize the chaos.
