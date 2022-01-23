# gatsby-source-etsy 🛍

[![Current npm package version](https://img.shields.io/npm/v/gatsby-source-etsy)](https://www.npmjs.com/package/gatsby-source-etsy)

Downloads listing info and images from your Etsy shop!

## Installation

### Sites on Gatsby v3+

Install the package from npm:

`npm i gatsby-source-etsy`

Install peer dependencies:

`npm i gatsby-source-filesystem`

### Sites on Gatsby v2

Install version 1 from npm:

`npm i gatsby-source-etsy@release-1.x`

### Sites on Gatsby v1

Gatsby v1 is not supported.

## Configuration

Next, add the plugin to your `gatsby-config.js` file:

```javascript
module.exports = {
  plugins: [
    {
      resolve: 'gatsby-source-etsy',
      options: {
        api_key: 'your api key here',
        shop_id: 'your shop id here',
        // The following properties are optional - Most of them narrow the results returned from Etsy.
        //
        // You don't have to use them, and in fact, you probably shouldn't!
        // You're probably here because you need to source *all* your listings.
        language: 'en',
        translate_keywords: true,
        keywords: 'coffee',
        sort_on: 'created',
        sort_order: 'up',
        min_price: 0.01,
        max_price: 999.99,
        color: '#333333',
        color_accuracy: 0,
        tags: 'diy,coffee,brewing',
        taxonomy_id: 18,
        include_private: true,
      },
    },
  ],
}
```

This plugin supports the options specified in Etsy's documentation under [findAllShopListingsActive](https://www.etsy.com/developers/documentation/reference/listing#method_findallshoplistingsactive).

For information on the `language` and `translate_keywords` properties, please see [Searching Listings](https://www.etsy.com/developers/documentation/reference/listing#section_searching_listings).

## Example GraphQL queries

Listing info:

```graphql
{
  allEtsyListing(sort: { fields: featured_rank, order: ASC }, limit: 4) {
    nodes {
      currency_code
      title
      listing_id
      price
      url
    }
  }
}
```

Query transformed/optimized images for a listing (e.g. for use with `gatsby-image` - see below):

```graphql
{
  allEtsyListing(sort: { fields: featured_rank, order: ASC }, limit: 4) {
    nodes {
      childrenEtsyListingImage {
        rank
        childFile {
          childImageSharp {
            fluid {
              base64
              tracedSVG
              aspectRatio
              src
              srcSet
              srcWebp
              srcSetWebp
              originalName
              originalImg
              presentationHeight
              presentationWidth
              sizes
            }
          }
        }
      }
    }
  }
}
```

## Queryable entities

- allEtsyListing
- allEtsyListingImage
- etsyListing
  - childrenEtsyListingImage
- etsyListingImage
  - childFile

## Usage with `gatsby-image`

Install the necessary packages:

`npm install gatsby-image gatsby-plugin-sharp gatsby-transformer-sharp`

Query:

```graphql
{
  etsyListing {
    childrenEtsyListingImage {
      childFile {
        childImageSharp {
          fluid {
            ...GatsbyImageSharpFluid
          }
        }
      }
    }
  }
}
```

See [`gatsby-image`](https://www.gatsbyjs.org/packages/gatsby-image/) for more.

## Contributing

Did something break, or is there additional functionality you'd like to add to this plugin? Consider contributing to this project!

Feel free to open an issue to discuss what's happening first, or dive right in and open a PR.

### Developing this plugin locally

You can use `yalc` to test changes you make to this plugin against a local Gatsby site:

```bash
# Install yalc globally on your system
yarn global add yalc

# Publish the package to your local repository
# (Run this from this repo's root directory)
yalc publish

# Use the package from your local repository instead of one from npm
# (Run this from your Gatsby site's root directory)
yalc add gatsby-source-etsy
```

For up-to-date information and troubleshooting, see `yalc`'s [documentation](https://github.com/wclr/yalc).
