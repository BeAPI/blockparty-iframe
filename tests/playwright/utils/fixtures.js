/**
 * WordPress dependencies
 */
import { test as base, expect } from '@wordpress/e2e-test-utils-playwright';

export const BLOCK_NAME = 'blockparty/iframe';

export const test = base.extend( {
	// Fail any test during which the page throws an uncaught JavaScript error.
	pageErrors: [
		async ( { page }, use ) => {
			const errors = [];
			page.on( 'pageerror', ( error ) => errors.push( error.message ) );

			await use( errors );

			expect( errors ).toEqual( [] );
		},
		{ auto: true },
	],

	// A source the iframes can load from the test site itself, so that no
	// test depends on a third-party host.
	iframeUrl: async ( { baseURL }, use ) => {
		await use( new URL( '/wp-includes/images/blank.gif', baseURL ).href );
	},

	// Locators and actions for the iframe block in the editor canvas.
	iframeBlock: async ( { editor }, use ) => {
		const block = editor.canvas.getByRole( 'document', {
			name: 'Block: Iframe',
		} );
		const source = block.getByLabel( 'Source', { exact: true } );
		const title = block.getByLabel( 'Title', { exact: true } );
		const addButton = block.getByRole( 'button', { name: 'Add iframe' } );

		await use( {
			block,
			source,
			title,
			addButton,
			preview: block.locator( 'iframe' ),

			async insert() {
				await editor.insertBlock( { name: BLOCK_NAME } );
			},

			async fill( values ) {
				await source.fill( values.source );

				if ( values.title !== undefined ) {
					await title.fill( values.title );
				}
			},

			async insertAndAdd( values ) {
				await this.insert();
				await this.fill( values );
				await addButton.click();
			},

			async getAttributes() {
				const blocks = await editor.getBlocks();

				return blocks[ 0 ].attributes;
			},
		} );
	},
} );

export { expect };
