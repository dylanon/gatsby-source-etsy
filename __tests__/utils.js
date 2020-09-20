const nock = require('nock')
const { ETSY_BASE_URL, ETSY_PAGE_LIMIT } = require('../constants')
const { generateFakeEtsyPages } = require('../testUtils')
const { createThrottledFetch, getListingsRecursively } = require('../utils')

describe('getListingsRecursively', () => {
  let nockScope = nock(ETSY_BASE_URL)
  const apiKey = 'mockApiKey'
  const shopId = 'mockShopId'
  const language = undefined
  const numberOfListings = 250
  const pages = generateFakeEtsyPages(numberOfListings)

  beforeEach(() => {
    nockScope
      .persist()
      .get(`/shops/${shopId}/listings/featured`)
      .query({
        api_key: apiKey,
        limit: ETSY_PAGE_LIMIT,
        offset: 0,
      })
      .reply(200, pages[0])
      .get(`/shops/${shopId}/listings/featured`)
      .query({
        api_key: apiKey,
        limit: ETSY_PAGE_LIMIT,
        offset: 1 * ETSY_PAGE_LIMIT,
      })
      .reply(200, pages[1])
      .get(`/shops/${shopId}/listings/featured`)
      .query({
        api_key: apiKey,
        limit: ETSY_PAGE_LIMIT,
        offset: 2 * ETSY_PAGE_LIMIT,
      })
      .reply(200, pages[2])
      .get(`/shops/${shopId}/listings/featured`)
      .query({
        api_key: apiKey,
        limit: ETSY_PAGE_LIMIT,
        offset: 3 * ETSY_PAGE_LIMIT,
      })
      .reply(200, {
        ...pages[2],
        results: [],
      })
  })

  afterEach(() => {
    nock.cleanAll()
  })

  it('fetches all the listings', async () => {
    const etsyFetch = createThrottledFetch({
      minTime: 150, // 6.7 requests per second
      maxConcurrent: 6,
    })
    const listings = await getListingsRecursively(
      shopId,
      apiKey,
      etsyFetch,
      language
    )
    expect(nockScope.isDone()).toBe(true)
    expect(listings.length).toBe(numberOfListings)
  })
})
