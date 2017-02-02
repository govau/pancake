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
* [Batter](#batter)
* [Syrup](#syrup)
* [Cream](#Cream)

> Pancakes needs batter. Can’t do no pancakes without batter. This is essential!

**Batter** will check the peerDependencies of all installed pancake modules for conflicts and error out with a meaningful error message.

> Eating pancakes without Syrup is pretty dry. You could but it’s not much fun.

**Syrup** will compile all assets and give you options as to where you might want those assets.

> To make it a real sweat experience and you happy in the process, put cream on top.

**Cream** will present you with options to upgrade your existing pancake project or to start a new one. All that while checking conflicts, communicating what
breaking changes might occur and what an easy way out might be.


**[⬆ back to top](#content)**


----------------------------------------------------------------------------------------------------------------------------------------------------------------


## Batter

### command
**`batter`**  
Type: `[command]`  
Option: `<path>` _(optional)_  
Default value: `path to one level below cwd`

To make sure all peerDependencies are resolved without conflicts this tool goes through your `node_modules` folder and reads each <sup>_(Only the ones
in scope)_</sup> `package.json` in search for a gov.au UI-Kit module. If it finds one, identified by the tag `pancake-module` and org scope `gov.au`, it will
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


### command
**`-d`, `--dry`**  
Type: `[command]`  
Option: `<path>` _(optional)_  
Default value: `no flag`

Run batter without syrup.

```shell
pancake batter --dry
```


### command
**`-v`, `--verbose`**  
Type: `[command]`  
Option: `<path>` _(optional)_  
Default value: `no flag`

Run pancake in verbose silly mode.

```shell
pancake batter --verbose
```


**[⬆ back to top](#content)**


----------------------------------------------------------------------------------------------------------------------------------------------------------------


## Syrup

### command
**`syrup`**  
Type: `[command]`  
Option: `<path>` _(optional)_  
Default value: `path to one level below cwd`

Syrup compiles your pancake assets and writes them to disk. It comes with sane defaults that you can overwrite by adding the `pancake` object into your
`package.json`.

```shell
pancake syrup
```

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

### command
**`-s`, `--save`**  
Type: `[flag]`  
Option: `<path>` _(optional)_  
Default value: `no flag`

The command will merge your local settings, complete them with the defaults and save them into your `package.json`
This will sort-of shrink-wrap all settings in so you are completely reproducible.

```shell
pancake syrup --save
```

**`-v`, `--verbose`**  
Type: `[command]`  
Option: `<path>` _(optional)_  
Default value: `no flag`

Run pancake in verbose silly mode.

```shell
pancake syrup --verbose
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
