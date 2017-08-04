const R = require('ramda')
const match = require('./match')
const {GrammarFactory, oneOf, manyOf, optional, ref} = require('./grammar-factory')
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
            return result.value.map((val) => val.asValue())
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
          const result = parseForm(form,  previous.end)
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
            return previous.value.map((val) => val.asValue())
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
  ref
}
