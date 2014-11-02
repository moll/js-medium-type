var _ = require("overstrike")
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
    var index = PARAMETERS.lastIndex = match[1].length + 1 + match[2].length
    while ((param = PARAMETERS.exec(type)) && (param.index == index)) {
      this.parameters[param[1].toLowerCase()] = unquote(param[2])
      index = PARAMETERS.lastIndex
    }
  }
  else if (typeof type == "object") _.assign(this, type)
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

MediumType.parse = MediumType

MediumType.stringify = function(type) {
  if (type instanceof MediumType) return type.toString()
  return new MediumType(type).toString()
}

// https://tools.ietf.org/html/rfc2045#section-5.1
//
// Using the permissive RFC 2045 5.1 for parsing as opposed to RFC 6838 that
// states the requirements for _registering_ media types.
var TOKEN = "[-a-zA-Z0-9!#$%^&*_+{}\\|'.`~]+"
var QUOTED = "\"[^\\\\\"\x00-\x1f\x7f]*(\\\\.[^\\\\\"\x00-\x1f\x7f]*)*\""
var TYPE = "(" + TOKEN + ")"

// https://tools.ietf.org/html/rfc2045#section-5.1
var PARAMETER = "(?:\\s*;\\s*(" + TOKEN + ")=(" + TOKEN + "|" + QUOTED + "))"
var PARAMETERS = new RegExp(PARAMETER, "g")

var MEDIA_TYPE = new RegExp("^" + TYPE + "/" + TYPE + PARAMETER + "*$")

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
