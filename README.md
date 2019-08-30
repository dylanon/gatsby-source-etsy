# gatsby-source-etsy 🛍

[![Current npm package version](https://img.shields.io/npm/v/gatsby-source-etsy)](https://www.npmjs.com/package/gatsby-source-etsy)

Downloads featured listing info and images for your shop!

## Installation

Install the package from npm:

`npm i gatsby-source-etsy`

Next, add the plugin to your `gatsby-config.js` file:

```javascript
module.exports = {
  plugins: [
    {
      resolve: 'gatsby-source-etsy',
      options: {
        apiKey: 'your api key here',
        shopId: 'your shop id here',
      },
    },
  ],
};
```

## Example GraphQL queries

Listing info:

```graphql
{
  allFeaturedEtsyListing(
    sort: { fields: featured_rank, order: ASC }
    limit: 4
  ) {
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
  allFeaturedEtsyListing(
    sort: { fields: featured_rank, order: ASC }
    limit: 4
  ) {
    nodes {
      childrenEtsyListingImage {
        rank
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
}
```

## Queryable entities

- allFeaturedEtsyListing
- allEtsyListingImage
- featuredEtsyListing
  - childrenEtsyListingImage
- etsyListingImage
  - childFile

## Usage with `gatsby-image`

Install the necessary packages:

`npm install gatsby-image gatsby-plugin-sharp gatsby-transformer-sharp`

Query:

```graphql
{
  featuredEtsyListing {
    childrenEtsyListingImage {
      childFile {
        childImageSharp {
          fixed {
            base64
            tracedSVG
            aspectRatio
            width
            height
            src
            srcSet
            srcWebp
            srcSetWebp
            originalName
          }
        }
      }
    }
  }
}
```

See [`gatsby-image`](https://www.gatsbyjs.org/packages/gatsby-image/) for more.
