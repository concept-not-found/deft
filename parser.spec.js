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

    shouldParse('0')
    shouldParse('10')

    shouldParse('10e0')
    shouldParse('10e10')

    shouldParse('0b1010')
    shouldParse('0o1010')
    shouldParse('0x1010')

    shouldParse('\'\'')
    shouldParse('""')
    shouldParse('"hotdog"')
    shouldParse('"hot\ndog"')
    shouldParse('"hot\\xA9dog"')
    shouldParse('"hot\\u00A9dog"')
    shouldParse('"hot\\u{1D306}dog"')
    shouldError('"')
    shouldError('"hotdog')
    shouldError('hotdog"')
    shouldError('""hotdog"')
    shouldError('"hotdog""')

    shouldParse('[]')
    shouldParse('[ ]')
    shouldParse('[1]')
    shouldParse('[ 1]')
    shouldParse('[1 ]')
    shouldParse('[ 1 ]')
    shouldParse('[1,true]')
    shouldParse('[1 ,true]')
    shouldParse('[1, true]')
    shouldParse('[1, true, "hotdog", ["wow nested"]]')
    shouldError('[')
    shouldError(']')
    shouldError('[1')
    shouldError('1]')

    shouldParse('{}')
    shouldParse('{ }')
    shouldParse('{hotdog:true}')
    shouldParse('{ hotdog:true}')
    shouldParse('{hotdog:true }')
    shouldParse('{ hotdog:true }')
    shouldParse('{hotdog :true}')
    shouldParse('{hotdog: true}')
    shouldParse('{hotdog : true}')
    shouldParse('{hotdog:true,"not hotdog":false}')
    shouldParse('{hotdog:true ,"not hotdog":false}')
    shouldParse('{hotdog:true, "not hotdog":false}')
    shouldParse('{hotdog:true , "not hotdog":false}')
    shouldError('{')
    shouldError('}')
    shouldError('{hotdog}')
    shouldError('{hotdog')
    shouldError('hotdog}')
  })
})
