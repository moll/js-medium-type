var _ = require("overstrike")
var max = Math.max
module.exports = MediumType

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

MediumType.prototype.type = ""
MediumType.prototype.subtype = ""
MediumType.prototype.suffix = ""

MediumType.prototype.toString = function() {
  var string = this.type + "/" + this.subtype
  if (this.suffix) string += "+" + this.suffix

  for (var name in this.parameters) {
    var value = this.parameters[name]
    if (value !== undefined) string += "; " + name + "=" + quote(value)
  }

  return string
}

MediumType.prototype.toJSON = MediumType.prototype.toString
MediumType.prototype.inspect = MediumType.prototype.toString

MediumType.parse = MediumType

MediumType.stringify = function(type) {
  if (type instanceof MediumType) return type.toString()
  return new MediumType(type).toString()
}

MediumType.split = function(string) {
  var types = []
  COMMAS.lastIndex = 0

  while (true) {
    var match
    if (!(match = matchAt(string, MEDIA_TYPES, COMMAS.lastIndex))) break
    types.push(match[0])
    if (!(match = matchAt(string, COMMAS, MEDIA_TYPES.lastIndex))) break
  }

  var length = string.length
  if (length == 0 || max(MEDIA_TYPES.lastIndex, COMMAS.lastIndex) != length)
    throw new SyntaxError("Invalid Media Types: " + string)

  return types.map(function(type) {
    return type == null ? null : new MediumType(type)
  })
}

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
  if (match == null || match.index != pos) return regexp.lastIndex = 0, null
  return match
}

function sortByQuality(a, b) {
  var aQ = a.parameters.q != null ? Number(a.parameters.q) : 1
  var bQ = b.parameters.q != null ? Number(b.parameters.q) : 1
  return bQ - aQ
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
  return count(b.parameters) - count(a.parameters)
}

function count(obj) { var i = 0; for (obj in obj) ++i; return i }
