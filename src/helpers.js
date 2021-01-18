const customTag = {}
const _ = require('lodash')
const isCustomTag = function(name) {
  return name.indexOf('-') > 0
}

const builtinDirective = ['v-if', 'v-for', 'v-model', 'v-slot', 'v-else', 'v-else-if']
const builtinDirectivesWithoutVModel = builtinDirective.filter(x => x !== 'v-model')


const extractChildrens = function(dObj) {
  const defaultChildrens = []
  const slotChildrens = []
  for(let child of dObj.children) {
    if (child.type === 'tag' && child.name === 'template' && Object.keys(child.attribs).find(isSlotAttribute)) {
      slotChildrens.push(child)
    } else {
      defaultChildrens.push(child)
    }
  }

  return {
    defaultChildrens,
    slotChildrens
  }
}



const isNamedSlot = function(dObj) {
  return Object.keys(dObj.attribs).find(isSlotAttribute)
}

function getSlotName(dObj) {
  if (!dObj.attribs) return 'default'
  const attr = Object.keys(dObj.attribs).find(isSlotAttribute)
  if (!isNamedSlot(dObj)) return 'default'
  const prefix = attr.startsWith("#") ? "#" : "v-slot:"
  return attr.split(prefix)[1]
}

function getSlotProps(dObj) {
  const attr = Object.keys(dObj.attribs).find(isSlotAttribute)
  return dObj.attribs[attr]
}
const getCondition = function(dObj) {
  return dObj.attribs['v-if'] || dObj.attribs['v-else-if']
}

// conditional attribute
function isConditional(dObj) {
  return isVIf(dObj) || isVElse(dObj) || isVElseIf(dObj)
}
function isVIf(dObj) {
  return dObj.type !== 'text' && dObj.attribs.hasOwnProperty('v-if')
}
function isVElseIf(dObj) {
  return dObj.type !== 'text' && dObj.attribs.hasOwnProperty('v-else-if')
}
function isVElse(dObj) {
  return dObj.type !== 'text' && dObj.attribs.hasOwnProperty('v-else')
}

function isVifOrVElseIf(dObj) {
  return isVIf(dObj) || isVElseIf(dObj)
}

const isVFor = function(dObj) {
  return dObj.attribs && dObj.attribs.hasOwnProperty('v-for')
}

const isSlotAttribute = function(attr) {
  return attr.startsWith('#') || attr.startsWith('v-slot')
}

function isValueAttribute(attr) {
  return ['v-if', 'v-else', 'v-else-if', 'v-for', 'v-slot'].indexOf(attr) === -1
}

const getSlotAttribute = function(attrs) {
  const slotAttrib = Object.keys(attrs).find(isSlotAttribute)
  const slotValue = attrs[slotAttrib]

  if (slotAttrib.startsWith('#')) {
    return {
      name: slotAttrib.substr(1), // #slotName
      value: slotValue
    }
  } else {
    return {
      name: slotAttrib.split(':')[1], // v-slot:slotName
      value: slotValue
    }
  }
}

function getValueAttributes(attribs) {
  const output = {}
  const attrNames = Object.keys(attribs)
  _.each(attrNames, k => {
    if (isValueAttribute(k)) {
      output[k] = attribs[k]
    }
  })
  return output
}

function isTextBlank(txt) {
  for (let i of txt) {
    if (i !== ' ' && i !== '\n') {
      return false
    }
  }
  return true
}
function renderValueAttributes(attribs) {
  const attribOuts = []
  for(let attrib of Object.keys(attribs)) {
    if (attrib.startsWith(':') /*prop*/) {
      attribOuts.push(`${attrib.substr(1)}={ ${attribs[attrib]} }`)
    } else if (attrib.startsWith('@') /*event handler*/) {
      const withModifier = attrib.indexOf('.') > 0
      if (withModifier) {
        const eventPath = attrib.split('.')
        const eventName = eventPath.splice(0, 1)
        const jsxEventName = `on${eventName[0].toUpperCase()}${eventName.substr(1)}`
        const modifiers = "[" + eventPath.map(i => `"${i}"`).join(',') + "]"
        attribOuts.push(`${jsxEventName}={ withModifiers(${attribs[eventName]}, ${modifiers}) }`)
      } else {
        attribOuts.push(`on${attrib[1].toUpperCase() + attrib.substr(2)}={ ${attribs[attrib]} }`)
      }
    } else /*attribute or string prop*/ {
      // blank attrib -> boolean prop -> only append attribute name
      if (attribs[attrib] === "") {
        attribOuts.push(attrib)
      } else {
        attribOuts.push(`${attrib}="${attribs[attrib]}"`)
      }
    }
  }

  return attribOuts.join(' ')
}

function renderSlots(slotChildrens) {
  const vSlots = {}

  for(let child of slotChildrens) {
    const { name, value } = getSlotAttribute(child.attribs)
    vSlots[name] = `(${value}) => <>${ child.children.map(renderDomObject) }</>`
  }

  const slotDeclareName = `slotOf${_.snakeCase(slotChildrens[0].parent.name)}`

  return {
    declare:
      `const ${slotDeclareName} = {
  ${ Object.keys(vSlots).map(k => `${k}: ${vSlots[k]}` ) }
}
`,
    usage: `v-slots={${slotDeclareName}}`
  }
}

function getTag(dObj) {
  return dObj.name
}

function getFirstChild(dObj) {
  return dObj.children. length && dObj.children[0]
}
function preprocess(dObj) {
  // TODO: Pre-process remove all empty text node
  return dObj
}
function isEmptyObject(dObj) {
  return dObj.type === 'text' && isTextBlank(dObj.data)
}

function isText(dObj) {
  return dObj.type === 'text'
}

function getText(dObj) {
  return dObj.data
}

function convertText(text) {
  return text.replace(/{{/g, '{').replace(/}}/g, '}').replace(/\$t/g, 't')
}

function getLoopCommand(dObj) {
  const command = dObj.attribs['v-for']
  const separator = command.includes(' in ') ? ' in ' : ' of '
  const s = command.split(separator)
  return `${s[1].trim()}.map(${s[0].trim()} `
}

function isBindingAttrs(attrName) {
  return attrName.startsWith(':')
}


const toCamelCase = function(s) {
  let res = ''
  for(let i = 0; i < s.length; i++) {
    if (i > 0 && s[i-1] === '-') {
      res += s[i].toUpperCase()
    } else if (s[i] !== '-') res += s[i]
  }
  return res
}
function getAttrName(attrName, prefix) {
  return toCamelCase(attrName.split(prefix)[1])
}

function isEventListener(attrName) {
  return attrName.startsWith('@')
}

function getListenerName(attrName) {
  const idx = attrName.indexOf('.')
  if (idx === -1) return attrName.substr(1)
  else return attrName.substr(1, idx - 1)
}

function getModifiers(attrName) {
  let res = attrName.split('.')
  res.shift()
  return res
}

const convertEventListenerName = function(attrName) {
  const name = getListenerName(attrName)
  return toCamelCase(`on-${name}`)
}

const convertListener = function(listener) {
  const isFunction = (listener.indexOf('=>') !== -1) || (listener.indexOf('(') === -1)
  return isFunction ? listener : (listener.includes('$event') ? `(v) => {${listener.replace(/\$event/g, 'v')}}` : `() => ${listener}` )
}
const convertEventListener = function(listener, modifiers = []) {
  return modifiers.length === 0 ? `${convertListener(listener)}` :
    `withModifiers(${convertListener(listener)}, [${modifiers.map(m => `'${m}'`).join(', ')}])`
}

const isVModel = function(attrName) {
  return attrName.startsWith('v-model')
}

const isBooleanAttrs = function(attrName) {
  return attrName === ''
}

module.exports = {
  isBooleanAttrs,
  convertText,
  convertEventListener,
  convertEventListenerName,
  getListenerName,
  getModifiers,
  isCustomTag,
  extractChildrens,
  isConditional,
  isSlotAttribute,
  isVModel,
  isVIf,
  isVElse,
  isVElseIf,
  isVFor,
  isVifOrVElseIf,
  isTextBlank,
  isValueAttribute,
  getSlotAttribute,
  getValueAttributes,
  renderValueAttributes,
  renderSlots,
  getCondition,
  getTag,
  getFirstChild,
  isEmptyObject,
  isText,
  getText,
  getLoopCommand,
  isNamedSlot,
  getSlotName,
  getSlotProps,
  isBindingAttrs,
  getAttrName,
  builtinDirective,
  isEventListener,
  builtinDirectivesWithoutVModel
}
