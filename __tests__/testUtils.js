const Joi = require('joi')
const { generateFakeEtsyPages } = require('../testUtils')

describe('generateFakeEtsyPages', () => {
  it('returns the default number of pages and results', () => {
    const pages = generateFakeEtsyPages()
    expect(pages.length).toBe(1)
    const [page] = pages
    expect(page.results.length).toBe(100)
  })

  it('returns the right number of pages', () => {
    const results = 25
    const perPage = 10
    const pages = generateFakeEtsyPages(results, perPage)
    expect(pages.length).toBe(3)
  })

  it('returns data in the right schema', async () => {
    const schema = Joi.object({
      count: Joi.number()
        .integer()
        .min(0),
      pagination: {
        effective_limit: Joi.number()
          .integer()
          .min(0),
        effective_offset: Joi.number()
          .integer()
          .min(0),
        next_offset: null,
        effective_page: Joi.number()
          .integer()
          .min(0),
        next_page: null,
      },
      params: Joi.object({
        limit: Joi.string(),
        offset: Joi.string(),
        page: Joi.number()
          .integer()
          .positive()
          .allow(null),
        shop_id: Joi.string(),
        keywords: null,
        sort_on: Joi.string(),
        sort_order: Joi.string(),
        min_price: null,
        max_price: null,
        color: null,
        color_accuracy: 0,
        tags: null,
        taxonomy_id: null,
        translate_keywords: Joi.string(),
        include_private: 0,
      }),
      type: Joi.string(),
      results: Joi.array().items(
        Joi.object({
          listing_id: Joi.number()
            .integer()
            .positive(),
          state: Joi.string(),
          user_id: Joi.number()
            .integer()
            .positive(),
          category_id: null,
          title: Joi.string(),
          description: Joi.string(),
          creation_tsz: Joi.date().timestamp('unix'),
          ending_tsz: Joi.date().timestamp('unix'),
          original_creation_tsz: Joi.date().timestamp('unix'),
          last_modified_tsz: Joi.date().timestamp('unix'),
          price: Joi.string(),
          currency_code: Joi.string(),
          quantity: Joi.number()
            .integer()
            .min(0),
          sku: Joi.array(),
          tags: Joi.array().items(Joi.string()),
          materials: Joi.array(),
          shop_section_id: Joi.number()
            .integer()
            .positive(),
          featured_rank: Joi.number()
            .allow(null)
            .integer()
            .positive(),
          state_tsz: Joi.date().timestamp('unix'),
          url: Joi.string().uri(),
          views: Joi.number()
            .integer()
            .min(0),
          num_favorers: Joi.number()
            .integer()
            .min(0),
          shipping_template_id: Joi.number()
            .integer()
            .positive(),
          processing_min: Joi.number()
            .integer()
            .allow(null),
          processing_max: Joi.number()
            .integer()
            .allow(null),
          who_made: Joi.string(),
          is_supply: Joi.string(),
          when_made: Joi.string(),
          item_weight: null,
          item_weight_unit: Joi.string(),
          item_length: null,
          item_width: null,
          item_height: null,
          item_dimensions_unit: Joi.string(),
          is_private: Joi.boolean(),
          recipient: null,
          occasion: null,
          style: null,
          non_taxable: Joi.boolean(),
          is_customizable: Joi.boolean(),
          is_digital: Joi.boolean(),
          file_data: '',
          should_auto_renew: Joi.boolean(),
          language: Joi.string(),
          has_variations: Joi.boolean(),
          taxonomy_id: Joi.number()
            .integer()
            .positive(),
          taxonomy_path: Joi.array().items(Joi.string()),
          used_manufacturer: Joi.boolean(),
          is_vintage: Joi.boolean(),
        })
      ),
    })
    const results = 10
    const perPage = 2
    const pages = generateFakeEtsyPages(results, perPage)
    const validations = pages.map(page => {
      return schema.validateAsync(page)
    })
    await Promise.all(validations)
  })
})
