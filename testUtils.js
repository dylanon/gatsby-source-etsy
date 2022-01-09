const faker = require('faker')

function generateFakeEtsyPages(numberOfResults = 100, resultsPerPage = 100) {
  const pages = []
  let workingPage = { results: [] }
  for (let i = 0; i < numberOfResults; i = i + 1) {
    workingPage.results.push({
      listing_id: faker.datatype.number(),
      state: faker.random.word(),
      user_id: faker.datatype.number(),
      category_id: null,
      title: faker.lorem.words(),
      description: faker.lorem.sentences(),
      creation_tsz: faker.date.past(),
      ending_tsz: faker.date.future(),
      original_creation_tsz: faker.date.past(),
      last_modified_tsz: faker.date.past(),
      price: faker.commerce.price(),
      currency_code: faker.finance.currencyCode(),
      quantity: faker.datatype.number(),
      sku: [],
      tags: [faker.lorem.word()],
      materials: [],
      shop_section_id: faker.datatype.number(),
      featured_rank: faker.datatype.number(),
      state_tsz: faker.date.past(),
      url: faker.internet.url(),
      views: faker.datatype.number(),
      num_favorers: faker.datatype.number(),
      shipping_template_id: faker.datatype.number(),
      processing_min: null,
      processing_max: null,
      who_made: faker.lorem.word(),
      is_supply: faker.lorem.word(),
      when_made: faker.lorem.word(),
      item_weight: null,
      item_weight_unit: faker.lorem.word(),
      item_length: null,
      item_width: null,
      item_height: null,
      item_dimensions_unit: faker.lorem.word(),
      is_private: faker.datatype.boolean(),
      recipient: null,
      occasion: null,
      style: null,
      non_taxable: faker.datatype.boolean(),
      is_customizable: faker.datatype.boolean(),
      is_digital: faker.datatype.boolean(),
      file_data: '',
      should_auto_renew: faker.datatype.boolean(),
      language: faker.random.locale(),
      has_variations: faker.datatype.boolean(),
      taxonomy_id: faker.datatype.number(),
      taxonomy_path: [faker.lorem.word()],
      used_manufacturer: faker.datatype.boolean(),
      is_vintage: faker.datatype.boolean(),
    })
    const resultNumber = i + 1
    if (
      resultNumber % resultsPerPage === 0 ||
      resultNumber === numberOfResults
    ) {
      const pageIndex = Math.floor(i / resultsPerPage)
      workingPage = {
        ...workingPage,
        count: numberOfResults,
        params: {
          limit: String(resultsPerPage),
          offset: String(resultsPerPage * pageIndex),
          page: null,
          shop_id: faker.datatype.uuid(),
          keywords: null,
          sort_on: 'created',
          sort_order: 'down',
          min_price: null,
          max_price: null,
          color: null,
          color_accuracy: 0,
          tags: null,
          taxonomy_id: null,
          translate_keywords: 'false',
          include_private: 0,
        },
        type: 'Listing',
        pagination: {
          effective_limit: resultsPerPage,
          effective_offset: resultsPerPage * pageIndex,
          next_offset: resultsPerPage * (pageIndex + 1),
          effective_page: pageIndex + 1,
          next_page: pageIndex + 2,
        },
      }
      pages.push(workingPage)
      workingPage = { results: [] }
    }
  }
  if (pages.length) {
    const lastPage = pages[pages.length - 1]
    pages.push({
      ...lastPage,
      results: [],
      params: {
        ...lastPage.params,
        offset: String(Number(lastPage.params.offset) + resultsPerPage),
      },
      pagination: {
        ...lastPage.pagination,
        effective_offset: lastPage.pagination.effective_offset + resultsPerPage,
        next_offset: null,
        effective_page: lastPage.pagination.effective_page + 1,
        next_page: null,
      },
    })
  }
  return pages
}

module.exports = {
  generateFakeEtsyPages,
}
