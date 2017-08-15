const {LexerFactory, oneOf, manyOf, optional, ref, except, separated} = require('./lexer-factory')

describe('lexer factory', () => {
  describe('hotdog lexer', () => {
    const lexer = LexerFactory({
      Root: 'hotdog'
    })

    it('should lex exactly hotdog', () => {
      expect(lexer('hotdog')).toEqual({
        result: 'Success',
        ref: 'Root',
        value: 'hotdog',
        start: {
          index: 0,
          line: 0,
          column: 0
        },
        end: {
          index: 6,
          line: 0,
          column: 6
        }
      })
    })

    it('should fail to lex empty', () => {
      expect(lexer('')).toEqual({
        result: 'Error',
        ref: 'Root',
        error: 'expected "hotdog"',
        pointer: {
          index: 0,
          line: 0,
          column: 0
        }
      })
    })

    it('should fail to lex not hotdog', () => {
      expect(lexer('not hotdog')).toEqual({
        result: 'Error',
        ref: 'Root',
        error: 'expected "hotdog"',
        pointer: {
          index: 0,
          line: 0,
          column: 0
        }
      })
    })

    it('should fail to lex hotdog in your mouth', () => {
      expect(lexer('hotdog in your mouth')).toEqual({
        result: 'Error',
        ref: 'Root',
        error: 'unexpected source after Root',
        pointer: {
          index: 6,
          line: 0,
          column: 6
        }
      })
    })
  })

  describe('hotdog lexer with extra array', () => {
    const lexer = LexerFactory({
      Root: ['hotdog']
    })

    it('should lex exactly hotdog', () => {
      expect(lexer('hotdog')).toEqual({
        result: 'Success',
        ref: 'Root',
        value: 'hotdog',
        start: {
          index: 0,
          line: 0,
          column: 0
        },
        end: {
          index: 6,
          line: 0,
          column: 6
        }
      })
    })

    it('should fail to lex empty', () => {
      expect(lexer('')).toEqual({
        result: 'Error',
        ref: 'Root',
        error: 'expected "hotdog"',
        pointer: {
          index: 0,
          line: 0,
          column: 0
        }
      })
    })
  })

  describe('hot\\ndog lexer', () => {
    const lexer = LexerFactory({
      Root: 'hot\ndog'
    })

    it('should lex exactly hot\\ndog', () => {
      expect(lexer('hot\ndog')).toEqual({
        result: 'Success',
        ref: 'Root',
        value: 'hot\ndog',
        start: {
          index: 0,
          line: 0,
          column: 0
        },
        end: {
          index: 7,
          line: 1,
          column: 3
        }
      })
    })

    it('should fail to lex hot\\r\\ndog', () => {
      expect(lexer('hot\r\ndog')).toEqual({
        result: 'Error',
        ref: 'Root',
        error: 'expected "hot\\ndog"',
        pointer: {
          index: 0,
          line: 0,
          column: 0
        }
      })
    })
  })

  describe('win\\r\\ndoze lexer', () => {
    const lexer = LexerFactory({
      Root: 'win\r\ndoze'
    })

    it('should lex exactly win\\r\\ndoze', () => {
      expect(lexer('win\r\ndoze')).toEqual({
        result: 'Success',
        ref: 'Root',
        value: 'win\r\ndoze',
        start: {
          index: 0,
          line: 0,
          column: 0
        },
        end: {
          index: 9,
          line: 1,
          column: 4
        }
      })
    })

    it('should fail to lex hot\\r\\ndog', () => {
      expect(lexer('hot\r\ndog')).toEqual({
        result: 'Error',
        ref: 'Root',
        error: 'expected "win\\r\\ndoze"',
        pointer: {
          index: 0,
          line: 0,
          column: 0
        }
      })
    })
  })

  describe('hotdog\\n lexer', () => {
    const lexer = LexerFactory({
      Root: 'hotdog\n'
    })

    it('should lex exactly hotdog\\n', () => {
      expect(lexer('hotdog\n')).toEqual({
        result: 'Success',
        ref: 'Root',
        value: 'hotdog\n',
        start: {
          index: 0,
          line: 0,
          column: 0
        },
        end: {
          index: 7,
          line: 1,
          column: 0
        }
      })
    })
  })

  describe('\\nhotdog lexer', () => {
    const lexer = LexerFactory({
      Root: '\nhotdog'
    })

    it('should lex exactly \\nhotdog', () => {
      expect(lexer('\nhotdog')).toEqual({
        result: 'Success',
        ref: 'Root',
        value: '\nhotdog',
        start: {
          index: 0,
          line: 0,
          column: 0
        },
        end: {
          index: 7,
          line: 1,
          column: 6
        }
      })
    })
  })

  describe('hotdog lexer using array', () => {
    const lexer = LexerFactory({
      Root: ['hot', 'dog']
    })

    it('should lex exactly hotdog', () => {
      expect(lexer('hotdog')).toEqual({
        result: 'Success',
        ref: 'Root',
        value: ['hot', 'dog'],
        start: {
          index: 0,
          line: 0,
          column: 0
        },
        end: {
          index: 6,
          line: 0,
          column: 6
        }
      })
    })

    it('should fail to lex empty', () => {
      expect(lexer('')).toEqual({
        result: 'Error',
        ref: 'Root',
        error: 'expected "hot"',
        pointer: {
          index: 0,
          line: 0,
          column: 0
        }
      })
    })
  })

  describe('hotdog lexer using regex', () => {
    const lexer = LexerFactory({
      Root: /hotdog/
    })

    it('should lex exactly hotdog', () => {
      expect(lexer('hotdog')).toEqual({
        result: 'Success',
        ref: 'Root',
        value: 'hotdog',
        start: {
          index: 0,
          line: 0,
          column: 0
        },
        end: {
          index: 6,
          line: 0,
          column: 6
        }
      })
    })

    it('should fail to lex empty', () => {
      expect(lexer('')).toEqual({
        result: 'Error',
        ref: 'Root',
        error: 'expected /hotdog/',
        pointer: {
          index: 0,
          line: 0,
          column: 0
        }
      })
    })

    it('should fail to lex veryhotdog', () => {
      expect(lexer('veryhotdog')).toEqual({
        result: 'Error',
        ref: 'Root',
        error: 'expected /hotdog/',
        pointer: {
          index: 0,
          line: 0,
          column: 0
        }
      })
    })

    it('should fail to lex hotdoghotdog', () => {
      expect(lexer('hotdoghotdog')).toEqual({
        result: 'Error',
        ref: 'Root',
        error: 'unexpected source after Root',
        pointer: {
          index: 6,
          line: 0,
          column: 6
        }
      })
    })
  })

  describe('star trek|war lexer', () => {
    const lexer = LexerFactory({
      Root: ['star', ' ', oneOf('trek', 'wars')]
    })

    it('should lex star trek', () => {
      expect(lexer('star trek')).toEqual({
        result: 'Success',
        ref: 'Root',
        value: ['star', ' ', 'trek'],
        start: {
          index: 0,
          line: 0,
          column: 0
        },
        end: {
          index: 9,
          line: 0,
          column: 9
        }
      })
    })

    it('should lex star wars', () => {
      expect(lexer('star wars')).toEqual({
        result: 'Success',
        ref: 'Root',
        value: ['star', ' ', 'wars'],
        start: {
          index: 0,
          line: 0,
          column: 0
        },
        end: {
          index: 9,
          line: 0,
          column: 9
        }
      })
    })

    it('should fail to lex star stroll', () => {
      expect(lexer('star stroll')).toEqual({
        result: 'Error',
        ref: 'Root',
        error: 'expected oneOf("trek", "wars")',
        pointer: {
          index: 5,
          line: 0,
          column: 5
        }
      })
    })
  })

  describe('ㅋㅋㅋㅋㅋㅋ lexer', () => {
    const lexer = LexerFactory({
      Root: manyOf('ㅋ')
    })

    it('should lex ㅋ', () => {
      expect(lexer('ㅋ')).toEqual({
        result: 'Success',
        ref: 'Root',
        value: 'ㅋ',
        start: {
          index: 0,
          line: 0,
          column: 0
        },
        end: {
          index: 1,
          line: 0,
          column: 1
        }
      })
    })

    it('should lex ㅋㅋㅋㅋㅋㅋ', () => {
      expect(lexer('ㅋㅋㅋㅋㅋㅋ')).toEqual({
        result: 'Success',
        ref: 'Root',
        value: ['ㅋ', 'ㅋ', 'ㅋ', 'ㅋ', 'ㅋ', 'ㅋ'],
        start: {
          index: 0,
          line: 0,
          column: 0
        },
        end: {
          index: 6,
          line: 0,
          column: 6
        }
      })
    })

    it('should fail to lex empty', () => {
      expect(lexer('')).toEqual({
        result: 'Error',
        ref: 'Root',
        error: 'expected manyOf("ㅋ")',
        pointer: {
          index: 0,
          line: 0,
          column: 0
        }
      })
    })
  })

  describe('maeby lexer', () => {
    const lexer = LexerFactory({
      Root: optional('maeby')
    })

    it('should lex maeby', () => {
      expect(lexer('maeby')).toEqual({
        result: 'Success',
        ref: 'Root',
        value: 'maeby',
        start: {
          index: 0,
          line: 0,
          column: 0
        },
        end: {
          index: 5,
          line: 0,
          column: 5
        }
      })
    })

    it('should lex empty', () => {
      expect(lexer('')).toEqual({
        result: 'Success',
        ref: 'Root',
        value: '',
        start: {
          index: 0,
          line: 0,
          column: 0
        },
        end: {
          index: 0,
          line: 0,
          column: 0
        }
      })
    })
  })

  describe('hotdog lexer with ref', () => {
    const lexer = LexerFactory({
      Root: ['hot', ref('Animal')],
      Animal: 'dog'
    })

    it('should lex hotdog', () => {
      expect(lexer('hotdog')).toEqual({
        result: 'Success',
        ref: 'Root',
        value: [
          'hot',
          {
            ref: 'Animal',
            value: 'dog',
            start: {
              index: 3,
              line: 0,
              column: 3
            },
            end: {
              index: 6,
              line: 0,
              column: 6
            }
          }
        ],
        start: {
          index: 0,
          line: 0,
          column: 0
        },
        end: {
          index: 6,
          line: 0,
          column: 6
        }
      })
    })

    it('should fail to lex hotcat', () => {
      expect(lexer('hotcat')).toEqual({
        result: 'Error',
        ref: 'Animal',
        error: 'expected "dog"',
        pointer: {
          index: 3,
          line: 0,
          column: 3
        }
      })
    })
  })

  describe('A -> (A) | B+B | 1; B -> (A) | 1 lexer', () => {
    const lexer = LexerFactory({
      Root: ref('Expression'),
      Expression: oneOf(
        ['(', ref('Expression'), ')'],
        [ref('Argument'), '+', ref('Argument')],
        ref('Literal')
      ),
      Argument: oneOf(
        ['(', ref('Expression'), ')'],
        ref('Literal')
      ),
      Literal: 1
    })

    it('should lex 1', () => {
      expect(lexer('1').result).toBe('Success')
    })

    it('should lex 1+1', () => {
      expect(lexer('1+1').result).toBe('Success')
    })

    it('should lex (1+1)', () => {
      expect(lexer('(1+1)').result).toBe('Success')
    })

    it('should lex 1+(1)', () => {
      expect(lexer('1+(1)').result).toBe('Success')
    })

    it('should lex 1+(1+1)', () => {
      expect(lexer('1+(1+1)').result).toBe('Success')
    })
  })

  describe('circular references', () => {
    it('should detect Root -> Root', () => {
      const lexer = LexerFactory({
        Root: ref('Root')
      })
      expect(lexer('')).toEqual({
        result: 'Error',
        ref: 'Root',
        error: 'circular reference detected {ref("Root") @ 0}',
        pointer: {
          index: 0,
          line: 0,
          column: 0
        }
      })
    })

    it('should detect A -> B -> A', () => {
      const lexer = LexerFactory({
        Root: ref('A'),
        A: ref('B'),
        B: ref('A')
      })
      expect(lexer('')).toEqual({
        result: 'Error',
        ref: 'B',
        error: 'circular reference detected {ref("Root") @ 0, ref("A") @ 0, ref("B") @ 0}',
        pointer: {
          index: 0,
          line: 0,
          column: 0
        }
      })
    })
  })

  describe('a two digit number, except 42 lexer', () => {
    const lexer = LexerFactory({
      Root: except(/[0-9]{2}/, 42)
    })

    it('should lex exactly 06', () => {
      expect(lexer('06')).toEqual({
        result: 'Success',
        ref: 'Root',
        value: '06',
        start: {
          index: 0,
          line: 0,
          column: 0
        },
        end: {
          index: 2,
          line: 0,
          column: 2
        }
      })
    })

    it('should fail to lex 42', () => {
      expect(lexer('42')).toEqual({
        result: 'Error',
        ref: 'Root',
        error: 'expected except(/[0-9]{2}/, "42")',
        pointer: {
          index: 0,
          line: 0,
          column: 0
        }
      })
    })
  })

  describe('[1,2,3] lexer', () => {
    const lexer = LexerFactory({
      Root: [
        '[',
        optional(separated(oneOf(1, 2, 3), ',')),
        ']'
      ]
    })
    it('should lex []', () => {
      expect(lexer('[]')).toEqual({
        result: 'Success',
        ref: 'Root',
        value: ['[', ']'],
        start: {
          index: 0,
          line: 0,
          column: 0
        },
        end: {
          index: 2,
          line: 0,
          column: 2
        }
      })
    })

    it('should lex [1]', () => {
      expect(lexer('[1]')).toEqual({
        result: 'Success',
        ref: 'Root',
        value: ['[', '1', ']'],
        start: {
          index: 0,
          line: 0,
          column: 0
        },
        end: {
          index: 3,
          line: 0,
          column: 3
        }
      })
    })

    it('should lex [1,2]', () => {
      expect(lexer('[1,2]')).toEqual({
        result: 'Success',
        ref: 'Root',
        value: ['[', '1', ',', '2', ']'],
        start: {
          index: 0,
          line: 0,
          column: 0
        },
        end: {
          index: 5,
          line: 0,
          column: 5
        }
      })
    })

    it('should lex [1,2,3]', () => {
      expect(lexer('[1,2,3]')).toEqual({
        result: 'Success',
        ref: 'Root',
        value: ['[', '1', ',', '2', ',', '3', ']'],
        start: {
          index: 0,
          line: 0,
          column: 0
        },
        end: {
          index: 7,
          line: 0,
          column: 7
        }
      })
    })

    it('should fail to lex [,2]', () => {
      expect(lexer('[,2]')).toEqual({
        result: 'Error',
        ref: 'Root',
        error: 'expected "]"',
        pointer: {
          index: 1,
          line: 0,
          column: 1
        }
      })
    })

    it('should fail to lex [1,]', () => {
      expect(lexer('[1,]')).toEqual({
        result: 'Error',
        ref: 'Root',
        error: 'expected "]"',
        pointer: {
          index: 2,
          line: 0,
          column: 2
        }
      })
    })
  })

})
