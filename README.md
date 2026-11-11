# Blockparty — Iframe

[![Test with WordPress Playground](https://img.shields.io/badge/Test%20with-WordPress%20Playground-0073aa?style=for-the-badge&logo=wordpress&logoColor=white)](https://playground.wordpress.net/?blueprint-url=https://raw.githubusercontent.com/beapi/blockparty-iframe/refs/heads/main/.wordpress-org/blueprints/blueprint.json)

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
├── includes/               # PHP classes (block renderer)
├── languages/              # Translation files
├── tests/                  # PHPUnit, Jest and Playwright tests
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
npm run env:start

# Stop local development environment
npm run env:stop
```

#### PHP

```bash
# Check code with PHP_CodeSniffer
composer cs

# Automatically fix code
composer cb
```

### Coding Standards

The project follows WordPress coding standards:

- **WPCS** (WordPress Coding Standards) for PHP
- **ESLint** with WordPress rules for JavaScript
- **GrumPHP** to automate pre-commit checks

### Development Environment Setup

The plugin uses `@wordpress/env` to create a local WordPress development environment:

```bash
# Start the environment
npm run env:start

# Access WordPress
# URL: http://localhost:8888
# Default credentials: admin / password

# Stop the environment
npm run env:stop
```

### Tests

Three suites cover the block, each at its own level:

| Suite | Location | Covers |
| --- | --- | --- |
| PHPUnit | `tests/php/` | `BlockRenderer`: attribute allowlist, escaping, source protocols, `allow` policy and its filter |
| Jest | `tests/js/` | Pure helpers of `src/blockparty-iframe/utils.js` |
| Playwright | `tests/playwright/` | The block in the editor (form, server-side preview, inspector, deprecation) and on the front end |

PHPUnit and Playwright run against an isolated WordPress site (`.wp-env.test.json`, port 8889), separate from the development site. Docker is required, and the plugin must be installed and built first, because `build/` and `vendor/` are not versioned:

```bash
composer install
npm install
npm run build
```

```bash
# JavaScript unit tests (no WordPress needed)
npm run test:unit:js

# Start the test site (reused by the commands below)
npm run env:start-ci

# PHP tests, inside the test site container
npm run test:php

# End-to-end tests (installs the Playwright browsers on first run)
npm run test:e2e

# Same, with a visible browser or the Playwright UI
npm run test:e2e-debug
npm run test:e2e-ui

# Stop the test site
npm run env:stop-tests
```

Arguments are forwarded to the runners, for instance `npm run test:php -- --filter allow` or `npm run test:e2e -- --grep "lazy loading"`.

To run the suites on another WordPress or PHP version, recreate the test site with wp-env overrides:

```bash
WP_ENV_CORE='WordPress/WordPress#6.7' WP_ENV_PHP_VERSION=8.1 npm run env:reset-tests
```

For a PHP coverage report, start the test site with Xdebug (`npm run env:start-tests`) and run `npm run test:php -- --coverage-html=coverage/ --coverage-text`.

On pull requests, GitHub Actions runs PHPUnit and Playwright on WordPress 6.7 and on the latest release with PHP 8.1, and Jest once.

#### Test tooling

| Tool | Version | Why |
| --- | --- | --- |
| `@wordpress/scripts` | 31.8.0 | Build, Jest and Playwright runners. Below 33, the Playwright command is `test-playwright` (`test-e2e` still runs Puppeteer). |
| `@wordpress/env` | 12.1.0 | Needs 11 or newer for `--config` and `testsEnvironment`, used to isolate the test site. |
| `@playwright/test` | 1.58.2 | Range required by `@wordpress/scripts` 31.8. |
| `@wordpress/e2e-test-utils-playwright` | 1.54.0 | WordPress fixtures (`admin`, `editor`, `requestUtils`). |
| `phpunit/phpunit` | 9.6.38 | Latest major supported by the WordPress test library, compatible with PHP 8.1. |
| `yoast/phpunit-polyfills` | 1.1.5 | Required by the WordPress test library. |

The WordPress test library itself comes from wp-env (`WP_TESTS_DIR`), so it always matches the tested Core.

## 🔍 Code Quality

The project integrates several quality tools:

- **PHP_CodeSniffer**: PHP coding standards verification
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
- Passes all quality checks (PHPCS, ESLint) and the test suites (PHPUnit, Jest, Playwright)
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
