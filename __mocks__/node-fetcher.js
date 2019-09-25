module.exports = jest.fn(async function nodeFetch() {
  return {
    json: async function() {
      return {
        one: 1,
      }
    },
  }
})
