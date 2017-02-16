#!/usr/bin/env node

/***************************************************************************************************************************************************************
 *
 * Checking peerDependencies, writing compiled files and discovering new modules
 *
 * This tool was built to make working with npm and the front end easy and seamless.
 *
 * @repo    - https://github.com/AusDTO/pancake
 * @author  - Dominik Wilkowski
 * @license - https://raw.githubusercontent.com/AusDTO/pancake/master/LICENSE (MIT)
 *
 **************************************************************************************************************************************************************/

'use strict';


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Dependencies
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
const Player = require('play-sound')();
const Program = require('commander');
const Size = require('window-size');
const Chalk = require('chalk');
const Path = require(`path`);
const Fs = require(`fs`);


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// CLI program
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
const Package = JSON.parse( Fs.readFileSync( Path.normalize(`${ __dirname }/../package.json`, `utf8`) ) ); //for displaying help and version
const Version = Package.version;


//Adding the all important business logic
if( process.argv.indexOf( '-x' ) !== -1 || process.argv.indexOf( '--surround-sound' ) !== -1 ) {
	const position = process.argv.indexOf( '-x' ) !== -1 ? process.argv.indexOf( '-x' ) : process.argv.indexOf( '--surround-sound' );

	process.argv.splice( position, 1 ); //don't want the option to be in help

	Player.play( Path.normalize(`${ __dirname }/../assets/pancake.mp3`), ( error ) => { //120kb ...
		if( error ) {
			// throw err; //we are not erroring out as this is not important functionality
		}
	});
}

//the all important banner
if( process.argv.length <= 2 ) {
	if( Size.width > 110 ) { //only show if we have enough space
		console.log( Chalk.yellow(`
                                                 ${ Chalk.white(`.,;+@@@@@@@@@#+;,
                                              #+':               .+@@;
                                            @\`                       \`##
                                           @+   \`;@@#+'      ,+@@@@@@@@@`) }
                                 \`,;''+#@@++${ Chalk.white(`@     .,;@;    @@@@@@@@@@@@@`) } #@@@@+:\`
                          \`,'@@+,\`   :;:;+'  ${ Chalk.white(`\`:@@;.       \`@@@@@@@@@@+.`) } .@@@@@@@@@@@#;\`
                       +@#,        \`\`.,.  @@.+@${ Chalk.white(`@@':. \`;@#  ;.,+@@@@@`) }@@@@@@@@@@@@@@@@@@@@@@'
                   ,#@,     \`.\`        #@.#@@@@@@@@@ \`: ;#@@@@@@@@@@@@@@@@@@@@@@@@@@@@@.@   ;@'
               .@@@;:,\`  .;++;,      #@#@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@        \`   \`@:
             @@,   ,;::;;,.        @@@@@@@@@@@@#':'@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@    \`  \`,\`  \`  .#+\`
           '@.   ..   ,'+':\`      @@@@@@@@'\`        @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@'      .,  .\`     ,@'
        ,@+       '.               @@@@,           ,@@@@@@:    .#@@@@@@@@@@@@@@@@@@@@@+                  ;@
      ;@,                                           #@+\`          .@@@@@+     .+@@@#+@;                    @
      @+      .@'++                                                 :@@@                                  @#
         +#@,          :;:':':                     - pancake -        @@@                         \`:'':  \`@'
       '@@@@@@@@@@,                                                    @@:      '\`  ,'+##@@@@@@@@@.    \`\`
   \`@@\`   \`::,';:;#@@@@@@#;.  \`,;++',                               .' @@@  ,@@@,@@@@@@@#+':,\`             ,+#
  :@\`                    .#@@@@@@+#@@@@@@@@@@@@@@#+''+++@@@@@@@+#+++   @@@@;,,;,\`                             @
  \`@:                                   \`:;+#@@##@@@+;,\`              #@';@@                                 #,
    ;#+;            \`\`\`                                               @@+@@#                             .+'.
         '@@@@@@@@@@@@@@@@#.                             \`\`           #@@@#     \`\`         \`#@@@@@@:'@@@@@@,
                   \`\`...,,+@@@@@@@@'.\`.,;''#@@@;    \`'@@@@@@@@@@@@@@#:     @@@#'\` \`###@@#'.        ,;;,::
                                     ,@@@@@@@@#@@@:@@@@#;.`));
	}

	console.log( Chalk.yellow(`\n  ( ^-^)_旦`) );
}


Program
	.version( `v${ Version }` )
	.usage( `[command] <input>` )
	.description(
		`\n( ^-^)_旦 🥞  Pancake is an utility to make working with npm modules for the frontend sweet and seamlessly. ` +
		`It will check your peerDependencies, write compile the contents for you and lists all available modules for you to select and install.`
	)
	.command(`batter`,
		`✅  will check the peerDependencies of all installed pancake modules\n` +
		`               for conflicts and error out with a meaningful error message.\n` +
		Chalk.gray(
			`               ❝ Pancakes needs batter. Can’t do no pancakes without batter.\n` +
			`                 This is essential! ❞`
		)
	)
	.command(`syrup`,
		`🍯  will compile all assets and give you options\n` +
		`               as to where you might want those assets.\n` +
		Chalk.gray(
			`               ❝ Eating pancakes without Syrup is pretty dry.\n` +
			`                 You could but it’s not really fun. ❞`
		)
	)
	.command('cream',
		`👀  will present you with options to upgrade your existing\n` +
		`               pancake project or to start a new one.\n` +
		Chalk.gray(
			`               ❝ Putting cream on top makes this a sweet experience.\n` +
			`                 This is why you want more. ❞`
		)
	)
	.parse( process.argv );
