# CDN Integration Guide

This guide shows you how to integrate the VERSUS game engine into your website using public CDNs.

## Quick Start

### Option 1: jsDelivr (Recommended)

jsDelivr is a fast, reliable CDN with automatic minification and compression.

```html
<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/katamini/versus@latest/public/styles.css">
</head>
<body>
    <div id="game-root"></div>
    
    <script src="https://cdn.jsdelivr.net/gh/katamini/versus@latest/public/game.js"></script>
    <script>
        // Your game data URL
        const dataLoader = new JSONLoader('https://your-server.com/game-data.json');
        const gameEngine = new GameEngine(dataLoader);
        const gameUI = new GameUI(gameEngine);
        gameUI.initialize();
    </script>
</body>
</html>
```

### Option 2: unpkg (Requires npm publishing)

⚠️ Note: unpkg URLs only work after the package is published to npm with `dist/` files included.

```html
<script src="https://unpkg.com/versus@latest/dist/cdn/versus.min.js"></script>
<link rel="stylesheet" href="https://unpkg.com/versus@latest/dist/cdn/versus.min.css">
```

If the package is not yet published to npm, use jsDelivr with GitHub (Option 1) instead.

### Option 3: GitHub Raw (Development Only)

⚠️ Not recommended for production due to rate limiting and caching issues.

```html
<script src="https://raw.githubusercontent.com/katamini/versus/main/public/game.js"></script>
```

## Using Specific Versions

For production, always pin to a specific version:

```html
<!-- Using version 1.0.0 -->
<script src="https://cdn.jsdelivr.net/gh/katamini/versus@v1.0.0/public/game.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/katamini/versus@v1.0.0/public/styles.css">
```

## Loading Game Data

### From Your Own GitHub Repository

```javascript
const dataLoader = new JSONLoader(
    'https://cdn.jsdelivr.net/gh/YOUR_USERNAME/YOUR_REPO@main/data/game-data.json'
);
```

### From Your Own Server

```javascript
const dataLoader = new JSONLoader('https://yourdomain.com/api/game-data.json');
```

### From a Different CDN

```javascript
const dataLoader = new JSONLoader('https://cdn.example.com/versus-data.json');
```

## Complete Integration Example

See `cdn-example.html` for a complete working example.

## Performance Tips

1. **Use specific versions** instead of `@latest` for better caching
2. **Enable compression** on your server for JSON data
3. **Use CDN** for both the game engine and your data files
4. **Preload critical resources**:
```html
<link rel="preload" href="https://cdn.jsdelivr.net/gh/katamini/versus@v1.0.0/public/game.js" as="script">
<link rel="preload" href="https://yourdomain.com/game-data.json" as="fetch" crossorigin>
```

## Security Considerations

1. **Subresource Integrity (SRI)** - Add integrity hashes for CDN files:
```html
<script src="https://cdn.jsdelivr.net/gh/katamini/versus@v1.0.0/public/game.js" 
        integrity="sha384-..." 
        crossorigin="anonymous"></script>
```

2. **CORS** - Ensure your data server has proper CORS headers:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET
```

3. **HTTPS Only** - Always use HTTPS for production

## Hosting Your Game Data

### GitHub Repository (Free)

1. Create a new repository for your game data
2. Add your JSON files to a `data/` folder
3. Commit and push
4. Access via: `https://cdn.jsdelivr.net/gh/USERNAME/REPO@main/data/game-data.json`

### GitHub Releases (Recommended for Production)

1. Create a release in your repository
2. Attach your JSON file as a release asset
3. Access via the release URL

### Your Own Server

Host the JSON file on any web server with proper CORS headers.

## Troubleshooting

### CDN Cache Issues

If you're seeing old content:

1. Use version tags instead of `@latest`
2. Purge the CDN cache (jsDelivr: add `?v=timestamp` to URL)
3. Wait for CDN propagation (usually < 5 minutes)

### CORS Errors

Make sure your data source has proper CORS headers. For GitHub:
- jsDelivr automatically adds CORS headers ✅
- GitHub Raw may have CORS restrictions ⚠️

### Loading Errors

Check browser console for specific errors. Common issues:
- Incorrect file paths
- Network/CORS issues
- Invalid JSON format
