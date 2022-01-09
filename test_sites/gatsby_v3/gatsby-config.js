require('dotenv').config({
  path: `.env.${process.env.NODE_ENV}`,
})

module.exports = {
  siteMetadata: {
    siteUrl: 'https://www.yourdomain.tld',
    title: 'Gatsby v3 Test Site',
  },
  plugins: [
    {
      resolve: `gatsby-source-etsy`,
      options: {
        api_key: process.env.GATSBY_ETSY_API_KEY,
        shop_id: process.env.GATSBY_ETSY_STORE_ID,
      },
    },
  ],
}
