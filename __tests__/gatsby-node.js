const nock = require('nock')
const utilsMock = require('../utils')
const {
  ETSY_BASE_URL,
  ETSY_FETCH_CONFIG,
  ETSY_PAGE_LIMIT,
} = require('../constants')
const { sourceNodes } = require('../gatsby-node')
const page1 = require('../fixtures/page1.json')
const page2 = require('../fixtures/page2.json')
const page3 = require('../fixtures/page3.json')

jest.mock('../utils', () => {
  const originalModule = jest.requireActual('../utils')
  return {
    ...originalModule,
    createThrottledFetch: jest.fn(originalModule.createThrottledFetch),
  }
})

const createNode = jest.fn()
const createParentChildLink = jest.fn()
const touchNode = jest.fn()
const actions = {
  createNode,
  createParentChildLink,
  touchNode,
}
const cache = {
  // Simulate empty cache
  get: jest.fn(async () => undefined),
  set: jest.fn(),
}
const createContentDigest = jest.fn(() => 'mockContentDigest')
const createNodeId = jest.fn()
const getNode = jest.fn(nodeId => {
  if (typeof nodeId !== 'string') {
    return
  }
  return {
    id: nodeId,
  }
})
const reporter = {
  info: jest.fn(),
}
const store = {}
const api_key = 'mockApiKey'
const shop_id = 'mockShopId'
const listingId = 'id1'
const listingImageId = 'imageId1'
const listingImageUrl = 'mockImageUrl'
const listingsEndpoint = `/shops/${shop_id}/listings/active`

let nockScope = nock(ETSY_BASE_URL)

afterEach(() => {
  nock.cleanAll()
})

describe('networking', () => {
  beforeEach(() => {
    nockScope
      .filteringPath(/\/listings\/.*\/images/, `/listings/${listingId}/images`)
      .persist()
      .get(listingsEndpoint)
      .query({
        api_key: api_key,
        limit: ETSY_PAGE_LIMIT,
        offset: 0,
      })
      .reply(200, page1)
      .get(listingsEndpoint)
      .query({
        api_key: api_key,
        limit: ETSY_PAGE_LIMIT,
        offset: 1 * ETSY_PAGE_LIMIT,
      })
      .reply(200, page2)
      .get(listingsEndpoint)
      .query({
        api_key: api_key,
        limit: ETSY_PAGE_LIMIT,
        offset: 2 * ETSY_PAGE_LIMIT,
      })
      .reply(200, page3)
      .get(`/listings/${listingId}/images`)
      .query({
        api_key: api_key,
      })
      .reply(200, {
        results: [
          {
            listing_image_id: listingImageId,
            url_fullxfull: listingImageUrl,
          },
        ],
      })
  })

  it('fetches all available listings and images', async () => {
    await sourceNodes(
      {
        actions,
        cache,
        createContentDigest,
        createNodeId,
        getNode,
        reporter,
        store,
      },
      {
        api_key,
        shop_id,
      }
    )
    expect(nockScope.isDone()).toBe(true)
  })
})

describe('processing', () => {
  beforeEach(() => {
    nockScope
      .persist()
      .get(listingsEndpoint)
      .query({
        api_key: api_key,
        limit: ETSY_PAGE_LIMIT,
        offset: 0,
      })
      .reply(200, {
        results: [
          {
            listing_id: listingId,
            last_modified_tsz: 1570240827981,
          },
        ],
      })
      .get(listingsEndpoint)
      .query({
        api_key: api_key,
        limit: ETSY_PAGE_LIMIT,
        offset: 1 * ETSY_PAGE_LIMIT,
      })
      .reply(200, {
        results: [],
      })
      .get(`/listings/${listingId}/images`)
      .query(true)
      .reply(200, {
        results: [
          {
            listing_image_id: listingImageId,
            url_fullxfull: listingImageUrl,
          },
        ],
      })
  })

  describe('when the listing is not cached', () => {
    it('creates a listing node and an image node', async () => {
      // Run test
      await sourceNodes(
        {
          actions,
          cache,
          createContentDigest,
          createNodeId,
          getNode,
          reporter,
          store,
        },
        {
          api_key,
          shop_id,
        }
      )
      expect(utilsMock.createThrottledFetch).toBeCalledWith(ETSY_FETCH_CONFIG)
      expect(cache.get).toBeCalledWith('cached-gsetsy_listing_id1')
      expect(touchNode).not.toBeCalled()
      expect(reporter.info).toBeCalledWith(
        'gatsby-source-etsy: cached listing node not found, downloading gsetsy_listing_id1'
      )
      expect(createNode).toBeCalledTimes(2)
      expect(createNode.mock.calls[0][0]).toEqual({
        id: 'gsetsy_listing_id1',
        parent: null,
        internal: {
          type: 'EtsyListing',
          contentDigest: 'mockContentDigest',
        },
        listing_id: 'id1',
        last_modified_tsz: 1570240827981,
      })
      expect(createNode.mock.calls[1][0]).toEqual({
        id: 'gsetsy_listing_id1_image_imageId1',
        parent: 'gsetsy_listing_id1',
        internal: {
          type: 'EtsyListingImage',
          contentDigest: 'mockContentDigest',
        },
        listing_image_id: listingImageId,
        url_fullxfull: listingImageUrl,
      })
      expect(createParentChildLink).toBeCalledTimes(2)
      expect(cache.set).toBeCalledWith('cached-gsetsy_listing_id1', {
        cachedListingNodeId: 'gsetsy_listing_id1',
        cachedImageNodeIds: ['gsetsy_listing_id1_image_imageId1'],
      })
    })
  })

  describe('when the listing is cached', () => {
    const cacheWithListing = {
      // Simulate nothing being found in cache
      get: jest.fn(async () => {
        return {
          cachedListingNodeId: 'cached-gsetsy_listing_id1',
          cachedImageNodeIds: ['gsetsy_listing_id1_image_imageId1'],
        }
      }),
    }
    const mockListingNode = {
      id: 'gsetsy_listing_id1',
      listing_id: `id1`,
      last_modified_tsz: 1570240827981,
    }
    const mockListingImageNode = {
      id: 'gsetsy_listing_id1_image_imageId1',
      listing_id: `id1`,
      last_modified_tsz: 1570240827981,
    }
    const mockGetNode = nodeId => {
      const cachedNodes = {
        'cached-gsetsy_listing_id1': mockListingNode,
        gsetsy_listing_id1_image_imageId1: mockListingImageNode,
      }
      return cachedNodes[nodeId]
    }
    it('uses existing nodes instead of creating nodes', async () => {
      // Run test
      await sourceNodes(
        {
          actions,
          cache: cacheWithListing,
          createContentDigest,
          createNodeId,
          getNode: mockGetNode,
          reporter,
          store,
        },
        {
          api_key,
          shop_id,
        }
      )
      expect(reporter.info).toBeCalledWith(
        `gatsby-source-etsy: using cached version of listing node gsetsy_listing_id1`
      )
      expect(touchNode).toBeCalledTimes(2)
      expect(touchNode.mock.calls[0][0]).toEqual(mockListingNode)
      expect(touchNode.mock.calls[1][0]).toEqual(mockListingImageNode)
      expect(createNode).not.toBeCalled()
    })
  })
})
