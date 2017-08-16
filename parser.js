const match = require('./match')

const matchRef = match('ref')
const matchName = match('name')

function parser(state, node) {
  try {
    const result = matchName({
      Root() {
        return matchRef({
          Root({value}) {
            return parser({
              name: 'Expression'
            }, value)
          }
        })(node)
      },

      Expression() {
        return matchRef({
          Numeric({value}) {
            return {
              term: 'Num',
              value: Number(value)
            }
          },

          String({value}) {
            return {
              term: 'Str',
              value
            }
          },

          Identifier({value}) {
            return {
              term: 'Var',
              value
            }
          }
        })(node)
      }
    })(state)

    return Object.assign({
      result: 'Success',
    }, result)
  } catch (error) {
    return {
      result: 'Error',
      error
    }
  }
}

module.exports = (node) => parser({
  name: 'Root'
}, node)
