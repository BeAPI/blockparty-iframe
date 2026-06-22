<?php

namespace Blockparty\Iframe;

class BlockRenderer {

	/**
	 * Render the iframe block on the front end.
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

		if ( '' === $url || '' === $title ) {
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
			esc_url( $url ),
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

			$key   = (string) $attribute['key'];
			$value = isset( $attribute['value'] ) ? (string) $attribute['value'] : '';

			if ( self::is_excluded_iframe_attribute( $key ) ) {
				continue;
			}

			if ( self::is_boolean_attribute( $key ) ) {
				if ( 'true' === $value || '' === $value ) {
					$html .= ' ' . esc_attr( strtolower( $key ) );
				}
				continue;
			}

			$html .= sprintf(
				' %1$s="%2$s"',
				esc_attr( $key ),
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
			'allowpaymentrequest',
		];

		return in_array( strtolower( $attribute_name ), $boolean_attrs, true );
	}

	/**
	 * Check if an iframe attribute should be excluded from custom output.
	 *
	 * @param string $attribute_name Attribute name.
	 *
	 * @return bool
	 */
	private static function is_excluded_iframe_attribute( string $attribute_name ): bool {
		$excluded_attrs = [
			'src',
			'loading',
			'title',
			'width',
			'height',
			'style',
			'frameborder',
			'marginwidth',
			'marginheight',
			'scrolling',
			'align',
			'longdesc',
			'name',
		];

		return in_array( strtolower( $attribute_name ), $excluded_attrs, true );
	}
}
