<?php
/**
 * PHPUnit bootstrap file.
 *
 * Runs inside the wp-env test container, which provides the WordPress test
 * library matching the tested Core through WP_TESTS_DIR.
 *
 * @package Blockparty\Iframe
 */

require_once dirname( __DIR__ ) . '/vendor/autoload.php';

$_tests_dir = getenv( 'WP_TESTS_DIR' );

if ( ! $_tests_dir || ! file_exists( $_tests_dir . '/includes/functions.php' ) ) {
	echo 'Could not find the WordPress test library. Run the suite with `npm run test:php`.' . PHP_EOL;
	exit( 1 );
}

if ( ! file_exists( dirname( __DIR__ ) . '/build/blockparty-iframe/block.json' ) ) {
	echo 'Could not find the built block. Run `npm run build` first.' . PHP_EOL;
	exit( 1 );
}

if ( ! defined( 'WP_TESTS_CONFIG_FILE_PATH' ) ) {
	define( 'WP_TESTS_CONFIG_FILE_PATH', __DIR__ . '/wp-tests-config.php' );
}

require_once $_tests_dir . '/includes/functions.php';

tests_add_filter(
	'muplugins_loaded',
	static function (): void {
		require dirname( __DIR__ ) . '/blockparty-iframe.php';
	}
);

require $_tests_dir . '/includes/bootstrap.php';
