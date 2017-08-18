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
            let argumentIndex = 0
            const args = []
            if (current[index + 1 + 1 + argumentIndex] !== ')') {
              while (true) {
                const argument = parse({
                  name: 'Expression',
                  index: index + 1 + 1 + argumentIndex
                }, current)
                args.push(argument)
                if (index + 1 + 1 + argumentIndex + 1 >= current.length || current[index + 1 + 1 + argumentIndex + 1] === ')') {
                  break
                }
                // skip comma
                argumentIndex += 2
              }
            }
            return {
              term: 'Call',
              function: main,
              arguments: args
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
