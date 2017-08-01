const {ParserFactory, oneOf, optional, manyOf, separated, Node} = require('./parser-factory')

describe('parser factory', () => {
  describe('hotdog parser', () => {
    const parser = ParserFactory({
      Root: 'hotdog'
    })

    it('should parse exactly hotdog', () => {
      expect(parser('hotdog')).toEqual({
        case: 'Root',
        value: 'hotdog',
        lineNumber: 0,
        columnNumber: 6
      })
    })

    it('should fail to parse not hotdog', () => {
      expect(parser('not hotdog')).toEqual({
        case: 'Error',
        error: 'expected Root',
        lineNumber: 0,
        columnNumber: 0
      })
    })
  })
})