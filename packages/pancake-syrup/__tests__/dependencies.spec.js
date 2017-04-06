/***************************************************************************************************************************************************************
 *
 * dependencies.js unit tests
 *
 * @file - pancake-syrup/src/dependencies.js
 *
 **************************************************************************************************************************************************************/


import { AddDeps } from '../src/dependencies';


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// testing AddDeps
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
const dependencies1 = {
	"@gov.au/core": "^0.1.0",
	"@gov.au/link-list": "^0.1.0",
};
const installed1 = new Map();
installed1.set( '@gov.au/testmodule1', '11.0.1' );
installed1.set( '@gov.au/testmodule2', '11.0.0' );
installed1.set( '@gov.au/testmodule3', '11.0.0' );

const result1 = {
	breakage: false,
	lines: [
		{
			type: 'separator',
			line: '\u001b[2m├── core       ^0.1.0            \u001b[22m',
		},
		{
			type: 'separator',
			line: '\u001b[2m└── link-list  ^0.1.0            \u001b[22m',
		},
	],
	breaking: [],
};

test('AddDeps - Should return an object with dependencies', () => {
	expect( AddDeps( dependencies1, installed1, 10 ) ).toMatchObject( result1 );
});


const dependencies2 = {
	"@gov.au/core": "^0.1.0",
	"@gov.au/link-list": "^0.1.0",
};
const installed2 = new Map();
installed2.set( '@gov.au/testmodule1', '11.0.1' );
installed2.set( '@gov.au/testmodule2', '11.0.0' );
installed2.set( '@gov.au/testmodule3', '11.0.0' );
installed2.set( '@gov.au/testmodule4', '12.0.0' );
installed2.set( '@gov.au/testmodule5', '13.0.0' );

const result2 = {
	breakage: false,
	lines: [
		{
			type: 'separator',
			line: '\u001b[2m├── core                 ^0.1.0            \u001b[22m'
		},
		{
			type: 'separator',
			line: '\u001b[2m└── link-list            ^0.1.0            \u001b[22m'
		},
	],
	breaking: [],
};

test('AddDeps - Should return an object with dependencies nicely centered', () => {
	expect( AddDeps( dependencies2, installed2, 20 ) ).toMatchObject( result2 );
});


const dependencies3 = {
	"@gov.au/core": "^0.1.0",
	"@gov.au/link-list": "^0.1.0",
	"@gov.au/testmodule2": "^11.1.0",
	"@gov.au/testmodule5": "^13.1.0",
};
const installed3 = new Map();
installed3.set( '@gov.au/testmodule1', '11.0.1' );
installed3.set( '@gov.au/testmodule2', '11.0.0' );
installed3.set( '@gov.au/testmodule3', '11.0.0' );
installed3.set( '@gov.au/testmodule4', '12.0.0' );
installed3.set( '@gov.au/testmodule5', '13.0.0' );

const result3 = {
	breakage: true,
	lines: [
		{
			type: 'separator',
			line: '\u001b[2m├── core                 ^0.1.0            \u001b[22m'
		},
		{
			type: 'separator',
			line: '\u001b[2m├── link-list            ^0.1.0            \u001b[22m'
		},
		{
			type: 'separator',
			line: '\u001b[2m├── \u001b[35mtestmodule2\u001b[39m          \u001b[35m^11.1.0   !   11.0.0\u001b[39m   installed\u001b[22m'
		},
		{
			type: 'separator',
			line: '\u001b[2m└── \u001b[35mtestmodule5\u001b[39m          \u001b[35m^13.1.0   !   13.0.0\u001b[39m   installed\u001b[22m'
		},
	],
	breaking: [
		'@gov.au/testmodule2@^11.1.0',
		'@gov.au/testmodule5@^13.1.0'
	],
};

test('AddDeps - Should highlight breaking dependencies', () => {
	expect( AddDeps( dependencies3, installed3, 20 ) ).toMatchObject( result3 );
});
