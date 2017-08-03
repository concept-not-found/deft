module.exports = {
  count(source) {
    let count = 0
    let consumed = 0
    while (consumed < source.length) {
      let working = consumed
      while (working < source.length) {
        const character = source[working]
        if (character === '\n' || character === '\r') {
          break
        }
        working += 1
      }
      if (working >= source.length) {
        break
      }
      consumed = working
      if (source[consumed] === '\r' && source[consumed + 1] === '\n') {
        count += 1
        consumed += 2
        continue
      }
      count += 1
      consumed += 1
    }
    return {
      newlineCount: count,
      lastLineLength: source.length - consumed
    }
  }
}
