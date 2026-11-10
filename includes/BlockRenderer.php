<?php

namespace Blockparty\Iframe;

class BlockRenderer {

	/**
	 * URL protocols allowed for the iframe source.
	 *
	 * @var string[]
	 */
	private const ALLOWED_PROTOCOLS = [ 'http', 'https' ];

	/**
	 * Iframe attribute names that can be added by editors.
	 *
	 * Any other attribute (event handlers such as `onload`, `srcdoc`, …) is
	 * dropped, since block attributes are controlled by users who may not
	 * have the `unfiltered_html` capability.
	 *
	 * @var string[]
	 */
	private const ALLOWED_ATTRIBUTES = [
		'allow',
		'allowfullscreen',
		'id',
		'referrerpolicy',
		'sandbox',
	];

	/**
	 * Permissions Policy features that editors can delegate through `allow`.
	 *
	 * Sensitive features (camera, microphone, geolocation, display-capture,
	 * payment…) are left out: users without `unfiltered_html` must not be
	 * able to grant them to a third-party document on behalf of the site.
	 *
	 * @var string[]
	 */
	private const ALLOWED_FEATURES = [
		'accelerometer',
		'autoplay',
		'clipboard-write',
		'encrypted-media',
		'fullscreen',
		'gyroscope',
		'picture-in-picture',
		'web-share',
	];

	/**
	 * Render the iframe block, on the front end and in the editor preview
	 * (ServerSideRender), so attribute filtering only lives here.
	 *
	 * @param array $attributes Block attributes.
	 *
	 * @return string
	 */
	public static function render( $attributes ) {
		$url               = isset( $attributes['url'] ) ? trim( (string) $attributes['url'] ) : '';
		$title             = isset( $attributes['title'] ) ? trim( (string) $attributes['title'] ) : '';
		$lazyload          = ! empty( $attributes['lazyload'] );
		$iframe_attributes = isset( $attributes['iframeAttributes'] ) && is_array( $attributes['iframeAttributes'] )
			? $attributes['iframeAttributes']
			: [];

		$safe_url = '' !== $url ? esc_url( $url, self::ALLOWED_PROTOCOLS ) : '';

		if ( '' === $safe_url || '' === $title ) {
			return sprintf(
				'<div %s></div>',
				get_block_wrapper_attributes()
			);
		}

		$loading     = $lazyload ? 'lazy' : 'eager';
		$extra_attrs = self::build_iframe_attribute_string( $iframe_attributes );

		$iframe_html = sprintf(
			'<iframe title="%1$s" src="%2$s" loading="%3$s"%4$s></iframe>',
			esc_attr( $title ),
			$safe_url,
			esc_attr( $loading ),
			$extra_attrs
		);

		return sprintf(
			'<div %1$s>%2$s</div>',
			get_block_wrapper_attributes(),
			$iframe_html
		);
	}

	/**
	 * Build additional iframe attributes from stored key/value pairs.
	 *
	 * @param array $attributes Iframe attribute pairs.
	 *
	 * @return string
	 */
	private static function build_iframe_attribute_string( array $attributes ): string {
		$html = '';

		foreach ( $attributes as $attribute ) {
			if ( ! is_array( $attribute ) || empty( $attribute['key'] ) ) {
				continue;
			}

			$key   = strtolower( (string) $attribute['key'] );
			$value = isset( $attribute['value'] ) ? (string) $attribute['value'] : '';

			if ( ! self::is_allowed_iframe_attribute( $key ) ) {
				continue;
			}

			if ( 'allow' === $key ) {
				$value = self::sanitize_allow_value( $value );

				if ( '' === $value ) {
					continue;
				}
			}

			if ( self::is_boolean_attribute( $key ) ) {
				if ( 'true' === $value || '' === $value ) {
					$html .= ' ' . $key;
				}
				continue;
			}

			$html .= sprintf(
				' %1$s="%2$s"',
				$key,
				esc_attr( $value )
			);
		}

		return $html;
	}

	/**
	 * Check if an iframe attribute is boolean in HTML.
	 *
	 * @param string $attribute_name Attribute name.
	 *
	 * @return bool
	 */
	private static function is_boolean_attribute( string $attribute_name ): bool {
		$boolean_attrs = [
			'allowfullscreen',
		];

		return in_array( strtolower( $attribute_name ), $boolean_attrs, true );
	}

	/**
	 * Keep only allowlisted features from an `allow` Permissions Policy value.
	 *
	 * Origin lists are dropped, so each kept feature defaults to the iframe
	 * source origin only.
	 *
	 * @param string $value Raw `allow` attribute value.
	 *
	 * @return string Sanitized value, empty when no feature is kept.
	 */
	private static function sanitize_allow_value( string $value ): string {
		/**
		 * Filters the Permissions Policy features that editors can delegate to an iframe.
		 *
		 * @param string[] $features Allowed feature names.
		 */
		$features = (array) apply_filters( 'blockparty_iframe_allowed_features', self::ALLOWED_FEATURES );
		$kept     = [];

		foreach ( explode( ';', $value ) as $directive ) {
			$parts = preg_split( '/\s+/', trim( $directive ) );
			$name  = is_array( $parts ) ? strtolower( $parts[0] ) : '';

			if ( '' !== $name && in_array( $name, $features, true ) ) {
				$kept[ $name ] = $name;
			}
		}

		return implode( '; ', $kept );
	}

	/**
	 * Check if an iframe attribute can be output.
	 *
	 * The name must be a plain lowercase attribute name (no whitespace, quotes
	 * or `=`), and either be allowlisted or be an `aria-*` / `data-*` attribute.
	 *
	 * @param string $attribute_name Lowercased attribute name.
	 *
	 * @return bool
	 */
	private static function is_allowed_iframe_attribute( string $attribute_name ): bool {
		if ( 1 !== preg_match( '/^[a-z][a-z0-9-]*$/', $attribute_name ) ) {
			return false;
		}

		return in_array( $attribute_name, self::ALLOWED_ATTRIBUTES, true )
			|| str_starts_with( $attribute_name, 'aria-' )
			|| str_starts_with( $attribute_name, 'data-' );
	}
}
