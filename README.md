# Retro Pong Game

A modern implementation of the classic Pong game with an AI opponent powered by Claude 3.7. This browser-based game features retro aesthetics with modern gameplay enhancements, accessibility features, and intelligent AI.

![Retro Pong Game](screenshot.png)

## Features

- **Classic Gameplay**: Authentic Pong experience with modern refinements
- **Player vs AI**: Compete against an adaptive AI opponent with three difficulty levels
- **Multiple Game Modes**: 
  - **Classic Mode**: First to 10 points wins
  - **Survival Mode**: See how long you can last against increasingly difficult AI
- **Intelligent AI Commentary**: Reactive commentary during gameplay
- **Post-Game Coaching Tips**: Get personalized advice to improve your skills
- **Customizable Settings**:
  - Sound effects toggle
  - Multiple visual themes (Retro, Neon, Minimal, Matrix)
  - Ball speed adjustment
  - Control schemes (Arrow keys, W/S keys, or both)
- **Accessibility Features**:
  - High contrast mode
  - Large text option
  - Screen reader friendly elements
  - Keyboard navigation
  - Touch controls for mobile devices
- **Leaderboard System**: Save and view high scores for each game mode
- **Easter Eggs**: Try the Konami Code during gameplay (↑ ↑ ↓ ↓ ← → ← → B A)

## Getting Started

### Playing Online

The game is hosted at [GitHub Pages URL] and can be played directly in your browser without installation.

### Local Installation

1. Clone the repository:
```
git clone https://github.com/yourusername/retro-pong.git
cd retro-pong
```

2. Open `index.html` in your web browser to start playing, or use a local server:
```
# Using Python's built-in HTTP server
python -m http.server

# Or using Node.js and http-server
npx http-server
```

## How to Play

- Use **Arrow Keys** or **W/S Keys** to move your paddle (left side)
- The ball speeds up during longer rallies
- First player to reach 10 points wins in Classic mode
- Try different themes and settings for a fresh experience
- On mobile devices, use the touch controls at the bottom left

## Game Modes

### Classic Mode
- Traditional Pong rules
- First to 10 points wins
- Three difficulty levels affect AI response time and precision

### Survival Mode
- AI gradually increases in difficulty
- See how long you can last and how many points you can score
- Challenge your friends to beat your time record

## Accessibility

This game was designed with accessibility in mind:
- High contrast option for better visibility
- Large text mode for improved readability
- Keyboard and touch controls
- Screen reader compatible elements
- Audio cues for important game events

## Technologies Used

- HTML5
- CSS3 with CSS Variables for theming
- Vanilla JavaScript (no frameworks)
- Local Storage API for settings and leaderboard
- Canvas API for game rendering

## Contributing

Contributions are welcome! If you'd like to contribute:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Original Pong game created by Allan Alcorn and Atari, Inc.
- Sound effects from [source]
- Font: "Press Start 2P" from Google Fonts 