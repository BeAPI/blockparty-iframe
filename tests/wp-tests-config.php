<?php
/**
 * WordPress integration test configuration for the local wp-env test site.
 *
 * The test bootstrap recreates its tables: the `wptests_` prefix keeps them
 * apart from the browser site living in the same database.
 *
 * @package Blockparty\Iframe
 */

$database_defaults = [
	'DB_NAME'     => 'wordpress',
	'DB_USER'     => 'root',
	'DB_PASSWORD' => 'password',
	'DB_HOST'     => 'mysql',
];

foreach ( $database_defaults as $constant => $default ) {
	$value = getenv( 'WORDPRESS_' . $constant );
	define( $constant, false !== $value && '' !== $value ? $value : $default );
}

define( 'DB_CHARSET', 'utf8' );
define( 'DB_COLLATE', '' );

$table_prefix = 'wptests_'; // phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited -- Required by the WordPress test library.

define( 'WP_TESTS_DOMAIN', 'example.org' );
define( 'WP_TESTS_EMAIL', 'admin@example.org' );
define( 'WP_TESTS_TITLE', 'Blockparty Iframe tests' );
define( 'WP_PHP_BINARY', 'php' );
define( 'ABSPATH', '/var/www/html/' );
