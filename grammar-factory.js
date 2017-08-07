const R = require('ramda')
const match = require('./match')

function normalize(form) {
  if (typeof form === 'string' || typeof form === 'number' || typeof form === 'boolean') {
    return {
      type: 'String',
      value: String(form),
      toString() {
        return JSON.stringify(form)
      }
    }
  }

  if (form instanceof Array) {
    const forms = form
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
    return {
      type: 'RegularExpression',
      regex: form,
      toString() {
        return form.toString()
      }
    }
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
      return {
        type: 'Ref',
        name,
        toString() {
          return `ref("${name}")`
        }
      }
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

  manyOf(form, extra) {
    if (extra) {
      throw new Error(`manyOf only takes a single argument. unexpected extra argument ${JSON.stringify(extra)}`)
    }
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
  }
}
