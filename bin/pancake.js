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
 * @repo    - https://github.com/AusDTO/pancake
 * @author  - Dominik Wilkowski
 * @license - https://raw.githubusercontent.com/AusDTO/pancake/master/LICENSE (MIT)
 *
 **************************************************************************************************************************************************************/

'use strict';

//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Dependencies
//--------------------------------------------------------------------------------------------------------------------------------------------------------------

var Player = require('play-sound')();
var Program = require('commander');
var Size = require('window-size');
var Chalk = require('chalk');
var Path = require('path');
var Fs = require('fs');

//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// CLI program
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
var Package = JSON.parse(Fs.readFileSync(Path.normalize(__dirname + '/../package.json', 'utf8'))); //for displaying help and version
var Version = Package.version;

//Adding the all important business logic
if (process.argv.indexOf('-x') !== -1 || process.argv.indexOf('--surround-sound') !== -1) {
  var position = process.argv.indexOf('-x') !== -1 ? process.argv.indexOf('-x') : process.argv.indexOf('--surround-sound');

  process.argv.splice(position, 1); //don't want the option to be in help

  Player.play(Path.normalize(__dirname + '/assets/pancake.mp3'), function (error) {
    //120kb ...
    if (error) {
      // throw err; //we are not erroring out as this is not important functionality
    }
  });
}

//the all important banner
if (process.argv.length <= 2) {
  if (Size.width > 110) {
    //only show if we have enough space
    console.log(Chalk.yellow('\n                                                 ' + Chalk.white('.,;+@@@@@@@@@#+;,\n                                              #+\':               .+@@;\n                                            @`                       `##\n                                           @+   `;@@#+\'      ,+@@@@@@@@@') + '\n                                 `,;\'\'+#@@++' + Chalk.white('@     .,;@;    @@@@@@@@@@@@@') + ' #@@@@+:`\n                          `,\'@@+,`   :;:;+\'  ' + Chalk.white('`:@@;.       `@@@@@@@@@@+.') + ' .@@@@@@@@@@@#;`\n                       +@#,        ``.,.  @@.+@' + Chalk.white('@@\':. `;@#  ;.,+@@@@@') + '@@@@@@@@@@@@@@@@@@@@@@\'\n                   ,#@,     `.`        #@.#@@@@@@@@@ `: ;#@@@@@@@@@@@@@@@@@@@@@@@@@@@@@.@   ;@\'\n               .@@@;:,`  .;++;,      #@#@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@        `   `@:\n             @@,   ,;::;;,.        @@@@@@@@@@@@#\':\'@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@    `  `,`  `  .#+`\n           \'@.   ..   ,\'+\':`      @@@@@@@@\'`        @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@\'      .,  .`     ,@\'\n        ,@+       \'.               @@@@,           ,@@@@@@:    .#@@@@@@@@@@@@@@@@@@@@@+                  ;@\n      ;@,                                           #@+`          .@@@@@+     .+@@@#+@;                    @\n      @+      .@\'++                                                 :@@@                                  @#\n         +#@,          :;:\':\':                     - pancake -        @@@                         `:\'\':  `@\'\n       \'@@@@@@@@@@,                                                    @@:      \'`  ,\'+##@@@@@@@@@.    ``\n   `@@`   `::,\';:;#@@@@@@#;.  `,;++\',                               .\' @@@  ,@@@,@@@@@@@#+\':,`             ,+#\n  :@`                    .#@@@@@@+#@@@@@@@@@@@@@@#+\'\'+++@@@@@@@+#+++   @@@@;,,;,`                             @\n  `@:                                   `:;+#@@##@@@+;,`              #@\';@@                                 #,\n    ;#+;            ```                                               @@+@@#                             .+\'.\n         \'@@@@@@@@@@@@@@@@#.                             ``           #@@@#     ``         `#@@@@@@:\'@@@@@@,\n                   ``...,,+@@@@@@@@\'.`.,;\'\'#@@@;    `\'@@@@@@@@@@@@@@#:     @@@#\'` `###@@#\'.        ,;;,::\n                                     ,@@@@@@@@#@@@:@@@@#;.'));
  }

  console.log(Chalk.yellow('\n  ( ^-^)_\u65E6'));
}

Program.version('v' + Version).usage('[command] <input>').description('\n( ^-^)_\u65E6 \uD83E\uDD5E  Pancake is an utility to make working with npm modules for the frontend sweet and seamlessly. ' + 'It will check your peerDependencies, write compile the contents for you and lists all available modules for you to select and install.').command('batter', '\u2705  will check the peerDependencies of all installed pancake modules\n' + '               for conflicts and error out with a meaningful error message.\n' + Chalk.gray('               \u275D Pancakes needs batter. Can\u2019t do no pancakes without batter.\n' + '                 This is essential! \u275E')).command('syrup', '\uD83C\uDF6F  will compile all assets and give you options\n' + '               as to where you might want those assets.\n' + Chalk.gray('               \u275D Eating pancakes without Syrup is pretty dry.\n' + '                 You could but it\u2019s not really fun. \u275E')).command('cream', '\uD83D\uDC40  will present you with options to upgrade your existing\n' + '               pancake project or to start a new one.\n' + Chalk.gray('               \u275D Putting cream on top makes this a sweet experience.\n' + '                 This is why you want more. \u275E')).parse(process.argv);