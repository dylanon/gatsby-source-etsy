const fetch = require('node-fetch')
const Bottleneck = require('bottleneck')

async function asyncForEach(sourceArray, callback) {
  for (let i = 0; i < sourceArray.length; i = i + 1) {
    await callback(sourceArray[i], i, sourceArray)
  }
}

function createThrottledFetch(limiterOptions = {}) {
  const defaultLimiterOptions = {
    minTime: 100,
  }
  const limiter = new Bottleneck({
    ...defaultLimiterOptions,
    ...limiterOptions,
  })
  function throttledFetch(...args) {
    return limiter.schedule(() => fetch(...args))
  }
  return throttledFetch
}

module.exports = {
  asyncForEach,
  createThrottledFetch,
}
