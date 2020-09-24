const nock = require('nock')
const {
  ETSY_BASE_URL,
  ETSY_FETCH_CONFIG,
  ETSY_PAGE_LIMIT,
} = require('../constants')
const { createThrottledFetch, getListingsRecursively } = require('../utils')
const page1 = require('../fixtures/page1')
const page2 = require('../fixtures/page2')
const page3 = require('../fixtures/page3')

describe('getListingsRecursively', () => {
  let nockScope = nock(ETSY_BASE_URL)
  const api_key = 'mockApiKey'
  const shop_id = 'mockShopId'
  const listingsEndpoint = `/shops/${shop_id}/listings/active`

  afterEach(() => {
    nock.cleanAll()
  })

  describe('with default config', () => {
    beforeEach(() => {
      nockScope
        .persist()
        .get(listingsEndpoint)
        .query({
          api_key,
          limit: ETSY_PAGE_LIMIT,
          offset: 0,
        })
        .reply(200, page1)
        .get(listingsEndpoint)
        .query({
          api_key,
          limit: ETSY_PAGE_LIMIT,
          offset: 1 * ETSY_PAGE_LIMIT,
        })
        .reply(200, page2)
        .get(listingsEndpoint)
        .query({
          api_key,
          limit: ETSY_PAGE_LIMIT,
          offset: 2 * ETSY_PAGE_LIMIT,
        })
        .reply(200, page3)
    })

    it('fetches all the listings', async () => {
      const etsyFetch = createThrottledFetch(ETSY_FETCH_CONFIG)
      const listings = await getListingsRecursively(shop_id, api_key, etsyFetch)
      expect(nockScope.isDone()).toBe(true)
      expect(listings.length).toBe(101)
    })
  })

  describe('with custom config', () => {
    const customConfig = {
      keywords: 'testKeyword',
      sort_on: 'created',
      sort_order: 'up',
      min_price: 0.01,
      max_price: 999.99,
      color: '#333333',
      color_accuracy: 0,
      tags: 'one,two,three',
      taxonomy_id: 18,
      translate_keywords: true,
      include_private: true,
    }
    beforeEach(() => {
      nockScope
        .get(listingsEndpoint)
        .query({
          api_key,
          limit: ETSY_PAGE_LIMIT,
          offset: 0,
          ...customConfig,
        })
        .reply(200, page1)
        .get(listingsEndpoint)
        .query({
          api_key,
          limit: ETSY_PAGE_LIMIT,
          offset: 1 * ETSY_PAGE_LIMIT,
          ...customConfig,
        })
        .reply(200, page2)
        .get(listingsEndpoint)
        .query({
          api_key,
          limit: ETSY_PAGE_LIMIT,
          offset: 2 * ETSY_PAGE_LIMIT,
          ...customConfig,
        })
        .reply(200, { results: [] })
    })

    it('adds query params to the request', async () => {
      const etsyFetch = createThrottledFetch(ETSY_FETCH_CONFIG)
      await getListingsRecursively(shop_id, api_key, etsyFetch, customConfig)
      expect(nockScope.isDone()).toBe(true)
    })
  })

  describe('with invalid custom config', () => {
    beforeEach(() => {
      nockScope
        .get(listingsEndpoint)
        .query({
          api_key,
          limit: ETSY_PAGE_LIMIT,
          offset: 0,
        })
        .reply(200, page1)
        .get(listingsEndpoint)
        .query({
          api_key,
          limit: ETSY_PAGE_LIMIT,
          offset: 1 * ETSY_PAGE_LIMIT,
        })
        .reply(200, page2)
        .get(listingsEndpoint)
        .query({
          api_key,
          limit: ETSY_PAGE_LIMIT,
          offset: 2 * ETSY_PAGE_LIMIT,
        })
        .reply(200, { results: [] })
    })

    it('skips or overrides specific query params', async () => {
      const etsyFetch = createThrottledFetch(ETSY_FETCH_CONFIG)
      await getListingsRecursively(shop_id, api_key, etsyFetch, {
        shop_id: 'wrongShopId',
        api_key: 'wrongApiKey',
        limit: 12,
        offset: 999,
        page: 42,
      })
      expect(nockScope.isDone()).toBe(true)
    })
  })
})
