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

function countLines(source) {
  let count = 0
  let consumed = 0
  while (consumed < source.length) {
    let working = consumed
    while (working < source.length) {
      const character = source[working]
      if (character === '\n' || character === '\r') {
        break
      }
      working += 1
    }
    if (working >= source.length) {
      break
    }
    consumed = working
    if (source[consumed] === '\r' && source[consumed + 1] === '\n') {
      count += 1
      consumed += 2
      continue
    }
    count += 1
    consumed += 1
  }
  return {
    newlineCount: count,
    lastLineLength: source.length - consumed
  }
}

function buildForm(grammar, node, form) {
  const operators = {
    String({value}) {
      return (source, index, line, column) => {
        if (!source.startsWith(value)) {
          return {
            case: 'Error',
            error: `expected ${node}`,
            index,
            line,
            column
          }
        }

        const {newlineCount, lastLineLength} = countLines(value)
        return {
          case: node,
          value,
          index: index + value.length,
          line: line + newlineCount,
          column: column + lastLineLength
        }
      }
    },

    Array({elements}) {
      return (source, index, line, column) => {
        return elements.reduce((previous, form) => {
          if (previous.case === 'Error') {
            return previous
          }
          const nextSource = seek(source, previous.index)
          const result = buildForm(grammar, node, form)(nextSource, index, line, column)
          return Object.assign(
            {},
            result,
            {
              value: previous.value.concat(result.value),
              index: previous.index + result.index,
              line: previous.line + result.line,
              column: previous.column + result.column
            }
          )
        }, {
          value: [],
          index,
          line,
          column
        })
      }
    }
  }

  if (!operators[form.case]) {
    throw new Error('unsupported')
  }

  return operators[form.case](form)
}

function seek(source, index) {
  return R.drop(index, source)
}

module.exports = {
  ParserFactory(grammar) {
    return (source) => {
      const result = build(normalize(grammar), 'Root')(source, 0, 0, 0)

      if (result.case !== 'Error') {
        const remainingSource = seek(source, result.index)
        if (remainingSource) {
          return {
            case: 'Error',
            error: 'unexpected source after Root',
            index: result.index,
            line: result.line,
            column: result.column
          }
        }
      }
      return result
    }
  }
}
