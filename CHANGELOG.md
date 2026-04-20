# Blockparty Iframe

## Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [1.1.1] - 2026-04-20

### Fixed

- **Dependency alignment**: Bump `@wordpress/icons` to ^12.2.0 so the block editor resolves a single icons package version alongside `@wordpress/block-editor`, `@wordpress/components`, and related packages (avoids duplicate bundles and inconsistent icons).

## [1.1.0] - 2026-01-12

### 🚀 Added

#### Iframe Code Parsing

- **HTML iframe code support**: You can now paste complete iframe HTML code instead of just URLs
- **Automatic URL extraction**: The `src` attribute is automatically extracted from iframe code
- **Auto-fill title**: The `title` attribute is automatically extracted and fills the title field
- **Custom attributes preservation**: All custom iframe attributes are extracted and preserved in the final output
- **Smart content filtering**: HTML content inside iframe tags is automatically removed during parsing

#### Attribute Management

- **Custom attributes storage**: New `iframeAttributes` block attribute (array of key-value objects)
- **Boolean attributes support**: Proper handling of HTML boolean attributes like `allowfullscreen`
- **React prop mapping**: Automatic conversion of HTML attributes to React prop names
  - `allowfullscreen` → `allowFullScreen`
  - `allowpaymentrequest` → `allowPaymentRequest`
  - `referrerpolicy` → `referrerPolicy`
- **Deprecated attributes filtering**: Automatic exclusion of deprecated HTML attributes
  - `frameborder`, `marginwidth`, `marginheight`, `scrolling`, `align`, `longdesc`
- **Problematic attributes filtering**: Exclusion of attributes that cause issues in React
  - `style` (requires object format in React)
  - `name` (can cause conflicts)
  - `width`, `height` (managed by block dimension supports)

#### Code Quality

- **Utility functions**: New `utils.js` module for shared functionality
- **Code refactoring**: Eliminated duplication between `edit.js` and `save.js`
- **Better error handling**: Improved parsing with `insertAdjacentHTML` for safer DOM manipulation

### 🔧 Changed

- **Source field enhancement**: The URL field now accepts both URLs and iframe HTML code
- **Placeholder text**: Updated to reflect dual input capability
- **Help text**: Added contextual help explaining the new paste functionality

### 📚 Technical Details

- **New file**: `src/blockparty-iframe/utils.js` with exported utility functions:
  - `parseIframeCode()`: Parse iframe HTML and extract attributes
  - `convertAttributesToProps()`: Convert attributes array to React props
  - `mapHtmlAttributeToReact()`: Map HTML attribute names to React prop names
  - `isBooleanAttribute()`: Identify boolean HTML attributes
  - `isExcludedIframeAttribute()`: Filter out problematic attributes

---

## [1.0.2] - 2026-01-10

### 🔧 Changed

- **Release workflow**: Updated GitHub Actions release workflow configuration

---

## [1.0.1] - 2026-01-09

### 🐛 Fixed

- **Build artifacts**: Updated `.distignore` and `.gitattributes` for proper release packaging

---

## [1.0.0] - 2026-01-09

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

[1.1.1]: https://github.com/BeAPI/blockparty-iframe/releases/tag/1.1.1
[1.1.0]: https://github.com/BeAPI/blockparty-iframe/releases/tag/1.1.0
[1.0.2]: https://github.com/BeAPI/blockparty-iframe/releases/tag/1.0.2
[1.0.1]: https://github.com/BeAPI/blockparty-iframe/releases/tag/1.0.1
[1.0.0]: https://github.com/BeAPI/blockparty-iframe/releases/tag/1.0.0
