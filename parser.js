const {ParserFactory, oneOf, optional, ref, except, separated, zeroOrMoreOf} = require('./parser-factory')

const reservedWords = [
  'null',
  'true',
  'false',
  'typeof'
]

module.exports = ParserFactory({
  Null: 'null',

  Boolean: oneOf('true', 'false'),

  Identifier: except(/[^ !"#%&'()*+,-./0-9:;<=>?@[\\\]^`{|}~][^ !"#%&'()*+,-./:;<=>?@[\\\]^`{|}~]*/, reservedWords),

  Numeric: oneOf(
    /0(b|B)[01]+/,
    /0(o|O)[0-7]+/,
    /0(x|X)[0-9a-fA-F]+/,
    /(0|([1-9][0-9]*))\.?((e|E)(\+|-)?[0-9]+)?/
  ),

  String: oneOf(
    [
      '"',
      zeroOrMoreOf(
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
      ),
      '"',
    ],
    [
      '\'',
      zeroOrMoreOf(
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
      ),
      '\'',
    ]
  ),

  Whitespace: /[\n\r\t ]*/,

  Array: [
    '[',
    ref('Whitespace'),
    optional(separated(ref('Expression'), [
      ref('Whitespace'),
      ',',
      ref('Whitespace')
    ])),
    ref('Whitespace'),
    ']'
  ],

  Object: [
    '{',
    ref('Whitespace'),
    optional(separated([
      oneOf(
        ref('Identifier'),
        ref('String'),
        ref('Numeric')
      ),
      ref('Whitespace'),
      ':',
      ref('Whitespace'),
      ref('Expression')
    ], [
      ref('Whitespace'),
      ',',
      ref('Whitespace')
    ])),
    ref('Whitespace'),
    '}'
  ],

  ArrowFunction: [
    oneOf(
      ref('Identifier'),
      [
        '(',
        ref('Whitespace'),
        separated(ref('Identifier'), [
          ref('Whitespace'),
          ',',
          ref('Whitespace')
        ]),
        ref('Whitespace'),
        ')'
      ]
    ),
    ref('Whitespace'),
    '=>',
    ref('Whitespace'),
    ref('Expression')
  ],

  Block: [
    '{',
    ref('Whitespace'),
    separated([
      ref('Identifier'),
      ref('Whitespace'),
      '=',
      ref('Whitespace'),
      ref('Expression'),
    ], ref('Whitespace')),
    ref('Expression'),
    '}'
  ],

  Expression: [
    oneOf(
      ref('ArrowFunction'),
      ref('Identifier'),
      ref('Null'),
      ref('Boolean'),
      ref('Numeric'),
      ref('String'),
      ref('Array'),
      ref('Object'),
      ref('Block'),
      [
        '(',
        ref('Whitespace'),
        ref('Expression'),
        ref('Whitespace'),
        ')'
      ]
    ),
    ref('Whitespace'),
    optional(separated(oneOf(
      [
        '(',
        ref('Whitespace'),
        separated(ref('Expression'), [
          ref('Whitespace'),
          ',',
          ref('Whitespace')
        ]),
        ref('Whitespace'),
        ')'
      ],
      [
        '[',
        ref('Whitespace'),
        ref('Expression'),
        ref('Whitespace'),
        ']'
      ],
      [
        '.',
        ref('Whitespace'),
        ref('Identifier')
      ]
    ), ref('Whitespace')))
  ],

  Root: [
    ref('Whitespace'),
    optional(ref('Expression')),
    ref('Whitespace')
  ]
})
