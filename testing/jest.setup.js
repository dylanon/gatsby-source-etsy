const nock = require('nock')

jest.setTimeout(20000)

afterAll(() => {
  // Prevent [nock + Jest memory leaks](https://github.com/nock/nock#memory-issues-with-jest)
  nock.restore()
})
