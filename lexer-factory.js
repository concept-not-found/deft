const R = require('ramda')
const match = require('./match')
const {GrammarFactory, oneOf, manyOf, optional, ref, except} = require('./grammar-factory')
const {count: countLines} = require('./lines')

function FormLexerFactory(grammar, source) {
  const seenRefs = new Set()
  function lexForm(form, pointer) {
    return match('type')({
      String({value, toString}) {
        if (source.substr(pointer.index, value.length) !== value) {
          return {
            result: 'Error',
            error: `expected ${toString()}`,
            pointer
          }
        }

        const {newlineCount, lastLineLength} = countLines(value)
        return {
          result: 'Success',
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
          (previous) => previous.result !== 'Error',
          (previous, form) => {
            const result = lexForm(form, previous.end)
            if (result.result === 'Error') {
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
        if (result.result === 'Error') {
          return result
        }
        return {
          result: 'Success',
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
            result: 'Error',
            error: `expected ${toString()}`,
            pointer
          }
        }
        const [value] = match

        const {newlineCount, lastLineLength} = countLines(value)
        return {
          result: 'Success',
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
          (previous) => previous.result === 'Error',
          (previous, form) => lexForm(form, pointer),
          {
            result: 'Error'
          },
          forms
        )
        if (match.result === 'Error') {
          return {
            result: 'Error',
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
          const result = lexForm(form, previous.end)
          if (result.result === 'Error') {
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
            result: 'Error',
            error: `expected ${toString()}`,
            pointer
          }
        }
        return {
          result: 'Success',
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
        const result = lexForm(form, pointer)
        if (result.result === 'Error') {
          return {
            result: 'Success',
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
            result: 'Error',
            error: `circular reference detected {${[...seenRefs.values()].join(', ')}}`,
            pointer
          }
        }
        seenRefs.add(currentRef)
        const result = lexForm(grammar[name], pointer)
        seenRefs.delete(currentRef)
        if (result.result === 'Error') {
          if (!result.ref) {
            result.ref = name
          }
          return result
        }
        const self = {
          result: 'Success',
          ref: name,
          value: result.asValue(),
          start: result.start,
          end: result.end,
          asValue() {
            return R.omit(['result', 'asValue'], self)
          }
        }
        return self
      },

      Except({form, exceptions, toString}) {
        const result = lexForm(form, pointer)
        if (result.result === 'Error') {
          return result
        }
        if (exceptions.includes(result.value)) {
          return {
            result: 'Error',
            error: `expected ${toString()}`,
            pointer
          }
        }
        return result
      }
    })(form)
  }
  return lexForm
}

const self = {
  LexerFactory(grammar) {
    return (source) => {
      const lexForm = FormLexerFactory(GrammarFactory(grammar), source)
      const pointer = {
        index: 0,
        line: 0,
        column: 0
      }
      const result = lexForm(ref('Root'), pointer)

      if (result.result === 'Error') {
        return result
      }

      if (source.length > result.end.index) {
        return {
          result: 'Error',
          ref: 'Root',
          error: 'unexpected source after Root',
          pointer: result.end
        }
      }

      const value = result.asValue()
      value.result = 'Success'
      return value
    }
  },

  oneOf,
  manyOf,
  optional,
  ref,
  except,

  zeroOrMoreOf(...forms) {
    return optional(manyOf(oneOf(...forms)))
  },
  zeroOrMoreOfAll(...forms) {
    return optional(manyOf(forms))
  },
  manyOfAll(...forms) {
    return manyOf(forms)
  },
  separated(form, separator) {
    return [
      form,
      self.zeroOrMoreOfAll(
        separator,
        form
      )
    ]
  }
}

module.exports = self