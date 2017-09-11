start = _ Expression? _

_ = [ \t\n\r]*

Expression = Null
  / Boolean
  / Numeric
  / Call
  / Identifier
  / String
  / Array
  / Object
  / Block

Array = "[" _ (Expression (_ "," _  Expression)*)? _ "]"

Object = "{" _ ((Identifier _ ":" _ Expression) (_ "," _ (Identifier _ ":" _ Expression))*)? _ "}"

Block = "{" _ ((Identifier _ "=" _ Expression) (_ (Identifier _ "=" _ Expression))*)? Expression _ "}"

Call = Identifier _ "(" _ (Expression (_ "," _ Expression)*)? _ ")"
Identifier = head:(
[$_a-zA-Z]
) tail:(
[$_a-zA-Z0-9]
)* {
  return {
    type: 'Identifier',
    name: `${head}${tail.join('')}`
  }
}

Null = 'null' {
  return {
    type: 'Null'
  }
}

Boolean = 'true' {
  return {
    type: 'Boolean',
    value: true
  }
}
  / 'false' {
    return {
      type: 'Boolean',
      value: false
    }
  }

Numeric = "NaN"
  / "Infinity"
  / literal:("0x"i digits:$[0-9a-fA-F]+ {
  return {
    type: 'Numeric',
    value: parseInt(digits, 16)
  };
}) {
  return literal
}
  / literal:(("0"
  / [1-9] [0-9]*) ("." [0-9]*)? (("e" / "E") (("+" / "-")? [0-9]+))? {
  return { type: "Literal", value: parseFloat(text()) };
}
  / "." [0-9]+ (("e" / "E") (("+" / "-")? [0-9]+))? {
    return { type: "Literal", value: parseFloat(text()) };
  }) {
    return literal
  }

String = '"' chars:([^"\\\b\f\n\r\v\0] { return text(); }
  / "\\" sequence:(['"\\bfnrtv0]
  / ("x" digits:$([0-9a-fA-F] [0-9a-fA-F]) {
  return String.fromCharCode(parseInt(digits, 16));
})
  / ("u" digits:$([0-9a-fA-F] [0-9a-fA-F] [0-9a-fA-F] [0-9a-fA-F]) {
  return String.fromCharCode(parseInt(digits, 16));
})) { return sequence; })* '"' {
  return { type: "Literal", value: chars.join("") };
}
  / "'" chars:([^'\\\b\f\n\r\v\0] { return text(); }
  / "\\" sequence:(['"\\bfnrtv0]
  / ("x" digits:$([0-9a-fA-F] [0-9a-fA-F]) {
  return String.fromCharCode(parseInt(digits, 16));
})
  / ("u" digits:$([0-9a-fA-F] [0-9a-fA-F] [0-9a-fA-F] [0-9a-fA-F]) {
  return String.fromCharCode(parseInt(digits, 16));
})) { return sequence; })* "'" {
  return { type: "Literal", value: chars.join("") };
}
