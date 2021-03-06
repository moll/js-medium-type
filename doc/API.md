MediumType.js API Documentation
===============================
### [MediumType](#MediumType)
- [name](#mediumType.name)
- [parameters](#mediumType.parameters)
- [q](#mediumType.q)
- [subtype](#mediumType.subtype)
- [suffix](#mediumType.suffix)
- [type](#mediumType.type)
- [.prototype.match](#MediumType.prototype.match)(type)
- [.prototype.toJSON](#MediumType.prototype.toJSON)()
- [.prototype.toString](#MediumType.prototype.toString)()
- [.parse](#MediumType.parse)(type)
- [.sort](#MediumType.sort)(types)
- [.split](#MediumType.split)(types)
- [.stringify](#MediumType.stringify)(type)


MediumType(mediaType) <a name="MediumType"></a>
---------------------
[RFC 2045][rfc2045] media type class.

Implements parsing based on [RFC 2045][rfc2045] with added support for
suffixes ([RFC 3023][rfc3023], [RFC 6839][rfc6839]).

Pass it a string or an object with necessary fields.  
Media types with invalid syntax will result in a `SyntaxError` being thrown.

[rfc2045]: https://tools.ietf.org/html/rfc2045
[rfc3023]: https://tools.ietf.org/html/rfc3023
[rfc6839]: https://tools.ietf.org/html/rfc6839

**Examples**:
```javascript
new MediumType("application/vnd.app.model+json; charset=utf-8")

new MediumType({
  type: "application",
  subtype: "vnd.app.model",
  suffix: "json",
  parameters: {charset: "utf-8"}
})
```

### mediumType.name <a name="mediumType.name"></a>
Full media type name without parameters (read-only).  
Contains the type, subtype and optional suffix.

**Examples**:
```javascript
new MediumType("application/rdf+xml").name // application/rdf+xml
new MediumType("text/html; q=0.3").name // text/html
```

### mediumType.parameters <a name="mediumType.parameters"></a>
Parameters of the media type.  
Keys are always in lower case. Values are left as-is.

**Examples**:
```javascript
new MediumType("text/html; q=0.3; charset=utf-8").parameters
// {q: "0.3", charset: "utf-8"}
```

### mediumType.q <a name="mediumType.q"></a>
Numeric quality value of the media type taken from the `q` parameter.  
If missing, will default to `1`.

**Examples**:
```javascript
new MediumType("text/html; q=0.3").q // 0.3
new MediumType("text/html").q // 1
```

### mediumType.subtype <a name="mediumType.subtype"></a>
Subtype of the media type.  
Always in lower case.

**Examples**:
```javascript
new MediumType("application/json").subtype // "json"
```

### mediumType.suffix <a name="mediumType.suffix"></a>
Suffix of the media type.  
Always in lower case.

**Examples**:
```javascript
new MediumType("application/vnd.app.model+xml").suffix // "xml"
```

### mediumType.type <a name="mediumType.type"></a>
Type of the media type.  
Always in lower case.

**Examples**:
```javascript
new MediumType("application/json").type // "application"
```

### MediumType.prototype.match(type) <a name="MediumType.prototype.match"></a>
Matches a given media type pattern to the current media type.  
Supports wildcards (`*`) for type and subtype.  

Only those parameters are checked that are in the given type. This allows
for matching `application/json; charset=utf-8` by passing in
`application/json`. `application/json; charset=utf-16` however would not
match. The `q` parameter is ignored entirely for easier use when matching
against HTTP's `Accept` header types.

**Examples**:
```javascript
new MediumType("application/json").match(new MediumType("application/json")) // true
new MediumType("application/json").match("application/*") // true
new MediumType("text/html+zip").match("text/*+zip") // true
new MediumType("text/html; charset=utf-8").match("text/html; charset=utf-8") // true
new MediumType("text/html").match("text/html; q=0.3") // true
```

### MediumType.prototype.toJSON() <a name="MediumType.prototype.toJSON"></a>
Alias of [`toString`](#MediumType.prototype.toString).  
Stringifies the media type to a canonical string when passing it to
`JSON.stringify`.  
This way you don't need to manually call `toString` when stringifying.

**Examples**:
```javascript
JSON.stringify(new MediumType("text/html")) // "\"text/html\""
```

### MediumType.prototype.toString() <a name="MediumType.prototype.toString"></a>
Stringify a `MediumType` to canonical form.

**Examples**:
```javascript
new MediumType({type: "text", subtype: "html"}).toString() // "text/html"
new MediumType("text/html;q=0.3").toString() // "text/html; q=0.3"
```

### MediumType.parse(type) <a name="MediumType.parse"></a>
Parse a media type string to a `MediumType`.  
Media types with invalid syntax will result in a `SyntaxError` being thrown.

**Examples**:
```javascript
MediumType.parse("application/json")
MediumType.parse("text/html+zip")
MediumType.parse("text/html; charset=utf-8")
```

### MediumType.sort(types) <a name="MediumType.sort"></a>
Sort an array of `MediumType`s according to sorting rules of the HTTP
`Accept` header listed in [RFC 2616][rfc2616] and [RFC 7231][rfc7231].
That is, first by the `q` parameter, then by type and subtype specificity
and then by parameter count (excluding the `q` parameter).

Returns a new array and does not modify the given array.

If you want to sort the comma separated HTTP `Accept` header, split it first
with [`MediumType.split`](#MediumType.split).

[rfc2616]: https://tools.ietf.org/html/rfc2616
[rfc7231]: https://tools.ietf.org/html/rfc7231

**Examples**:
```javascript
MediumType.sort([
  new MediumType("text/html; level=3; q=0.7"),
  new MediumType("text/html; q=0.7"),
  new MediumType("text/plain; q=0.5"),
  new MediumType("text/*; q=0.1")
])
```

### MediumType.split(types) <a name="MediumType.split"></a>
Split a comma separated string to an array of media type strings.  
Handles quoted parameters with embedded spaces, commas etc.

If you need `MediaType` instances back, map over the array with
`MediumType`:
```javascript
MediumType.split(types).map(MediaType)
```

**Examples**:
```javascript
MediumType.split("text/html; levels=\"1, 2, 3\", text/plain")
// [
//   "text/html; levels=\"1, 2, 3\"",
//   "text/plain"
// ]
```

### MediumType.stringify(type) <a name="MediumType.stringify"></a>
Alias of [`toString`](#MediumType.prototype.toString).  
Stringify a `MediumType` to canonical form.

**Examples**:
```javascript
MediumType.stringify(new MediumType("text/html")) // "text/html"
MediumType.stringify({type: "text", subtype: "html"}) // "text/html"
MediumType.stringify("text/html;q=0.3") // "text/html; q=0.3"
```
