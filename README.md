# VERSUS - Pixel Quiz Game Engine

A colorful pixel-art quiz game engine for building browser-based fact-matching games. Players match facts to characters/picks and try to reach the maximum number of consecutive successful guesses!

## Features

- 🎮 **Browser-based game engine** - No installation required, runs in any modern browser
- 🎨 **Pixel-art aesthetic** - Colorful retro-style UI with pixel fonts and vibrant gradients
- 🎯 **Fact-matching gameplay** - Match interesting facts to characters/items
- 🔄 **Flexible data loading** - Support for both GitHub-hosted JSON files and SQLite databases
- 🖼️ **Image support** - Optional pixel art images for picks and facts
- ✏️ **Built-in database editor** - Easy-to-use browser-based tool for creating and editing game data
- 🏆 **Streak-based scoring** - Players aim for the maximum consecutive correct guesses
- 📱 **Responsive design** - Works on desktop and mobile devices

## Quick Start

### 1. Run the Game

```bash
npm install
npm start
```

This will start a local web server and open the game in your browser at `http://localhost:8080`.

### 2. Run the Database Editor

```bash
npm run editor
```

This will open the database editor at `http://localhost:8080/editor.html`.

## How to Play

1. The game presents a fact with a category hint (e.g., "AWARDS", "FOOD")
2. You're asked: "Who [FACT]?" (e.g., "Who WON THE NOBEL PRIZE?")
3. Choose from multiple character options
4. If you guess correctly, your streak continues
5. If you guess wrong or run out of time, the game ends
6. Try to achieve the maximum consecutive correct guesses!

## Game Data Format

### JSON Format

The game uses a compact JSON format where each pick carries its own facts:

```json
{
  "picks": [
    {
      "id": "1",
      "name": "Alice",
      "description": "Famous Singer",
      "image": "https://example.com/alice.png",
      "facts": [
        {
          "description": "WON THE NOBEL PRIZE",
          "category": "AWARDS",
          "quantity": 1,
          "image": null
        },
        {
          "description": "HAS THE MOST DOGS",
          "category": "ANIMALS",
          "quantity": 10,
          "image": null
        }
      ]
    }
  ]
}
```

**Key features:**
- **Compact structure**: Facts are embedded directly in each pick
- **Optional quantity field**: When multiple picks share the same fact, the one with the highest quantity wins (e.g., if both Alice and Bob won Nobel Prizes, Alice with quantity=2 beats Bob with quantity=1)
- **No fact IDs needed**: Facts are identified by their description

> **Note**: The SQLite loader is not currently updated for the compact format. Only the JSON format is supported with the new compact structure.

## Using the Database Editor

The database editor (`/editor.html`) provides a visual interface to:

1. **Add Picks** - Create characters/entries with embedded facts
2. **Add Facts to Picks** - Define facts with descriptions, categories, optional quantities, and images
3. **Add Images** - Optionally add pixel art images for picks and facts
4. **Import Data** - Load existing JSON data
5. **Export JSON** - Download your database as a JSON file

### Editor Features

- **Visual editing** - Click-based interface, no code required
- **Inline fact editing** - Add and edit facts directly within each pick
- **Quantity support** - Specify quantities for facts to determine the "winner" when multiple picks share a fact
- **Live preview** - See your picks as cards with their associated facts
- **Local storage** - Automatically saves your work in the browser
- **Bulk import** - Paste JSON data to quickly populate the database

## Loading Data from GitHub

You can host your game data on GitHub and load it directly:

```javascript
const dataLoader = new JSONLoader('https://raw.githubusercontent.com/username/repo/main/data/game-data.json');
```

This allows you to:
- Version control your game data
- Share data across multiple game instances
- Update game content without redeploying

## Project Structure

```
versus/
├── public/              # Web-accessible files
│   ├── index.html       # Main game page
│   ├── game.js          # Game UI and logic
│   ├── styles.css       # Game styling
│   ├── editor.html      # Database editor page
│   ├── editor.js        # Editor logic
│   └── editor-styles.css # Editor styling
├── src/                 # Source code (for Node.js usage)
│   ├── models/          # Data models
│   │   ├── Pick.js      # Pick/entry model
│   │   └── Question.js  # Question model
│   ├── loaders/         # Data loaders
│   │   ├── DataLoader.js    # Base loader
│   │   ├── JSONLoader.js    # JSON loader
│   │   └── SQLiteLoader.js  # SQLite loader
│   └── engine/          # Game engine
│       └── GameEngine.js    # Core game logic
├── data/                # Example data
│   └── example-data.json
├── examples/            # Usage examples
├── package.json
└── README.md
```

## Core Classes

### Fact
Represents a fact that can be associated with picks (e.g., "WON THE NOBEL PRIZE", category: "AWARDS").

### Pick
Represents a single character/item in the game with associated facts and optional pixel art image.

### Question
Represents a game question with a fact, options (picks), and the correct answer.

### DataLoader
Base class for loading game data from various sources.

### JSONLoader
Loads data from JSON files (local or remote).

### SQLiteLoader
Loads data from SQLite databases (requires sql.js in browser).

### GameEngine
Core game logic - manages game state, question generation, and scoring.

## Customization

### Styling
Edit `public/styles.css` to customize:
- Colors and gradients
- Fonts and sizes
- Layout and spacing
- Animations

### Game Rules
Edit `src/engine/GameEngine.js` to customize:
- Number of options per question
- Scoring logic
- Question generation algorithm

## Browser Compatibility

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile browsers: ✅ Full support

## License

ISC

## Contributing

Contributions welcome! Please feel free to submit issues and pull requests.

