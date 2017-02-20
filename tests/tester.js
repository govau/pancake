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
const Spawn = require('child_process');
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

	return {
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Settings
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
		PASS: true,
		UNITS: [
			{
				folder: 'test1',
				hash: '02333a3fc5107546f270d41e97f556386196f57beb21df0ef0435af4ef0b30ac',
			},
			{
				'folder': 'test2',
				'hash': '6f1a995d73c1359c5082b8fb401a56d4d04f3053281d9dcd7409180fd3b10a11',
			},
		],


		/**
		 * Initiating test
		 */
		init: () => {
			let allTasks = [];

			TESTER.log.info(`Testing each folder`);

			//loop over all folders and start each test
			for( const unit of TESTER.UNITS ) {
				const scriptFolder = Path.normalize(`${ __dirname }/${ unit.folder }/`);

				allTasks.push(
					TESTER
						.delete( scriptFolder )                                  //delete trash first
						.then( () => TESTER.run( scriptFolder ) )                //now run script
						.then( () => TESTER.compare( scriptFolder, unit.hash ) ) //now compare output
						.catch( error => TESTER.log.error( error ) )             //catch errors...
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
		 * @param  {string} path - The path to the folder that needs cleaning
		 */
		delete: ( path ) => {
			const trash = [
				Path.normalize(`${ path }/node_modules`),
				Path.normalize(`${ path }/pancake`),
				Path.normalize(`${ path }/yarn.lock`),
				Path.normalize(`${ path }/*.log.*`),
			];

			return new Promise( ( resolve, reject ) => {
				Del( trash )
					.catch( error => {
						reject( error );
					})
					.then( paths => {
						TESTER.log.pass(`Cleaned ${ Chalk.bgWhite.black(` ${ Path.basename( path ) } `) } folder`);

						resolve();
				});
			});
		},


		/**
		 * Running shell script
		 *
		 * @param  {string} path - The path to the shell script
		 */
		run: ( path ) => {
			return new Promise( ( resolve, reject ) => {
				const script = Spawn
					.spawn( 'sh', [ Path.normalize(`${ path }/task.sh`) ], { cwd: path })
					.on( 'close', ( code ) => {
						if( code === 0 ) {
							TESTER.log.pass(`Ran shell script in ${ Chalk.bgWhite.black(` ${ Path.basename( path ) } `) } folder`);

							resolve();
						}
						else {
							reject();
						}
				});
			});
		},


		/**
		 * Compare the output of a test against its fixture
		 *
		 * @param  {string} path - The path to the test folder
		 * @param  {string} hash - The sha256 hash of the folder
		 */
		compare: ( path, hash ) => {
			return new Promise( ( resolve, reject ) => {
				Dirsum.digest( Path.normalize(`${ path }/pancake/`), 'sha256', ( error, hashes ) => {
					if( error ) {
						reject();
					}

					if( hashes.hash === hash ) {
						TESTER.log.pass(`Test for ${ Chalk.bgWhite.black(` ${ Path.basename( path ) } `) } passed`);
					}
					else {
						TESTER.log.fail(`Test for ${ Chalk.bgWhite.black(` ${ Path.basename( path ) } `) } failed`);
						TESTER.log.fail(`${ hashes.hash } !== ${ hash }`);

						TESTER.PASS = false;
					}

					resolve();
				});
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
				console.error(`\n\n        ${ Chalk.red( text ) }\u001b[1F`);
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
