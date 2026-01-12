/**
 * React hook that is used to mark the block wrapper element.
 * It provides all the necessary props like the class name.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-block-editor/#useblockprops
 */
import { useBlockProps } from '@wordpress/block-editor';
import { convertAttributesToProps } from './utils';

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
