var _ = require("overstrike")
module.exports = MediumType

/**
 * [RFC 2045][rfc2045] media type class.
 *
 * Implements parsing based on [RFC 2045][rfc2045] with added support for
 * suffixes ([RFC 3023][rfc3023], [RFC 6839][rfc6839]).
 *
 * Pass it a string or an object with necessary fields.  
 * Media types with invalid syntax will result in a `SyntaxError` being thrown.
 *
 * [rfc2045]: https://tools.ietf.org/html/rfc2045
 * [rfc3023]: https://tools.ietf.org/html/rfc3023
 * [rfc6839]: https://tools.ietf.org/html/rfc6839
 *
 * @example
 * new MediumType("application/vnd.app.model+json; charset=utf-8")
 *
 * new MediumType({
 *   type: "application",
 *   subtype: "vnd.app.model",
 *   suffix: "json",
 *   parameters: {charset: "utf-8"}
 * })
 *
 * @class MediumType
 * @constructor
 * @param {String, Object, MediumType} mediaType
 */
function MediumType(type) {
  if (!(this instanceof MediumType)) return new MediumType(type)
  this.parameters = {}

  if (type instanceof MediumType) {
    this.type = type.type
    this.subtype = type.subtype
    this.suffix = type.suffix
    this.parameters = _.assign(this.parameters, type.parameters)
  }
  else if (typeof type == "string") {
    var match = MEDIA_TYPE.exec(type)
    if (!match) throw SyntaxError("Invalid Media Type: " + type)

    this.type = match[1].toLowerCase()
    this.subtype = match[2].toLowerCase()

    // Suffix is an implicit part of the subtype:
    // http://tools.ietf.org/html/rfc3023
    // http://tools.ietf.org/html/rfc6839
    var suffix = this.subtype.indexOf("+")
    if (suffix != -1) this.suffix = this.subtype.slice(suffix + 1)
    if (this.suffix.length) this.subtype = this.subtype.slice(0, suffix)

    var param
    PARAMETERS.lastIndex = match[1].length + 1 + match[2].length
    while (param = matchAt(type, PARAMETERS, PARAMETERS.lastIndex)) {
      this.parameters[param[1].toLowerCase()] = unquote(param[2])
    }
  }
  else if (type && typeof type == "object") _.assign(this, type)
  else if (type === undefined);
  else throw new SyntaxError("Invalid Media Type: " + type)
}

/**
 * Type of the media type.  
 * Always in lower case.
 *
 * @example
 * new MediumType("application/json").type // "application"
 *
 * @property {String} type
 */
MediumType.prototype.type = ""

/**
 * Subtype of the media type.  
 * Always in lower case.
 *
 * @example
 * new MediumType("application/json").subtype // "json"
 *
 * @property {String} subtype
 */
MediumType.prototype.subtype = ""

/**
 * Suffix of the media type.  
 * Always in lower case.
 *
 * @example
 * new MediumType("application/vnd.app.model+xml").suffix // "xml"
 *
 * @property {String} suffix
 */
MediumType.prototype.suffix = ""

/**
 * Parameters of the media type.  
 * Keys are always in lower case. Values are left as-is.
 *
 * @example
 * new MediumType("text/html; q=0.3; charset=utf-8").parameters
 * // {q: "0.3", charset: "utf-8"}
 *
 * @property {Object} parameters
 */

/**
 * Numeric quality value of the media type taken from the `q` parameter.  
 * If missing, will default to `1`.
 *
 * @example
 * new MediumType("text/html; q=0.3").q // 0.3
 * new MediumType("text/html").q // 1
 *
 * @property {Number} q
 */
Object.defineProperty(MediumType.prototype, "q", {
  get: function() { var q = this.parameters.q; return q == null? 1: Number(q) },
  set: function(value) { this.parameters.q = value },
  configurable: true, enumerable: true
})

/**
 * Stringify a `MediumType` to canonical form.
 *
 * @example
 * new MediumType({type: "text", subtype: "html"}).toString() // "text/html"
 * new MediumType("text/html;q=0.3").toString() // "text/html; q=0.3"
 *
 * @method toString
 */
MediumType.prototype.toString = function() {
  var string = this.type + "/" + this.subtype
  if (this.suffix) string += "+" + this.suffix

  for (var name in this.parameters) {
    var value = this.parameters[name]
    if (value !== undefined) string += "; " + name + "=" + quote(value)
  }

  return string
}

/**
 * Stringifies the media type to a canonical string when passing it to
 * `JSON.stringify`.  
 * This way you don't need to manually call `toString` when stringifying.
 *
 * @example
 * JSON.stringify(new MediumType("text/html")) // "\"text/html\""
 *
 * @method toJSON
 * @alias toString
 */
MediumType.prototype.toJSON = MediumType.prototype.toString
MediumType.prototype.inspect = MediumType.prototype.toString

/**
 * Matches a given media type pattern to the current media type.  
 * Supports wildcards (`*`) for type and subtype.  
 *
 * Only those parameters are checked that are in the given type. This allows
 * for matching `application/json; charset=utf-8` by passing in
 * `application/json`. `application/json; charset=utf-16` however would not
 * match. The `q` parameter is ignored entirely for easier use when matching
 * against HTTP's `Accept` header types.
 *
 * @example
 * new MediumType("application/json").match(new MediumType("application/json")) // true
 * new MediumType("application/json").match("application/*") // true
 * new MediumType("text/html+zip").match("text/*+zip") // true
 * new MediumType("text/html; charset=utf-8").match("text/html; charset=utf-8") // true
 * new MediumType("text/html").match("text/html; q=0.3") // true
 *
 * @method match
 * @param {string, MediumType} type
 */
MediumType.prototype.match = function(t) {
  if (!(t instanceof MediumType)) t = new MediumType(t)

  var eql = true
  eql = eql && (t.type == "*" || this.type == t.type)
  eql = eql && (t.subtype == "*" || this.subtype == t.subtype)
  eql = eql && (t.subtype == "*" && t.suffix == "" || this.suffix == t.suffix)
  eql = eql && contains(this.parameters, t.parameters)
  return eql
}

/**
 * Parse a media type string to a `MediumType`.  
 * Media types with invalid syntax will result in a `SyntaxError` being thrown.
 *
 * @example
 * MediumType.parse("application/json")
 * MediumType.parse("text/html+zip")
 * MediumType.parse("text/html; charset=utf-8")
 *
 * @static
 * @method parse
 * @param {string} type
 */
MediumType.parse = MediumType

/**
 * Stringify a `MediumType` to canonical form.
 *
 * @example
 * MediumType.stringify(new MediumType("text/html")) // "text/html"
 * MediumType.stringify({type: "text", subtype: "html"}) // "text/html"
 * MediumType.stringify("text/html;q=0.3") // "text/html; q=0.3"
 *
 * @static
 * @method stringify
 * @alias toString
 * @param {Object, MediumType} type
 */
MediumType.stringify = function(type) {
  if (type instanceof MediumType) return type.toString()
  return new MediumType(type).toString()
}

/**
 * Split a comma separated string to an array of media type strings.  
 * Handles quoted parameters with embedded spaces, commas etc.
 *
 * If you need `MediaType` instances back, map over the array with
 * `MediumType`:
 * ```javascript
 * MediumType.split(types).map(MediaType)
 * ```
 *
 * @example
 * MediumType.split("text/html; levels=\"1, 2, 3\", text/plain")
 * // [
 * //   "text/html; levels=\"1, 2, 3\",
 * //   "text/plain"
 * // ]
 *
 * @static
 * @method split
 * @param {string} types
 */
MediumType.split = function(string) {
  var types = [], m
  COMMAS.lastIndex = 0

  do types.push((m = matchAt(string, MEDIA_TYPES, COMMAS.lastIndex))? m[0] : "")
  while (matchAt(string, COMMAS, MEDIA_TYPES.lastIndex))

  if (MEDIA_TYPES.lastIndex != string.length) {
    types[types.length - 1] += string.slice(MEDIA_TYPES.lastIndex)
  }

  return types
}

/**
 * Sort an array of `MediumType`s according to sorting rules of the HTTP
 * `Accept` header listed in [RFC 2616][rfc2616] and [RFC 7231][rfc7231].
 * That is, first by the `q` parameter, then by type and subtype specificity
 * and then by parameter count (excluding the `q` parameter).
 *
 * Returns a new array and does not modify the given array.
 *
 * If you want to sort the comma separated HTTP `Accept` header, split it first
 * with [`MediumType.split`](#MediumType.split).
 *
 * [rfc2616]: https://tools.ietf.org/html/rfc2616
 * [rfc7231]: https://tools.ietf.org/html/rfc7231
 *
 * @example
 * MediumType.sort([
 *   new MediumType("text/html; level=3; q=0.7"),
 *   new MediumType("text/html; q=0.7"),
 *   new MediumType("text/plain; q=0.5"),
 *   new MediumType("text/*; q=0.1")
 * ])
 *
 * @static
 * @method sort
 * @param {Array} types
 */
MediumType.sort = function(types) {
  return types.slice().sort(MediumType.comparator)
}

MediumType.comparator = function(a, b) {
  return sortByQuality(a, b) || sortByType(a, b) || sortByParameters(a, b)
}

// https://tools.ietf.org/html/rfc2045#section-5.1
//
// Using the permissive RFC 2045 5.1 for parsing as opposed to RFC 6838 that
// states the requirements for _registering_ media types.
var TOKEN = "[-a-zA-Z0-9!#$%^&*_+{}\\|'.`~]+"
var QUOTED = "\"[^\\\\\"\x00-\x1f\x7f]*(\\\\.[^\\\\\"\x00-\x1f\x7f]*)*\""
var TYPE = "(" + TOKEN + ")"
var COMMAS = /\s*,\s*/g

// https://tools.ietf.org/html/rfc2045#section-5.1
var PARAMETER = "(?:\\s*;\\s*(" + TOKEN + ")=(" + TOKEN + "|" + QUOTED + "))"
var PARAMETERS = new RegExp(PARAMETER, "g")

var MEDIA_TYPE = new RegExp("^" + TYPE + "/" + TYPE + PARAMETER + "*$")
var MEDIA_TYPES = new RegExp(TYPE + "/" + TYPE + PARAMETER + "*", "g")

var ALL_TOKEN = new RegExp("^" + TOKEN + "$")
var ESCAPE = /([\\"])/g
var UNESCAPE = /\\(.)/g

function quote(value) {
  if (value == null) return '""'
  if (ALL_TOKEN.test(value)) return value
  return '"' + value.replace(ESCAPE, "\\$1") + '"'
}

function unquote(value) {
  if (value[0] == '"') return value.slice(1, -1).replace(UNESCAPE, "$1")
  return value
}

function matchAt(string, regexp, pos) {
  regexp.lastIndex = pos
  var match = regexp.exec(string)
  if (match == null || match.index != pos) return regexp.lastIndex = pos, null
  return match
}

function contains(a, b) {
  for (var key in b) if (key != "q" && a[key] != b[key]) return false
  return true
}

function sortByQuality(a, b) {
  return b.q - a.q
}

function sortByType(a, b) {
  // RFC 7231 does not speak of suffix ordering. Better ignore that for now.
  if (a.type == b.type && a.subtype == b.subtype) return 0
  if (a.type == "*" && a.subtype == "*") return 1
  if (b.type == "*" && b.subtype == "*") return -1
  if (a.subtype == "*" && b.subtype == "*") return 0
  if (a.subtype == "*") return 1
  if (b.subtype == "*") return -1
  return 0
}

function sortByParameters(a, b) {
  return countParameters(b.parameters) - countParameters(a.parameters)
}

function countParameters(obj) {
  var i = 0
  for (var key in obj) if (key != "q") ++i
  return i
}
