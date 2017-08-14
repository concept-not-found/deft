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

function shouldNotParseReserveredWord(reservedWord, debug) {
  it(`should not parse ${reservedWord} as an identifier`, () => {
    const result = parser(reservedWord)
    if (debug) {
      console.log(JSON.stringify(result, null, 2)) // eslint-disable-line no-console
    }
    expect(result.type).toBe('Success')
    expect(R.path(['value', 'value', 'ref'], result)).not.toBe('Identifier')
  })
}

function mergeSpaces([singleString]) {
  return singleString.replace(/[\n\r\t ]+/g, ' ')
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
    shouldError('1 x()')
    shouldError('x = 1 x()')

    describe('reserved words', () => {
      shouldNotParseReserveredWord('null')
      shouldNotParseReserveredWord('true')
      shouldNotParseReserveredWord('false')
    })
  })

  describe('literal', () => {
    shouldParse('null')

    describe('boolean', () => {
      shouldParse('true')
      shouldParse('false')
    })

    describe('numberic', () => {
      shouldParse('0')
      shouldParse('10')
      shouldParse('.0')

      shouldParse('10e0')
      shouldParse('10e10')
      shouldParse('1.0e10')
      shouldParse('.0e10')

      shouldParse('0b1010')
      shouldParse('0o1010')
      shouldParse('0x1010')
    })

    describe('string', () => {
      shouldParse('\'\'')
      shouldParse('""')
      shouldParse('"hotdog"')
      shouldParse('"hot\\ndog"')
      shouldParse('"hot\\xA9dog"')
      shouldParse('"hot\\u00A9dog"')
      shouldParse('"hot\\u{1D306}dog"')

      shouldError('"')
      shouldError('"hotdog')
      shouldError('hotdog"')
      shouldError('""hotdog"')
      shouldError('"hotdog""')
      shouldError('"hot\ndog"')
    })

    describe('array', () => {
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
    })

    describe('object', () => {
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

  describe('arrow function', () => {
    shouldParse('x=>a')
    shouldParse('x=>(a)')
    shouldParse('(x=>a)')
    shouldParse('(x)=>a')
    shouldParse('( x)=>a')
    shouldParse('(x )=>a')
    shouldParse('( x )=>a')
    shouldParse('(x,y)=>a')
    shouldParse('(x ,y)=>a')
    shouldParse('(x, y)=>a')
    shouldParse('(x , y)=>a')
    shouldParse('(x) => y => a')
    shouldParse('x => (y) => a')
    shouldParse('(x) => (y) => a')
    shouldParse('x => y => a')
    shouldParse('x => (y => a)')

    shouldError('x=>')
    shouldError('=>a')
    shouldError('(=>a')
    shouldError(')=>a')
    shouldError('(x=>a')
    shouldError('x)=>a')
    shouldError('((x))=>a')
    shouldError('(x => y) => a')
  })

  describe('call', () => {
    shouldParse('x()')
    shouldParse('x(y)')
    shouldParse('x (y)')
    shouldParse('x( y)')
    shouldParse('x(y )')
    shouldParse('x( y )')
    shouldParse('x(y,z)')
    shouldParse('x(y ,z)')
    shouldParse('x(y, z)')
    shouldParse('x(y , z)')
    shouldParse('x(y => z)')
    shouldParse('x((y) => z)')
    shouldParse('x(y => z(a))')
    shouldParse('y => z(a)')
    shouldParse('(x)(y)')
    shouldParse('((x))(y)')
    shouldParse('(x)((y))')
    shouldParse('((x))((y))')
    shouldParse('((x)(y))')
    shouldParse('x(y(z))')

    shouldParse('x(y)(z)')
    shouldParse('x(y) (z)')
    shouldParse('(x)(y)(z)')
    shouldParse('((x))(y)(z)')
    shouldParse('(x)((y))(z)')
    shouldParse('(x)(y)((z))')
    shouldParse('((x)(y))(z)')
    shouldParse('(x)((y)(z))')
    shouldParse('((x)(y)(z))')
    shouldParse('(x => y)(x)')

    shouldError('x(')
    shouldError('x)')
    shouldError('x(())')
  })

  describe('object accessor', () => {
    describe('brackets', () => {
      shouldParse('x[y]')
      shouldParse('x [y]')
      shouldParse('x[ y]')
      shouldParse('x[y ]')
      shouldParse('x[ y ]')
      shouldParse('x[y => z]')
      shouldParse('x[(y) => z]')
      shouldParse('x[y => z(a)]')
      shouldParse('y => z[a]')
      shouldParse('[x][y]')
      shouldParse('[[x]][y]')
      shouldParse('[x][[y]]')
      shouldParse('[[x]][[y]]')
      shouldParse('[[x][y]]')
      shouldParse('x[y[z]]')

      shouldParse('x[y][z]')
      shouldParse('x[y] [z]')
      shouldParse('[x][y][z]')
      shouldParse('[[x]][y][z]')
      shouldParse('[x][[y]][z]')
      shouldParse('[x][y][[z]]')
      shouldParse('[[x][y]][z]')
      shouldParse('[x][[y][z]]')
      shouldParse('[[x][y][z]]')
      shouldParse('[x => y][x]')

      shouldParse('(x)(y)')
      shouldParse('(x)[y]')
      shouldParse('[x](y)')
      shouldParse('[x][y]')

      shouldError('x[y,z]')
    })

    describe('property shorthand', () => {
      shouldParse('x.y')
      shouldParse('x .y')
      shouldParse('x. y')
      shouldParse('x . y')
      shouldParse('x.y.z')
      shouldParse('x.y(z)')
      shouldParse('x.y[z]')
      shouldParse('x(y).z')
      shouldParse('x[y].z')

      shouldError('x."y"')
    })
  })

  describe('block', () => {
    shouldParse('{x=1 x}')
    shouldParse('{ x=1 x}')
    shouldParse('{x=1 x}')
    shouldParse('{x=1 x }')
    shouldParse('{ x=1 x }')
    shouldParse('{x =1 x}')
    shouldParse('{x= 1 x}')
    shouldParse('{x = 1 x}')
    shouldParse('{x = 1 x()}')
    shouldParse('{x = 1 x() }')
    shouldParse('{x = 1 y = 1 add(x, y)}')
    shouldParse('{x = 1 {y = 1 add(x, y)}}')
    shouldParse('{x = 1 {y: x}}')
    shouldParse('{x = {y = 1 add(x, y)} x}')
    shouldParse('{x = {y: x} x}')

    shouldError('{x}')
    shouldError('{x=1}')
    shouldError('{x=1 x')
    shouldError('x=1 x}')
    shouldError('{x=1 y:2}')
    shouldError('{x:1 y=2}')
  })

  describe('unary operators', () => {
    shouldParse('typeof x')
    shouldParse('-x')
    shouldParse('- x')
    shouldParse('+x')
    shouldParse('~x')
    shouldParse('!x')
    shouldParse('!!x')
    shouldParse('!+!x')
  })

  describe('binary operators', () => {
    shouldParse('x||x')
    shouldParse('x ||x')
    shouldParse('x|| x')
    shouldParse('x || x')
    shouldParse('x && x')
    shouldParse('x | x')
    shouldParse('x & x')
    shouldParse('x !== x')
    shouldParse('x === x')
    shouldParse('x >>> x')
    shouldParse('x >> x')
    shouldParse('x >= x')
    shouldParse('x > x')
    shouldParse('x << x')
    shouldParse('x <= x')
    shouldParse('x < x')
    shouldParse('x - x')
    shouldParse('x + x')
    shouldParse('x ** x')
    shouldParse('x % x')
    shouldParse('x / x')
    shouldParse('x * x')
    shouldParse('x + [3]')
    shouldParse('x + (3)')
    shouldParse('x + .3')
    shouldParse('x + x * x')
    shouldParse('(x + x) * x')
    shouldParse('x + (x * x)')
    shouldParse('x + !x')
    shouldParse('x++x')
    shouldParse('x+++x')
    shouldParse('x+-x')
    shouldParse('x-+x')
    shouldParse('x--x')

    shouldError('x == x')
    shouldError('x != x')
    shouldError('x!+x')
    shouldError('x!x')
  })

  describe('programs', () => {
    shouldParse(mergeSpaces`
      limit => {
        dot = (a, b) => R.sum(R.zipWith((a,b) => a * b, a, b))
        R.range(0, limit).reduce((total, i) =>
          total + dot([i, i , i], [i, i, i]), 0)
      }
    `)

    shouldParse(mergeSpaces`
      width => {
        buildMatrix = width => {
          buildRow = i => R.range(0, width).map(x => x + i)
          R.range(0, width).map(buildRow)
        }
        sumMatrix = mat => R.sum(mat.reduce(R.concat, []))
        sumMatrix(buildMatrix(width))
      }
    `)

    shouldParse(mergeSpaces`
      size => R.range(0, 256).reduce((list, i) =>
        list.map(x => x + 1), R.range(0, size))
    `)
  })
})
