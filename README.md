MediumType.js
=============
[![NPM version][npm-badge]](http://badge.fury.io/js/medium-type)
[![Build status][travis-badge]](https://travis-ci.org/moll/js-medium-type)
[npm-badge]: https://badge.fury.io/js/medium-type.png
[travis-badge]: https://travis-ci.org/moll/js-medium-type.png?branch=master

MediumType.js is a JavaScript library to **parse and stringify media types**.

### Tour
- Implements parsing based on [RFC 2045][rfc2045] with added support for
  suffixes ([RFC 3023][rfc3023], [RFC 6839][rfc6839]).  
  RFC 2045 is a little more permissive than later RFCs when it comes to allowed
  tokens. MediumType.js thereby adheres to [Postel's law of liberal
  acceptance][postel].

  Examples of supported media types:
  - `application/json`.
  - `application/vnd.app.model+json; charset=utf-8`.
  - `application/xml; dtd="http://www.w3.org/TR/html4/strict.dtd"`.
  - `*/*+json; q=0.3`.
  - `*/*`.

- **Split** comma separated media types (like in HTTP's `Accept` header).  
  Note that it properly **supports quoted parameters** when splitting.  It's the
  only library that I know of that does this.

  ```javascript
  MediumType.split("text/html; levels=\"1, 2, 3\", text/plain")
  ```

- **Sort** an array of `MediumType`s according to sorting rules of the HTTP
  `Accept` header listed in [RFC 2616][rfc2616] and [RFC 7231][rfc7231].  
  That is, first by the `q` parameter, then by type and subtype specificity and
  then by parameter count (excluding the `q` parameter).

  ```javascript
  MediumType.sort([
    new MediumType("text/html; level=3; q=0.7"),
    new MediumType("text/html; q=0.7"),
    new MediumType("text/plain; q=0.5"),
    new MediumType("text/*; q=0.1"),
    new MediumType("*/*; q=0.1"),
  ])
  ```

- **Stringify** media types to a canonical `type/subtype+suffix; param=value`
  format.

  ```javascript
  MediumType.stringify({type: "application", subtype: "json"})
  new MediumType({type: "application", subtype: "json"}).toString()
  ```

- No dependencies on Node.js modules or the whole MIME database. Pretty
  lightweight and easily usable in the browser with [Browserify][browserify].


[rfc2045]: https://tools.ietf.org/html/rfc2045
[rfc3023]: https://tools.ietf.org/html/rfc3023
[rfc6839]: https://tools.ietf.org/html/rfc6839
[rfc2616]: https://tools.ietf.org/html/rfc2616
[rfc7231]: https://tools.ietf.org/html/rfc7231
[postel]: https://en.wikipedia.org/wiki/Robustness_principle
[browserify]: http://browserify.org/
[api]: https://github.com/moll/js-medium-type/blob/master/doc/API.md
[semver]: http://semver.org/


Installing
----------
From v1.0.0 MediumType.js will follow [semantic versioning][semver], but until
then, breaking changes may appear between minor versions (the middle number).

### Installing on Node.js
```
npm install medium-type
```

### Installing for the browser
MediumType.js doesn't yet have a build ready for the browser, but you will be
able to use [Browserify][browserify] to have it run there till then.


Using
-----
```javascript
var MediumType = require("medium-type")

var type = new MediumType("application/vnd.app.model+json; charset=utf-8")
type.type == "application"
type.subtype == "vnd.app.model"
type.suffix == "json"
type.parameters.charset == "utf-8"
```


API
---
For extended documentation on all functions, please see the [MediumType.js API
Documentation][api].

### [MediumType](https://github.com/moll/js-medium-type/blob/master/doc/API.md#MediumType)
- [parameters](https://github.com/moll/js-medium-type/blob/master/doc/API.md#mediumType.parameters)
- [q](https://github.com/moll/js-medium-type/blob/master/doc/API.md#mediumType.q)
- [subtype](https://github.com/moll/js-medium-type/blob/master/doc/API.md#mediumType.subtype)
- [suffix](https://github.com/moll/js-medium-type/blob/master/doc/API.md#mediumType.suffix)
- [type](https://github.com/moll/js-medium-type/blob/master/doc/API.md#mediumType.type)
- [match](https://github.com/moll/js-medium-type/blob/master/doc/API.md#MediumType.prototype.match)(type)
- [parse](https://github.com/moll/js-medium-type/blob/master/doc/API.md#MediumType.parse)(type)
- [sort](https://github.com/moll/js-medium-type/blob/master/doc/API.md#MediumType.sort)(types)
- [split](https://github.com/moll/js-medium-type/blob/master/doc/API.md#MediumType.split)(types)
- [stringify](https://github.com/moll/js-medium-type/blob/master/doc/API.md#MediumType.stringify)(type)
- [toJSON](https://github.com/moll/js-medium-type/blob/master/doc/API.md#MediumType.prototype.toJSON)()
- [toString](https://github.com/moll/js-medium-type/blob/master/doc/API.md#MediumType.prototype.toString)()


License
-------
MediumType.js is released under a *Lesser GNU Affero General Public License*,
which in summary means:

- You **can** use this program for **no cost**.
- You **can** use this program for **both personal and commercial reasons**.
- You **do not have to share your own program's code** which uses this program.
- You **have to share modifications** (e.g. bug-fixes) you've made to this
  program.

For more convoluted language, see the `LICENSE` file.


About
-----
**[Andri Möll][moll]** typed this and the code.  
[Monday Calendar][monday] supported the engineering work.

If you find MediumType.js needs improving, please don't hesitate to type to me
now at [andri@dot.ee][email] or [create an issue online][issues].

[email]: mailto:andri@dot.ee
[issues]: https://github.com/moll/js-medium-type/issues
[moll]: http://themoll.com
[monday]: https://mondayapp.com
