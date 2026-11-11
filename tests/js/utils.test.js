/**
 * Internal dependencies
 */
import {
	convertAttributesToRawProps,
	isAllowedIframeAttribute,
	isBooleanAttribute,
	isSafeIframeUrl,
	mapHtmlAttributeToReact,
	parseIframeCode,
} from '../../src/blockparty-iframe/utils';

describe( 'isSafeIframeUrl', () => {
	it.each( [
		'https://example.org',
		'http://example.org/embed?a=1&b=2',
		'HTTPS://EXAMPLE.ORG/embed',
	] )( 'accepts the http(s) URL %s', ( url ) => {
		expect( isSafeIframeUrl( url ) ).toBe( true );
	} );

	it.each( [
		'javascript:alert(1)',
		'data:text/html,<script>alert(1)</script>',
		'ftp://example.org/file',
		'//example.org/embed',
		'/embed',
		'example.org/embed',
		'',
	] )( 'rejects %s', ( url ) => {
		expect( isSafeIframeUrl( url ) ).toBe( false );
	} );

	it.each( [ undefined, null, 42, {} ] )(
		'rejects the non-string value %p',
		( url ) => {
			expect( isSafeIframeUrl( url ) ).toBe( false );
		}
	);
} );

describe( 'isAllowedIframeAttribute', () => {
	it.each( [
		'allow',
		'allowfullscreen',
		'id',
		'referrerpolicy',
		'sandbox',
		'aria-label',
		'data-video-id',
		'ALLOW',
		'Data-Video-Id',
	] )( 'keeps %s', ( name ) => {
		expect( isAllowedIframeAttribute( name ) ).toBe( true );
	} );

	it.each( [
		'onload',
		'srcdoc',
		'src',
		'title',
		'style',
		'allowpaymentrequest',
		'data_video_id',
		'id onload',
		'data-x"',
		'id=x',
		'1data-x',
		'',
	] )( 'drops %p', ( name ) => {
		expect( isAllowedIframeAttribute( name ) ).toBe( false );
	} );

	it.each( [ undefined, null, 42 ] )(
		'drops the non-string value %p',
		( name ) => {
			expect( isAllowedIframeAttribute( name ) ).toBe( false );
		}
	);
} );

describe( 'isBooleanAttribute', () => {
	it( 'detects boolean iframe attributes whatever their case', () => {
		expect( isBooleanAttribute( 'allowfullscreen' ) ).toBe( true );
		expect( isBooleanAttribute( 'AllowFullScreen' ) ).toBe( true );
		expect( isBooleanAttribute( 'allowpaymentrequest' ) ).toBe( true );
	} );

	it( 'does not treat valued attributes as boolean', () => {
		expect( isBooleanAttribute( 'allow' ) ).toBe( false );
		expect( isBooleanAttribute( 'sandbox' ) ).toBe( false );
	} );
} );

describe( 'mapHtmlAttributeToReact', () => {
	it( 'maps the attributes React spells differently', () => {
		expect( mapHtmlAttributeToReact( 'allowfullscreen' ) ).toBe(
			'allowFullScreen'
		);
		expect( mapHtmlAttributeToReact( 'ALLOWPAYMENTREQUEST' ) ).toBe(
			'allowPaymentRequest'
		);
		expect( mapHtmlAttributeToReact( 'referrerpolicy' ) ).toBe(
			'referrerPolicy'
		);
	} );

	it( 'leaves the other attributes untouched', () => {
		expect( mapHtmlAttributeToReact( 'id' ) ).toBe( 'id' );
		expect( mapHtmlAttributeToReact( 'data-video-id' ) ).toBe(
			'data-video-id'
		);
	} );
} );

describe( 'convertAttributesToRawProps', () => {
	it( 'returns no props without attributes', () => {
		expect( convertAttributesToRawProps( [] ) ).toEqual( {} );
		expect( convertAttributesToRawProps( undefined ) ).toEqual( {} );
	} );

	// The deprecated save output must match the markup stored before 1.2.0.
	it( 'converts stored pairs to React props without filtering them', () => {
		expect(
			convertAttributesToRawProps( [
				{ key: 'allowfullscreen', value: 'true' },
				{ key: 'referrerpolicy', value: 'no-referrer' },
				{ key: 'allow', value: 'camera' },
				{ key: 'onload', value: 'alert(1)' },
			] )
		).toEqual( {
			allowFullScreen: true,
			referrerPolicy: 'no-referrer',
			allow: 'camera',
			onload: 'alert(1)',
		} );
	} );

	it( 'keeps the stored value of a boolean attribute that is not "true"', () => {
		expect(
			convertAttributesToRawProps( [
				{ key: 'allowfullscreen', value: 'false' },
			] )
		).toEqual( { allowFullScreen: 'false' } );
	} );
} );

describe( 'parseIframeCode', () => {
	it.each( [ 'https://example.org/embed', 'plain text', '' ] )(
		'returns null when %p is not iframe code',
		( value ) => {
			expect( parseIframeCode( value ) ).toBeNull();
		}
	);

	it( 'extracts the source, the title and the kept attributes', () => {
		const code =
			'<iframe width="560" height="315" src="https://example.org/embed?a=1&amp;b=2" title="My video" ' +
			'allow="autoplay; camera" allowfullscreen referrerpolicy="no-referrer" ' +
			'onload="alert(1)" srcdoc="hello" style="border:0" data-video-id="42" aria-label="Player"></iframe>';

		expect( parseIframeCode( code ) ).toEqual( {
			url: 'https://example.org/embed?a=1&b=2',
			title: 'My video',
			attributes: [
				{ key: 'allow', value: 'autoplay; camera' },
				{ key: 'allowfullscreen', value: 'true' },
				{ key: 'referrerpolicy', value: 'no-referrer' },
				{ key: 'data-video-id', value: '42' },
				{ key: 'aria-label', value: 'Player' },
			],
		} );
	} );

	it( 'stores a present boolean attribute as "true" whatever its value', () => {
		const parsed = parseIframeCode(
			'<iframe src="https://example.org/embed" allowfullscreen="false">'
		);

		expect( parsed.attributes ).toEqual( [
			{ key: 'allowfullscreen', value: 'true' },
		] );
	} );

	it( 'reads upper-cased markup', () => {
		expect(
			parseIframeCode(
				'<IFRAME SRC="https://example.org/embed" TITLE="My video" ID="player"></IFRAME>'
			)
		).toEqual( {
			url: 'https://example.org/embed',
			title: 'My video',
			attributes: [ { key: 'id', value: 'player' } ],
		} );
	} );

	it( 'returns empty source and title when the iframe has none', () => {
		expect( parseIframeCode( '<iframe></iframe>' ) ).toEqual( {
			url: '',
			title: '',
			attributes: [],
		} );
	} );

	it( 'only reads the opening iframe tag', () => {
		expect(
			parseIframeCode(
				'Watch this: <iframe src="https://example.org/embed">fallback <b>content</b></iframe><script>alert(1)</script>'
			)
		).toEqual( {
			url: 'https://example.org/embed',
			title: '',
			attributes: [],
		} );
	} );
} );
