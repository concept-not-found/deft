const R = require('ramda')
const match = require('./match')
const {GrammarFactory, oneOf, manyOf, optional, ref} = require('./grammar-factory')
const {count: countLines} = require('./lines')

function parse(grammar, form, source, pointer) {
  return match({
    String({value, toString}) {
      if (!source.startsWith(value)) {
        return {
          case: 'Error',
          error: `expected ${toString()}`,
          pointer
        }
      }

      const {newlineCount, lastLineLength} = countLines(value)
      return {
        case: 'Success',
        value,
        start: pointer,
        end: {
          index: pointer.index + value.length,
          line: pointer.line + newlineCount,
          column: pointer.column + lastLineLength
        },
        asValue() {
          return value
        }
      }
    },

    Array({forms}) {
      const result = R.reduceWhile(
        (previous) => previous.case !== 'Error',
        (previous, form) => {
          const nextSource = R.drop(previous.end.index, source)
          const result = parse(grammar, form, nextSource, previous.end)
          if (result.case === 'Error') {
            return result
          }
          return {
            value: previous.value.concat(result),
            start: pointer,
            end: result.end
          }
        },
        {
          value: [],
          end: pointer
        },
        forms
      )
      if (result.case === 'Error') {
        return result
      }
      return {
        case: 'Success',
        value: result.value,
        start: result.start,
        end: result.end,
        asValue() {
          return result.value.map((val) => val.asValue())
        }
      }
    },

    OneOf({forms, toString}) {
      const match = R.reduceWhile(
        (previous) => previous.case === 'Error',
        (previous, form) => parse(grammar, form, source, pointer),
        {
          case: 'Error'
        },
        forms
      )
      if (match.case === 'Error') {
        return {
          case: 'Error',
          error: `expected ${toString()}`,
          pointer
        }
      }
      return match
    },

    ManyOf({form, toString}) {
      let previous
      let next = {
        value: [],
        end: pointer
      }
      do {
        previous = next
        const nextSource = R.drop(previous.end.index, source)
        const result = parse(grammar, form, nextSource, previous.end)
        if (result.case === 'Error') {
          break
        }
        next = {
          value: previous.value.concat(result),
          start: pointer,
          end: result.end
        }
      } while (true)
      if (previous.value.length === 0) {
        return {
          case: 'Error',
          error: `expected ${toString()}`,
          pointer
        }
      }
      return {
        case: 'Success',
        value: previous.value,
        start: previous.start,
        end: previous.end,
        asValue() {
          return previous.value.map((val) => val.asValue())
        }
      }
    },

    Optional({form}) {
      const result = parse(grammar, form, source, pointer)
      if (result.case === 'Error') {
        return {
          case: 'Success',
          value: '',
          start: pointer,
          end: pointer,
          asValue() {
            return ''
          }
        }
      }
      return result
    },

    Ref({name}) {
      const result = parse(grammar, grammar[name], source, pointer)
      if (result.case === 'Error') {
        if (!result.ref) {
          result.ref = name
        }
        return result
      }
      const self = {
        case: 'Success',
        ref: name,
        value: result.asValue(),
        start: result.start,
        end: result.end,
        asValue() {
          return R.omit(['case', 'asValue'], self)
        }
      }
      return self
    }
  })(form)
}

module.exports = {
  ParserFactory(grammar) {
    return (source) => {
      const pointer = {
        index: 0,
        line: 0,
        column: 0
      }
      const result = parse(GrammarFactory(grammar), ref('Root'), source, pointer)

      if (result.case === 'Error') {
        return result
      }

      const remainingSource = R.drop(result.end.index, source)
      if (remainingSource) {
        return {
          case: 'Error',
          ref: 'Root',
          error: 'unexpected source after Root',
          pointer: result.end
        }
      }

      const value = result.asValue()
      value.case = 'Success'
      return value
    }
  },

  oneOf,
  manyOf,
  optional,
  ref
}
