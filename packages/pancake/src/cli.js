/***************************************************************************************************************************************************************
 *
 * Running pancake inside a cli
 *
 * @repo    - https://github.com/govau/pancake
 * @author  - Dominik Wilkowski
 * @license - https://raw.githubusercontent.com/govau/pancake/master/LICENSE (MIT)
 *
 **************************************************************************************************************************************************************/

'use strict';


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Dependencies
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
import Path from 'path';
// import Fs from 'fs';


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Module imports
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
import { ExitHandler, CheckNPM, Cwd, Size } from './helpers';
import { InstallPlugins, RunPlugins } from './plugins';
import { GetModules, GetPlugins } from './modules';
import { Log, Style, Loading } from './logging';
import { ParseArgs } from './parse-arguments';
import { CheckModules } from './conflicts';
import { Settings } from './settings';


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Default export
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
/**
 * Running the program in CLI
 *
 * @param  {array} argv - The arguments passed to node
 */
export const init = ( argv = process.argv ) => {
	const pkg = require( Path.normalize(`${ __dirname }/../package.json`) );

//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Verbose flag
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
	let verbose = false;
	if( process.argv.indexOf('-v') !== -1 || process.argv.indexOf('--verbose') !== -1 ) {
		Log.verboseMode = true;
	}


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Check npm version
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
	const npmVersion = CheckNPM();

	//npm 3 and higher is required as below will install dependencies inside each module folder
	if( !npmVersion ) {
		Log.error(`Pancake only works with npm 3 and later.`);
		Log.space();
		process.exit( 1 );
	}


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Get global settings
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
	let SETTINGS = Settings.GetGlobal();


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Parsing cli arguments
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
	const ARGS = ParseArgs( SETTINGS, argv );

	//arg overwrites
	SETTINGS.npmOrg = ARGS.org;
	SETTINGS.plugins = ARGS.plugins;
	SETTINGS.ignorePlugins = ARGS.ignorePlugins.length ? ARGS.ignorePlugins : SETTINGS.ignorePlugins;


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Set global settings
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
	if( ARGS.set.length > 0 ) {
		SETTINGS = Settings.SetGlobal( SETTINGS, ...ARGS.set );

		Loading.stop();
		Log.space();
		process.exit( 0 ); //finish after
	}


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Display help
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
	if( ARGS.help ) {
		if( Size().width > 110 ) { //only show if we have enough space
			Log.info(`Pancake help`);
			Loading.stop();

			console.log( Style.yellow(`
                                                 ${ Style.white(`.,;+@@@@@@@@@#+;,
                                              #+':               .+@@;
                                            @\`                       \`##
                                           @+   \`;@@#+'      ,+@@@@@@@@@@`) }
                                 \`,;''+#@@++${ Style.white(`@     .,;@;    @@@@@@@@@@@@@ #@@@@`) }+:\`
                          \`,'@@+,\`   :;:;+'${ Style.white(`\`:@@;.       \`@@@@@@@@@@@+..@@@@@@@@@@@`) }#;\`
                       +@#,        \`\`.,.  ${ Style.white(`@@.+ @@@':. \`;@#  ;.,+@@@@@@@@@@@@@@@@@@@@@@@@@@@`) }'
                   ,#@,     \`.\`        ${ Style.white(`#@.#@@@@@@#@@@ \`: ;@@@@@@@@@@@@@@@@@@@@@@@@@@@@@.@`) }   ;@'
               .@@@;:,\`  .;++;,      ${ Style.white(`#@#@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@`) }        \`   \`@:
             @@,   ,;::;;,.        ${ Style.white(`@@@@@@@@@@@@#':'@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@`) }    \`  \`,\`  \`  .#+\`
           '@.   ..   ,'+':\`      ${ Style.white(`@@@@@@@@'\`        @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@`) }\'      .,  .\`     ,@'
        ,@+       '.               ${ Style.white(`@@@@,           ,@@@@@@:    .#@@@@@@@@@@@@@@@@@@@@@+`) }                  ;@
      ;@,                                           ${ Style.white(`#@+\`          .@@@@@+     .+@@@#+@`) };                    @
      @+      .@'++                                                 ${ Style.white(`:@@@`) }                                  @#
         +#@,          :;:':':                     - pancake -        ${ Style.white(`@@@`) }                         \`:'':  \`@'
       '@@@@@@@@@@,                                                    ${ Style.white(`@@`) }:      '\`  ,'+##@@@@@@@@@.    \`\`
   \`@@\`   \`::,';:;#@@@@@@#;.  \`,;++',                               .' ${ Style.white(`@@@`) }  ,@@@,@@@@@@@#+':,\`             ,+#
  :@\`                    .#@@@@@@+#@@@@@@@@@@@@@@#+''+++@@@@@@@+#+++   ${ Style.white(`@@@@`) };,,;,\`                             @
  \`@:                                   \`:;+#@@##@@@+;,\`              ${ Style.white(`#@';@@`) }                                 #,
    ;#+;            \`\`\`                                               ${ Style.white(`@@+@@#`) }                             .+'.
         '@@@@@@@@@@@@@@@@#.                             \`\`           ${ Style.white(`#@@@#`) }     \`\`         \`#@@@@@@:'@@@@@@,
                   \`\`...,,+@@@@@@@@'.\`.,;''#@@@;    \`'@@@@@@@@@@@@@@#:     @@@#'\` \`###@@#'.        ,;;,::
                                     ,@@@@@@@@#@@@:@@@@#;.`));
		}

		console.log(
			Style.yellow(`\n  ( ^-^)_旦\n\n`) +
			`  🥞  Pancake is an utility to make working with npm modules for the frontend sweet and seamlessly.\n\n` +
			`  It will check your peerDependencies for conflicts and comes with plugins to compile the contents\n` +
			`  for you and lists all available modules for you to select and install.\n\n` +
			`  ${ Style.gray(`-------------------------------------------------------------------------------------------------\n\n`) }` +
			`  ${ Style.bold(`PATH`) }            - Run pancake in a specific path and look for pancake modules there.\n` +
			`    $ ${ Style.gray(`pancake /Users/you/project/folder`) }\n\n` +
			`  ${ Style.bold(`SETTINGS`) }        - Set global settings. Available settings are: ${ Style.yellow( Object.keys( SETTINGS ).join(', ') ) }.\n` +
			`    $ ${ Style.gray(`pancake --set npmOrg "@yourOrg"`) }\n\n` +
			`  ${ Style.bold(`JSON`) }            - Temporarily overwrite the address to the json file of all your pancake modules.\n` +
			`    $ ${ Style.gray(`pancake --json https://domain.tld/pancake-modules.json`) }\n\n` +
			`  ${ Style.bold(`PLUGINS`) }         - Temporarily turn off all plugins.\n` +
			`    $ ${ Style.gray(`pancake --plugins`) }\n\n` +
			`  ${ Style.bold(`IGNORED PLUGINS`) } - Prevent a certain plugin(s) from being installed and run.\n` +
			`    $ ${ Style.gray(`pancake --ignore @gov.au/pancake-js,@gov.au/pancake-sass`) }\n\n` +
			`  ${ Style.bold(`HELP`) }            - Display the help (this screen).\n` +
			`    $ ${ Style.gray(`pancake --help`) }\n\n` +
			`  ${ Style.bold(`VERBOSE`) }         - Run pancake in verbose silly mode\n` +
			`    $ ${ Style.gray(`pancake --verbose`) }`
		);

		Log.space();
		process.exit( 0 ); //finish after
	}


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Finding the current working directory
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
	const pkgPath = Cwd( ARGS.cwd );


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Get local settings
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
	let SETTINGSlocal = Settings.GetLocal( pkgPath );


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Display version
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
	if( ARGS.version ) {
		console.log(`v${ pkg.version }`);

		if( ARGS.verbose ) { //show some space if we had verbose enabled
			Log.space();
		}

		process.exit( 0 ); //finish after
	}


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Show banner
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
	Log.info(`PANCAKE MIXING THE BATTER`);


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Get all modules data
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
	Loading.start();

	GetModules( pkgPath, SETTINGS.npmOrg )
		.catch( error => {
			Log.error(`Reading all package.json files bumped into an error: ${ error }`);
			Log.error( error );

			process.exit( 1 );
		})
		.then( allModules => { //once we got all the content from all package.json files
			Log.verbose(`Gathered all modules:\n${ Style.yellow( JSON.stringify( allModules ) ) }`);


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Check for conflicts
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
			if( allModules.length < 1 ) {
				Log.info(`No modules found 😬`);
				Loading.stop();
			}
			else {
				const conflicts = CheckModules( allModules );

				if( conflicts.conflicts ) {
					Log.error( Style.red( conflicts.message ) );

					process.exit( 1 ); //error out so npm knows things went wrong
				}
				else {
					Log.ok(`All modules(${ allModules.length }) without conflict 💥`);
				}


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Install all plugins
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
				let plugins = [];

				if( SETTINGSlocal.plugins === false || SETTINGS.plugins === false ) {
					Log.verbose(`Skipping plugins`);
				}
				else {
					const allPlugins = GetPlugins( allModules );

					allPlugins.map( plugin => {
						if(
							SETTINGSlocal.ignore.filter( ignore => ignore === plugin ).length === 0 &&
							SETTINGS.ignorePlugins.filter( ignore => ignore === plugin ).length === 0
						) {
							plugins.push( plugin );
						}
					});

					const installed = InstallPlugins( plugins, pkgPath );
				}


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Run all plugins
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
				RunPlugins( pkg.version, plugins, pkgPath, allModules, SETTINGSlocal, SETTINGS )
					.catch( error => {
						Loading.stop();

						Log.error( error );
					})
					.then( ( settings ) => {
						Loading.start();


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Save local settings into host package.json
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
						if( SETTINGSlocal['auto-save'] && !ARGS.nosave ) {

							//merge all plugin settings
							settings.map( setting => {
								Object.keys( setting ).map( key => {
									SETTINGSlocal[ key ] = Object.assign( setting[ key ], SETTINGSlocal[ key ] );
								});
							});

							Settings.SetLocal( SETTINGSlocal, pkgPath ) //let’s save all settings
								.catch( error => {
									Log.error(`Saving settings caused an error: ${ error }`);

									process.exit( 1 );
								})
								.then( SETTINGSlocal => {
									Log.ok(`SETTINGS SAVED`); //all done!

									Log.done(`YOUR PANCAKE IS READY ( ˘▽˘)っ旦`); //all done!
							});
						}
						else {
							Log.done(`YOUR PANCAKE IS READY ( ˘▽˘)っ旦`); //all done!
						}
				});

			}
	});


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Adding some event handling to exit signals
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
	process.on( 'exit', ExitHandler.bind( null, { withoutSpace: false } ) );              //on closing
	process.on( 'SIGINT', ExitHandler.bind( null, { withoutSpace: false } ) );             //on [ctrl] + [c]
	process.on( 'uncaughtException', ExitHandler.bind( null, { withoutSpace: false } ) );  //on uncaught exceptions
}
