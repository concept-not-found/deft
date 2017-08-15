const parser = require('./parser')

describe('parser', () => {
  it('should parse Numeric to Num', () => {
    const node = {
      ref: 'Root',
      value:{
        ref: 'Numeric',
        value: '0',
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
      type: 'Success'
    }
    expect(parser(node)).toEqual({
      result: 'Success',
      term: 'Num',
      value: 0
    })
  })
})