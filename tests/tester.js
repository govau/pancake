/***************************************************************************************************************************************************************
 *
 * TESTER
 *
 * Running tests with Pancake
 *
 **************************************************************************************************************************************************************/

'use strict';


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Dependencies
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
const Replace = require('replace-in-file');
const Spawn = require('child_process');
const Copydir = require('copy-dir');
const Dirsum = require('dirsum');
const Chalk = require('chalk');
const Path = require('path');
const Del = require('del');
const Fs = require(`fs`);


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// GLOBALS
//--------------------------------------------------------------------------------------------------------------------------------------------------------------


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Constructor
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
const TESTER = (() => { //constructor factory

	/**
	 * PRIVATE
	 * Flatten a deep object into a one level object with it’s path as key
	 *
	 * @param  {object} object - The object to be flattened
	 *
	 * @return {object}        - The resulting flat object
	 */
	const flatten = object => {
		return Object.assign( {}, ...function _flatten( objectBit, path = '' ) {  //spread the result into our return object
			return [].concat(                                                       //concat everything into one level
				...Object.keys( objectBit ).map(                                      //iterate over object
					key => typeof objectBit[ key ] === 'object' ?                       //check if there is a nested object
						_flatten( objectBit[ key ], `${ path }/${ key }` ) :              //call itself if there is
						( { [ `${ path }/${ key }` ]: objectBit[ key ] } )                //append object with it’s path as key
				)
			)
		}( object ) );
	};


	return {
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Settings
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
		PASS: true,
		UNITS: [
			{
				name: 'Test1: Compile test with two modules',
				folder: 'test1',
				script: {
					options: [],
				},
				compare: 'pancake/',
				empty: false,
			},
			{
				name: 'Test2: Compile test with five modules and modules enabled',
				folder: 'test2',
				script: {
					options: [],
				},
				compare: 'pancake/',
				empty: false,
			},
			{
				name: 'Test3: Compile test with orgName overwrite and minification off',
				folder: 'test3',
				script: {
					options: [ '--org', '@other.org' ],
				},
				compare: 'pancake/',
				empty: false,
			},
			{
				name: 'Test4: Compile test with folder overwrite',
				folder: 'test4',
				script: {
					options: [],
				},
				compare: 'testfolder/',
				empty: false,
			},
			{
				name: 'Test5: Compile test with conflict',
				folder: 'test5',
				script: {
					options: [],
				},
				compare: 'pancake/',
				empty: true,
			},
			{
				name: 'Test6: Compile test for css only',
				folder: 'test6',
				script: {
					options: [],
				},
				compare: 'pancake/',
				empty: false,
			},
			{
				name: 'Test7: Compile test js only minified',
				folder: 'test7',
				script: {
					options: [],
				},
				compare: 'pancake/',
				empty: false,
			},
			{
				name: 'Test8: Compile test with deep dependencies',
				folder: 'test8',
				script: {
					options: [],
				},
				compare: 'pancake/',
				empty: false,
			},
			{
				name: 'Test9: Compile test with different asset path',
				folder: 'test9',
				script: {
					options: [],
				},
				compare: 'pancake/',
				empty: false,
			},
			{
				name: 'Test10: Compile test with react files',
				folder: 'test10',
				script: {
					options: [],
				},
				compare: 'pancake/',
				empty: false,
			},
			{
				name: 'Test11: Compile test with two modules and pancake-json enabled',
				folder: 'test11',
				script: {
					options: [],
				},
				compare: 'pancake/',
				empty: false,
			},
			{
				name: 'Test12: Compile test with pancake-json enabled and cherry-picked json',
				folder: 'test12',
				script: {
					options: [],
				},
				compare: 'pancake/',
				empty: false,
			},
			{
				name: 'Test13: Compile test with react files disabled',
				folder: 'test13',
				script: {
					options: [],
				},
				compare: 'pancake/',
				empty: false,
			},
			{
				name: 'Test14: Compile test with three modules from two organisations',
				folder: 'test14',
				script: {
					options: [ '--org', '@nsw.gov.au @gov.au' ],
				},
				compare: 'pancake/',
				empty: false,
			},
			{
				name: 'Test15: Compile test with sass files disabled',
				folder: 'test15',
				script: {
					options: [],
				},
				compare: 'pancake/',
				empty: false,
			},
		],


		/**
		 * Initiating test
		 */
		init: () => {
			let allTasks = [];

			TESTER.log.info(`Testing …`);

			//loop over all folders and start each test
			for( const unit of TESTER.UNITS ) {
				const scriptFolder = Path.normalize(`${ __dirname }/${ unit.folder }/`);

				allTasks.push(
					TESTER
						.delete( scriptFolder, unit )                                   //delete trash first
						.then( () => TESTER.copyFixtures( scriptFolder, unit ) )        //copy fixtures
						.then( () => TESTER.replaceFixtures( scriptFolder, unit ) )     //compile fixtures
						.then( () => TESTER.run( scriptFolder, unit ) )                 //now run script
						.then( () => TESTER.fixture( scriptFolder, unit ) )             //get hash for fixture
						.then( result => TESTER.result( scriptFolder, unit, result ) )  //get hash for result of test
						.then( result => TESTER.compare( unit, result ) )               //now compare both and detail errors
						.then( success => {                                             //cleaning up after ourself
							if( success ) {
								TESTER.delete( scriptFolder, unit );
							}
						})
						.catch( error => TESTER.log.error(`Nooo: ${ error }`) )         //catch errors...
				);
			}

			//finished with all tests
			Promise.all( allTasks )
				.catch( error => {
					TESTER.log.error(`An error occurred: ${ Chalk.bgWhite.black(` ${ Path.basename( error ) } `) }`);

					process.exit( 1 );
				})
				.then( () => {
					if( TESTER.PASS ) {
						TESTER.log.finished(`😅  All tests passed`);

						process.exit( 0 );
					}
					else {
						TESTER.log.finished(`😳  Ouch! Some tests failed`);

						process.exit( 1 );
					}
			});

		},


		/**
		 * Deleting files from previous tests
		 *
		 * @param  {string} path     - The path to the folder that needs cleaning
		 * @param  {object} settings - The settings object for this test
		 *
		 * @return {Promise object}
		 */
		delete: ( path, settings ) => {
			const trash = [
				Path.normalize(`${ path }/pancake/`),
				Path.normalize(`${ path }/testfolder/`),
				Path.normalize(`${ path }/yarn.lock`),
				Path.normalize(`${ path }/*.log.*`),
				Path.normalize(`${ path }/fixture/.DS_Store`),
				Path.normalize(`${ path }/fixture/*/.DS_Store`),
				Path.normalize(`${ path }/_fixture/`),
			];

			return new Promise( ( resolve, reject ) => {
				Del( trash )
					.catch( error => {
						reject( error );
					})
					.then( paths => {
						// TESTER.log.pass(`Cleaned ${ Chalk.bgWhite.black(` ${ settings.folder } `) } folder`);

						resolve();
				});
			});
		},


		/**
		 * Copy fixture files into a temp folder for later processing
		 *
		 * @param  {string} path     - The path to the folder that needs cleaning
		 * @param  {object} settings - The settings object for this test
		 *
		 * @return {Promise object}
		 */
		copyFixtures: ( path, settings ) => {
			return new Promise( ( resolve, reject ) => {
				if( settings.empty ) {
					resolve();
				}
				else {
					Copydir( Path.normalize(`${ path }/fixture/`) , Path.normalize(`${ path }/_fixture/`), error => {
						if( error ) {
							reject( error );
						}
						else {
							resolve();
						}
					});
				}
			});
		},


		/**
		 * Replace placeholders in temp fixtures
		 *
		 * @param  {string} path     - The path to the folder that needs cleaning
		 * @param  {object} settings - The settings object for this test
		 *
		 * @return {Promise object}
		 */
		replaceFixtures: ( path, settings ) => {
			return new Promise( ( resolve, reject ) => {
				if( settings.empty ) {
					resolve();
				}
				else {
					const version = require('../packages/pancake/package.json').version;
					const sassVersion = require('../packages/pancake-sass/package.json').version;
					const jsVersion = require('../packages/pancake-js/package.json').version;
					const reactVersion = require('../packages/pancake-react/package.json').version;

					Replace({
							files: [
								Path.normalize(`${ path }/_fixture/**`),
							],
							from: [
								/\[version\]/g,
								/\[sass-version\]/g,
								/\[js-version\]/g,
								/\[react-version\]/g,
								/\[path\]/g,
							],
							to: [
								version,
								sassVersion,
								jsVersion,
								reactVersion,
								Path.normalize(`${ __dirname }/..`),
							],
							allowEmptyPaths: true,
							encoding: 'utf8',
						})
						.catch( error => {
							reject( error );
						})
						.then( changedFiles => {
							resolve();
					});
				}
			});
		},


		/**
		 * Running shell script
		 *
		 * @param  {string} path     - The path to the shell script
		 * @param  {object} settings - The settings object for this test
		 *
		 * @return {Promise object}
		 */
		run: ( path, settings ) => {
			return new Promise( ( resolve, reject ) => {

				// what the command would look like:
				// console.log('node ', [ Path.normalize(`${ path }/../../packages/pancake/bin/pancake`), settings.script.command, path, ...settings.script.options ].join(' '));

				Spawn
					.spawn( 'node', [ Path.normalize(`${ path }/../../packages/pancake/bin/pancake`), /*settings.script.command,*/ path, ...settings.script.options ] )
					// .stdout.on('data', ( data ) => {
					// 	console.log( data.toString() );
					// })
					.on( 'close', ( code ) => {
						if( code === 0 ) {
							// TESTER.log.pass(`Ran test in ${ Chalk.bgWhite.black(` ${ Path.basename( path ) } `) } folder`);

							resolve();
						}
						else {
							TESTER.PASS = false;

							reject(`Script errored out!`);
						}
				});
			});
		},


		/**
		 * Get the checksum hash for the fixture of a test
		 *
		 * @param  {string} path     - The path to the test folder
		 * @param  {object} settings - The settings object for this test
		 *
		 * @return {Promise object}  - The hash object of all files inside the fixture
		 */
		fixture: ( path, settings ) => {
			return new Promise( ( resolve, reject ) => {
				if( !settings.empty ) {
					Dirsum.digest( Path.normalize(`${ path }/_fixture/${ settings.compare }/`), 'sha256', ( error, hashes ) => {
						if( error ) {
							TESTER.log.pass( error );

							TESTER.PASS = false;

							reject( error );
						}
						else {
							resolve( hashes );
						}
					});
				}
				else {
					resolve({});
				}
			});
		},


		/**
		 * Get the checksum hash for the result of the test
		 *
		 * @param  {string} path     - The path to the test folder
		 * @param  {object} settings - The settings object for this test
		 * @param  {object} fixture  - The hash results of the fixture to be passed on
		 *
		 * @return {Promise object}  - The hash object of all files inside the resulting files
		 */
		result: ( path, settings, fixture ) => {
			const location = Path.normalize(`${ path }/${ settings.compare }/`);

			return new Promise( ( resolve, reject ) => {
				if( !settings.empty ) {
					Dirsum.digest( location, 'sha256', ( error, hashes ) => {
						if( error ) {
							TESTER.log.error( error );

							TESTER.PASS = false;

							reject();
						}
						else {

							resolve({ //passing it to compare later
								fixture,
								result: hashes,
							});

						}
					});
				}
				else {
					Fs.access( location, Fs.constants.R_OK, error => {

						if( !error || error.code !== 'ENOENT' ) {
							TESTER.log.fail(`${ Chalk.bgWhite.black(` ${ settings.name } `) } failed becasue it produced files but really shoudn’t`);

							TESTER.PASS = false;

							resolve({
								fixture: {
									hash: 'xx',
									files: {
										location: 'nope',
									},
								},
								result: {
									hash: 'xxx',
									files: {
										location: 'nope',
									},
								},
							});

						}
						else {

							resolve({
								fixture: {
									hash: 'xxx',
								},
								result: {
									hash: 'xxx',
								},
							});

						}
					});
				}
			});
		},


		/**
		 * Compare the output of a test against its fixture
		 *
		 * @param  {object} settings - The settings object for this test
		 * @param  {object} result   - The hash results of fixture and result
		 *
		 * @return {Promise object}  - The hash object of all files inside the fixture
		 */
		compare: ( settings, hashes ) => {

			return new Promise( ( resolve, reject ) => {
				if( hashes.fixture.hash === hashes.result.hash ) {
					TESTER.log.pass(`${ Chalk.bgWhite.black(` ${ settings.name } `) } passed`); //yay

					resolve( true );
				}
				else { //grr
					TESTER.PASS = false;
					TESTER.log.fail(`${ Chalk.bgWhite.black(` ${ settings.name } `) } failed`);

					//flatten hash object
					const fixture = flatten( hashes.fixture.files );
					const result = flatten( hashes.result.files );

					//iterate over fixture
					for( const file of Object.keys( fixture ) ) {
						const compare = result[ file ]; //get the hash from our result folder
						delete result[ file ];          //remove this one so we can keep track of the ones that were not inside the fixture folder

						if( compare === undefined ) {  //we couldn’t find this file inside the resulting folder
							TESTER.log.error(`Missing ${ Chalk.yellow( file ) } file inside result folder`);
						}
						else {
							const fileName = file.split('/');

							if( fixture[ file ] !== compare && fileName[ fileName.length - 1 ] !== 'hash' ) { //we don’t want to compare folders
								TESTER.log.error(`Difference inside ${ Chalk.yellow( settings.folder + file ) } file`);
							}
						}
					}

					if( Object.keys( result ).length > 0 ) { //found files that have not been deleted yet
						let files = [];

						for( const file of Object.keys( result ) ) {
							files.push( file ); //make ’em readable
						}

						TESTER.log.error(`Some new files not accounted for: ${ Chalk.yellow( files.join(', ') ) } inside the fixture folder`);
					}

					resolve( false );
				}
			});
		},


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Log to console.log
//
// @method  info                       Log info
//          @param   [text]  {string}  The sting you want to log
//          @return  [ansi]            output
//
// @method  finished                   Log the finishing message
//          @param   [text]  {string}  The sting you want to log
//          @return  [ansi]            output
//
// @method  error                      Log errors
//          @param   [text]  {string}  The sting you want to log
//          @return  [ansi]            output
//
// @method  pass                       Log a pass
//          @param   [text]  {string}  The sting you want to log
//          @return  [ansi]            output
//
// @method  fail                       Log a fail
//          @param   [text]  {string}  The sting you want to log
//          @return  [ansi]            output
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
		log: {

			info: ( text ) => {
				console.log(`\n\n        ${ text }\u001b[1F`);
			},

			finished: ( text ) => {
				console.log(`\n        ${ text }\n\n`);
			},

			error: ( text ) => {
				console.error(`\n        ${ Chalk.red( text ) }\u001b[1F`);
			},

			pass: ( text ) => {
				console.log(`${ Chalk.bgGreen.bold(`\n  OK  `) } ${ Chalk.bgGreen.white.bold(` ${ text }`) }\u001b[1F`);
			},

			fail: ( text ) => {
				console.error(`${ Chalk.bgRed.bold(`\n FAIL `) } ${ Chalk.bgRed.white.bold(` ${ text }`) }\u001b[1F`);
			},
		},
	}
})();


TESTER.init();
