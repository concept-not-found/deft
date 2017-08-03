const R = require('ramda')
const match = require('./match')

function normalize(form) {
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
        case: 'OneOf',
        forms: forms.map(normalize),
        toString() {
          return `oneOf(${self.forms.map((form) => form.toString()).join(', ')})`
        }
      }
      return self
    },

    ManyOf({form}) {
      const self = {
        case: 'ManyOf',
        form: normalize(form),
        toString() {
          return `manyOf(${self.form.toString()})`
        }
      }
      return self
    },

    Optional({form}) {
      const self = {
        case: 'Optional',
        form: normalize(form),
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


module.exports = {
  GrammarFactory(grammar) {
    return R.mapObjIndexed(normalize, grammar)
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

  ref(name) {
    return {
      case: 'Ref',
      name
    }
  }
}
