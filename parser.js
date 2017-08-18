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

      MainExpression() {
        return matchRef({
          Numeric({value}) {
            return Number(value)
          },

          String({value: [openQuote, value, closeQuote]}) {
            return value
          },

          Identifier({value}) {
            return {
              term: 'Reference',
              value
            }
          }
        })(current)
      },

      Expression() {
        if (current instanceof Array) {
          const {index = 0} = state
          //prefix
          //main
          const main = parse({
            name: 'MainExpression',
          }, current[index])
          //postfix
          if (current[index + 1] === '(') {
            if (current[index + 1 + 1] === ')') {
              return {
                term: 'Call',
                function: main,
                arguments: []
              }
            } else {
              return {
                term: 'Call',
                function: main,
                arguments: [
                  parse({
                    name: 'Expression',
                    index: index + 1 + 1
                  }, current)
                ]
              }
            }
          }
          return main
        }
        return parse({
          name: 'MainExpression',
        }, current)
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
