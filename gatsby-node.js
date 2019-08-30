const { createRemoteFileNode } = require('gatsby-source-filesystem')
const { createThrottledFetch } = require('./utils')
const { ETSY_BASE_URL } = require('./constants')

const etsyFetch = createThrottledFetch({
  minTime: 150, // 6.7 requests per second
  maxConcurrent: 6,
})

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
  const { createNode, createParentChildLink, touchNode } = actions
  const { apiKey, shopId } = configOptions

  // * Get the listings
  const { results: listings } = await etsyFetch(
    `${ETSY_BASE_URL}/shops/${shopId}/listings/featured?api_key=${apiKey}`
  ).then(res => res.json())

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
    // * Get images metadata for the listing
    const { results: images } = await etsyFetch(
      `${ETSY_BASE_URL}/listings/${listing_id}/images?api_key=${apiKey}`
    ).then(res => res.json())

    // * Process images
    const imageNodePromises = images.map(async image => {
      // * Create a node for each image
      const imageNodeId = `${listingNodeId}_image_${image.listing_image_id}`
      await createNode({
        id: imageNodeId,
        internal: {
          type: 'EtsyListingImage',
          contentDigest: createContentDigest(image),
        },
        ...image,
      })
      const url = image.url_fullxfull
      // * Create a child node for each image file
      const fileNode = await createRemoteFileNode({
        url,
        parentNodeId: imageNodeId,
        store,
        cache,
        createNode,
        createNodeId,
      })
      const imageNode = getNode(imageNodeId)
      createParentChildLink({
        parent: imageNode,
        child: fileNode,
      })
      return imageNode
    })
    const imageNodes = await Promise.all(imageNodePromises)

    // * Create a node for the listing and attach the image nodes as children
    const imageNodeIds = imageNodes.map(node => node.id)
    await createNode({
      id: listingNodeId,
      children: imageNodeIds,
      parent: null,
      internal: {
        type: 'FeaturedEtsyListing',
        contentDigest: createContentDigest(listing),
      },
      ...listing,
    })

    // * Cache the listing node id and image node ids
    await cache.set(`cached-${listingNodeId}`, {
      cachedListingNodeId: listingNodeId,
      cachedImageNodeIds: imageNodeIds,
    })
  })
  return Promise.all(listingProcessingJobs)
}
