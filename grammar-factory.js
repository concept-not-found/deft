const R = require('ramda')
const match = require('./match')

function normalize(form) {
  if (typeof form === 'string' || typeof form === 'number' || typeof form === 'boolean') {
    const self = {
      type: 'String',
      value: String(form),
      toString() {
        return JSON.stringify(self.value)
      }
    }
    return self
  }

  if (form instanceof Array) {
    const forms = form
    if (forms.length === 1) {
      return normalize(forms[0])
    }
    const self = {
      type: 'Array',
      forms: forms.map(normalize),
      toString() {
        return `[${self.forms.map((form) => form.toString()).join(', ')}]`
      }
    }
    return self
  }

  if (form instanceof RegExp) {
    const self = {
      type: 'RegularExpression',
      regex: form,
      toString() {
        return self.regex.toString()
      }
    }
    return self
  }

  return match({
    OneOf({forms}) {
      const self = {
        type: 'OneOf',
        forms: forms.map(normalize),
        toString() {
          return `oneOf(${self.forms.map((form) => form.toString()).join(', ')})`
        }
      }
      return self
    },

    ManyOf({form}) {
      const self = {
        type: 'ManyOf',
        form: normalize(form),
        toString() {
          return `manyOf(${self.form.toString()})`
        }
      }
      return self
    },

    Optional({form}) {
      const self = {
        type: 'Optional',
        form: normalize(form),
        toString() {
          return `optional(${self.form.toString()})`
        }
      }
      return self
    },

    Ref({name}) {
      const self = {
        type: 'Ref',
        name,
        toString() {
          return `ref("${self.name}")`
        }
      }
      return self
    },

    Except({form, exceptions}) {
      const self = {
        type: 'Except',
        form: normalize(form),
        exceptions: exceptions.map(String),
        toString() {
          return `except(${self.form.toString()}, ${self.exceptions.map(JSON.stringify).join(', ')})`
        }
      }
      return self
    }
  })(form)
}


module.exports = {
  GrammarFactory(grammar) {
    return R.mapObjIndexed(normalize, grammar)
  },

  oneOf(...forms) {
    return {
      type: 'OneOf',
      forms
    }
  },

  manyOf(...forms) {
    const form = forms.length > 1
      ? {
        type: 'OneOf',
        forms
      }
      : forms[0]
    return {
      type: 'ManyOf',
      form
    }
  },

  optional(form, extra) {
    if (extra) {
      throw new Error(`optional only takes a single argument. unexpected extra argument ${JSON.stringify(extra)}`)
    }
    return {
      type: 'Optional',
      form
    }
  },

  ref(name, extra) {
    if (extra) {
      throw new Error(`ref only takes a single argument. unexpected extra argument ${JSON.stringify(extra)}`)
    }
    return {
      type: 'Ref',
      name
    }
  },

  except(form, ...exceptions) {
    return {
      type: 'Except',
      form,
      exceptions: R.flatten(exceptions)
    }
  }
}
