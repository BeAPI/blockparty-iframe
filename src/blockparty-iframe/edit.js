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
 * The edit function describes the structure of your block in the context of the
 * editor. This represents what the editor will render when the block is used.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-edit-save/#edit
 *
 * @return {Element} Element to render.
 */
export default function Edit( { attributes, setAttributes } ) {
	const blockProps = useBlockProps();
	const { lazyload, title: initialTitle, url: initialUrl } = attributes;

	// State local pour les champs TextControl
	const [ iframeData, setIframeData ] = useState( {
		url: initialUrl || '',
		title: initialTitle || '',
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
						'Fill the URL and the title of the iframe.',
						'blockparty-iframe'
					) }
				>
					<div style={ { width: '100%' } }>
						<TextControl
							label={ __( 'URL', 'blockparty-iframe' ) }
							value={ iframeData.url }
							onChange={ ( value ) =>
								setIframeData( { ...iframeData, url: value } )
							}
							placeholder="https://..."
							type="url"
							help={
								iframeData.url.length &&
								! isURL( iframeData.url )
									? __(
											'The URL is invalid.',
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
				/>
			) }
		</div>
	);
}
