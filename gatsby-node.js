const { createRemoteFileNode } = require('gatsby-source-filesystem')
const { createThrottledFetch, getListingsRecursively } = require('./utils')
const { ETSY_BASE_URL, ETSY_FETCH_CONFIG } = require('./constants')

exports.sourceNodes = async (
  {
    actions,
    cache,
    createContentDigest,
    createNodeId,
    getNode,
    reporter,
    store,
  },
  configOptions
) => {
  const etsyFetch = createThrottledFetch(ETSY_FETCH_CONFIG)

  const { createNode, createParentChildLink, touchNode } = actions
  const { api_key, shop_id, ...queryParams } = configOptions

  const listings = await getListingsRecursively(
    shop_id,
    api_key,
    etsyFetch,
    queryParams
  )

  // * Process listings
  const listingProcessingJobs = listings.map(async listing => {
    const { listing_id } = listing
    const listingNodeId = `gsetsy_listing_${listing_id}`

    // * Check if there is a cached node for this listing
    const { cachedListingNodeId, cachedImageNodeIds } =
      (await cache.get(`cached-${listingNodeId}`)) || {}
    const cachedListingNode = getNode(cachedListingNodeId)
    if (
      cachedListingNode &&
      cachedListingNode.last_modified_tsz === listing.last_modified_tsz
    ) {
      reporter.info(
        `gatsby-source-etsy: using cached version of listing node ${cachedListingNode.id}`
      )
      touchNode({ nodeId: cachedListingNode.id })
      cachedImageNodeIds.forEach(nodeId => touchNode({ nodeId }))
      return
    }

    reporter.info(
      `gatsby-source-etsy: cached listing node not found, downloading ${listingNodeId}`
    )

    // * Create a node for the listing
    await createNode({
      id: listingNodeId,
      parent: null,
      internal: {
        type: 'EtsyListing',
        contentDigest: createContentDigest(listing),
      },
      ...listing,
    })

    // * Get images metadata for the listing
    const { results: images } = await etsyFetch(
      `${ETSY_BASE_URL}/listings/${listing_id}/images?api_key=${api_key}`
    ).then(res => res.json())

    // * Process images
    const imageNodePromises = images.map(async image => {
      // * Create a node for each image
      const imageNodeId = `${listingNodeId}_image_${image.listing_image_id}`
      await createNode({
        id: imageNodeId,
        parent: listingNodeId,
        internal: {
          type: 'EtsyListingImage',
          contentDigest: createContentDigest(image),
        },
        ...image,
      })
      const listingNode = getNode(listingNodeId)
      const imageNode = getNode(imageNodeId)
      createParentChildLink({
        parent: listingNode,
        child: imageNode,
      })
      // * Create a child node for each image file
      const url = image.url_fullxfull
      const fileNode = await createRemoteFileNode({
        url,
        parentNodeId: imageNodeId,
        store,
        cache,
        createNode,
        createNodeId,
      })
      createParentChildLink({
        parent: imageNode,
        child: fileNode,
      })
      return imageNode
    })
    const imageNodes = await Promise.all(imageNodePromises)
    const imageNodeIds = imageNodes.map(node => node.id)

    // * Cache the listing node id and image node ids
    await cache.set(`cached-${listingNodeId}`, {
      cachedListingNodeId: listingNodeId,
      cachedImageNodeIds: imageNodeIds,
    })
  })
  return Promise.all(listingProcessingJobs)
}
