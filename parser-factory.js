const R = require('ramda')

const normalize = R.mapObjIndexed((form, node) => {
  if (typeof form === 'string') {
    return {
      case: 'String',
      value: form
    }
  }
})


function build(grammar, node) {
  if (node === 'Error') {
    throw new Error('grammar cannot use reserved node name "Error"')
  }
  const form = grammar[node]
  if (!form) {
    throw new Error(`grammar does not contain the node named "${node}"`)
  }
  
  const operators = {
    String({value}) {
      return ([head, ...tail]) => {
        if (head.startsWith(value)) {
          return {
            case: node,
            value,
            lineNumber: 0,
            columnNumber: value.length
          }
        } else {
          return {
            case: 'Error',
            error: `expected ${node}`,
            lineNumber: 0,
            columnNumber: 0
          }
        }
      }
    },

    Newline() {

    }
  }

  if (!operators[form.case]) {
    throw new Error('unsupported')
  }

  return operators[form.case](form)
}

function seek(lines, lineNumber, columnNumber) {
  return R.drop(columnNumber, lines[lineNumber])
}

module.exports = {
  ParserFactory(grammar) {
    return (source) => {
      const lines = R.pipe(
        R.chain(R.split('\r\n')),
        R.chain(R.split('\r')),
        R.chain(R.split('\n'))
      )([source])
      const result = build(normalize(grammar), 'Root')(lines)

      if (result.case !== 'Error') {
        const remainingSource = seek(lines, result.lineNumber, result.columnNumber)
        if (remainingSource) {
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