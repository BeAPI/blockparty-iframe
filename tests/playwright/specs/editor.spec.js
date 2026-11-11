/**
 * Internal dependencies
 */
import { test, expect } from '../utils/fixtures';

test.describe( 'Iframe block in the editor', () => {
	test.beforeEach( async ( { admin } ) => {
		await admin.createNewPost();
	} );

	test.afterAll( async ( { requestUtils } ) => {
		await requestUtils.deleteAllPosts();
	} );

	test( 'only enables "Add iframe" with a safe source and a title', async ( {
		iframeBlock,
		iframeUrl,
	} ) => {
		await iframeBlock.insert();

		await expect( iframeBlock.source ).toBeVisible();
		await expect( iframeBlock.title ).toBeVisible();
		await expect( iframeBlock.addButton ).toBeDisabled();

		await iframeBlock.fill( { source: iframeUrl } );
		await expect( iframeBlock.addButton ).toBeDisabled();

		await iframeBlock.fill( {
			source: 'javascript:alert(1)', // eslint-disable-line no-script-url
			title: 'Unsafe source',
		} );
		await expect( iframeBlock.addButton ).toBeDisabled();

		await iframeBlock.fill( { source: iframeUrl } );
		await expect( iframeBlock.addButton ).toBeEnabled();
	} );

	test( 'previews the form with "View" before saving it', async ( {
		editor,
		iframeBlock,
		iframeUrl,
	} ) => {
		await iframeBlock.insert();
		await iframeBlock.fill( { source: iframeUrl, title: 'Draft title' } );

		await editor.clickBlockToolbarButton( 'View' );

		await expect( iframeBlock.preview ).toHaveAttribute( 'src', iframeUrl );
		await expect( iframeBlock.preview ).toHaveAttribute(
			'title',
			'Draft title'
		);
		await expect( iframeBlock.source ).toBeHidden();

		// The preview comes from the form: nothing is stored yet.
		expect( await iframeBlock.getAttributes() ).toMatchObject( {
			url: '',
			title: '',
		} );
	} );

	test( 'stores the attributes and renders the server-side preview', async ( {
		iframeBlock,
		iframeUrl,
	} ) => {
		await iframeBlock.insertAndAdd( {
			source: iframeUrl,
			title: 'Embedded content',
		} );

		await expect( iframeBlock.preview ).toHaveAttribute( 'src', iframeUrl );
		await expect( iframeBlock.preview ).toHaveAttribute(
			'title',
			'Embedded content'
		);
		await expect( iframeBlock.preview ).toHaveAttribute(
			'loading',
			'eager'
		);
		await expect( iframeBlock.source ).toBeHidden();

		expect( await iframeBlock.getAttributes() ).toMatchObject( {
			url: iframeUrl,
			title: 'Embedded content',
			lazyload: false,
			iframeAttributes: [],
		} );
	} );

	test( 'reads pasted iframe code and filters it in the preview', async ( {
		iframeBlock,
		iframeUrl,
	} ) => {
		await iframeBlock.insert();
		await iframeBlock.fill( {
			source: `<iframe width="560" src="${ iframeUrl }" title="Pasted title" allow="autoplay; camera" allowfullscreen onload="alert(1)"></iframe>`,
		} );

		await expect( iframeBlock.source ).toHaveValue( iframeUrl );
		await expect( iframeBlock.title ).toHaveValue( 'Pasted title' );

		await iframeBlock.addButton.click();

		// Attributes are stored as pasted, then filtered by the PHP renderer.
		expect( await iframeBlock.getAttributes() ).toMatchObject( {
			url: iframeUrl,
			title: 'Pasted title',
			iframeAttributes: [
				{ key: 'allow', value: 'autoplay; camera' },
				{ key: 'allowfullscreen', value: 'true' },
			],
		} );

		await expect( iframeBlock.preview ).toHaveAttribute( 'src', iframeUrl );
		await expect( iframeBlock.preview ).toHaveAttribute(
			'allow',
			'autoplay'
		);
		await expect( iframeBlock.preview ).toHaveAttribute(
			'allowfullscreen',
			''
		);
		await expect( iframeBlock.preview ).not.toHaveAttribute( 'onload' );
		await expect( iframeBlock.preview ).not.toHaveAttribute( 'width' );
	} );

	test( 'switches the preview to lazy loading from the inspector', async ( {
		editor,
		page,
		iframeBlock,
		iframeUrl,
	} ) => {
		await iframeBlock.insertAndAdd( {
			source: iframeUrl,
			title: 'Embedded content',
		} );
		await expect( iframeBlock.preview ).toHaveAttribute(
			'loading',
			'eager'
		);

		await editor.openDocumentSettingsSidebar();
		await page
			.getByRole( 'region', { name: 'Editor settings' } )
			.getByRole( 'checkbox', { name: 'Enable lazyloading' } )
			.check();

		await expect( iframeBlock.preview ).toHaveAttribute(
			'loading',
			'lazy'
		);
		expect( await iframeBlock.getAttributes() ).toMatchObject( {
			lazyload: true,
		} );
	} );

	test( 'goes back to the filled form with "Replace"', async ( {
		editor,
		iframeBlock,
		iframeUrl,
	} ) => {
		await iframeBlock.insertAndAdd( {
			source: iframeUrl,
			title: 'Embedded content',
		} );
		await expect( iframeBlock.preview ).toBeVisible();

		await editor.clickBlockToolbarButton( 'Replace' );

		await expect( iframeBlock.preview ).toBeHidden();
		await expect( iframeBlock.source ).toHaveValue( iframeUrl );
		await expect( iframeBlock.title ).toHaveValue( 'Embedded content' );
		await expect( iframeBlock.addButton ).toBeEnabled();
	} );

	test( 'migrates the static markup saved before the block was dynamic', async ( {
		admin,
		page,
		requestUtils,
		iframeBlock,
		iframeUrl,
	} ) => {
		const attributes = { title: 'Legacy iframe', url: iframeUrl };
		const { id } = await requestUtils.createPost( {
			title: 'Legacy iframe markup',
			status: 'draft',
			content: `<!-- wp:blockparty/iframe ${ JSON.stringify(
				attributes
			) } -->
<div class="wp-block-blockparty-iframe"><iframe title="${
				attributes.title
			}" src="${ attributes.url }" loading="eager"></iframe></div>
<!-- /wp:blockparty/iframe -->`,
		} );

		await admin.editPost( id );

		await expect( iframeBlock.preview ).toHaveAttribute( 'src', iframeUrl );
		await expect( iframeBlock.preview ).toHaveAttribute(
			'title',
			'Legacy iframe'
		);

		const migrated = await page.evaluate( () => {
			const blocks = window.wp.data
				.select( 'core/block-editor' )
				.getBlocks();

			return {
				validity: blocks.map( ( block ) => block.isValid ),
				content: window.wp.blocks.serialize( blocks ),
			};
		} );

		expect( migrated.validity ).toEqual( [ true ] );
		// The block is now dynamic: it no longer saves any markup.
		expect( migrated.content ).toBe(
			`<!-- wp:blockparty/iframe ${ JSON.stringify( attributes ) } /-->`
		);
	} );
} );
