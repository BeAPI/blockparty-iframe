<?php
/**
 * Plugin Name:       Blockparty Iframe
 * Description:       Add a block to display an embedded frame in the WordPress editor.
 * Version:           1.1.2
 * Requires at least: 6.7
 * Requires PHP:      8.1
 * Author:            Be API Technical team
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       blockparty-iframe
 *
 * @package Blockparty\Iframe
 */

namespace Blockparty\Iframe;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

if ( is_readable( __DIR__ . '/vendor/autoload.php' ) ) {
	include_once __DIR__ . '/vendor/autoload.php';
}

define( 'BLOCKPARTY_IFRAME_VERSION', '1.1.2' );
define( 'BLOCKPARTY_IFRAME_URL', plugin_dir_url( __FILE__ ) );
define( 'BLOCKPARTY_IFRAME_DIR', plugin_dir_path( __FILE__ ) );
define( 'BLOCKPARTY_IFRAME_PLUGIN_BASENAME', plugin_basename( __FILE__ ) );

/**
 * Bootstrap the plugin.
 */
function init() {
	load_plugin_textdomain(
		'blockparty-iframe',
		false,
		dirname( BLOCKPARTY_IFRAME_PLUGIN_BASENAME ) . '/languages'
	);

	register_block_type(
		BLOCKPARTY_IFRAME_DIR . 'build/blockparty-iframe',
		array(
			'render_callback' => array( BlockRenderer::class, 'render' ),
		)
	);

	wp_set_script_translations(
		'blockparty-iframe-editor-script',
		'blockparty-iframe',
		BLOCKPARTY_IFRAME_DIR . 'languages'
	);
}

add_action( 'init', __NAMESPACE__ . '\\init', 0 );
