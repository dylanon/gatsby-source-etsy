const fetch = require('node-fetch')
const Bottleneck = require('bottleneck')
const querystring = require('querystring')
const { ETSY_BASE_URL, ETSY_PAGE_LIMIT } = require('./constants')

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

async function getListingsRecursively(
  shopId,
  apiKey,
  etsyFetch,
  language = null,
  offset = 0
) {
  const queryObject = {
    api_key: apiKey,
    limit: ETSY_PAGE_LIMIT,
    offset,
  }
  if (language) {
    queryObject.language = language
  }
  const query = querystring.stringify(queryObject)
  const { results } = await etsyFetch(
    `${ETSY_BASE_URL}/shops/${shopId}/listings/featured?${query}`
  ).then(res => res.json())

  let nextResults = []

  if (results.length) {
    nextResults = await getListingsRecursively(
      shopId,
      apiKey,
      etsyFetch,
      language,
      offset + ETSY_PAGE_LIMIT
    )
  }

  return [...results, ...nextResults]
}

module.exports = {
  asyncForEach,
  createThrottledFetch,
  getListingsRecursively,
}
