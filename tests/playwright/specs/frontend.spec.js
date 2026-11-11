/**
 * Internal dependencies
 */
import { test, expect } from '../utils/fixtures';

test.describe( 'Iframe block on the front end', () => {
	test.afterAll( async ( { requestUtils } ) => {
		await requestUtils.deleteAllPosts();
	} );

	test( 'publishes the block, keeps it on reload and renders the filtered iframe', async ( {
		admin,
		editor,
		page,
		iframeBlock,
		iframeUrl,
	} ) => {
		await admin.createNewPost( { title: 'Published iframe' } );
		await iframeBlock.insert();
		await iframeBlock.fill( {
			source: `<iframe src="${ iframeUrl }" title="Published content" allow="autoplay; camera" allowfullscreen onload="alert(1)"></iframe>`,
		} );
		await iframeBlock.addButton.click();
		await expect( iframeBlock.preview ).toBeVisible();

		const postId = await editor.publishPost();

		await page.reload();
		await expect( iframeBlock.preview ).toHaveAttribute( 'src', iframeUrl );
		await expect( iframeBlock.preview ).toHaveAttribute(
			'title',
			'Published content'
		);

		await page.goto( `/?p=${ postId }` );

		const iframe = page.locator( '.wp-block-blockparty-iframe iframe' );
		await expect( iframe ).toHaveCount( 1 );
		await expect( iframe ).toHaveAttribute( 'src', iframeUrl );
		await expect( iframe ).toHaveAttribute( 'title', 'Published content' );
		await expect( iframe ).toHaveAttribute( 'loading', 'eager' );
		await expect( iframe ).toHaveAttribute( 'allow', 'autoplay' );
		await expect( iframe ).toHaveAttribute( 'allowfullscreen', '' );
		await expect( iframe ).not.toHaveAttribute( 'onload' );
	} );

	test( 'renders an empty wrapper for an unsafe source', async ( {
		page,
		requestUtils,
	} ) => {
		const attributes = {
			url: 'javascript:alert(1)', // eslint-disable-line no-script-url
			title: 'Unsafe source',
		};
		const { link } = await requestUtils.createPost( {
			title: 'Unsafe iframe',
			status: 'publish',
			content: `<!-- wp:blockparty/iframe ${ JSON.stringify(
				attributes
			) } /-->`,
		} );

		await page.goto( link );

		const wrapper = page.locator( '.wp-block-blockparty-iframe' );
		await expect( wrapper ).toHaveCount( 1 );
		await expect( wrapper.locator( 'iframe' ) ).toHaveCount( 0 );
	} );
} );
