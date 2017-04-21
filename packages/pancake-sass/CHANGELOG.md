Pancake SASS PLUGIN
===================

> This is a [Pancake](https://github.com/govau/pancake) plugin to handle sass files.


## Versions

* [v1.0.10 - Fixed mixed js and Sass module bug](v1010)
* [v1.0.9  - Cleaned logs](v109)
* [v1.0.8  - Dependencies and tests](v108)
* [v1.0.7  - Sass custom path, global settings](v107)
* [v1.0.6  - Loading fixes](v106)
* [v1.0.5  - Made sass-versioning entirely optional](v105)
* [v1.0.4  - Bug hunting](v104)
* [v1.0.3  - 💥 Initial version](v103)


----------------------------------------------------------------------------------------------------------------------------------------------------------------


## v1.0.10

- Fixed a bug where pancake would fail when we mix modules that are only Sass and only Js.


## v1.0.9

- Cleaned log so now pancake will announce plugins just when it tries to run them


## v1.0.8

- Made pancake a dependency
- Added jest unit tests


## v1.0.7

- Fixed #16 sass with custom path
- Receiving global settings from pancake now
- Added version comment tag into pancake.min.css
- Loading now separate from main module in case the main module is globally installed


## v1.0.6

- Loading as a plugin is now fixed, even when you have pancake installed globally
- Removed pancake as a dependency


## v1.0.5

- Made [sass-versioning](https://github.com/dominikwilkowski/sass-versioning) entirely optional


## v1.0.4

- Fixed some bugs


## v1.0.3

- 💥 Initial version


**[⬆ back to top](#contents)**


# };
