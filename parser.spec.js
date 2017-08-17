const lexer = require('./lexer')
const parser = require('./parser')

describe('parser', () => {
  it('should parse 0 to JavaScript number', () => {
    expect(parser(lexer('0'))).toEqual({
      result: 'Success',
      value: 0
    })
  })

  it('should parse "0" to a JavaScript string', () => {
    expect(parser(lexer('"0"'))).toEqual({
      result: 'Success',
      value: '0'
    })
  })

  it('should parse x to Reference', () => {
    expect(parser(lexer('x'))).toEqual({
      result: 'Success',
      value: {
        term: 'Reference',
        value: 'x'
      }
    })
  })

  it('should parse x() to Call', () => {
    expect(parser(lexer('x()'))).toEqual({
      result: 'Success',
      value: {
        term: 'Call',
        function: {
          term: 'Reference',
          value: 'x'
        },
        arguments: []
      }
    })
  })

})
