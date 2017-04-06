/***************************************************************************************************************************************************************
 *
 * pancake.js unit tests
 *
 * @file - pancake/src/pancake.js
 *
 **************************************************************************************************************************************************************/


import {
	ExitHandler,
	CheckNPM,
	Cwd,
	Size,
	Spawning,
	Log,
	Style,
	Loading,
	ParseArgs,
	CheckModules,
	GetModules,
	Settings,
	GetFolders,
	CreateDir,
	WriteFile,
	ReadFile,
	CopyFile,
	Semver } from '../src/pancake';


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// testing exports
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
test('syrup - Should define all exported functions', () => {
	expect( ExitHandler ).toBeDefined();
	expect( CheckNPM ).toBeDefined();
	expect( Cwd ).toBeDefined();
	expect( Size ).toBeDefined();
	expect( Spawning ).toBeDefined();
	expect( Log ).toBeDefined();
	expect( Style ).toBeDefined();
	expect( Loading ).toBeDefined();
	expect( ParseArgs ).toBeDefined();
	expect( CheckModules ).toBeDefined();
	expect( GetModules ).toBeDefined();
	expect( Settings ).toBeDefined();
	expect( GetFolders ).toBeDefined();
	expect( CreateDir ).toBeDefined();
	expect( WriteFile ).toBeDefined();
	expect( ReadFile ).toBeDefined();
	expect( CopyFile ).toBeDefined();
	expect( Semver ).toBeDefined();
});
