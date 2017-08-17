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
        if (current instanceof Array) {
          //prefix
          //main
          const main = parse({
            name: 'Expression',
          }, current[0])
          //postfix
          if (current[1] === '(') {
            if (current[2] === ')') {
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
                  }, current[2])
                ]
              }
            }
          }
          return main
        }
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
