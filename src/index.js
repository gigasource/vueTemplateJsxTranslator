const parse = require('html-dom-parser');
const { renderVueDomObject } = require('./render')
const fs = require('fs')
const path = require('path')
const render = function(input) {
  const node = parse(input)[0]
  return renderVueDomObject(node).default.renderFn
}

const input = fs.readFileSync(path.resolve(__dirname, 'input.txt'), 'utf-8')
console.log(render(input))
module.exports = {
  render
}
