/***************************************************************************************************************************************************************
 *
 * prettiness.js unit tests
 *
 * @file - pancake-syrup/src/prettiness.js
 *
 **************************************************************************************************************************************************************/


const { HighlightDiff, Headline } = require( '../src/prettiness' );


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// testing HighlightDiff
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
test('HighlightDiff - Should highlight the mayor version', () => {
	expect( HighlightDiff( '1.0.0', '2.0.0' ) ).toBe('\u001b[35m2.0.0\u001b[39m');
});

test('HighlightDiff - Should highlight the minor version', () => {
	expect( HighlightDiff( '1.0.0', '1.1.0' ) ).toBe('1.\u001b[35m1.0\u001b[39m');
});

test('HighlightDiff - Should highlight the patch version', () => {
	expect( HighlightDiff( '1.0.0', '1.0.10' ) ).toBe('1.0.\u001b[35m10\u001b[39m');
});

test('HighlightDiff - Should not highlight the same version', () => {
	expect( HighlightDiff( '1.0.0', '1.0.0' ) ).toBe('1.0.0');
});


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// testing Headline
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
const headline1 = [
	{
		type: 'separator',
		line: '\u001b[2m \u001b[22m',
	},
	{
		type: 'separator',
		line: '\u001b[2m\u001b[0m\u001b[44m\u001b[1m\u001b[36m  ═══╡ Headline ╞═══  \u001b[39m\u001b[2m\u001b[49m\u001b[0m\u001b[22m',
	},
	{
		type: 'separator',
		line: '\u001b[2m       \u001b[0m\u001b[36mSubline\u001b[39m\u001b[0m\u001b[22m',
	},
];

test('Headline - Should output the correct array with the correct ansi codes', () => {
	expect( Headline( 'Headline', 'Subline', 20 ) ).toMatchObject( headline1 );
});


const headline2 = [
	{
		type: 'separator',
		line: '\u001b[2m \u001b[22m',
	},
	{
		type: 'separator',
		line: '\u001b[2m\u001b[0m\u001b[44m\u001b[1m\u001b[36m  ════════╡ Headline ╞════════  \u001b[39m\u001b[2m\u001b[49m\u001b[0m\u001b[22m',
	},
	{
		type: 'separator',
		line: '\u001b[2m            \u001b[0m\u001b[36mSubline\u001b[39m\u001b[0m\u001b[22m',
	},
];

test('Headline - Should output the correct center alignment', () => {
	expect( Headline( 'Headline', 'Subline', 30 ) ).toMatchObject( headline2 );
});


const headline3 = [
	{
		type: 'separator',
		line: '\u001b[2m \u001b[22m',
	},
	{
		type: 'separator',
		line: '\u001b[2m\u001b[0m\u001b[44m\u001b[1m\u001b[36m  ═╡ Headline ╞═  \u001b[39m\u001b[2m\u001b[49m\u001b[0m\u001b[22m',
	},
	{
		type: 'separator',
		line: '\u001b[2m\u001b[0m\u001b[36mSubline\u001b[39m\u001b[0m\u001b[22m',
	},
];

test(`Headline - Should build a headline even with a smaller table than the headline`, () => {
	expect( Headline( 'Headline', 'Subline', 5 ) ).toMatchObject( headline3 );
});
