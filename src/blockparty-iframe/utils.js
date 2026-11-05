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
 * Iframe attribute names that can be added by editors.
 *
 * Any other attribute (event handlers such as `onload`, `srcdoc`, …) is
 * dropped: block attributes are controlled by users who may not have the
 * `unfiltered_html` capability. Keep in sync with BlockRenderer.php.
 */
const ALLOWED_ATTRIBUTES = [
	'allow',
	'allowfullscreen',
	'allowpaymentrequest',
	'id',
	'referrerpolicy',
	'sandbox',
];

/**
 * Check if an iframe attribute can be rendered.
 *
 * @param {string} attributeName - The name of the attribute to check.
 * @return {boolean} True if the attribute is allowed, false otherwise.
 */
export function isAllowedIframeAttribute( attributeName ) {
	if ( typeof attributeName !== 'string' ) {
		return false;
	}

	const name = attributeName.toLowerCase();

	if ( ! /^[a-z][a-z0-9-]*$/.test( name ) ) {
		return false;
	}

	return (
		ALLOWED_ATTRIBUTES.includes( name ) ||
		/^(aria|data)-[a-z0-9-]+$/.test( name )
	);
}

/**
 * Check if a URL can be used as iframe source (http or https only).
 *
 * @param {string} url - The URL to check.
 * @return {boolean} True if the URL is safe, false otherwise.
 */
export function isSafeIframeUrl( url ) {
	if ( typeof url !== 'string' || ! url.length ) {
		return false;
	}

	try {
		const { protocol } = new URL( url );
		return protocol === 'http:' || protocol === 'https:';
	} catch ( error ) {
		return false;
	}
}

/**
 * Convert an iframe attributes array to a React props object, without filtering.
 *
 * Only meant for the deprecated save function, whose output must match the
 * markup previously stored in post content and is never mounted in the DOM.
 *
 * @param {Array} attributes - Array of {key, value} objects.
 * @return {Object} Props object for React component.
 */
export function convertAttributesToRawProps( attributes ) {
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
 * Convert iframe attributes array to props object for React.
 * Drops non allowed attributes, handles boolean attributes and React prop
 * name mapping.
 *
 * @param {Array} attributes - Array of {key, value} objects.
 * @return {Object} Props object for React component.
 */
export function convertAttributesToProps( attributes ) {
	return convertAttributesToRawProps(
		( attributes || [] ).filter( ( attr ) =>
			isAllowedIframeAttribute( attr?.key )
		)
	);
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
	const match = value.match( iframeRegex );

	if ( ! match ) {
		return null;
	}

	// Extract only the opening tag (ignore any content inside iframe)
	const iframeTag = match[ 0 ];

	// Parse in an inert document so nothing is loaded or executed.
	const doc = new window.DOMParser().parseFromString(
		iframeTag + '</iframe>',
		'text/html'
	);
	const iframeElement = doc.querySelector( 'iframe' );

	if ( ! iframeElement ) {
		return null;
	}

	// Extract src attribute
	const src = iframeElement.getAttribute( 'src' ) || '';

	// Extract title attribute
	const title = iframeElement.getAttribute( 'title' ) || '';

	// Extract other allowed attributes only
	const attributes = [];

	for ( const attr of iframeElement.attributes ) {
		if ( isAllowedIframeAttribute( attr.name ) ) {
			// For boolean attributes, store 'true' as value if present
			const attrValue = isBooleanAttribute( attr.name )
				? 'true'
				: attr.value;

			attributes.push( {
				key: attr.name,
				value: attrValue,
			} );
		}
	}

	return {
		url: src,
		title,
		attributes,
	};
}
