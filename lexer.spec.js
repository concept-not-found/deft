const R = require('ramda')
const lexer = require('./lexer')

function shouldLex(source, debug) {
  it(`should lex ${JSON.stringify(source)}`, () => {
    const node = lexer(source)
    if (debug) {
      console.log(JSON.stringify(node, null, 2)) // eslint-disable-line no-console
    }
    expect(node.result).toBe('Success')
  })
}

function shouldError(source, debug) {
  it(`should error ${JSON.stringify(source)}`, () => {
    const node = lexer(source)
    if (debug) {
      console.log(JSON.stringify(node, null, 2)) // eslint-disable-line no-console
    }
    expect(node.result).toBe('Error')
  })
}

function shouldNotlexereserveredWord(reservedWord, debug) {
  it(`should not lex ${reservedWord} as an identifier`, () => {
    const node = lexer(reservedWord)
    if (debug) {
      console.log(JSON.stringify(node, null, 2)) // eslint-disable-line no-console
    }
    expect(node.result).toBe('Success')
    expect(R.path(['value', 'value', 'ref'], node)).not.toBe('Identifier')
  })
}

function mergeSpaces([singleString]) {
  return singleString.replace(/[\n\r\t ]+/g, ' ')
}

describe('lexer', () => {
  shouldLex('')
  shouldLex(' ')
  shouldLex(' \n')
  shouldLex('\n ')

  describe('whitespace', () => {
    shouldLex(' null')
    shouldLex(' \nnull')
    shouldLex('\n null')
    shouldLex(' null ')
    shouldLex(' null \n')
    shouldLex(' null\n ')
    shouldLex(' \nnull ')
    shouldLex(' \nnull \n')
    shouldLex(' \nnull\n ')
    shouldLex('\n null ')
    shouldLex('\n null \n')
    shouldLex('\n null\n ')
  })

  describe('identifier', () => {
    shouldLex('foo')

    shouldError('0foo')
    shouldError('1 x()')
    shouldError('x = 1 x()')

    describe('reserved words', () => {
      shouldNotlexereserveredWord('null')
      shouldNotlexereserveredWord('true')
      shouldNotlexereserveredWord('false')
    })
  })

  describe('literal', () => {
    shouldLex('null')

    describe('boolean', () => {
      shouldLex('true')
      shouldLex('false')
    })

    describe('numeric', () => {
      shouldLex('0')
      shouldLex('10')
      shouldLex('.0')

      shouldLex('10e0')
      shouldLex('10e10')
      shouldLex('1.0e10')
      shouldLex('.0e10')

      shouldLex('0b1010')
      shouldLex('0o1010')
      shouldLex('0x1010')
    })

    describe('string', () => {
      shouldLex('\'\'')
      shouldLex('""')
      shouldLex('"hotdog"')
      shouldLex('"hot\\ndog"')
      shouldLex('"hot\\xA9dog"')
      shouldLex('"hot\\u00A9dog"')
      shouldLex('"hot\\u{1D306}dog"')

      shouldError('"')
      shouldError('"hotdog')
      shouldError('hotdog"')
      shouldError('""hotdog"')
      shouldError('"hotdog""')
      shouldError('"hot\ndog"')
    })

    describe('array', () => {
      shouldLex('[]')
      shouldLex('[ ]')
      shouldLex('[1]')
      shouldLex('[ 1]')
      shouldLex('[1 ]')
      shouldLex('[ 1 ]')
      shouldLex('[1,true]')
      shouldLex('[1 ,true]')
      shouldLex('[1, true]')
      shouldLex('[1, true, "hotdog", ["wow nested"]]')

      shouldError('[')
      shouldError(']')
      shouldError('[1')
      shouldError('1]')
    })

    describe('object', () => {
      shouldLex('{}')
      shouldLex('{ }')
      shouldLex('{hotdog:true}')
      shouldLex('{ hotdog:true}')
      shouldLex('{hotdog:true }')
      shouldLex('{ hotdog:true }')
      shouldLex('{hotdog :true}')
      shouldLex('{hotdog: true}')
      shouldLex('{hotdog : true}')
      shouldLex('{hotdog:true,"not hotdog":false}')
      shouldLex('{hotdog:true ,"not hotdog":false}')
      shouldLex('{hotdog:true, "not hotdog":false}')
      shouldLex('{hotdog:true , "not hotdog":false}')

      shouldError('{')
      shouldError('}')
      shouldError('{hotdog}')
      shouldError('{hotdog')
      shouldError('hotdog}')
    })
  })

  describe('arrow function', () => {
    shouldLex('x=>a')
    shouldLex('x=>(a)')
    shouldLex('(x=>a)')
    shouldLex('(x)=>a')
    shouldLex('( x)=>a')
    shouldLex('(x )=>a')
    shouldLex('( x )=>a')
    shouldLex('(x,y)=>a')
    shouldLex('(x ,y)=>a')
    shouldLex('(x, y)=>a')
    shouldLex('(x , y)=>a')
    shouldLex('(x) => y => a')
    shouldLex('x => (y) => a')
    shouldLex('(x) => (y) => a')
    shouldLex('x => y => a')
    shouldLex('x => (y => a)')

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
    shouldLex('x()')
    shouldLex('x(y)')
    shouldLex('x (y)')
    shouldLex('x( y)')
    shouldLex('x(y )')
    shouldLex('x( y )')
    shouldLex('x(y,z)')
    shouldLex('x(y ,z)')
    shouldLex('x(y, z)')
    shouldLex('x(y , z)')
    shouldLex('x(y => z)')
    shouldLex('x((y) => z)')
    shouldLex('x(y => z(a))')
    shouldLex('y => z(a)')
    shouldLex('(x)(y)')
    shouldLex('((x))(y)')
    shouldLex('(x)((y))')
    shouldLex('((x))((y))')
    shouldLex('((x)(y))')
    shouldLex('x(y(z))')

    shouldLex('x(y)(z)')
    shouldLex('x(y) (z)')
    shouldLex('(x)(y)(z)')
    shouldLex('((x))(y)(z)')
    shouldLex('(x)((y))(z)')
    shouldLex('(x)(y)((z))')
    shouldLex('((x)(y))(z)')
    shouldLex('(x)((y)(z))')
    shouldLex('((x)(y)(z))')
    shouldLex('(x => y)(x)')

    shouldError('x(')
    shouldError('x)')
    shouldError('x(())')
  })

  describe('object accessor', () => {
    describe('brackets', () => {
      shouldLex('x[y]')
      shouldLex('x [y]')
      shouldLex('x[ y]')
      shouldLex('x[y ]')
      shouldLex('x[ y ]')
      shouldLex('x[y => z]')
      shouldLex('x[(y) => z]')
      shouldLex('x[y => z(a)]')
      shouldLex('y => z[a]')
      shouldLex('[x][y]')
      shouldLex('[[x]][y]')
      shouldLex('[x][[y]]')
      shouldLex('[[x]][[y]]')
      shouldLex('[[x][y]]')
      shouldLex('x[y[z]]')

      shouldLex('x[y][z]')
      shouldLex('x[y] [z]')
      shouldLex('[x][y][z]')
      shouldLex('[[x]][y][z]')
      shouldLex('[x][[y]][z]')
      shouldLex('[x][y][[z]]')
      shouldLex('[[x][y]][z]')
      shouldLex('[x][[y][z]]')
      shouldLex('[[x][y][z]]')
      shouldLex('[x => y][x]')

      shouldLex('(x)(y)')
      shouldLex('(x)[y]')
      shouldLex('[x](y)')
      shouldLex('[x][y]')

      shouldError('x[y,z]')
    })

    describe('property shorthand', () => {
      shouldLex('x.y')
      shouldLex('x .y')
      shouldLex('x. y')
      shouldLex('x . y')
      shouldLex('x.y.z')
      shouldLex('x.y(z)')
      shouldLex('x.y[z]')
      shouldLex('x(y).z')
      shouldLex('x[y].z')

      shouldError('x."y"')
    })
  })

  describe('block', () => {
    shouldLex('{x=1 x}')
    shouldLex('{ x=1 x}')
    shouldLex('{x=1 x}')
    shouldLex('{x=1 x }')
    shouldLex('{ x=1 x }')
    shouldLex('{x =1 x}')
    shouldLex('{x= 1 x}')
    shouldLex('{x = 1 x}')
    shouldLex('{x = 1 x()}')
    shouldLex('{x = 1 x() }')
    shouldLex('{x = 1 y = 1 add(x, y)}')
    shouldLex('{x = 1 {y = 1 add(x, y)}}')
    shouldLex('{x = 1 {y: x}}')
    shouldLex('{x = {y = 1 add(x, y)} x}')
    shouldLex('{x = {y: x} x}')

    shouldError('{x}')
    shouldError('{x=1}')
    shouldError('{x=1 x')
    shouldError('x=1 x}')
    shouldError('{x=1 y:2}')
    shouldError('{x:1 y=2}')
  })

  describe('unary operators', () => {
    shouldLex('typeof x')
    shouldLex('-x')
    shouldLex('- x')
    shouldLex('+x')
    shouldLex('~x')
    shouldLex('!x')
    shouldLex('!!x')
    shouldLex('!+!x')
  })

  describe('binary operators', () => {
    shouldLex('x||x')
    shouldLex('x ||x')
    shouldLex('x|| x')
    shouldLex('x || x')
    shouldLex('x && x')
    shouldLex('x | x')
    shouldLex('x & x')
    shouldLex('x !== x')
    shouldLex('x === x')
    shouldLex('x >>> x')
    shouldLex('x >> x')
    shouldLex('x >= x')
    shouldLex('x > x')
    shouldLex('x << x')
    shouldLex('x <= x')
    shouldLex('x < x')
    shouldLex('x - x')
    shouldLex('x + x')
    shouldLex('x ** x')
    shouldLex('x % x')
    shouldLex('x / x')
    shouldLex('x * x')
    shouldLex('x + [3]')
    shouldLex('x + (3)')
    shouldLex('x + .3')
    shouldLex('x + x * x')
    shouldLex('(x + x) * x')
    shouldLex('x + (x * x)')
    shouldLex('x + !x')
    shouldLex('x++x')
    shouldLex('x+++x')
    shouldLex('x+-x')
    shouldLex('x-+x')
    shouldLex('x--x')

    shouldError('x == x')
    shouldError('x != x')
    shouldError('x!+x')
    shouldError('x!x')
  })

  describe('ternary', () => {
    shouldLex('x?x:x')
    shouldLex('x? x:x')
    shouldLex('x?x :x')
    shouldLex('x?x: x')
    shouldLex('x? x :x')
    shouldLex('x? x: x')
    shouldLex('x?x : x')
    shouldLex('x? x : x')

    shouldError('x?')
    shouldError('x?x:')
    shouldError('x?:x')
    shouldError('x?:')
  })

  describe('programs', () => {
    shouldLex(mergeSpaces`
      limit => {
        dot = (a, b) => R.sum(R.zipWith((a,b) => a * b, a, b))
        R.range(0, limit).reduce((total, i) =>
          total + dot([i, i , i], [i, i, i]), 0)
      }
    `)

    shouldLex(mergeSpaces`
      width => {
        buildMatrix = width => {
          buildRow = i => R.range(0, width).map(x => x + i)
          R.range(0, width).map(buildRow)
        }
        sumMatrix = mat => R.sum(mat.reduce(R.concat, []))
        sumMatrix(buildMatrix(width))
      }
    `)

    shouldLex(mergeSpaces`
      size => R.range(0, 256).reduce((list, i) =>
        list.map(x => x + 1), R.range(0, size))
    `)

    shouldLex(mergeSpaces`
      size => R.sum(R.range(0, size).reduce((list, i) =>
        R.reverse(list), R.range(0, size)))
    `)

    shouldLex(mergeSpaces`
      {
        fib = n => n > 1
          ? fib(n - 1) + fib(n - 2)
          : n
        fib
      }
    `)
  })

  describe('simpify', () => {
    it('should remove expressions and unneeded arrays', () => {
      expect(lexer('1')).toEqual({
        ref: 'Root',
        value: {
          ref: 'Numeric',
          value: '1',
          start: {
            index: 0,
            line: 0,
            column: 0
          },
          end: {
            index: 1,
            line: 0,
            column: 1
          }
        },
        start: {
          index: 0,
          line: 0,
          column: 0
        },
        end: {
          index: 1,
          line: 0,
          column: 1
        },
        result: 'Success'
      })
    })
  })

  describe('strip whitespace', () => {
    it('should strip empty whitespace', () => {
      expect(lexer('1 + 1', true)).toEqual({
        ref: 'Root',
        value: [
          {
            ref: 'Numeric',
            value: '1',
            start: {
              index: 0,
              line: 0,
              column: 0
            },
            end: {
              index: 1,
              line: 0,
              column: 1
            }
          },
          {
            ref: 'Whitespace',
            value: ' ',
            start: {
              index: 1,
              line: 0,
              column: 1
            },
            end: {
              index: 2,
              line: 0,
              column: 2
            }
          },
          '+',
          {
            ref: 'Whitespace',
            value: ' ',
            start: {
              index: 3,
              line: 0,
              column: 3
            },
            end: {
              index: 4,
              line: 0,
              column: 4
            }
          },
          {
            ref: 'Numeric',
            value: '1',
            start: {
              index: 4,
              line: 0,
              column: 4
            },
            end: {
              index: 5,
              line: 0,
              column: 5
            }
          }
        ],
        start: {
          index: 0,
          line: 0,
          column: 0
        },
        end: {
          index: 5,
          line: 0,
          column: 5
        },
        result: 'Success'
      })
    }),

    it('should be able to strip all whitespace', () => {
      expect(lexer('1 + 1')).toEqual({
        ref: 'Root',
        value: [
          {
            ref: 'Numeric',
            value: '1',
            start: {
              index: 0,
              line: 0,
              column: 0
            },
            end: {
              index: 1,
              line: 0,
              column: 1
            }
          },
          '+',
          {
            ref: 'Numeric',
            value: '1',
            start: {
              index: 4,
              line: 0,
              column: 4
            },
            end: {
              index: 5,
              line: 0,
              column: 5
            }
          }
        ],
        start: {
          index: 0,
          line: 0,
          column: 0
        },
        end: {
          index: 5,
          line: 0,
          column: 5
        },
        result: 'Success'
      })
    })
  })
})
