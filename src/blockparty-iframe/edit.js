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
import { convertAttributesToProps, parseIframeCode } from './utils';

/**
 * The edit function describes the structure of your block in the context of the
 * editor. This represents what the editor will render when the block is used.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-edit-save/#edit
 *
 * @param {Object}   root0               Block edit props.
 * @param {Object}   root0.attributes    Block attributes.
 * @param {Function} root0.setAttributes Updates block attributes.
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
						'Fill the iframe source and the title of the iframe.',
						'blockparty-iframe'
					) }
				>
					<div style={ { width: '100%' } }>
						<TextControl
							label={ __( 'Source', 'blockparty-iframe' ) }
							value={ iframeData.url }
							onChange={ handleUrlChange }
							placeholder={ `https://... or <iframe src="https://..."` }
							help={ __(
								'You can either paste a URL or the iframe code.',
								'blockparty-iframe'
							) }
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
