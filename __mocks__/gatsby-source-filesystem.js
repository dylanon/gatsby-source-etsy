const createRemoteFileNode = jest.fn(async () => {
  return {
    id: 'fileNode1',
  }
})

module.exports = {
  createRemoteFileNode,
}
