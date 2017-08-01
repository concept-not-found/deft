const R = require('ramda')

function normalizeForm(form, node) {
  if (form.case) {
    return form
  }

  if (typeof form === 'string') {
    return {
      case: 'String',
      value: form
    }
  }

  if (form instanceof Array) {
    return {
      case: 'Array',
      elements: form.map((subform) => normalizeForm(subform, node))
    }
  }

  throw new Error(`unsupported form ${JSON.stringify(form)} for node ${node}`)
}
function normalize(grammar) {
  return R.mapObjIndexed(normalizeForm, grammar)
}


function build(grammar, node) {
  if (node === 'Error') {
    throw new Error('grammar cannot use reserved node name "Error"')
  }

  const form = grammar[node]
  if (!form) {
    throw new Error(`grammar does not contain the node named "${node}"`)
  }
  return buildForm(grammar, node, form)
}

function buildForm(grammar, node, form) {
  const operators = {
    String({value}) {
      return ([head, ...tail]) => {
        if (!head.startsWith(value)) {
          return {
            case: 'Error',
            error: `expected ${node}`,
            lineNumber: 0,
            columnNumber: 0
          }
        }

        return {
          case: node,
          value,
          lineNumber: 0,
          columnNumber: value.length
        }
      }
    },

    Array({elements}) {
      return (lines) => {
        return elements.reduce((previous, form) => {
          if (previous.case === 'Error') {
            return previous
          }
          const nextLines = seek(lines, previous.lineNumber, previous.columnNumber)
          const result = buildForm(grammar, node, form)(nextLines)
          return Object.assign(
            {},
            result,
            {
              value: previous.value.concat(result.value),
              lineNumber: previous.lineNumber + result.lineNumber,
              columnNumber: result.lineNumber
                ? 0
                : previous.columnNumber + result.columnNumber
            }
          )
        }, {
          value: [],
          lineNumber: 0,
          columnNumber: 0
        })
      }
    },

    Newline() {
      return ([head, ...tail]) => {
        if (head) {
          return {
            case: 'Error',
            error: 'expected newline',
            lineNumber: 0,
            columnNumber: 0
          }
        }

        return {
          case: 'Newline',
          value: '\n',
          lineNumber: 1,
          columnNumber: 0
        }
      }
    }
  }

  if (!operators[form.case]) {
    throw new Error('unsupported')
  }

  return operators[form.case](form)
}

function seek(lines, lineNumber, columnNumber) {
  const remainingLines = R.drop(lineNumber, lines)
  const remainingLine = R.drop(columnNumber, remainingLines[0])
  return [remainingLine, ...R.tail(remainingLines)]
}

module.exports = {
  ParserFactory(grammar) {
    return (source) => {
      const lexer = R.pipe(
        R.chain(R.split('\r\n')),
        R.chain(R.split('\r')),
        R.chain(R.split('\n'))
      )
      const lines = lexer([source])
      const result = build(normalize(grammar), 'Root')(lines)

      if (result.case !== 'Error') {
        const remainingSource = seek(lines, result.lineNumber, result.columnNumber)
        if (remainingSource[0]) {
          return {
            case: 'Error',
            error: 'unexpected source after Root',
            lineNumber: result.lineNumber,
            columnNumber: result.columnNumber
          }
        }
      }
      return result
    }
  },
  newline() {
    return {
      case: 'Newline'
    }
  }
}
