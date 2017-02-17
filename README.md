Pancake
=======

> A tool to help the Gov.au UI-KIT installation through the npm ecosystem. Checking peerDependencies, writing compiled files and discovering new modules


## Content

* [What’s inside?](#whats-inside)
* [Requirements](#requirements)
* [Batter](#batter)
* [Syrup](#syrup)
* [Cream](#cream)
* [Creating your own pancake modules](creating-your-own-pancake-modules)
* [Contributing](#contributing)
* [Taste / Tests](#tests)
* [Release History](#release-history)
* [License](#license)


----------------------------------------------------------------------------------------------------------------------------------------------------------------


## What’s inside?

![the pancake tool](https://raw.githubusercontent.com/govau/pancake/master/assets/pancake.jpg)

This tool comes with three commands:
* [Batter](#batter)
* [Syrup](#syrup)
* [Cream](#cream)

> Pancakes needs batter. Can’t do no pancakes without batter. This is essential!

**Batter** will check the peerDependencies of all installed pancake modules for conflicts and error out with a meaningful error message.

> Eating pancakes without Syrup is pretty dry. You could but it’s not really fun.

**Syrup** will compile all assets and give you options as to where you might want those assets.

> Putting cream on top makes this a sweet experience. This is why you want more.

**Cream** will present you with options to upgrade your existing pancake project or to start a new one. All that while checking conflicts, communicating what
breaking changes might occur and what an easy way out might be.


**[⬆ back to top](#content)**


----------------------------------------------------------------------------------------------------------------------------------------------------------------


## Requirements

- npm >= 3
- a `package.json` file in your root (run `yarn init` or `npm init`)

Pancake has been testing with all node version coming with npm 3 and higher:

- node `v5.0.0`
- node `v5.12.0`
- node `v6.9.5`
- node `v7.0.0`
- node `v7.4.0`
- node `v7.5.0`

_Dependencies have been fixed to specific versions to keep the dependency tree and security impact as low as possible._


**[⬆ back to top](#content)**


----------------------------------------------------------------------------------------------------------------------------------------------------------------


## Batter

![the batter command](https://raw.githubusercontent.com/govau/pancake/master/assets/batter.jpg)

### batter
`batter`  
Type: `[command]`  
Option: `<path>` _(optional) overwrite where to look for the `node_module` folder_  
Default value: `path to one level below cwd`

To make sure all peerDependencies are resolved without conflicts this tool goes through your `node_modules` folder and reads each <sup>_(Only the ones
in scope)_</sup> `package.json` in search for a gov.au UI-Kit module. If it finds one, identified by the tag `pancake-module` and org scope `gov.au`, it will
record it’s peerDependencies and cross check against all other installed modules.

```shell
pancake batter
```

You can also pass it a path to the `node_modules` folder and overwrite the default:

```shell
pancake batter /Path/to/folder/of/your/package.json
```

Batter will also run [Syrup](#syrup) after a successful run.
You can change that behavior by adding `"uikit": { "auto-syrup": false }` into your package.json.


### dry
`-d`, `--dry`  
Type: `<flag>`  
Default value: `no flag`

Run batter without syrup.

```shell
pancake batter --dry
```


### verbose
`-v`, `--verbose`  
Type: `<flag>`  
Default value: `no flag`

Run pancake in verbose silly mode.

```shell
pancake batter --verbose
```


**[⬆ back to top](#content)**


----------------------------------------------------------------------------------------------------------------------------------------------------------------


## Syrup

![the syrup command](https://raw.githubusercontent.com/govau/pancake/master/assets/syrup.jpg)

### syrup
`syrup`  
Type: `[command]`  
Option: `<path>` _(optional) overwrite where to look for the `node_module` folder_  
Default value: `path to one level below cwd`

Syrup compiles your pancake assets and writes them to disk. It comes with sane defaults that you can overwrite by adding the `pancake` object into your
`package.json`. All settings are automatically saved into your `package.json` file unless you supply the `--nosave` flag.

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

### save
`-n`, `--nosave`  
Type: `<flag>`  
Default value: `no flag`

The command will stop pancake from merging your local settings, complete them with the defaults and save them into your `package.json`.
This will sort-of shrink-wrap all settings in so you are completely reproducible.
You can also opt-out of this behavior by adding `"uikit": { "auto-save": false }` into your package.json.

```shell
pancake syrup --nosave
```

### verbose
`-v`, `--verbose`  
Type: `<flag>`  
Default value: `no flag`

Run pancake in verbose silly mode.

```shell
pancake syrup --verbose
```


**[⬆ back to top](#content)**


----------------------------------------------------------------------------------------------------------------------------------------------------------------


## Cream

![the cream command](https://raw.githubusercontent.com/govau/pancake/master/assets/cream.jpg)

### cream
`cream`  
Type: `[command]`  
Option: `<path>` _(optional) overwrite where to look for the `node_module` folder_  
Default value: `path to one level below cwd`  
Option: `--json <path>` _(optional) overwrite where to look for the `pancake.json`_    
Default value: `https://raw.githubusercontent.com/govau/uikit/master/uikit.json`


Cream will analyze your currently installed pancake modules and show you in a user friendly interface what you can easily update and what update will entail
breaking changes.

```shell
pancake cream
```

To overwrite the hardcoded json URL run cream with the `json` flag:

```shell
pancake cream --json https://you.domain/to/json/file.json
```


### verbose
`-v`, `--verbose`  
Type: `<flag>`  
Default value: `no flag`

Run pancake in verbose silly mode.

```shell
pancake syrup --verbose
```


**[⬆ back to top](#content)**


----------------------------------------------------------------------------------------------------------------------------------------------------------------


## Creating your own pancake modules

💡 You can use Pancake with your own modules. All you have to do is:
- keep a certain folder structure
- add one or two keywords to your `package.json` file
- add the pancake script to your `package.json` file
- and publish your module to npm.

### Folder structure

```shell
.
├── CHANGELOG.md
├── LICENSE
├── README.md
├── lib                   # this is the folder that pancake with look into to compile your assets
│   ├── js
│   │   └── module.js     # (optional) your javascript goes in this folder and must be named module.js
│   └── sass
│       ├── _globals.scss # you can have other sass partials in this folder but make sure they are imported inside the _module.scss file
│       └── _module.scss  # your sass partial goes in this folder and must be named _module.scss
└── package.json          # your package.json file holds some pancake magic described below
```

### Keywords

To make sure pancake can detect your module amongst the other hundred npm packages you have to add the `pancake-module` keyword:

```json
{
	"name": "your-module-name",
	"version": "1.0.0",
	"description": "Your description",
	"keywords": [
		"pancake-module",
		"pancake-sass-versioning"
	],
	"dependencies": {
		"@gov.au/pancake": "latest",
	},
	"peerDependencies": {},
	"devDependencies": {},
	"scripts": {
		"test": "echo \"Error: no test specified\" && exit 1"
	},
	"author": "",
	"license": "ISC"
}
```

You can also add the `pancake-sass-versioning` keyword to tell pancake you are using [Sass-versioning](https://github.com/dominikwilkowski/sass-versioning)
with your module so it can add the `versioning-check();` function.

### The script

The magic of pancake lies within the `postInstall` script. To enable pancake to run right after the install of your module you have to add the script:

```json
{
	"name": "your-module-name",
	"version": "1.0.0",
	"description": "Your description",
	"keywords": [
		"pancake-module",
		"pancake-sass-versioning"
	],
	"dependencies": {
		"@gov.au/pancake": "latest",
	},
	"peerDependencies": {},
	"devDependencies": {},
	"scripts": {
		"postinstall": "pancake batter \"$(cd .. && npm prefix)\""
	},
	"author": "",
	"license": "ISC"
}
```

This will run `batter` and `syrup` right after install and make sure pancake is always up-to-date.

### Publish

All that’s left right now is to publish your module. At this moment Pancake has a hard coded npm organization built in. We will change that once we figure out
how to store/edit those defaults. 😁


**[⬆ back to top](#content)**


----------------------------------------------------------------------------------------------------------------------------------------------------------------


## Contributing

Hi there 👀,

❤️ We LOVE that you’re looking into this section. We welcome any feedback or pull requests and are super psyched about you putting your own time into this
project. To make your contribution count, have a read through the code first and see what our thinking was. We will do the same with yours.

To run the project run install dependencies and devDependencies:

```shell
yarn
```

To run the transpiler watch that will transpile your ES2016 code into ES5:

```shell
yarn watch
```

❗️ Make sure you only edit file inside the `src/` folder. Files inside the `bin/` folder are overwritten by the transpiler.

_Please look at the coding style and work with it, not against it. 🌴_


**[⬆ back to top](#content)**


----------------------------------------------------------------------------------------------------------------------------------------------------------------


## Taste / Tests

We have published three test modules in our scoped npm org to test interdependencies. Find below a list of what is inside each version:

**@gov.au/testmodule1**
- `v10.0.0`
- `v10.0.1`
- `v10.0.2`
- `v10.1.0`
- `v10.1.1`
- `v10.2.0`
- `v10.3.0`
- `v11.0.0`
- `v11.0.1`

**@gov.au/testmodule2**
- `v10.0.0`  
	└── `@gov.au/testmodule1`: `^10.0.0`
- `v10.0.1`  
	└── `@gov.au/testmodule1`: `^10.0.0`
- `v11.0.0`  
	└── `@gov.au/testmodule1`: `^11.0.0`
- `v12.0.0`  
	└── `@gov.au/testmodule1`: `^11.0.0`
- `v13.0.0`  
	└── `@gov.au/testmodule1`: `^11.0.1`

**@gov.au/testmodule3**
- `v10.0.0`  
	└── `@gov.au/testmodule1`: `^10.0.0`
- `v10.0.1`  
	└── `@gov.au/testmodule1`: `^10.1.0`
- `v10.0.2`  
	└── `@gov.au/testmodule1`: `^10.2.0`
- `v10.1.0`  
	└── `@gov.au/testmodule1`: `^10.3.0`
- `v11.0.0`  
	└── `@gov.au/testmodule1`: `^11.0.1`



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
