const R = require('ramda')
const match = require('./match')
const {GrammarFactory, oneOf, manyOf, optional, ref, except} = require('./grammar-factory')
const {count: countLines} = require('./lines')

function FormParserFactory(grammar, source) {
  const seenRefs = new Set()
  function parseForm(form, pointer) {
    return match({
      String({value, toString}) {
        if (source.substr(pointer.index, value.length) !== value) {
          return {
            type: 'Error',
            error: `expected ${toString()}`,
            pointer
          }
        }

        const {newlineCount, lastLineLength} = countLines(value)
        return {
          type: 'Success',
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
          (previous) => previous.type !== 'Error',
          (previous, form) => {
            const result = parseForm(form, previous.end)
            if (result.type === 'Error') {
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
        if (result.type === 'Error') {
          return result
        }
        return {
          type: 'Success',
          value: result.value,
          start: result.start,
          end: result.end,
          asValue() {
            const unnested = R.unnest(result.value
              .map((val) => val.asValue())
              .filter((val) => !R.isEmpty(val)))
            return unnested.length === 1
              ? unnested[0]
              : unnested
          }
        }
      },

      RegularExpression({regex, toString}) {
        const match = source.substr(pointer.index).match(regex)
        if (!match || match.index !== 0) {
          return {
            type: 'Error',
            error: `expected ${toString()}`,
            pointer
          }
        }
        const [value] = match

        const {newlineCount, lastLineLength} = countLines(value)
        return {
          type: 'Success',
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

      OneOf({forms, toString}) {
        const match = R.reduceWhile(
          (previous) => previous.type === 'Error',
          (previous, form) => parseForm(form, pointer),
          {
            type: 'Error'
          },
          forms
        )
        if (match.type === 'Error') {
          return {
            type: 'Error',
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
        while (true) {
          previous = next
          const result = parseForm(form, previous.end)
          if (result.type === 'Error') {
            break
          }
          next = {
            value: previous.value.concat(result),
            start: pointer,
            end: result.end
          }
        }
        if (previous.value.length === 0) {
          return {
            type: 'Error',
            error: `expected ${toString()}`,
            pointer
          }
        }
        return {
          type: 'Success',
          value: previous.value,
          start: previous.start,
          end: previous.end,
          asValue() {
            const unnested = R.unnest(previous.value
              .map((val) => val.asValue())
              .filter((val) => !R.isEmpty(val)))
            return unnested.length === 1
              ? unnested[0]
              : unnested
          }
        }
      },

      Optional({form}) {
        const result = parseForm(form, pointer)
        if (result.type === 'Error') {
          return {
            type: 'Success',
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
        const currentRef = `ref("${name}") @ ${pointer.index}`
        if (seenRefs.has(currentRef)) {
          return {
            type: 'Error',
            error: `circular reference detected {${[...seenRefs.values()].join(', ')}}`,
            pointer
          }
        }
        seenRefs.add(currentRef)
        const result = parseForm(grammar[name], pointer)
        seenRefs.delete(currentRef)
        if (result.type === 'Error') {
          if (!result.ref) {
            result.ref = name
          }
          return result
        }
        const self = {
          type: 'Success',
          ref: name,
          value: result.asValue(),
          start: result.start,
          end: result.end,
          asValue() {
            return R.omit(['type', 'asValue'], self)
          }
        }
        return self
      },

      Except({form, exceptions, toString}) {
        const result = parseForm(form, pointer)
        if (result.type === 'Error') {
          return result
        }
        if (exceptions.includes(result.value)) {
          return {
            type: 'Error',
            error: `expected ${toString()}`,
            pointer
          }
        }
        return result
      }
    })(form)
  }
  return parseForm
}

module.exports = {
  ParserFactory(grammar) {
    return (source) => {
      const parseForm = FormParserFactory(GrammarFactory(grammar), source)
      const pointer = {
        index: 0,
        line: 0,
        column: 0
      }
      const result = parseForm(ref('Root'), pointer)

      if (result.type === 'Error') {
        return result
      }

      if (source.length > result.end.index) {
        return {
          type: 'Error',
          ref: 'Root',
          error: 'unexpected source after Root',
          pointer: result.end
        }
      }

      const value = result.asValue()
      value.type = 'Success'
      return value
    }
  },

  oneOf,
  manyOf,
  optional,
  ref,
  except,

  separated(form, separator) {
    return [
      form,
      optional(manyOf([
        separator,
        form
      ]))
    ]
  }
}
