const {ParserFactory, oneOf, optional, ref} = require('./parser-factory')

module.exports = ParserFactory({
  Null: 'null',

  Boolean: oneOf('true', 'false'),

  // Number: [
  //   optional('-'),
  //   manyOf('0', '1', '2', '3', '4', '5', '6', '7', '8', '9'),
  //   optional([
  //     '.',
  //     manyOf('0', '1', '2', '3', '4', '5', '6', '7', '8', '9')
  //   ]),
  //   optional([
  //     oneOf('e', 'E'),
  //     oneOf('-', '+'),
  //     manyOf('0', '1', '2', '3', '4', '5', '6', '7', '8', '9')
  //   ])
  // ],

  // String: oneOf(
  //   [
  //     '"',
  //     /a-zA-Z/,
  //     '"',
  //   ],
  //   [
  //     '\'',
  //     /a-zA-Z/,
  //     '\''
  //   ]
  // ),

  // Whitespace: manyOf(
  //   ' ',
  //   '\t',
  //   '\r\n',
  //   '\r',
  //   '\n'
  // ),

  // Array: [
  //   '[',
  //   optional(
  //     optional(ref('Whitespace')),
  //     separated(ref('Expression'), [
  //       optional(ref('Whitespace')),
  //       ',',
  //       optional(ref('Whitespace'))
  //     ]),
  //     optional(ref('Whitespace'))
  //   ),
  //   ']'
  // ],

  // Object: [
  //   '{',
  //   optional(
  //     optional(ref('Whitespace')),
  //     separated(ref('Property'), [
  //       optional(ref('Whitespace')),
  //       ',',
  //       optional(ref('Whitespace'))
  //     ]),
  //     optional(ref('Whitespace'))
  //   ),
  //   '}'
  // ],

  // Property: [
  //   ref('String'),
  //   optional(ref('Whitespace')),
  //   ':',
  //   optional(ref('Whitespace')),
  //   ref('Expression')
  // ],git 

  Expression: oneOf(
    ref('Null'),
    ref('Boolean')
    // ref('Number'),
    // ref('String'),
    // ref('Array'),
    // ref('Object'),
    // [
    //   '(',
    //   ref('Expression'),
    //   ')'
    // ]
  ),

  Root: optional(ref('Expression'))
})
