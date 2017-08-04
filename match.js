module.exports = (handlers) => (message) => {
  const type = message.type
  const handler = handlers[type]
  if (!handler) {
    throw new Error(`type ${type} not found in ${JSON.stringify(Object.keys(handlers))}`)
  }
  return handler(message)
}
