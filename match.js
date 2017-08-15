module.exports = (key) => (handlers) => (message) => {
  const type = message[key]
  const handler = handlers[type]
  if (!handler) {
    throw new Error(`${key} ${type} not found in ${JSON.stringify(Object.keys(handlers))}`)
  }
  return handler(message)
}
