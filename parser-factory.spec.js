const {ParserFactory, oneOf, manyOf, optional, ref, separated} = require('./parser-factory')

describe('parser factory', () => {
  describe('hotdog parser', () => {
    const parser = ParserFactory({
      Root: 'hotdog'
    })

    it('should parse exactly hotdog', () => {
      expect(parser('hotdog')).toEqual({
        type: 'Success',
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

    it('should fail to parse empty', () => {
      expect(parser('')).toEqual({
        type: 'Error',
        ref: 'Root',
        error: 'expected "hotdog"',
        pointer: {
          index: 0,
          line: 0,
          column: 0
        }
      })
    })

    it('should fail to parse not hotdog', () => {
      expect(parser('not hotdog')).toEqual({
        type: 'Error',
        ref: 'Root',
        error: 'expected "hotdog"',
        pointer: {
          index: 0,
          line: 0,
          column: 0
        }
      })
    })

    it('should fail to parse hotdog in your mouth', () => {
      expect(parser('hotdog in your mouth')).toEqual({
        type: 'Error',
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

  describe('hotdog parser with extra array', () => {
    const parser = ParserFactory({
      Root: ['hotdog']
    })

    it('should parse exactly hotdog', () => {
      expect(parser('hotdog')).toEqual({
        type: 'Success',
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

    it('should fail to parse empty', () => {
      expect(parser('')).toEqual({
        type: 'Error',
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

  describe('hot\\ndog parser', () => {
    const parser = ParserFactory({
      Root: 'hot\ndog'
    })

    it('should parse exactly hot\\ndog', () => {
      expect(parser('hot\ndog')).toEqual({
        type: 'Success',
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

    it('should fail to parse hot\\r\\ndog', () => {
      expect(parser('hot\r\ndog')).toEqual({
        type: 'Error',
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

  describe('win\\r\\ndoze parser', () => {
    const parser = ParserFactory({
      Root: 'win\r\ndoze'
    })

    it('should parse exactly win\\r\\ndoze', () => {
      expect(parser('win\r\ndoze')).toEqual({
        type: 'Success',
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

    it('should fail to parse hot\\r\\ndog', () => {
      expect(parser('hot\r\ndog')).toEqual({
        type: 'Error',
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

  describe('hotdog\\n parser', () => {
    const parser = ParserFactory({
      Root: 'hotdog\n'
    })

    it('should parse exactly hotdog\\n', () => {
      expect(parser('hotdog\n')).toEqual({
        type: 'Success',
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

  describe('\\nhotdog parser', () => {
    const parser = ParserFactory({
      Root: '\nhotdog'
    })

    it('should parse exactly \\nhotdog', () => {
      expect(parser('\nhotdog')).toEqual({
        type: 'Success',
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

  describe('hotdog parser using array', () => {
    const parser = ParserFactory({
      Root: ['hot', 'dog']
    })

    it('should parse exactly hotdog', () => {
      expect(parser('hotdog')).toEqual({
        type: 'Success',
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

    it('should fail to parse empty', () => {
      expect(parser('')).toEqual({
        type: 'Error',
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

  describe('hotdog parser using regex', () => {
    const parser = ParserFactory({
      Root: /hotdog/
    })

    it('should parse exactly hotdog', () => {
      expect(parser('hotdog')).toEqual({
        type: 'Success',
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

    it('should fail to parse empty', () => {
      expect(parser('')).toEqual({
        type: 'Error',
        ref: 'Root',
        error: 'expected /hotdog/',
        pointer: {
          index: 0,
          line: 0,
          column: 0
        }
      })
    })

    it('should fail to parse veryhotdog', () => {
      expect(parser('veryhotdog')).toEqual({
        type: 'Error',
        ref: 'Root',
        error: 'expected /hotdog/',
        pointer: {
          index: 0,
          line: 0,
          column: 0
        }
      })
    })

    it('should fail to parse hotdoghotdog', () => {
      expect(parser('hotdoghotdog')).toEqual({
        type: 'Error',
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

  describe('star trek|war parser', () => {
    const parser = ParserFactory({
      Root: ['star', ' ', oneOf('trek', 'wars')]
    })

    it('should parse star trek', () => {
      expect(parser('star trek')).toEqual({
        type: 'Success',
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

    it('should parse star wars', () => {
      expect(parser('star wars')).toEqual({
        type: 'Success',
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

    it('should fail to parse star stroll', () => {
      expect(parser('star stroll')).toEqual({
        type: 'Error',
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

  describe('ㅋㅋㅋㅋㅋㅋ parser', () => {
    const parser = ParserFactory({
      Root: manyOf('ㅋ')
    })

    it('should parse ㅋ', () => {
      expect(parser('ㅋ')).toEqual({
        type: 'Success',
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

    it('should parse ㅋㅋㅋㅋㅋㅋ', () => {
      expect(parser('ㅋㅋㅋㅋㅋㅋ')).toEqual({
        type: 'Success',
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

    it('should fail to parse empty', () => {
      expect(parser('')).toEqual({
        type: 'Error',
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

  describe('maeby parser', () => {
    const parser = ParserFactory({
      Root: optional('maeby')
    })

    it('should parse maeby', () => {
      expect(parser('maeby')).toEqual({
        type: 'Success',
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

    it('should parse empty', () => {
      expect(parser('')).toEqual({
        type: 'Success',
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

  describe('hotdog parser with ref', () => {
    const parser = ParserFactory({
      Root: ['hot', ref('Animal')],
      Animal: 'dog'
    })

    it('should parse hotdog', () => {
      expect(parser('hotdog')).toEqual({
        type: 'Success',
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

    it('should fail to parse hotcat', () => {
      expect(parser('hotcat')).toEqual({
        type: 'Error',
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

  describe('A -> (A) | B+B | 1; B -> (A) | 1 parser', () => {
    const parser = ParserFactory({
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

    it('should parse 1', () => {
      expect(parser('1').type).toBe('Success')
    })

    it('should parse 1+1', () => {
      expect(parser('1+1').type).toBe('Success')
    })

    it('should parse (1+1)', () => {
      expect(parser('(1+1)').type).toBe('Success')
    })

    it('should parse 1+(1)', () => {
      expect(parser('1+(1)').type).toBe('Success')
    })

    it('should parse 1+(1+1)', () => {
      expect(parser('1+(1+1)').type).toBe('Success')
    })
  })

  describe('circular references', () => {
    it('should detect Root -> Root', () => {
      const parser = ParserFactory({
        Root: ref('Root')
      })
      expect(parser('')).toEqual({
        type: 'Error',
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
      const parser = ParserFactory({
        Root: ref('A'),
        A: ref('B'),
        B: ref('A')
      })
      expect(parser('')).toEqual({
        type: 'Error',
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

  describe('[1,2,3] parser', () => {
    const parser = ParserFactory({
      Root: ['[', separated(oneOf(1, 2, 3), ','), ']']
    })
    it('should parse []', () => {
      expect(parser('[]')).toEqual({
        type: 'Success',
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

    it('should parse [1]', () => {
      expect(parser('[1]')).toEqual({
        type: 'Success',
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

    it('should parse [1,2]', () => {
      expect(parser('[1,2]')).toEqual({
        type: 'Success',
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

    it('should parse [1,2,3]', () => {
      expect(parser('[1,2,3]')).toEqual({
        type: 'Success',
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

    it('should fail to parse [,2]', () => {
      expect(parser('[,2]')).toEqual({
        type: 'Error',
        ref: 'Root',
        error: 'expected "]"',
        pointer: {
          index: 1,
          line: 0,
          column: 1
        }
      })
    })

    it('should fail to parse [1,]', () => {
      expect(parser('[1,]')).toEqual({
        type: 'Error',
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
