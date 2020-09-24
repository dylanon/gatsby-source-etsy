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
  shop_id,
  api_key,
  etsyFetch,
  queryParams = {},
  offset = 0
) {
  const {
    shop_id: _shop_id,
    page: _page,
    ...allowableQueryParams
  } = queryParams
  const definedQueryParams = {}
  Object.entries(allowableQueryParams).forEach(([key, value]) => {
    if (value !== undefined) {
      definedQueryParams[key] = value
    }
  })
  const queryObject = {
    ...definedQueryParams,
    api_key: api_key,
    limit: ETSY_PAGE_LIMIT,
    offset,
  }
  const query = querystring.stringify(queryObject)
  const { results } = await etsyFetch(
    `${ETSY_BASE_URL}/shops/${shop_id}/listings/active?${query}`
  ).then(res => res.json())

  let nextResults = []

  if (results.length) {
    nextResults = await getListingsRecursively(
      shop_id,
      api_key,
      etsyFetch,
      queryParams,
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
