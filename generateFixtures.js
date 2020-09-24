const fs = require('fs')
const prettier = require('prettier')
const { generateFakeEtsyPages } = require('./testUtils')

function generateFixtures() {
  const pages = generateFakeEtsyPages(101, 100)

  pages.forEach((page, i) => {
    const dir = 'fixtures'
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir)
    }
    const json = JSON.stringify(page)
    const content = prettier.format(json, { parser: 'json' })
    fs.writeFileSync(`fixtures/page${i + 1}.json`, content)
  })
}

generateFixtures()
