const parser = require('./parser')

function shouldParse(source, debug) {
  it(`should parse ${JSON.stringify(source)}`, () => {
    if (debug) {
      expect(parser(source)).toEqual({
        type: 'Success'
      })
    } else {
      expect(parser(source).type).toBe('Success')
    }
  })
}

function shouldError(source, debug) {
  it(`should error ${JSON.stringify(source)}`, () => {
    if (debug) {
      expect(parser(source)).toEqual({
        type: 'Error'
      })
    } else {
      expect(parser(source).type).toBe('Error')
    }
  })
}

describe('parser', () => {
  shouldParse('')
  shouldParse(' ')
  shouldParse(' \n')
  shouldParse('\n ')

  describe('whitespace', () => {
    shouldParse(' null')
    shouldParse(' \nnull')
    shouldParse('\n null')
    shouldParse(' null ')
    shouldParse(' null \n')
    shouldParse(' null\n ')
    shouldParse(' \nnull ')
    shouldParse(' \nnull \n')
    shouldParse(' \nnull\n ')
    shouldParse('\n null ')
    shouldParse('\n null \n')
    shouldParse('\n null\n ')
  })

  describe('identifier', () => {
    shouldParse('foo')
    shouldError('0foo')
  })

  describe('literal', () => {
    shouldParse('null')
    shouldParse('true')
    shouldParse('false')
  })
})
