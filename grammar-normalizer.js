const R = require('ramda')
const match = require('./match')

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

  return match({
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

    Ref({name}) {
      return {
        case: 'Ref',
        name,
        toString() {
          return `ref("${name}")`
        }
      }
    }
  })(form)
}

module.exports = (grammar) => R.mapObjIndexed(normalizeForm, grammar)
