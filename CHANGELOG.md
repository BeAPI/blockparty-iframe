# Blockparty Iframe

## Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [1.0.0] - 2025-01-09

### 🎉 Initial Release

#### Added

- **Gutenberg Iframe Block**: New custom block to embed iframes in WordPress editor
- **Configurable Attributes**:
  - `url`: URL of the page to embed
  - `title`: Iframe title for accessibility
  - `lazyload`: Option to enable lazy loading
- **Dimension Support**:
  - Customizable width
  - Customizable height
  - Configurable aspect ratio
- **Alignments**: Support for wide and full-width alignments
- **Internationalization**:
  - Full i18n/l10n support
  - French translations included
  - POT files for translators
- **Performance**:
  - Uses `blocks-manifest.php` API (WordPress 6.7+)
  - Compatible with `wp_register_block_types_from_metadata_collection` (WordPress 6.8+)
  - Optional lazy loading for iframes
- **Code Quality**:
  - WordPress Coding Standards (WPCS) compliance
  - Static analysis with Psalm
  - PHPCompatibility verification
  - ESLint for JavaScript
  - GrumPHP for pre-commit hooks
- **Documentation**:
  - Complete README with usage guide
  - PHPDoc for all functions
  - Detailed inline comments
- **Development Environment**:
  - `@wordpress/env` support for local environment
  - npm scripts for development and production
  - Composer configuration for development tools

#### Technical

- **Minimum Versions**:
  - WordPress 6.7+
  - PHP 8.1+
  - Requires ext-json
- **Block Editor API**: Uses API version 3
- **Build System**: `@wordpress/scripts` with `--blocks-manifest` flag
- **Structure**: Modular architecture with edit/save separation
- **Styles**: SCSS with automatic RTL support

---

[1.0.0]: https://github.com/BeAPI/blockparty-iframe/releases/tag/1.0.0
