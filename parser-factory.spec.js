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
  })
})