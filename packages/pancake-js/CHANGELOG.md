Pancake JS PLUGIN
=================

> This is a [Pancake](https://github.com/govau/pancake) plugin to handle js files.


## Versions

* [v1.0.9 - Fixed mixed js and Sass module bug](v109)
* [v1.0.8 - Cleaned log and updated uglify-js](v108)
* [v1.0.7 - Dependencies and tests](v107)
* [v1.0.6 - Receiving global settings from pancake now](v106)
* [v1.0.5 - Loading fixes](v105)
* [v1.0.4 - Bug hunting](v104)
* [v1.0.3 - 💥 Initial version](v103)


----------------------------------------------------------------------------------------------------------------------------------------------------------------


## v1.0.9

- Fixed a bug where pancake would fail when we mix modules that are only Sass and only Js.


## v1.0.8

- Cleaned log so now pancake will announce plugins just when it tries to run them
- Updated uglify-js to 2.8.18 to fix regression found in 2.8.7


## v1.0.7

- Made pancake a dependency
- Added jest unit tests


## v1.0.6

- Receiving global settings from pancake now
- Loading now separate from main module in case the main module is globally installed


## v1.0.5

- Loading as a plugin is now fixed, even when you have pancake installed globally
- Removed pancake as a dependency


## v1.0.4

- Fixed some bugs


## v1.0.3

- 💥 Initial version


**[⬆ back to top](#contents)**


# };
