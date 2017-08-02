const {ParserFactory, newline, oneOf, optional, manyOf, separated, Node} = require('./parser-factory')

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

    it('should fail to parse not hotdog', () => {
      expect(parser('not hotdog')).toEqual({
        case: 'Error',
        error: 'expected Root',
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

  describe('hot\ndog parser', () => {
    const parser = ParserFactory({
      Root: 'hot\ndog'
    })

    it('should parse exactly hot\ndog', () => {
      expect(parser('hot\ndog')).toEqual({
        case: 'Root',
        value: 'hot\ndog',
        index: 7,
        line: 1,
        column: 3
      })
    })
  })
})
