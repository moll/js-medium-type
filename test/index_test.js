var _ = require("underscore")
var MediumType = require("..")
var ASCII = _.times(128, String.fromCharCode)

var SPECIAL = [
  "(", ")",
  "<", ">",
  "[", "]",
  "@", ",", ";", ":",
  "\\", "\"",
  "/", "?", "=" // Added to RFC 822's special list by RFC 2045.
]

describe("MediumType", function() {
  describe("new", function() {
    it("must be an instance of MediumType", function() {
      new MediumType().must.be.an.instanceof(MediumType)
    })

    it("must be empty", function() {
      var type = new MediumType
      type.type.must.equal("")
      type.subtype.must.equal("")
      type.suffix.must.equal("")
      type.parameters.must.eql({})
    })

    it("must copy if given another MediumType", function() {
      var other = new MediumType("application/vnd.app.model+json; v=1")
      var type = new MediumType(other)

      type.must.not.equal(other)
      type.type.must.equal("application")
      type.subtype.must.equal("vnd.app.model")
      type.suffix.must.equal("json")
      type.parameters.must.eql({v: "1"})
    })

    it("must be empty given empty object", function() {
      var type = new MediumType({})
      type.type.must.equal("")
      type.subtype.must.equal("")
      type.suffix.must.equal("")
      type.parameters.must.eql({})
    })

    it("must set only properties given in object", function() {
      var type = new MediumType({suffix: "json", parameters: {v: "1"}})
      type.type.must.equal("")
      type.subtype.must.equal("")
      type.suffix.must.equal("json")
      type.parameters.must.eql({v: "1"})
    })

    it("must not share parameters object", function() {
      new MediumType().parameters.must.not.equal(new MediumType().parameters)
    })

    it("must parse type and subtype", function() {
      var type = new MediumType("application/vnd.app.model")
      type.type.must.equal("application")
      type.subtype.must.equal("vnd.app.model")
      type.suffix.must.equal("")
      type.parameters.must.eql({})
    })

    // https://www.iana.org/assignments/media-types/media-types.xhtml
    it("must parse empty suffix as subtype", function() {
      var type = new MediumType("audio/amr-wb+")
      type.type.must.equal("audio")
      type.subtype.must.equal("amr-wb+")
      type.suffix.must.equal("")
      type.parameters.must.eql({})
    })

    it("must parse suffix", function() {
      var type = new MediumType("application/vnd.app.model+json")
      type.type.must.equal("application")
      type.subtype.must.equal("vnd.app.model")
      type.suffix.must.equal("json")
      type.parameters.must.eql({})
    })

    it("must parse double suffix", function() {
      var type = new MediumType("application/vnd.app.model+xml+zip")
      type.type.must.equal("application")
      type.subtype.must.equal("vnd.app.model")
      type.suffix.must.equal("xml+zip")
      type.parameters.must.eql({})
    })

    it("must parse parameter", function() {
      var string = "application/vnd.app.model; q=0.5"
      var type = new MediumType(string)
      type.type.must.equal("application")
      type.subtype.must.equal("vnd.app.model")
      type.suffix.must.equal("")
      type.parameters.must.eql({q: "0.5"})
    })

    it("must parse parameter with suffix", function() {
      var type = new MediumType("application/vnd.app.model+json; v=1")
      type.type.must.equal("application")
      type.subtype.must.equal("vnd.app.model")
      type.suffix.must.equal("json")
      type.parameters.must.eql({v: "1"})
    })

    it("must parse parameter without leading space", function() {
      var string = "application/vnd.app.model;q=0.5"
      var type = new MediumType(string)
      type.type.must.equal("application")
      type.subtype.must.equal("vnd.app.model")
      type.suffix.must.equal("")
      type.parameters.must.eql({q: "0.5"})
    })

    it("must parse parameters", function() {
      var string = "application/vnd.app.model; q=0.5; v=1; charset=utf-8"
      var type = new MediumType(string)
      type.type.must.equal("application")
      type.subtype.must.equal("vnd.app.model")
      type.suffix.must.equal("")
      type.parameters.must.eql({q: "0.5", v: "1", charset: "utf-8"})
    })

    it("must parse parameters without whitespace", function() {
      var string = "application/vnd.app.model;q=0.5;v=1;charset=utf-8"
      var type = new MediumType(string)
      type.type.must.equal("application")
      type.subtype.must.equal("vnd.app.model")
      type.suffix.must.equal("")
      type.parameters.must.eql({q: "0.5", v: "1", charset: "utf-8"})
    })

    it("must parse parameters with extra intermediate whitespace", function() {
      var type = new MediumType("application/vnd.app.model  ;  q=0.5  ;  v=1")
      type.type.must.equal("application")
      type.subtype.must.equal("vnd.app.model")
      type.suffix.must.equal("")
      type.parameters.must.eql({q: "0.5", v: "1"})
    })

    it("must parse dotted subtypes", function() {
      var type = new MediumType("application/vnd.app.model")
      type.type.must.equal("application")
      type.subtype.must.equal("vnd.app.model")
    })

    it("must parse dashed subtypes", function() {
      var type = new MediumType("application/octet-stream")
      type.type.must.equal("application")
      type.subtype.must.equal("octet-stream")
    })

    it("must lowercase types", function() {
      var type = new MediumType("TEXT/PLAIN")
      type.type.must.equal("text")
      type.subtype.must.equal("plain")
    })

    it("must lowercase suffix", function() {
      var type = new MediumType("application/vnd.foo+JSON")
      type.suffix.must.equal("json")
    })

    it("must lowercase parameters", function() {
      var type = new MediumType("text/plain; CharSet=utf-8")
      type.parameters.charset.must.equal("utf-8")
    })

    it("must parse */*", function() {
      var type = new MediumType("*/*")
      type.type.must.equal("*")
      type.subtype.must.equal("*")
    })

    it("must parse interpunctuation", function() {
      var string = "-!#$%^&*_{}|'.`~"
      var type = new MediumType(string+"/"+string+"+json; "+string+"=1")
      type.type.must.equal(string)
      type.subtype.must.equal(string)
      type.suffix.must.equal("json")

      var params = {}; params[string] = "1"
      type.parameters.must.eql(params)
    })

    it("must parse quoted value", function() {
      var type = new MediumType("text/plain; charset=\"utf-8\"")
      type.type.must.equal("text")
      type.subtype.must.equal("plain")
      type.parameters.must.eql({charset: "utf-8"})
    })

    it("must parse quoted values", function() {
      var type = new MediumType("text/plain; q=0.5; v=\"1\"; charset=\"utf-8\"")
      type.type.must.equal("text")
      type.subtype.must.equal("plain")
      type.parameters.must.eql({q: "0.5", v: "1", charset: "utf-8"})
    })

    it("must parse quoted empty value", function() {
      var type = new MediumType("text/plain; charset=\"\"")
      type.parameters.must.eql({charset: ""})
    })

    it("must parse quoted space", function() {
      var type = new MediumType("text/plain; charset=\" \"")
      type.parameters.must.eql({charset: " "})
    })

    it("must parse quoted and escaped quote", function() {
      var type = new MediumType("text/plain; v=\"\\\"\"")
      type.parameters.must.eql({v: "\""})
    })

    it("must parse quoted and escaped backslash", function() {
      var type = new MediumType("text/plain; v=\"\\\\\"")
      type.parameters.must.eql({v: "\\"})
    })

    it("must parse quoted extended ASCII character", function() {
      var type = new MediumType("text/plain; v=\"ä\"")
      type.parameters.must.eql({v: "ä"})
    })

    it("must parse quoted UTF-8 character", function() {
      var type = new MediumType("text/plain; v=\"™\"")
      type.parameters.must.eql({v: "™"})
    })

    it("must throw SyntaxError when parts missing", function() {
      mustThrowSyntaxError("")
    })

    it("must throw SyntaxError given whitespace between parameter value",
      function() {
      var err
      try { new MediumType("application.vnd.foo; v = 1") }
      catch (ex) { err = ex }
      err.must.be.an.instanceof(SyntaxError)
    })

    it("must throw SyntaxError given an unclosed quoted string", function() {
      var err
      try { new MediumType("application.vnd.foo; v=\"1") }
      catch (ex) { err = ex }
      err.must.be.an.instanceof(SyntaxError)
    })

    it("must throw SyntaxError given an extended ASCII character", function() {
      mustThrowSyntaxError("ä")
    })

    ASCII.filter(isSpecial).forEach(function(char) {
      it("must throw SyntaxError given a special character «" + char + "»",
        function() {
        mustThrowSyntaxError(char)
      })
    })

    ASCII.filter(isControl).forEach(function(char) {
      var code = char.charCodeAt(0)
      it("must throw SyntaxError given a control character «" + code + "»",
        function() {
        mustThrowSyntaxError(char)
      })
    })

    it("must throw SyntaxError given a control character as a quoted value",
      function() {
      var err

      err = null
      try { new MediumType("application/vnd.foo; v=\"\x00\"") }
      catch (ex) { err = ex }
      err.must.be.an.instanceof(SyntaxError)

      err = null
      try { new MediumType("application/vnd.foo; v=\"\x1f\"") }
      catch (ex) { err = ex }
      err.must.be.an.instanceof(SyntaxError)

      err = null
      try { new MediumType("application/vnd.foo; v=\"\x7f\"") }
      catch (ex) { err = ex }
      err.must.be.an.instanceof(SyntaxError)
    })

    it("must throw SyntaxError given a space character", function() {
      mustThrowSyntaxError(" ")
    })
  })

  describe(".prototype.toString", function() {
    it("must stringify type and subtype", function() {
      var type = new MediumType({
        type: "application",
        subtype: "vnd.app.model",
        parameters: {v: "1"}
      })

      type.toString().must.equal("application/vnd.app.model; v=1")
    })

    it("must stringify suffix", function() {
      var type = new MediumType({
        type: "application",
        subtype: "vnd.app.model",
        suffix: "json"
      })

      type.toString().must.equal("application/vnd.app.model+json")
    })

    it("must stringify parameters", function() {
      var type = new MediumType({
        type: "application",
        subtype: "vnd.app.model",
        parameters: {q: 0.5, v: 1, charset: "utf-8"}
      })

      var string = "application/vnd.app.model; q=0.5; v=1; charset=utf-8"
      type.toString().must.equal(string)
    })

    it("must escape multiple characters", function() {
      var type = new MediumType({
        type: "application", subtype: "vnd.app.model",
        parameters: {param: "John \"The\" Smith"}
      })

      var string = "application/vnd.app.model; param=\"John \\\"The\\\" Smith\""
      type.toString().must.equal(string)
    })

    it("must ignore an undefined value", function() {
      var type = new MediumType({
        type: "application",
        subtype: "vnd.app.model",
        parameters: {param: undefined}
      })

      type.toString().must.equal("application/vnd.app.model")
    })

    it("must stringify a null value as empty", function() {
      var type = new MediumType({
        type: "application",
        subtype: "vnd.app.model",
        parameters: {param: null}
      })

      type.toString().must.equal("application/vnd.app.model; param=\"\"")
    })

    it("must quote an empty value", function() {
      var type = new MediumType({
        type: "application",
        subtype: "vnd.app.model",
        parameters: {param: ""}
      })

      type.toString().must.equal("application/vnd.app.model; param=\"\"")
    })

    it("must quote a space", function() {
      var type = new MediumType({
        type: "application",
        subtype: "vnd.app.model",
        parameters: {param: " "}
      })

      type.toString().must.equal("application/vnd.app.model; param=\" \"")
    })

    it("must quote and escape a quote", function() {
      var type = new MediumType({
        type: "application",
        subtype: "vnd.app.model",
        parameters: {param: "\""}
      })

      type.toString().must.equal("application/vnd.app.model; param=\"\\\"\"")
    })

    it("must quote and escape a backslash", function() {
      var type = new MediumType({
        type: "application",
        subtype: "vnd.app.model",
        parameters: {param: "\\"}
      })

      type.toString().must.equal("application/vnd.app.model; param=\"\\\\\"")
    })

    it("must quote an extended ASCII character", function() {
      var type = new MediumType({
        type: "application",
        subtype: "vnd.app.model",
        parameters: {param: "ä"}
      })

      type.toString().must.equal("application/vnd.app.model; param=\"ä\"")
    })

    it("must quote a UTF-8 character", function() {
      var type = new MediumType({
        type: "application",
        subtype: "vnd.app.model",
        parameters: {param: "™"}
      })

      type.toString().must.equal("application/vnd.app.model; param=\"™\"")
    })

    ASCII.filter(isSpecial).forEach(function(char) {
      if (char == "\"") return
      if (char == "\\") return

      it("must quote special character «" + char + "»", function() {
        var type = new MediumType({
          type: "application",
          subtype: "vnd.app.model",
          parameters: {v: char}
        })

        type.toString().must.equal("application/vnd.app.model; v=\""+char+"\"")
      })
    })
  })

  describe(".prototype.toJSON", function() {
    it("must stringify", function() {
      var type = new MediumType({
        type: "application",
        subtype: "vnd.app.model",
        suffix: "json",
        parameters: {v: "1"}
      })

      var string = JSON.parse(JSON.stringify(type))
      string.must.equal("application/vnd.app.model+json; v=1")
    })
  })

  describe(".parse", function() {
    it("must parse given string to MediumType", function() {
      var type = MediumType.parse("application/vnd.app.model+json; v=1")
      type.must.be.an.instanceof(MediumType)
      type.type.must.equal("application")
      type.subtype.must.equal("vnd.app.model")
      type.suffix.must.equal("json")
      type.parameters.must.eql({v: "1"})
    })
  })

  describe(".stringify", function() {
    it("must stringify given a MediumType", function() {
      var type = new MediumType({
        type: "application",
        subtype: "vnd.app.model",
        parameters: {q: 0.5, v: 1, charset: "utf-8"}
      })

      var string = "application/vnd.app.model; q=0.5; v=1; charset=utf-8"
      MediumType.stringify(type).must.equal(string)
    })

    it("must stringify given an object", function() {
      var type = {
        type: "application",
        subtype: "vnd.app.model",
        parameters: {q: 0.5, v: 1, charset: "utf-8"}
      }

      var string = "application/vnd.app.model; q=0.5; v=1; charset=utf-8"
      MediumType.stringify(type).must.equal(string)
    })

    it("must stringify given a string", function() {
      var given = "application/vnd.app.model;q=0.5;v=1;charset=utf-8"
      var string = "application/vnd.app.model; q=0.5; v=1; charset=utf-8"
      MediumType.stringify(given).must.equal(string)
    })
  })
})

function isControl(char) {
  var code = char.charCodeAt(0)
  if (code >= 0 && code < 32) return true
  if (code == 127) return true
  return false
}

function isSpecial(char) { return !!~SPECIAL.indexOf(char) }

function mustThrowSyntaxError(char) {
  var err

  err = null
  try { new MediumType(char + "/json") }
  catch (ex) { err = ex }
  err.must.be.an.instanceof(SyntaxError)

  err = null
  try { new MediumType("application/" + char) }
  catch (ex) { err = ex }
  err.must.be.an.instanceof(SyntaxError)

  err = null
  try { new MediumType("application.vnd.foo; " + char +"=1") }
  catch (ex) { err = ex }
  err.must.be.an.instanceof(SyntaxError)

  err = null
  try { new MediumType("application.vnd.foo; v=" + char) }
  catch (ex) { err = ex }
  err.must.be.an.instanceof(SyntaxError)
}