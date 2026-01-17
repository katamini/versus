# VERSUS - Pixel Quiz Game Engine

A colorful pixel-art quiz game engine for building browser-based guess games. Players compare properties between characters/picks and try to reach the maximum number of consecutive successful guesses!

## Features

- 🎮 **Browser-based game engine** - No installation required, runs in any modern browser
- 🎨 **Pixel-art aesthetic** - Colorful retro-style UI with pixel fonts and vibrant gradients
- 📊 **Property comparison gameplay** - Compare numeric properties between different picks
- 🔄 **Flexible data loading** - Support for both GitHub-hosted JSON files and SQLite databases
- 🖼️ **Image support** - Optional images for picks and property categories
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

1. The game shows you a target pick (character/entry) with various properties
2. You're asked: "Which has more [PROPERTY] than [TARGET]?"
3. Choose from multiple options
4. If you guess correctly, your streak continues
5. If you guess wrong, the game ends
6. Try to achieve the maximum consecutive correct guesses!

## Game Data Format

### JSON Format

The game uses JSON files with the following structure:

```json
{
  "propertyCategories": {
    "DOGS": {
      "image": "https://example.com/dog-icon.png"
    },
    "MONEY": {
      "image": null
    }
  },
  "picks": [
    {
      "id": "1",
      "name": "Alice",
      "properties": {
        "DOGS": 10,
        "MONEY": 5,
        "EYES": 2
      },
      "image": "https://example.com/alice.png",
      "propertyImages": {
        "DOGS": "https://example.com/alice-dogs.png"
      }
    }
  ]
}
```

### SQLite Format

For SQLite databases, use the following schema:

```sql
CREATE TABLE picks (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  image TEXT
);

CREATE TABLE properties (
  pick_id TEXT NOT NULL,
  property_name TEXT NOT NULL,
  value REAL NOT NULL,
  image TEXT,
  FOREIGN KEY (pick_id) REFERENCES picks(id)
);

CREATE TABLE property_categories (
  name TEXT PRIMARY KEY,
  image TEXT
);
```

## Using the Database Editor

The database editor (`/editor.html`) provides a visual interface to:

1. **Add Property Categories** - Define the types of properties (e.g., DOGS, MONEY, HEIGHT)
2. **Add Picks** - Create characters/entries with multiple properties
3. **Add Images** - Optionally add images for picks and properties
4. **Import Data** - Load existing JSON data
5. **Export JSON** - Download your database as a JSON file
6. **Export SQLite** - Download SQL script to create a SQLite database

### Editor Features

- **Visual editing** - Click-based interface, no code required
- **Live preview** - See your picks and categories as cards
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

### Pick
Represents a single entry in the game with properties and optional images.

### Question
Represents a game question with a target pick, options, and the property being compared.

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

