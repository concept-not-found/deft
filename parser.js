const {ParserFactory, oneOf, optional, manyOf, separated, Node} = require('./parser-factory')

module.exports = ParserFactory({
  Null: 'null',

  Boolean: oneOf('true', 'false'),

  Number: [
    optional('-'),
    manyOf('0', '1', '2', '3', '4', '5', '6', '7', '8', '9'),
    optional([
      '.',
      manyOf('0', '1', '2', '3', '4', '5', '6', '7', '8', '9')
    ]),
    optional([
      oneOf('e', 'E'),
      oneOf('-', '+'),
      manyOf('0', '1', '2', '3', '4', '5', '6', '7', '8', '9')
    ])
  ],

  String: oneOf(
    [
      '"',
      /a-zA-Z/,
      '"',
    ],
    [
      "'",
      /a-zA-Z/,
      "'"
    ]
  ),

  Whitespace: manyOf(
    ' ',
    '\t'
  ),

  Array: [
    '[',
    optional(
      optional(Node('Whitespace')),
      separated(Node('Expression'), [
        optional(Node('Whitespace')),
        ',',
        optional(Node('Whitespace'))
      ]),
      optional(Node('Whitespace'))
    ),
    ']'
  ],

  Object: [
    '{',
    optional(
      optional(Node('Whitespace')),
      separated(Node('Property'), [
        optional(Node('Whitespace')),
        ',',
        optional(Node('Whitespace'))
      ]),
      optional(Node('Whitespace'))
    ),
    '}'
  ],

  Property: [
    Node('String'),
    optional(Node('Whitespace')),
    ':',
    optional(Node('Whitespace')),
    Node('Expression')
  ],

  Expression: oneOf(
    Node('Null'),
    Node('Boolean'),
    Node('Number'),
    Node('String'),
    Node('Array'),
    Node('Object'),
    [
      '(',
      Node('Expression'),
      ')'
    ]
  )
})
