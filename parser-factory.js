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
    const forms = form
    const self = {
      case: 'Array',
      forms: forms.map((form) => normalizeForm(form, node)),
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
      return (source, start, end) => {
        if (!source.startsWith(value)) {
          return {
            case: 'Error',
            error: `expected ${toString()}`,
            start,
            end
          }
        }

        const {newlineCount, lastLineLength} = countLines(value)
        return {
          case: node,
          value,
          start: R.clone(end),
          end: {
            index: end.index + value.length,
            line: end.line + newlineCount,
            column: end.column + lastLineLength
          }
        }
      }
    },

    Array({forms}) {
      return (source, start, end) => {
        const result = R.reduceWhile(
          (previous) => previous.case !== 'Error',
          (previous, form) => {
            const nextSource = seek(source, previous.end.index)
            const result = buildForm(grammar, node, form)(nextSource, start, end)
            return Object.assign(
              {},
              result,
              {
                value: previous.value.concat(result.value),
                start: R.clone(end),
                end: {
                  index: previous.end.index + result.end.index,
                  line: previous.end.line + result.end.line,
                  column: previous.end.column + result.end.column
                }
              }
            )
          },
          {
            value: [],
            start,
            end
          },
          forms
        )
        if (result.case === 'Error') {
          return R.omit(['value'], result)
        }
        return result
      }
    },

    OneOf({forms, toString}) {
      return (source, start, end) => {
        const match = R.reduceWhile(
          (previous) => previous.case === 'Error',
          (previous, form) => buildForm(grammar, node, form)(source, start, end),
          {
            case: 'Error'
          },
          forms
        )
        if (match.case === 'Error') {
          return {
            case: 'Error',
            error: `expected ${toString()}`,
            start,
            end
          }
        }
        return match
      }
    },

    ManyOf({form, toString}) {
      return (source, start, end) => {
        let previous
        let next = {
          value: [],
          start,
          end
        }
        do {
          previous = next
          const nextSource = seek(source, previous.end.index)
          const result = buildForm(grammar, node, form)(nextSource, start, end)
          next = Object.assign(
            {},
            result,
            {
              value: previous.value.concat(result.value),
              start: R.clone(end),
              end: {
                index: previous.end.index + result.end.index,
                line: previous.end.line + result.end.line,
                column: previous.end.column + result.end.column
              }
            }
          )
        } while (next.case !== 'Error')
        if (!previous.case) {
          return {
            case: 'Error',
            error: `expected ${toString()}`,
            start,
            end
          }
        }
        return previous
      }
    },

    Optional({form}) {
      return (source, start, end) => {
        const result = buildForm(grammar, node, form)(source, start, end)
        if (result.case === 'Error') {
          return {
            case: node,
            value: '',
            start,
            end
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
      const start = {
        index: 0,
        line: 0,
        column: 0
      }
      const end = {
        index: 0,
        line: 0,
        column: 0
      }
      const result = build(normalize(grammar), 'Root')(source, start, end)

      if (result.case !== 'Error') {
        const remainingSource = seek(source, result.end.index)
        if (remainingSource) {
          return {
            case: 'Error',
            error: 'unexpected source after Root',
            start: result.start,
            end: result.end
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
