const parse = require('html-dom-parser');
const template = require('./template/vifelseifelse')
const render = require('./render')

const node = parse(template)[0]
const output = render.renderDomObject(node)
console.log(output)

