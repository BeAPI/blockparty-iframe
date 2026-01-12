/**
 * Utility functions for iframe attribute handling.
 */

/**
 * Map HTML attribute names to React prop names.
 *
 * @param {string} attributeName - The HTML attribute name.
 * @return {string} The React prop name.
 */
export function mapHtmlAttributeToReact( attributeName ) {
	const attributeMap = {
		allowfullscreen: 'allowFullScreen',
		allowpaymentrequest: 'allowPaymentRequest',
		referrerpolicy: 'referrerPolicy',
	};

	return attributeMap[ attributeName.toLowerCase() ] || attributeName;
}

/**
 * Check if an attribute is a boolean HTML attribute.
 *
 * @param {string} attributeName - The name of the attribute to check.
 * @return {boolean} True if the attribute is boolean, false otherwise.
 */
export function isBooleanAttribute( attributeName ) {
	const booleanAttrs = [ 'allowfullscreen', 'allowpaymentrequest' ];

	return booleanAttrs.includes( attributeName.toLowerCase() );
}

/**
 * Convert iframe attributes array to props object for React.
 * Handles boolean attributes and React prop name mapping correctly.
 *
 * @param {Array} attributes - Array of {key, value} objects.
 * @return {Object} Props object for React component.
 */
export function convertAttributesToProps( attributes ) {
	return Object.fromEntries(
		( attributes || [] ).map( ( attr ) => {
			// Map HTML attribute name to React prop name
			const propName = mapHtmlAttributeToReact( attr.key );

			// Convert 'true' string to boolean for boolean attributes
			const value =
				isBooleanAttribute( attr.key ) && attr.value === 'true'
					? true
					: attr.value;

			return [ propName, value ];
		} )
	);
}

/**
 * Check if an iframe attribute should be excluded.
 *
 * @param {string} attributeName - The name of the attribute to check.
 * @return {boolean} True if the attribute should be excluded, false otherwise.
 */
export function isExcludedIframeAttribute( attributeName ) {
	const excludedAttrs = [
		'src', // Managed separately
		'loading', // Managed by lazyload option
		'title', // Managed separately
		'width', // Managed by block dimension supports
		'height', // Managed by block dimension supports
		'frameborder', // Deprecated HTML attribute
		'marginwidth', // Deprecated HTML attribute
		'marginheight', // Deprecated HTML attribute
		'scrolling', // Deprecated HTML attribute
		'align', // Deprecated HTML attribute
		'longdesc', // Deprecated HTML attribute
		'name', // Can cause conflicts
	];

	return excludedAttrs.includes( attributeName.toLowerCase() );
}

/**
 * Parse iframe HTML code and extract src URL, title, and attributes.
 *
 * @param {string} value - The value that could be a URL or iframe HTML code.
 * @return {Object|null} Object with url, title, and attributes array, or null if not an iframe.
 */
export function parseIframeCode( value ) {
	// Check if the value contains iframe tag
	const iframeRegex = /<iframe[^>]*>/i;
	if ( ! iframeRegex.test( value ) ) {
		return null;
	}

	// Create a temporary DOM element to parse the HTML
	const tempDiv = document.createElement( 'div' );
	tempDiv.innerHTML = value;
	const iframeElement = tempDiv.querySelector( 'iframe' );

	if ( ! iframeElement ) {
		return null;
	}

	// Extract src attribute
	const src = iframeElement.getAttribute( 'src' ) || '';

	// Extract title attribute
	const title = iframeElement.getAttribute( 'title' ) || '';

	// Extract all other attributes (excluding managed and deprecated ones)
	const attributes = [];

	for ( const attr of iframeElement.attributes ) {
		if ( ! isExcludedIframeAttribute( attr.name ) ) {
			// For boolean attributes, store 'true' as value if present
			const value = isBooleanAttribute( attr.name ) ? 'true' : attr.value;

			attributes.push( {
				key: attr.name,
				value,
			} );
		}
	}

	return {
		url: src,
		title,
		attributes,
	};
}
