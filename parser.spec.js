const lexer = require('./lexer')
const parser = require('./parser')

describe('parser', () => {
  it('should parse 0 to JavaScript number', () => {
    expect(parser(lexer('0'))).toEqual({
      result: 'Success',
      value: {
        term: 'Number',
        value: 0,
        consumed: 1
      }
    })
  })

  it('should parse "0" to a JavaScript string', () => {
    expect(parser(lexer('"0"'))).toEqual({
      result: 'Success',
      value: {
        term: 'String',
        value: '0',
        consumed: 1
      }
    })
  })

  it('should parse x to Reference', () => {
    expect(parser(lexer('x'))).toEqual({
      result: 'Success',
      value: {
        term: 'Reference',
        value: 'x',
        consumed: 1
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
          value: 'x',
          consumed: 1
        },
        arguments: [],
        consumed: 3
      }
    })
  })

  it('should parse x(y) to Call with an argument', () => {
    expect(parser(lexer('x(y)'))).toEqual({
      result: 'Success',
      value: {
        term: 'Call',
        function: {
          term: 'Reference',
          value: 'x',
          consumed: 1
        },
        arguments: [
          {
            term: 'Reference',
            value: 'y',
            consumed: 1
          }
        ],
        consumed: 4
      }
    })
  })

  it('should parse x(y, z) to Call with arguments', () => {
    expect(parser(lexer('x(y, z)'))).toEqual({
      result: 'Success',
      value: {
        term: 'Call',
        function: {
          term: 'Reference',
          value: 'x',
          consumed: 1
        },
        arguments: [
          {
            term: 'Reference',
            value: 'y',
            consumed: 1
          },
          {
            term: 'Reference',
            value: 'z',
            consumed: 1
          }
        ],
        consumed: 6
      }
    })
  })

  it('should parse x(y(z)) to nested Call', () => {
    expect(parser(lexer('x(y(z))'))).toEqual({
      result: 'Success',
      value: {
        term: 'Call',
        function: {
          term: 'Reference',
          value: 'x',
          consumed: 1
        },
        arguments: [
          {
            term: 'Call',
            function: {
              term: 'Reference',
              value: 'y',
              consumed: 1
            },
            arguments: [
              {
                term: 'Reference',
                value: 'z',
                consumed: 1
              }
            ],
            consumed: 4
          }
        ],
        consumed: 7
      }
    })
  })

})
