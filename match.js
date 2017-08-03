module.exports = (caseHandlers) => (message) => {
  const caseName = message.case
  const handler = caseHandlers[caseName]
  if (!handler) {
    throw new Error(`case ${caseName} not found in ${Object.keys(caseHandlers)}`)
  }
  return handler(message)
}
