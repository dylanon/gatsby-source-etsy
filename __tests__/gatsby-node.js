const gatsbyNode = require('../gatsby-node')
const { sourceNodes } = gatsbyNode

jest.mock('../utils', function() {
  return {
    createThrottledFetch: jest.fn(() =>
      jest
        .fn()
        .mockImplementationOnce(async () => {
          return {
            json: async () => {
              return {
                results: [
                  {
                    listing_id: `id1`,
                  },
                ],
              }
            },
          }
        })
        .mockImplementationOnce(async () => {
          return {
            json: async () => {
              return {
                results: [
                  {
                    listing_image_id: `imageId1`,
                    url_fullxfull: `mockImageUrl`,
                  },
                ],
              }
            },
          }
        })
    ),
  }
})

describe('when the listing is not cached', () => {
  it('creates a listing node and an image node', async () => {
    // Prepare mocks
    const createNode = jest.fn()
    const createParentChildLink = jest.fn()
    const touchNode = jest.fn()
    const actions = {
      createNode,
      createParentChildLink,
      touchNode,
    }
    const cache = {
      // Simulate nothing being found in cache
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
    const apiKey = 'mockApiKey'
    const shopId = 'mockShopId'
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
        apiKey,
        shopId,
      }
    )
    const { createThrottledFetch } = require('../utils')
    expect(createThrottledFetch).toBeCalledWith({
      minTime: 150,
      maxConcurrent: 6,
    })
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
        type: 'FeaturedEtsyListing',
        contentDigest: 'mockContentDigest',
      },
      listing_id: 'id1',
    })
    expect(createNode.mock.calls[1][0]).toEqual({
      id: 'gsetsy_listing_id1_image_imageId1',
      parent: 'gsetsy_listing_id1',
      internal: {
        type: 'EtsyListingImage',
        contentDigest: 'mockContentDigest',
      },
      listing_image_id: `imageId1`,
      url_fullxfull: `mockImageUrl`,
    })
    expect(createParentChildLink).toBeCalledTimes(2)
    expect(cache.set).toBeCalledWith('cached-gsetsy_listing_id1', {
      cachedListingNodeId: 'gsetsy_listing_id1',
      cachedImageNodeIds: ['gsetsy_listing_id1_image_imageId1'],
    })
  })
})
