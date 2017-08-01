const R = require('ramda')

function build(grammar, node) {
  if (node === 'Error') {
    throw new Error('grammar cannot use reserved node name "Error"')
  }
  const form = grammar[node]
  if (!form) {
    throw new Error(`grammar does not contain the node named "${node}"`)
  }
  if (typeof form === 'string') {
    return (source) => {
      if (source.startsWith(form)) {
        const newLineCount = form.match(/(\r\n|\r|\n)/g)
        return {
          case: node,
          value: source,
          lineNumber: newLineCount
            ? newLineCount.length
            : 0,
          columnNumber: form.length
        }
      } else {
        return {
          case: 'Error',
          error: `expected ${node}`,
          lineNumber: 0,
          columnNumber: 0
        }
      }
    }
  }
  throw new Error('unsupported')
}

module.exports = {
  ParserFactory(grammar) {
    return (source) => {
      const result = build(grammar, 'Root')(source)
      // const remainingSource = seek(source, result.lineNumber, columnNumber)
      // if (remainingSource) {
      //   return {
      //     case: 'Error',
      //     error: 'unexpected source after Root',
      //     lineNumber: result.lineNumber,
      //     columnNumber: result.columnNumber
      //   }
      // }
      return result
    }
  }
}