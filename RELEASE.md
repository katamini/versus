# Release Guide

This guide explains how to create releases and distribute the VERSUS game.

## Creating a Release

### Method 1: Git Tag (Recommended)

Create and push a version tag to trigger the release workflow:

```bash
# Create a new version tag
git tag -a v1.0.0 -m "Release version 1.0.0"

# Push the tag to GitHub
git push origin v1.0.0
```

This will automatically:
1. Generate the database from JSON files
2. Create distribution packages (ZIP and TAR)
3. Build CDN-ready files
4. Create a GitHub Release with assets
5. Generate release notes

### Method 2: Manual Workflow Trigger

Go to GitHub Actions → Release workflow → Run workflow

## Release Artifacts

Each release includes:
- `versus-game.zip` - Complete game package
- `versus-game.tar.gz` - Complete game package (tar format)
- `versus.min.js` - CDN-ready game engine
- `versus.min.css` - CDN-ready styles
- `example-data.json` - Sample game data

## Version Numbering

Follow Semantic Versioning (SemVer):
- `v1.0.0` - Major release (breaking changes)
- `v1.1.0` - Minor release (new features, backwards compatible)
- `v1.0.1` - Patch release (bug fixes)

## CDN Distribution

After creating a release, the files are available via CDN:

### Specific Version (Recommended for Production)
```html
<script src="https://cdn.jsdelivr.net/gh/katamini/versus@v1.0.0/public/game.js"></script>
```

### Latest Version (Development)
```html
<script src="https://cdn.jsdelivr.net/gh/katamini/versus@latest/public/game.js"></script>
```

### Latest from Main Branch
```html
<script src="https://cdn.jsdelivr.net/gh/katamini/versus@main/public/game.js"></script>
```

## Pre-Release Checklist

Before creating a release:

1. **Update version in package.json**
   ```bash
   npm version major|minor|patch
   ```

2. **Test the game locally**
   ```bash
   npm start
   npm run editor
   ```

3. **Validate database**
   ```bash
   node scripts/validate-db.js
   ```

4. **Generate fresh database**
   ```bash
   node scripts/generate-db.js
   ```

5. **Update README if needed**

6. **Commit all changes**
   ```bash
   git add .
   git commit -m "chore: prepare for v1.0.0 release"
   git push
   ```

7. **Create and push tag**
   ```bash
   git tag -a v1.0.0 -m "Release v1.0.0"
   git push origin v1.0.0
   ```

## Post-Release

1. **Verify CDN files** are accessible
2. **Test the CDN integration** using the example
3. **Update documentation** if needed
4. **Announce the release** to users

## Rolling Back

If you need to rollback a release:

1. Delete the GitHub Release (optional)
2. Delete the tag locally and remotely:
   ```bash
   git tag -d v1.0.0
   git push origin :refs/tags/v1.0.0
   ```

## Database Updates

When you update game data:

1. Edit JSON files in `data/`
2. Commit and push to main branch
3. GitHub Actions will automatically regenerate the database
4. For a new release with updated data, create a new version tag

## CDN Cache

jsDelivr CDN caches for 7 days. To force a refresh:
- Use a new version tag
- Add `?v=timestamp` to the URL (temporary)
- Wait for cache expiration

## Support

For issues with releases or CDN distribution, check:
- GitHub Actions logs
- jsDelivr status: https://www.jsdelivr.com/
- CDN URL format in examples/

## Automated Workflows

### Release Workflow
- **Trigger**: Push tag matching `v*.*.*`
- **Actions**: Build, package, create release
- **Outputs**: ZIP, TAR, CDN files

### Database Workflow
- **Trigger**: Changes to `data/` or `scripts/`
- **Actions**: Generate and validate database
- **Outputs**: SQL files in `public/data/`

### CI Workflow
- **Trigger**: Push to main/develop, PRs
- **Actions**: Validate JSON, check JS syntax, test DB generation
- **Outputs**: Pass/fail status
