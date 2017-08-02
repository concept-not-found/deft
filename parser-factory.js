const R = require('ramda')

function normalizeForm(form, node) {
  if (typeof form === 'string') {
    return {
      case: 'String',
      value: form,
      toString() {
        return JSON.stringify(form)
      }
    }
  }

  if (form instanceof Array) {
    const self = {
      case: 'Array',
      elements: form.map((subform) => normalizeForm(subform, node)),
      toString() {
        return `[${self.elements.map((element) => element.toString()).join(', ')}]`
      }
    }
    return self
  }

  const normalizers = {
    OneOf({forms}) {
      const self = {
        case: 'OneOf',
        forms: forms.map((subform) => normalizeForm(subform, node)),
        toString() {
          return `oneOf(${self.forms.map((form) => form.toString()).join(', ')})`
        }
      }
      return self
    },

    ManyOf({form}) {
      const self = {
        case: 'ManyOf',
        form: normalizeForm(form, node),
        toString() {
          return `manyOf(${self.form.toString()})`
        }
      }
      return self
    },

    Optional({form}) {
      const self = {
        case: 'Optional',
        form: normalizeForm(form, node),
        toString() {
          return `optional(${self.form.toString()})`
        }
      }
      return self
    }
  }

  const normalizer = normalizers[form.case]
  if (!normalizer) {
    throw new Error(`unsupported form ${JSON.stringify(form)} for node ${node}`)
  }
  return normalizer(form)
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
    String({value, toString}) {
      return (source, index, line, column) => {
        if (!source.startsWith(value)) {
          return {
            case: 'Error',
            error: `expected ${toString()}`,
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
        const result = R.reduceWhile(
          (previous) => previous.case !== 'Error',
          (previous, form) => {
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
          },
          {
            value: [],
            index,
            line,
            column
          },
          elements
        )
        if (result.case === 'Error') {
          return R.omit(['value'], result)
        }
        return result
      }
    },

    OneOf({forms, toString}) {
      return (source, index, line, column) => {
        const match = R.reduceWhile(
          (previous) => previous.case === 'Error',
          (previous, form) => buildForm(grammar, node, form)(source, index, line, column),
          {
            case: 'Error'
          },
          forms
        )
        if (match.case === 'Error') {
          return {
            case: 'Error',
            error: `expected ${toString()}`,
            index,
            line,
            column
          }
        }
        return match
      }
    },

    ManyOf({form, toString}) {
      return (source, index, line, column) => {
        let previous
        let next = {
          value: [],
          index,
          line,
          column
        }
        do {
          previous = next
          const nextSource = seek(source, previous.index)
          const result = buildForm(grammar, node, form)(nextSource, index, line, column)
          next = Object.assign(
            {},
            result,
            {
              value: previous.value.concat(result.value),
              index: previous.index + result.index,
              line: previous.line + result.line,
              column: previous.column + result.column
            }
          )
        } while (next.case !== 'Error')
        if (!previous.case) {
          return {
            case: 'Error',
            error: `expected ${toString()}`,
            index,
            line,
            column
          }
        }
        return previous
      }
    },

    Optional({form}) {
      return (source, index, line, column) => {
        const result = buildForm(grammar, node, form)(source, index, line, column)
        if (result.case === 'Error') {
          return {
            case: node,
            value: '',
            index,
            line,
            column
          }
        }
        return result
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
  },

  oneOf(...forms) {
    return {
      case: 'OneOf',
      forms
    }
  },

  manyOf(form) {
    return {
      case: 'ManyOf',
      form
    }
  },

  optional(form) {
    return {
      case: 'Optional',
      form
    }
  }
}
