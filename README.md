Pancake
=======

> A tool to help the Gov.au UI-KIT installation through the npm ecosystem. Checking peerDependencies, writing compiled files and discovering new modules


## Content

* [What’s inside?](#whats-inside)
* [Batter](#batter)
* [Syrup](#syrup)
* [Cream](#Cream)
* [Taste / Tests](#tests)
* [Release History](#release-history)
* [License](#license)


----------------------------------------------------------------------------------------------------------------------------------------------------------------


## What’s inside?

This tool comes with three commands:
* [Batter](#batter) `pancake batter`
* [Syrup](#syrup) `pancake syrup`
* [Cream](#Cream) `pancake cream`

**Batter** will check the peerDependencies of all installed modules that have the tag `uikit-module` and error out with a meaningful error message if it
encounters a conflict.

**Syrup** will generate Sass import files that include each module you have installed to a path you can specify in your own `package.json`.

**Cream** will return a radio list of all modules that can be selected and installed automatically.


**[⬆ back to top](#content)**


----------------------------------------------------------------------------------------------------------------------------------------------------------------


## Batter

### batter
Type: `[command]`  
Option: `<path>` _(optional)_
Default value: `path to one level below cwd`

To make sure all peerDependencies are resolved without conflicts this tool goes through your `node_modules` folder and reads each <sup>_(Only the ones
in scope)_</sup> `package.json` in search for a gov.au UI-Kit module. If it finds one, identified by the tag `uikit-module` and org scope `gov.au`, it will
record it’s peerDependencies and cross check against all other installed modules.

```shell
pandcake batter
```

You can also pass it a path to the `node_modules` folder and overwrite the default:

```shell
pandcake batter /Path/to/folder/of/your/package.json
```

Batter will also run [Syrup](#syrup) after a successful run.
You can change that behavior by adding `"uikit": { "auto-syrup": false }` into your package.json.


**[⬆ back to top](#content)**


----------------------------------------------------------------------------------------------------------------------------------------------------------------


## Syrup
Type: `[command]`  
Option: `<path>` _(optional)_
Default value: `path to one level below cwd`

Syrup compiles your UI-Kit assets and writes them to disk. It comes with sane defaults that you can overwrite by adding the `uikit` object into your
`package.json`.

Below are all possible settings with default values.

```js
{
	"name": "your-name",
	"version": "0.1.0",
	"uikit": {
		"css": {
			"minified": true,          //minify your CSS output?
			"modules": false,          //save a css file per module?
			"browsers": [              //the browser support settings for autoprefixer
				"last 2 versions",
				"ie 8",
				"ie 9",
				"ie 10"
			],
			"location": "uikit/css/",  //path where to save those files, relative to your package.json
			"name": "uikit.min.css"    //name of your css file with all modules
		},
		"sass": {
			"generate": true,          //save sass files?
			"modules": false,          //save a sass file per module?
			"location": "uikit/sass/", //path where to save those files, relative to your package.json
			"name": "uikit.scss"       //name of the sass file with all modules
		},
		"js": {
			"minified": true,          //minify js code?
			"modules": false,          //save a js file per module?
			"location": "uikit/js/",   //path where to save those files, relative to your package.json
			"name": "uikit.min.js"     //name of the js file with all modules
		}
	}
}
```


**[⬆ back to top](#content)**


----------------------------------------------------------------------------------------------------------------------------------------------------------------


## Cream


**[⬆ back to top](#content)**


----------------------------------------------------------------------------------------------------------------------------------------------------------------


## Taste / Tests


**[⬆ back to top](#content)**


----------------------------------------------------------------------------------------------------------------------------------------------------------------


## Release History

* v0.1.0 - First pancake
* v0.0.X - Pre-releases of unstable, undercooked pancakes


**[⬆ back to top](#content)**


----------------------------------------------------------------------------------------------------------------------------------------------------------------


## License

Copyright (c) Commonwealth of Australia. Licensed under the [MIT](https://raw.githubusercontent.com/AusDTO/uikit-pancake/master/LICENSE).


**[⬆ back to top](#content)**


# };