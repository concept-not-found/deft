const {ParserFactory, oneOf, manyOf, optional, ref, except, separated} = require('./parser-factory')

const reservedWords = [
  'null',
  'true',
  'false'
]

module.exports = ParserFactory({
  Null: 'null',

  Boolean: oneOf('true', 'false'),

  Identifier: except(/[$a-z_A-Z][$0-9a-z_A-Z]*/, reservedWords),

  Numeric: oneOf(
    /0(b|B)[01]+/,
    /0(o|O)[0-7]+/,
    /0(x|X)[0-9a-fA-F]+/,
    /(0|([1-9][0-9]*))\.?((e|E)(\+|-)?[0-9]+)?/
  ),

  String: oneOf(
    [
      '"',
      optional(manyOf(
        /[^"\\\b\f\n\r\t\v\0]/,
        '\\\'',
        '\\"',
        '\\\\',
        '\\b',
        '\\f',
        '\\n',
        '\\r',
        '\\t',
        '\\v',
        '\\0',
        /\\x[0-9a-fA-F]{2}/,
        /\\u[0-9a-fA-F]{4}/,
        /\\u\{[0-9a-fA-F]{1,6}\}/
      )),
      '"',
    ],
    [
      '\'',
      optional(manyOf(
        /[^'\\\b\f\n\r\t\v\0]/,
        '\\\'',
        '\\"',
        '\\\\',
        '\\b',
        '\\f',
        '\\n',
        '\\r',
        '\\t',
        '\\v',
        '\\0',
        /\\x[0-9a-fA-F]{2}/,
        /\\u[0-9a-fA-F]{4}/,
        /\\u\{[0-9a-fA-F]{1,6}\}/
      )),
      '\'',
    ]
  ),

  Whitespace: oneOf(
    '\t',
    ' ',
    '\n',
    '\r'
  ),

  Array: [
    '[',
    optional(
      optional(ref('Whitespace')),
      separated(ref('Expression'), [
        optional(ref('Whitespace')),
        ',',
        optional(ref('Whitespace'))
      ]),
      optional(ref('Whitespace'))
    ),
    ']'
  ],

  Object: [
    '{',
    optional(
      optional(ref('Whitespace')),
      separated([
        oneOf(
          ref('Identifier'),
          ref('String'),
          ref('Numeric')
        ),
        optional(ref('Whitespace')),
        ':',
        optional(ref('Whitespace')),
        ref('Expression')
      ], [
        optional(ref('Whitespace')),
        ',',
        optional(ref('Whitespace'))
      ]),
      optional(ref('Whitespace'))
    ),
    '}'
  ],

  ArrowFunction: [
    oneOf(
      ref('Identifier'),
      [
        '(',
        optional(
          optional(ref('Whitespace')),
          separated(ref('Identifier'), [
            optional(ref('Whitespace')),
            ',',
            optional(ref('Whitespace'))
          ]),
          optional(ref('Whitespace'))
        ),
        ')'
      ]
    ),
    optional(ref('Whitespace')),
    '=>',
    optional(ref('Whitespace')),
    ref('Expression')
  ],

  Expression: oneOf(
    ref('ArrowFunction'),
    ref('Identifier'),
    ref('Null'),
    ref('Boolean'),
    ref('Numeric'),
    ref('String'),
    ref('Array'),
    ref('Object'),
    [
      '(',
      ref('Expression'),
      ')'
    ]
  ),

  Root: [
    optional(manyOf(ref('Whitespace'))),
    optional(ref('Expression')),
    optional(manyOf(ref('Whitespace')))
  ]
})
