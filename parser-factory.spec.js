const {ParserFactory, oneOf, manyOf} = require('./parser-factory')

describe('parser factory', () => {
  describe('hotdog parser', () => {
    const parser = ParserFactory({
      Root: 'hotdog'
    })

    it('should parse exactly hotdog', () => {
      expect(parser('hotdog')).toEqual({
        case: 'Root',
        value: 'hotdog',
        index: 6,
        line: 0,
        column: 6
      })
    })

    it('should fail to parse empty', () => {
      expect(parser('')).toEqual({
        case: 'Error',
        error: 'expected "hotdog"',
        index: 0,
        line: 0,
        column: 0
      })
    })

    it('should fail to parse not hotdog', () => {
      expect(parser('not hotdog')).toEqual({
        case: 'Error',
        error: 'expected "hotdog"',
        index: 0,
        line: 0,
        column: 0
      })
    })

    it('should fail to parse hotdog in your mouth', () => {
      expect(parser('hotdog in your mouth')).toEqual({
        case: 'Error',
        error: 'unexpected source after Root',
        index: 6,
        line: 0,
        column: 6
      })
    })
  })

  describe('hot\\ndog parser', () => {
    const parser = ParserFactory({
      Root: 'hot\ndog'
    })

    it('should parse exactly hot\\ndog', () => {
      expect(parser('hot\ndog')).toEqual({
        case: 'Root',
        value: 'hot\ndog',
        index: 7,
        line: 1,
        column: 3
      })
    })

    it('should fail to parse hot\\r\\ndog', () => {
      expect(parser('hot\r\ndog')).toEqual({
        case: 'Error',
        error: 'expected "hot\\ndog"',
        index: 0,
        line: 0,
        column: 0
      })
    })
  })

  describe('hotdog\\n parser', () => {
    const parser = ParserFactory({
      Root: 'hotdog\n'
    })

    it('should parse exactly hotdog\\n', () => {
      expect(parser('hotdog\n')).toEqual({
        case: 'Root',
        value: 'hotdog\n',
        index: 7,
        line: 1,
        column: 0
      })
    })
  })

  describe('\\nhotdog parser', () => {
    const parser = ParserFactory({
      Root: '\nhotdog'
    })

    it('should parse exactly \\nhotdog', () => {
      expect(parser('\nhotdog')).toEqual({
        case: 'Root',
        value: '\nhotdog',
        index: 7,
        line: 1,
        column: 6
      })
    })
  })

  describe('hotdog parser using array', () => {
    const parser = ParserFactory({
      Root: ['hot', 'dog']
    })

    it('should parse exactly hotdog', () => {
      expect(parser('hotdog')).toEqual({
        case: 'Root',
        value: ['hot', 'dog'],
        index: 6,
        line: 0,
        column: 6
      })
    })
  })

  describe('star trek|war parser', () => {
    const parser = ParserFactory({
      Root: ['star', ' ', oneOf('trek', 'wars')]
    })

    it('should parse star trek', () => {
      expect(parser('star trek')).toEqual({
        case: 'Root',
        value: ['star', ' ', 'trek'],
        index: 9,
        line: 0,
        column: 9
      })
    })

    it('should parse star wars', () => {
      expect(parser('star wars')).toEqual({
        case: 'Root',
        value: ['star', ' ', 'wars'],
        index: 9,
        line: 0,
        column: 9
      })
    })

    it('should fail to parse star stroll', () => {
      expect(parser('star stroll')).toEqual({
        case: 'Error',
        error: 'expected oneOf("trek", "wars")',
        index: 5,
        line: 0,
        column: 5
      })
    })
  })

  describe('ㅋㅋㅋㅋㅋㅋ parser', () => {
    const parser = ParserFactory({
      Root: manyOf('ㅋ')
    })

    it('should parse ㅋ', () => {
      expect(parser('ㅋ')).toEqual({
        case: 'Root',
        value: ['ㅋ'],
        index: 1,
        line: 0,
        column: 1
      })
    })

    it('should parse ㅋㅋㅋㅋㅋㅋ', () => {
      expect(parser('ㅋㅋㅋㅋㅋㅋ')).toEqual({
        case: 'Root',
        value: ['ㅋ', 'ㅋ', 'ㅋ', 'ㅋ', 'ㅋ', 'ㅋ'],
        index: 6,
        line: 0,
        column: 6
      })
    })

    it('should fail to parse empty', () => {
      expect(parser('')).toEqual({
        case: 'Error',
        error: 'expected manyOf("ㅋ")',
        index: 0,
        line: 0,
        column: 0
      })
    })
  })

})
