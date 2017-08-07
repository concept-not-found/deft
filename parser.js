const {ParserFactory, oneOf, manyOf, optional, ref, except} = require('./parser-factory')

const reservedWords = [
  'null',
  'true',
  'false'
]

module.exports = ParserFactory({
  Null: 'null',

  Boolean: oneOf('true', 'false'),

  Identifier: except(/[$a-z_A-Z][$0-9a-z_A-Z]*/, reservedWords),
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

  Whitespace: oneOf(
    '\t',
    ' '
  ),

  LineTerminator: oneOf(
    '\n',
    '\r'
  ),

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
    ref('Identifier'),
    ref('Null'),
    ref('Boolean')
    // ref('String'),
    // ref('Array'),
    // ref('Object'),
    // [
    //   '(',
    //   ref('Expression'),
    //   ')'
    // ]
  ),

  Root: [
    optional(manyOf(oneOf(
      ref('Whitespace'),
      ref('LineTerminator')
    ))),
    optional(ref('Expression')),
    optional(manyOf(oneOf(
      ref('Whitespace'),
      ref('LineTerminator')
    )))
  ]
})
