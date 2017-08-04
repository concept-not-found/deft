const R = require('ramda')
const match = require('./match')

function normalize(form) {
  if (typeof form === 'string') {
    return {
      type: 'String',
      value: form,
      toString() {
        return `"${form}"`
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

  manyOf(form) {
    return {
      type: 'ManyOf',
      form
    }
  },

  optional(form) {
    return {
      type: 'Optional',
      form
    }
  },

  ref(name) {
    return {
      type: 'Ref',
      name
    }
  }
}
