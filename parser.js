const match = require('./match')

const matchRef = match('ref')
const matchName = match('name')

function parser(node) {
  function parse(state, current) {
    return matchName({
      Root() {
        return matchRef({
          Root({value}) {
            return parse({
              name: 'Expression'
            }, value)
          }
        })(current)
      },

      Expression() {
        return matchRef({
          Numeric({value}) {
            return Number(value)
          },

          String({value}) {
            return value
          },

          Identifier({value}) {
            return {
              term: 'Reference',
              value
            }
          }
        })(current)
      }
    })(state)
  }

  try {
    const result = parse({
      name: 'Root'
    }, node)

    return {
      result: 'Success',
      value: result
    }
  } catch (error) {
    return {
      result: 'Error',
      error
    }
  }
}

module.exports = (node) => parser(node)
