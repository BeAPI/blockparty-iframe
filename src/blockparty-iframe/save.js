/**
 * React hook that is used to mark the block wrapper element.
 * It provides all the necessary props like the class name.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-block-editor/#useblockprops
 */
import { useBlockProps } from '@wordpress/block-editor';

/**
 * Map HTML attribute names to React prop names.
 *
 * @param {string} attributeName - The HTML attribute name.
 * @return {string} The React prop name.
 */
function mapHtmlAttributeToReact( attributeName ) {
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
function isBooleanAttribute( attributeName ) {
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
function convertAttributesToProps( attributes ) {
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
 * The save function defines the way in which the different attributes should
 * be combined into the final markup, which is then serialized by the block
 * editor into `post_content`.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-edit-save/#save
 *
 * @return {Element} Element to render.
 */
export default function save( { attributes } ) {
	const { lazyload, title, url, iframeAttributes } = attributes;

	if ( ! url || ! title ) {
		return <div { ...useBlockProps.save() } />;
	}

	return (
		<div { ...useBlockProps.save() }>
			<iframe
				title={ title }
				src={ url }
				loading={ lazyload ? 'lazy' : 'eager' }
				{ ...convertAttributesToProps( iframeAttributes ) }
			/>
		</div>
	);
}
