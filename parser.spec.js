const R = require('ramda')
const parser = require('./parser')

function shouldParse(source, debug) {
  it(`should parse ${JSON.stringify(source)}`, () => {
    const result = parser(source)
    if (debug) {
      console.log(JSON.stringify(result, null, 2)) // eslint-disable-line no-console
    }
    expect(result.type).toBe('Success')
  })
}

function shouldError(source, debug) {
  it(`should error ${JSON.stringify(source)}`, () => {
    const result = parser(source)
    if (debug) {
      console.log(JSON.stringify(result, null, 2)) // eslint-disable-line no-console
    }
    expect(result.type).toBe('Error')
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

    describe('reserved words', () => {
      function shouldNotParseReserveredWord(reservedWord) {
        it(`should not parse ${reservedWord} as an identifier`, () => {
          const result = parser(reservedWord)
          expect(result.type).toBe('Success')
          expect(R.path(['value', 'value', 'ref'], result)).not.toBe('Identifier')
        })
      }

      shouldNotParseReserveredWord('null')
      shouldNotParseReserveredWord('true')
      shouldNotParseReserveredWord('false')
    })
  })

  describe('literal', () => {
    shouldParse('null')
    shouldParse('true')
    shouldParse('false')
  })
})
