#!/usr/bin/env node

/***************************************************************************************************************************************************************
 *
 * Checking peerDependencies, writing compiled files and discovering new modules
 *
 * This tool was built for the Australian DTA UI-Kit. It comes with three cli commands:
 *
 * pancake batter
 * Checking. It will make sure Sass modules are build correctly and return a descriptive error message when
 * peerDependencies are in conflict with each other. This is invoked via npm postinstall inside each UI-Kit module.
 *
 * pancake syrup
 * Generate. It will write the appropriate files into a set location for you to digest into your project.
 *
 * pancake cream
 * Listing. It will list all available modules for you to select and install them for you.
 *
 * @repo    - https://github.com/AusDTO/uikit-pancake
 * @author  - Dominik Wilkowski
 * @license - https://raw.githubusercontent.com/AusDTO/uikit-pancake/master/LICENSE (MIT)
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
const Fs = require(`fs`);


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// CLI program
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
const Package = JSON.parse( Fs.readFileSync( `${ __dirname }/package.json`, `utf8` ) ); //for displaying help and version
const Version = Package.version;


//Adding the all important business logic
if( process.argv.indexOf( '-x' ) !== -1 || process.argv.indexOf( '--surround-sound' ) !== -1 ) {
	const position = process.argv.indexOf( '-x' ) !== -1 ? process.argv.indexOf( '-x' ) : process.argv.indexOf( '--surround-sound' );

	process.argv.splice( position, 1 ); //don't want the option to be in help

	Player.play('pancake.mp3', ( error ) => {
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
	.description(
		`( ^-^)_旦 🥞  Pancake is a utility for the UI-Kit of the gov.au team. ` +
		`It lets you check your peerDependencies, write include files for all your UI-Kit modules and lists all available modules for you to select and install.`
	)
	.version( `v${ Version }` )
	.usage( `[command] <input>` )
	.command(`batter`,
		`✅  will check the peerDependencies of all installed UI-Kit modules for conflicts and error out with a meaningful error message.\n` +
		Chalk.gray(`               ❝ Pancakes needs batter. Can’t do no pancakes without batter. This is essential! ❞`)
	)
	.command(`syrup`,
		`🍯  will compile all assets and give you options as to where you might want those assets.\n` +
		Chalk.gray(`               ❝ Eating pancakes without Syrup is pretty dry. You could but it’s not much fun. ❞`)
	)
	.command('cream',
		'👀  will present you with options to upgrade your existing UI-Kit project or to start a new one.\n' +
		Chalk.gray(`               ❝ To make it a real sweat experience and you happy in the process, put cream on top. ❞`)
	)
	.parse( process.argv );