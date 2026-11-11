<?php
/**
 * Tests for the iframe block renderer.
 *
 * @package Blockparty\Iframe
 */

namespace Blockparty\Iframe\Tests;

use Blockparty\Iframe\BlockRenderer;
use WP_Block_Type_Registry;
use WP_HTML_Tag_Processor;
use WP_UnitTestCase;

/**
 * Renders the block through `do_blocks()`, as WordPress does on the front end
 * and in the editor preview, so the production registration is exercised.
 */
class BlockRendererTest extends WP_UnitTestCase {

	private const BLOCK_NAME = 'blockparty/iframe';

	private const URL = 'https://example.org/embed';

	private const TITLE = 'Embedded content';

	/**
	 * Render the block from its attributes.
	 *
	 * @param array $attributes Block attributes.
	 *
	 * @return string Rendered HTML.
	 */
	private function render_block_html( array $attributes ): string {
		return do_blocks( get_comment_delimited_block_content( self::BLOCK_NAME, $attributes, '' ) );
	}

	/**
	 * Render a valid iframe carrying extra iframe attributes.
	 *
	 * @param array $iframe_attributes List of key/value pairs.
	 *
	 * @return string Rendered HTML.
	 */
	private function render_with_iframe_attributes( array $iframe_attributes ): string {
		return $this->render_block_html(
			[
				'url'              => self::URL,
				'title'            => self::TITLE,
				'iframeAttributes' => $iframe_attributes,
			]
		);
	}

	/**
	 * Point a tag processor at the rendered iframe.
	 *
	 * @param string $html Rendered HTML.
	 *
	 * @return WP_HTML_Tag_Processor Processor stopped on the iframe tag.
	 */
	private function get_iframe( string $html ): WP_HTML_Tag_Processor {
		$processor = new WP_HTML_Tag_Processor( $html );

		$this->assertTrue( $processor->next_tag( 'iframe' ), 'The block should render an iframe.' );

		return $processor;
	}

	/**
	 * List the names of every tag opened in the rendered HTML.
	 *
	 * @param string $html Rendered HTML.
	 *
	 * @return string[] Upper-cased tag names.
	 */
	private function get_tag_names( string $html ): array {
		$processor = new WP_HTML_Tag_Processor( $html );
		$tag_names = [];

		while ( $processor->next_tag() ) {
			$tag_names[] = $processor->get_tag();
		}

		return $tag_names;
	}

	/**
	 * The block is registered from its built metadata with the PHP renderer.
	 */
	public function test_block_is_registered_with_render_callback(): void {
		$block_type = WP_Block_Type_Registry::get_instance()->get_registered( self::BLOCK_NAME );

		$this->assertNotNull( $block_type );
		$this->assertSame( [ BlockRenderer::class, 'render' ], $block_type->render_callback );
	}

	/**
	 * A valid block renders a wrapper holding a single iframe.
	 */
	public function test_renders_iframe_with_title_source_and_eager_loading(): void {
		$html = $this->render_block_html(
			[
				'url'   => 'https://example.org/embed?a=1&b=2',
				'title' => self::TITLE,
			]
		);

		$this->assertSame( [ 'DIV', 'IFRAME' ], $this->get_tag_names( $html ) );

		$wrapper = new WP_HTML_Tag_Processor( $html );
		$this->assertTrue( $wrapper->next_tag( 'div' ) );
		$this->assertTrue( $wrapper->has_class( 'wp-block-blockparty-iframe' ) );

		$iframe = $this->get_iframe( $html );
		$this->assertSame( 'https://example.org/embed?a=1&b=2', $iframe->get_attribute( 'src' ) );
		$this->assertSame( self::TITLE, $iframe->get_attribute( 'title' ) );
		$this->assertSame( 'eager', $iframe->get_attribute( 'loading' ) );
		$this->assertSame( [ 'title', 'src', 'loading' ], $iframe->get_attribute_names_with_prefix( '' ) );
	}

	/**
	 * The lazyload attribute switches the iframe to lazy loading.
	 */
	public function test_lazyload_attribute_renders_lazy_loading(): void {
		$html = $this->render_block_html(
			[
				'url'      => self::URL,
				'title'    => self::TITLE,
				'lazyload' => true,
			]
		);

		$this->assertSame( 'lazy', $this->get_iframe( $html )->get_attribute( 'loading' ) );
	}

	/**
	 * Block supports are applied to the wrapper.
	 */
	public function test_alignment_is_applied_to_the_wrapper(): void {
		$html = $this->render_block_html(
			[
				'url'   => self::URL,
				'title' => self::TITLE,
				'align' => 'wide',
			]
		);

		$wrapper = new WP_HTML_Tag_Processor( $html );
		$this->assertTrue( $wrapper->next_tag( 'div' ) );
		$this->assertTrue( $wrapper->has_class( 'alignwide' ) );
	}

	/**
	 * Without a usable source and title, only the empty wrapper is rendered.
	 *
	 * @dataProvider data_attributes_without_iframe
	 *
	 * @param array $attributes Block attributes.
	 */
	public function test_renders_empty_wrapper_without_usable_source_or_title( array $attributes ): void {
		$html = $this->render_block_html( $attributes );

		$this->assertSame( [ 'DIV' ], $this->get_tag_names( $html ) );
		$this->assertStringContainsString( 'wp-block-blockparty-iframe', $html );
	}

	/**
	 * Data provider.
	 *
	 * @return array[]
	 */
	public function data_attributes_without_iframe(): array {
		return [
			'no attributes'       => [ [] ],
			'missing url'         => [ [ 'title' => self::TITLE ] ],
			'missing title'       => [ [ 'url' => self::URL ] ],
			'blank title'         => [
				[
					'url'   => self::URL,
					'title' => '   ',
				],
			],
			'javascript protocol' => [
				[
					'url'   => 'javascript:alert(1)',
					'title' => self::TITLE,
				],
			],
			'data protocol'       => [
				[
					'url'   => 'data:text/html,<script>alert(1)</script>',
					'title' => self::TITLE,
				],
			],
			'ftp protocol'        => [
				[
					'url'   => 'ftp://example.org/file',
					'title' => self::TITLE,
				],
			],
		];
	}

	/**
	 * Title and attribute values cannot break out of their attribute.
	 */
	public function test_title_and_attribute_values_are_escaped(): void {
		$payload = '"><script>alert(1)</script><iframe onload="alert(2)';

		$html = $this->render_block_html(
			[
				'url'              => self::URL,
				'title'            => $payload,
				'iframeAttributes' => [
					[
						'key'   => 'id',
						'value' => $payload,
					],
				],
			]
		);

		$this->assertSame( [ 'DIV', 'IFRAME' ], $this->get_tag_names( $html ) );

		$iframe = $this->get_iframe( $html );
		$this->assertSame( $payload, $iframe->get_attribute( 'title' ) );
		$this->assertSame( $payload, $iframe->get_attribute( 'id' ) );
		$this->assertNull( $iframe->get_attribute( 'onload' ) );
	}

	/**
	 * Allowlisted, `aria-*` and `data-*` attributes are rendered.
	 *
	 * @dataProvider data_allowed_iframe_attributes
	 *
	 * @param string $key           Stored attribute name.
	 * @param string $value         Stored attribute value.
	 * @param string $expected_name Rendered attribute name.
	 */
	public function test_allowed_iframe_attributes_are_rendered( string $key, string $value, string $expected_name ): void {
		$html = $this->render_with_iframe_attributes(
			[
				[
					'key'   => $key,
					'value' => $value,
				],
			]
		);

		$this->assertSame( $value, $this->get_iframe( $html )->get_attribute( $expected_name ) );
	}

	/**
	 * Data provider.
	 *
	 * @return array[]
	 */
	public function data_allowed_iframe_attributes(): array {
		return [
			'id'             => [ 'id', 'player', 'id' ],
			'referrerpolicy' => [ 'referrerpolicy', 'no-referrer', 'referrerpolicy' ],
			'sandbox'        => [ 'sandbox', 'allow-scripts allow-same-origin', 'sandbox' ],
			'aria attribute' => [ 'aria-label', 'Video player', 'aria-label' ],
			'data attribute' => [ 'data-video-id', '42', 'data-video-id' ],
			'uppercase name' => [ 'ID', 'player', 'id' ],
		];
	}

	/**
	 * Any other attribute name is dropped and cannot override core attributes.
	 *
	 * @dataProvider data_rejected_iframe_attribute_names
	 *
	 * @param string $key Stored attribute name.
	 */
	public function test_rejected_iframe_attributes_are_dropped( string $key ): void {
		$html = $this->render_with_iframe_attributes(
			[
				[
					'key'   => $key,
					'value' => 'alert(1)',
				],
			]
		);

		$this->assertSame( [ 'DIV', 'IFRAME' ], $this->get_tag_names( $html ) );

		$iframe = $this->get_iframe( $html );
		$this->assertSame( [ 'title', 'src', 'loading' ], $iframe->get_attribute_names_with_prefix( '' ) );
		$this->assertSame( self::URL, $iframe->get_attribute( 'src' ) );
		$this->assertSame( self::TITLE, $iframe->get_attribute( 'title' ) );
		$this->assertSame( 'eager', $iframe->get_attribute( 'loading' ) );
	}

	/**
	 * Data provider.
	 *
	 * @return array[]
	 */
	public function data_rejected_iframe_attribute_names(): array {
		return [
			'event handler'            => [ 'onload' ],
			'uppercase event handler'  => [ 'ONLOAD' ],
			'srcdoc'                   => [ 'srcdoc' ],
			'allowpaymentrequest'      => [ 'allowpaymentrequest' ],
			'style'                    => [ 'style' ],
			'src override'             => [ 'src' ],
			'title override'           => [ 'title' ],
			'loading override'         => [ 'loading' ],
			'name with a space'        => [ 'id onload' ],
			'name with a quote'        => [ 'data-x" onload="alert(1)' ],
			'name with an equals sign' => [ 'id=x' ],
			'name with a slash'        => [ 'data-x/onload' ],
			'name starting by a digit' => [ '1data-x' ],
			'underscore prefix'        => [ 'data_x' ],
		];
	}

	/**
	 * Entries without a key are skipped without breaking the other ones.
	 */
	public function test_entries_without_key_are_skipped(): void {
		$html = $this->render_with_iframe_attributes(
			[
				[ 'value' => 'orphan' ],
				[
					'key'   => '',
					'value' => 'empty',
				],
				[
					'key'   => 'id',
					'value' => 'player',
				],
			]
		);

		$iframe = $this->get_iframe( $html );
		$this->assertSame( [ 'title', 'src', 'loading', 'id' ], $iframe->get_attribute_names_with_prefix( '' ) );
		$this->assertSame( 'player', $iframe->get_attribute( 'id' ) );
	}

	/**
	 * The boolean `allowfullscreen` attribute is rendered bare, or not at all.
	 *
	 * @dataProvider data_allowfullscreen_values
	 *
	 * @param string $value    Stored attribute value.
	 * @param bool   $expected Whether the attribute is rendered.
	 */
	public function test_allowfullscreen_is_rendered_as_boolean( string $value, bool $expected ): void {
		$html = $this->render_with_iframe_attributes(
			[
				[
					'key'   => 'allowfullscreen',
					'value' => $value,
				],
			]
		);

		$this->assertSame( $expected ? true : null, $this->get_iframe( $html )->get_attribute( 'allowfullscreen' ) );
	}

	/**
	 * Data provider.
	 *
	 * @return array[]
	 */
	public function data_allowfullscreen_values(): array {
		return [
			'true'  => [ 'true', true ],
			'empty' => [ '', true ],
			'false' => [ 'false', false ],
			'other' => [ '1', false ],
		];
	}

	/**
	 * Only low-risk Permissions Policy features survive in `allow`.
	 *
	 * @dataProvider data_allow_values
	 *
	 * @param string      $value    Stored `allow` value.
	 * @param string|null $expected Rendered value, null when the attribute is omitted.
	 */
	public function test_allow_value_is_reduced_to_allowed_features( string $value, ?string $expected ): void {
		$html = $this->render_with_iframe_attributes(
			[
				[
					'key'   => 'allow',
					'value' => $value,
				],
			]
		);

		$this->assertSame( $expected, $this->get_iframe( $html )->get_attribute( 'allow' ) );
	}

	/**
	 * Data provider.
	 *
	 * @return array[]
	 */
	public function data_allow_values(): array {
		return [
			'allowed features'          => [ 'autoplay; fullscreen', 'autoplay; fullscreen' ],
			'every allowed feature'     => [
				'accelerometer; autoplay; clipboard-write; encrypted-media; fullscreen; gyroscope; picture-in-picture; web-share',
				'accelerometer; autoplay; clipboard-write; encrypted-media; fullscreen; gyroscope; picture-in-picture; web-share',
			],
			'sensitive features'        => [ 'camera; autoplay; microphone; geolocation; payment; display-capture', 'autoplay' ],
			'origin lists'              => [ "fullscreen https://evil.example 'self'; autoplay *", 'fullscreen; autoplay' ],
			'duplicates and case'       => [ 'autoplay; AUTOPLAY ;autoplay', 'autoplay' ],
			'no separator spacing'      => [ 'autoplay;fullscreen;', 'autoplay; fullscreen' ],
			'only sensitive features'   => [ 'camera; microphone', null ],
			'empty value'               => [ '', null ],
			'unknown feature'           => [ 'not-a-feature', null ],
			'attribute injection'       => [ 'autoplay" onload="alert(1)', null ],
			'feature followed by quote' => [ 'autoplay "onload=alert(1)', 'autoplay' ],
		];
	}

	/**
	 * The feature allowlist can be extended through its filter.
	 */
	public function test_allowed_features_filter_can_add_a_feature(): void {
		add_filter(
			'blockparty_iframe_allowed_features',
			static function ( array $features ): array {
				$features[] = 'camera';

				return $features;
			}
		);

		$html = $this->render_with_iframe_attributes(
			[
				[
					'key'   => 'allow',
					'value' => 'camera; autoplay; microphone',
				],
			]
		);

		$this->assertSame( 'camera; autoplay', $this->get_iframe( $html )->get_attribute( 'allow' ) );
	}

	/**
	 * The feature allowlist can be emptied through its filter.
	 */
	public function test_allowed_features_filter_can_remove_every_feature(): void {
		add_filter( 'blockparty_iframe_allowed_features', '__return_empty_array' );

		$html = $this->render_with_iframe_attributes(
			[
				[
					'key'   => 'allow',
					'value' => 'autoplay; fullscreen',
				],
			]
		);

		$this->assertNull( $this->get_iframe( $html )->get_attribute( 'allow' ) );
	}
}
