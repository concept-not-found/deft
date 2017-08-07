const parser = require('./parser')

function shouldParse(source) {
  it(`should parse ${source}`, () => {
    expect(parser(source).type).toBe('Success')
  })
}
describe('parser', () => {
  shouldParse('')

  describe('literal', () => {
    shouldParse('null')
    shouldParse('true')
    shouldParse('false')
  })
})
