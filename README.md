Pancake
=======

> A tool to help the Gov.au UI-KIT installation through the npm ecosystem. Checking peerDependencies, writing compiled files and discovering new modules


## Content

* [What's inside?](#whats-inside)
* [Batter](#batter)
* [Syrup](#syrup)
* [Flip](#Flip)
* [Taste / Tests](#tests)
* [Release History](#release-history)
* [License](#license)


----------------------------------------------------------------------------------------------------------------------------------------------------------------


## What's inside?

This tool comes with three functions:
* [Batter](#batter)
* [Syrup](#syrup)
* [Flip](#Flip)

**Batter** will check the peerDependencies of all installed modules that have the tag `uikit-module` and error out with a meaningful error message if it
encounters a conflict.

**Syrup** will generate Sass import files that include each module you have installed to a path you can specify in your own `package.json`.

**Flip** will return a radio list of all modules that can be selected and installed automatically.


**[⬆ back to top](#content)**


----------------------------------------------------------------------------------------------------------------------------------------------------------------


## Batter

### -b, --batter
Type: `<command>`  
Default value: `path to one level below cwd`

To make sure all peerDependencies are resolved without conflicts this tool goes through your `node_modules` folder and reads each `package.json` in search for
a Gov.au UI-Kit module. If it finds one, identified by the tag `uikit-module`, it will record it's peerDependencies and cross check against all other installed
modules.

```shell
pandcake -b
```

You can also pass it a path to the `node_modules` folder and overwrite the default:

```shell
pandcake -b /Path/to/folder
```


**[⬆ back to top](#content)**


----------------------------------------------------------------------------------------------------------------------------------------------------------------


## Syrup


**[⬆ back to top](#content)**


----------------------------------------------------------------------------------------------------------------------------------------------------------------


## Flipping


**[⬆ back to top](#content)**


----------------------------------------------------------------------------------------------------------------------------------------------------------------


## Taste / Tests


**[⬆ back to top](#content)**


----------------------------------------------------------------------------------------------------------------------------------------------------------------


## Release History

* v0.1.0 - First pancake


**[⬆ back to top](#content)**


----------------------------------------------------------------------------------------------------------------------------------------------------------------


## License

Copyright (c) Commonwealth of Australia. Licensed under the [MIT](https://raw.githubusercontent.com/AusDTO/uikit-pancake/master/LICENSE).


**[⬆ back to top](#content)**


# };