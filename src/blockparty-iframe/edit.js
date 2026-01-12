/**
 * Retrieves the translation of text.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-i18n/
 */
import { __ } from '@wordpress/i18n';

/**
 * React hook that is used to mark the block wrapper element.
 * It provides all the necessary props like the class name.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-block-editor/#useblockprops
 */
import {
	useBlockProps,
	BlockControls,
	InspectorControls,
} from '@wordpress/block-editor';

import {
	Button,
	PanelBody,
	Placeholder,
	TextControl,
	ToggleControl,
	ToolbarGroup,
	ToolbarButton,
} from '@wordpress/components';
import { isURL } from '@wordpress/url';

import { useState } from '@wordpress/element';

/**
 * Lets webpack process CSS, SASS or SCSS files referenced in JavaScript files.
 * Those files can contain any CSS code that gets applied to the editor.
 *
 * @see https://www.npmjs.com/package/@wordpress/scripts#using-css
 */
import './editor.scss';

import { aspectRatio } from '@wordpress/icons';

/**
 * Check if an iframe attribute should be excluded.
 *
 * @param {string} attributeName - The name of the attribute to check.
 * @return {boolean} True if the attribute should be excluded, false otherwise.
 */
function isExcludedIframeAttribute( attributeName ) {
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
 * Parse iframe HTML code and extract src URL, title, and attributes.
 *
 * @param {string} value - The value that could be a URL or iframe HTML code.
 * @return {Object|null} Object with url, title, and attributes array, or null if not an iframe.
 */
function parseIframeCode( value ) {
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

/**
 * The edit function describes the structure of your block in the context of the
 * editor. This represents what the editor will render when the block is used.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-edit-save/#edit
 *
 * @return {Element} Element to render.
 */
export default function Edit( { attributes, setAttributes } ) {
	const blockProps = useBlockProps();
	const {
		lazyload,
		title: initialTitle,
		url: initialUrl,
		iframeAttributes: initialAttributes,
	} = attributes;

	// State local pour les champs TextControl
	const [ iframeData, setIframeData ] = useState( {
		url: initialUrl || '',
		title: initialTitle || '',
		iframeAttributes: initialAttributes || [],
	} );

	// hasConfirmed = l’utilisateur a validé l’ajout de l’iframe
	const initialConfirmed = Boolean(
		iframeData.url?.length &&
			isURL( iframeData.url ) &&
			iframeData.title?.length
	);
	const [ hasConfirmed, setHasConfirmed ] = useState( initialConfirmed );

	// Validation
	const isIframeElligible = Boolean(
		iframeData.url?.length &&
			isURL( iframeData.url ) &&
			iframeData.title?.length
	);

	const showPlaceholder = ! hasConfirmed;
	const showIframe = hasConfirmed && isIframeElligible;

	// Handle URL/iframe code change
	function handleUrlChange( value ) {
		// Try to parse as iframe code
		const parsed = parseIframeCode( value );

		if ( parsed ) {
			// It's an iframe code, extract URL, title, and attributes
			setIframeData( {
				...iframeData,
				url: parsed.url,
				title: parsed.title || iframeData.title, // Use extracted title if available, otherwise keep current
				iframeAttributes: parsed.attributes,
			} );
		} else {
			// It's a regular URL
			setIframeData( {
				...iframeData,
				url: value,
				iframeAttributes: [],
			} );
		}
	}

	// Handle clic Add iframe
	function handleAddIframeButtonClick() {
		setAttributes( { ...attributes, ...iframeData } );
		setHasConfirmed( true );
	}

	return (
		<div { ...blockProps }>
			{ isIframeElligible && (
				<BlockControls>
					<ToolbarGroup>
						<ToolbarButton
							onClick={ () => setHasConfirmed( ! hasConfirmed ) }
						>
							{ hasConfirmed
								? __( 'Replace', 'blockparty-iframe' )
								: __( 'View', 'blockparty-iframe' ) }
						</ToolbarButton>
					</ToolbarGroup>
				</BlockControls>
			) }

			<InspectorControls>
				<PanelBody title={ __( 'Settings', 'blockparty-iframe' ) }>
					<ToggleControl
						label={ __(
							'Enable lazyloading',
							'blockparty-iframe'
						) }
						checked={ lazyload }
						onChange={ ( value ) =>
							setAttributes( { lazyload: value } )
						}
					/>
				</PanelBody>
			</InspectorControls>

			{ showPlaceholder && (
				<Placeholder
					icon={ aspectRatio }
					label={ __( 'Iframe', 'blockparty-iframe' ) }
					instructions={ __(
						'Fill the URL or paste iframe code, and the title of the iframe.',
						'blockparty-iframe'
					) }
				>
					<div style={ { width: '100%' } }>
						<TextControl
							label={ __(
								'URL or iframe code',
								'blockparty-iframe'
							) }
							value={ iframeData.url }
							onChange={ handleUrlChange }
							placeholder="https://... or <iframe>...</iframe>"
							help={
								iframeData.url.length &&
								! isURL( iframeData.url )
									? __(
											'The URL is invalid.',
											'blockparty-iframe'
									  )
									: iframeData.iframeAttributes.length > 0
									? __(
											'Iframe code detected. Attributes extracted.',
											'blockparty-iframe'
									  )
									: ''
							}
						/>

						<TextControl
							label={ __( 'Title', 'blockparty-iframe' ) }
							value={ iframeData.title }
							onChange={ ( value ) =>
								setIframeData( { ...iframeData, title: value } )
							}
							help={ __(
								'The title of the iframe is used for accessibility purposes and it will only be visible to screen readers.',
								'blockparty-iframe'
							) }
						/>

						<Button
							variant="primary"
							onClick={ handleAddIframeButtonClick }
							disabled={ ! isIframeElligible }
						>
							{ __( 'Add iframe', 'blockparty-iframe' ) }
						</Button>
					</div>
				</Placeholder>
			) }

			{ showIframe && (
				<iframe
					title={ iframeData.title }
					src={ iframeData.url }
					loading={ lazyload ? 'lazy' : 'eager' }
					{ ...convertAttributesToProps(
						iframeData.iframeAttributes
					) }
				/>
			) }
		</div>
	);
}
