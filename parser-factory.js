const R = require('ramda')

function normalizeForm(form) {
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
    const forms = form
    const self = {
      case: 'Array',
      forms: forms.map(normalizeForm),
      toString() {
        return `[${self.forms.map((form) => form.toString()).join(', ')}]`
      }
    }
    return self
  }

  const normalizers = {
    OneOf({forms}) {
      const self = {
        case: 'OneOf',
        forms: forms.map(normalizeForm),
        toString() {
          return `oneOf(${self.forms.map((form) => form.toString()).join(', ')})`
        }
      }
      return self
    },

    ManyOf({form}) {
      const self = {
        case: 'ManyOf',
        form: normalizeForm(form),
        toString() {
          return `manyOf(${self.form.toString()})`
        }
      }
      return self
    },

    Optional({form}) {
      const self = {
        case: 'Optional',
        form: normalizeForm(form),
        toString() {
          return `optional(${self.form.toString()})`
        }
      }
      return self
    },

    Ref({node}) {
      return {
        case: 'Ref',
        node
      }
    }
  }

  const normalizer = normalizers[form.case]
  if (!normalizer) {
    throw new Error(`unsupported form ${JSON.stringify(form)}`)
  }
  return normalizer(form)
}

function normalize(grammar) {
  return R.mapObjIndexed(normalizeForm, grammar)
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

function build(grammar, form) {
  const operators = {
    String({value, toString}) {
      return (source, end) => {
        if (!source.startsWith(value)) {
          return {
            case: 'Error',
            error: `expected ${toString()}`,
            index: end.index,
            line: end.line,
            column: end.column,
          }
        }

        const {newlineCount, lastLineLength} = countLines(value)
        return {
          case: 'String',
          value,
          start: end,
          end: {
            index: end.index + value.length,
            line: end.line + newlineCount,
            column: end.column + lastLineLength
          },
          asValue() {
            return value
          }
        }
      }
    },

    Array({forms}) {
      return (source, end) => {
        const result = R.reduceWhile(
          (previous) => previous.case !== 'Error',
          (previous, form) => {
            const nextSource = seek(source, previous.end.index)
            const result = build(grammar, form)(nextSource, previous.end)
            if (result.case === 'Error') {
              return Object.assign(
                {},
                result,
                {
                  index: previous.end.index,
                  line: previous.end.line,
                  column: previous.end.column
                }
              )
            }
            return {
              value: previous.value.concat(result),
              start: end,
              end: result.end
            }
          },
          {
            value: [],
            end
          },
          forms
        )
        if (result.case === 'Error') {
          return result
        }
        return {
          case: 'Array',
          value: result.value,
          start: result.start,
          end: result.end,
          asValue() {
            return result.value.map((val) => val.asValue())
          }
        }
      }
    },

    OneOf({forms, toString}) {
      return (source, end) => {
        const match = R.reduceWhile(
          (previous) => previous.case === 'Error',
          (previous, form) => build(grammar, form)(source, end),
          {
            case: 'Error'
          },
          forms
        )
        if (match.case === 'Error') {
          return {
            case: 'Error',
            error: `expected ${toString()}`,
            index: end.index,
            line: end.line,
            column: end.column
          }
        }
        return match
      }
    },

    ManyOf({form, toString}) {
      return (source, end) => {
        let previous
        let next = {
          value: [],
          end
        }
        do {
          previous = next
          const nextSource = seek(source, previous.end.index)
          const result = build(grammar, form)(nextSource, previous.end)
          if (result.case === 'Error') {
            break
          }
          next = {
            value: previous.value.concat(result),
            start: end,
            end: result.end
          }
        } while (true)
        if (previous.value.length === 0) {
          return {
            case: 'Error',
            error: `expected ${toString()}`,
            index: end.index,
            line: end.line,
            column: end.column
          }
        }
        return {
          case: 'Array',
          value: previous.value,
          start: previous.start,
          end: previous.end,
          asValue() {
            return previous.value.map((val) => val.asValue())
          }
        }
      }
    },

    Optional({form}) {
      return (source, end) => {
        const result = build(grammar, form)(source, end)
        if (result.case === 'Error') {
          return {
            case: 'Nothing',
            value: '',
            start: end,
            end,
            asValue() {
              return ''
            }
          }
        }
        return result
      }
    },

    Ref({node}) {
      return (source, end) => {
        const result = build(grammar, grammar[node])(source, end)
        if (result.case === 'Error') {
          return result
        }
        const self = {
          case: 'Ref',
          node,
          value: result.asValue(),
          start: result.start,
          end: result.end,
          asValue() {
            return R.omit(['asValue'], self)
          }
        }
        return self
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

const self = {
  ParserFactory(grammar) {
    return (source) => {
      const end = {
        index: 0,
        line: 0,
        column: 0
      }
      const result = build(normalize(grammar), self.ref('Root'))(source, end)

      if (result.case === 'Error') {
        return result
      }

      const remainingSource = seek(source, result.end.index)
      if (remainingSource) {
        return {
          case: 'Error',
          error: 'unexpected source after Root',
          index: result.end.index,
          line: result.end.line,
          column: result.end.column
        }
      }

      return result.asValue()
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
  },

  ref(node) {
    return {
      case: 'Ref',
      node
    }
  }
}

module.exports = self