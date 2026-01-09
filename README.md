# Blockparty — Iframe

[![License: GPL v2](https://img.shields.io/badge/License-GPL%20v2-blue.svg)](https://www.gnu.org/licenses/gpl-2.0)
[![WordPress: 6.7+](https://img.shields.io/badge/WordPress-6.7+-green.svg)](https://wordpress.org/)
[![PHP: 8.1+](https://img.shields.io/badge/PHP-8.1+-purple.svg)](https://php.net/)

A WordPress plugin that adds a custom Gutenberg block to embed iframes in the WordPress editor.

## 📋 Description

Blockparty Iframe is a modern WordPress plugin that allows you to easily add iframes to your WordPress content via the Gutenberg block editor. It offers an intuitive interface with advanced configuration options.

### ✨ Features

- **Native Gutenberg Block**: Full integration with the WordPress block editor
- **Lazy Loading**: Optional lazy loading to optimize performance
- **Customizable Dimensions**: Complete control over width, height, and aspect ratio
- **Flexible Alignments**: Support for wide and full-width alignments
- **Accessible Title**: Add a title to improve accessibility
- **Internationalized**: Multilingual support with translation files (French included)
- **Optimized Performance**: Uses WordPress 6.7+ block registration API for better performance

## 🔧 Requirements

- **WordPress**: Version 6.7 or higher
- **PHP**: Version 8.1 or higher
- **PHP Extension**: ext-json

## 📦 Installation

### Installation via Composer

```bash
composer require beapi/blockparty-iframe
```

### Manual Installation

1. Download the latest version of the plugin
2. Extract the archive to the `/wp-content/plugins/` folder
3. Activate the plugin from the WordPress "Plugins" menu

### Development Installation

```bash
# Clone the repository
git clone https://github.com/BeAPI/blockparty-iframe.git
cd blockparty-iframe

# Install PHP dependencies
composer install

# Install JavaScript dependencies
npm install

# Build the assets
npm run build
```

## 🚀 Usage

1. Open the Gutenberg block editor
2. Click the "+" button to add a new block
3. Search for "Iframe" in the "Widgets" category
4. Configure the block options:
   - **URL**: The address of the page to embed
   - **Title**: A descriptive title for accessibility
   - **Lazy Load**: Enable lazy loading (optional)
   - **Dimensions**: Adjust width, height, and aspect ratio
   - **Alignment**: Choose the block alignment

## 🛠️ Development

### Project Structure

```
blockparty-iframe/
├── src/                    # Block sources
│   └── blockparty-iframe/
│       ├── block.json      # Block configuration
│       ├── edit.js         # Edit component
│       ├── save.js         # Save component
│       ├── index.js        # Entry point
│       ├── editor.scss     # Editor styles
│       └── style.scss      # Frontend styles
├── build/                  # Compiled assets
├── languages/              # Translation files
├── blockparty-iframe.php   # Main plugin file
├── composer.json           # PHP dependencies
└── package.json            # JavaScript dependencies
```

### Available Scripts

#### JavaScript

```bash
# Development with hot reload
npm start

# Production build
npm run build

# JavaScript linter
npm run lint:js

# CSS linter
npm run lint:css

# Code formatting
npm run format

# Create plugin ZIP archive
npm run plugin-zip

# Start local development environment
npm run start:env

# Stop local development environment
npm run stop:env
```

#### PHP

```bash
# Check code with PHP_CodeSniffer
composer cs

# Automatically fix code
composer cb

# Analyze with Psalm
composer psalm

# Run unit tests
composer phpunit
```

### Coding Standards

The project follows WordPress coding standards:

- **WPCS** (WordPress Coding Standards) for PHP
- **ESLint** with WordPress rules for JavaScript
- **Psalm** for PHP static analysis
- **GrumPHP** to automate pre-commit checks

### Development Environment Setup

The plugin uses `@wordpress/env` to create a local WordPress development environment:

```bash
# Start the environment
npm run start:env

# Access WordPress
# URL: http://localhost:8888
# Default credentials: admin / password

# Stop the environment
npm run stop:env
```

## 🔍 Code Quality

The project integrates several quality tools:

- **PHP_CodeSniffer**: PHP coding standards verification
- **Psalm**: PHP static code analysis
- **PHPCompatibility**: PHP compatibility verification
- **PHP Parallel Lint**: PHP syntax error detection
- **GrumPHP**: Pre-commit checks automation

## 🌍 Internationalization

The plugin is fully internationalized and ready for translation. Translation files are available in the `languages/` folder.

### Available Languages

- English (default)
- French

### Adding a Translation

1. Use the `languages/blockparty-iframe.pot` file as a base
2. Create your `.po` and `.mo` files
3. Place them in the `languages/` folder

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the project
2. Create a branch for your feature (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Make sure your code:

- Follows WordPress coding standards
- Passes all quality tests (PHPCS, Psalm, ESLint)
- Is properly documented
- Includes translations if necessary

## 📄 License

This plugin is distributed under the GPL-2.0-or-later license. See the [LICENSE](LICENSE) file for more details.

## 👥 Authors

**Be API Technical Team**

- Email: <technical@beapi.fr>
- Website: [https://beapi.fr](https://beapi.fr)

## 🔗 Useful Links

- [WordPress Block Editor Documentation](https://developer.wordpress.org/block-editor/)
- [WordPress Coding Standards](https://developer.wordpress.org/coding-standards/)
- [Block API Reference](https://developer.wordpress.org/block-editor/reference-guides/block-api/)

## 📝 Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history.

---

Developed with ❤️ by [Be API](https://beapi.fr)
