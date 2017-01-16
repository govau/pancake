Pancake
=======

> A tool to help the Gov.au UI-KIT installation through the npm ecosystem. Checking peerDependencies, writing compiled files and discovering new modules


## Content

* [What's inside?](#whats-inside)
* [Batter](#batter)
* [Syrup](#syrup)
* [Cream](#Cream)
* [Taste / Tests](#tests)
* [Release History](#release-history)
* [License](#license)


----------------------------------------------------------------------------------------------------------------------------------------------------------------


## What's inside?

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
Type: `<command>`  
Default value: `path to one level below cwd`

To make sure all peerDependencies are resolved without conflicts this tool goes through your `node_modules` folder and reads each `package.json` in search for
a Gov.au UI-Kit module. If it finds one, identified by the tag `uikit-module` and org scope `gov.au`, it will record it's peerDependencies and cross check
against all other installed modules.

```shell
pandcake batter
```

You can also pass it a path to the `node_modules` folder and overwrite the default:

```shell
pandcake batter /Path/to/folder/of/your/package.json
```


**[⬆ back to top](#content)**


----------------------------------------------------------------------------------------------------------------------------------------------------------------


## Syrup


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