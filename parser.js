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
            return {
              term: 'Number',
              value: Number(value),
              consumed: 1
            }
          },

          String({value: [openQuote, value, closeQuote]}) {
            return {
              term: 'String',
              value,
              consumed: 1
            }
          },

          Identifier({value}) {
            return {
              term: 'Reference',
              value,
              consumed: 1
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
          if (current[index + main.consumed] === '(') {
            let argumentIndex = 0
            const args = []
            if (current[index + main.consumed + 1 + argumentIndex] !== ')') {
              while (true) {
                const argument = parse({
                  name: 'Expression',
                  index: index + main.consumed + 1 + argumentIndex
                }, current)
                args.push(argument)
                const consumed = argument.consumed
                if (index + main.consumed + 1 + argumentIndex + consumed >= current.length || current[index + main.consumed + 1 + argumentIndex + consumed] === ')') {
                  break
                }
                // skip comma
                argumentIndex += consumed + 1
              }
            }
            return {
              term: 'Call',
              function: main,
              arguments: args,
              consumed: main.consumed + 1 + args.reduce((sum, arg) => sum + arg.consumed, 0) + Math.max(0, args.length - 1) + 1
            }
          }
          return main
        }
        return parse({
          name: 'MainExpression'
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
