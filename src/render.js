const _ = require('lodash')

// custom tag
const customTag = {}
function isCustomTag(name) {
  return name.indexOf('-') > 0
}

// render dom object
function renderDomObject(dObj, defaultValue = null) {
  if (dObj == null)
    return defaultValue

  if (dObj.type === 'text') {
    const inCondition = dObj.prev && (isConditional(dObj.prev))
    // in case text is "\n    " (html format) -- can apply pre-process to handle it
    if (isTextBlank(dObj.data)) {
      return inCondition ? 'null' : ''
    } else {
      return inCondition ? '"' + dObj.data + '"': dObj.data
    }
  } else if (dObj.type === 'tag') {
    // import missing analysis in <script> section
    if (isCustomTag(dObj.name)) {
      customTag[dObj.name] = ""
    }

    const {
      defaultChildrens,
      slotChildrens
    } = extractChildrens(dObj)

    let declareSlot = ''
    let usageSlot = ''
    if (slotChildrens.length) {
      const { declare, usage } = renderSlots(slotChildrens)
      declareSlot = declare
      usageSlot = usage

      if (usageSlot) {
        usageSlot = ' ' + usageSlot
      } else {
        usageSlot = ''
      }
    }

    let attrRender = renderValueAttributes(getValueAttributes(dObj.attribs))
    if (attrRender) {
      attrRender = ' ' + attrRender
    }


    let output = `${ declareSlot !== '' ?  `{ ${declareSlot} }` : ''}<${dObj.name}${attrRender}${usageSlot}>${renderChildren(defaultChildrens, dObj)}</${dObj.name}>`

    if (isVIf(dObj)) {
      return `{ (${dObj.attribs['v-if']}) ? ${ output } : ${ renderDomObject(dObj.next, 'null') } }`
    } else if (isVElsIf(dObj)) {
      return `(${dObj.attribs['v-else-if']}) ? ${ output } : ${ renderDomObject(dObj.next, 'null') }`
    } else if (isVElse(dObj)) {
      // v-else
      return output
    } else {
      // non conditional
      return output
    }
  }
}

function isTextBlank(txt) {
  for (let i of txt) {
    if (i !== ' ' && i !== '\n') {
      return false
    }
  }
  return true
}

// conditional attribute
function isConditional(dObj) {
  return isVIf(dObj) || isVElse(dObj) || isVElsIf(dObj)
}
function isVIf(dObj) {
  return dObj.type !== 'text' && dObj.attribs.hasOwnProperty('v-if')
}
function isVElsIf(dObj) {
  return dObj.type !== 'text' && dObj.attribs.hasOwnProperty('v-else-if')
}
function isVElse(dObj) {
  return dObj.type !== 'text' && dObj.attribs.hasOwnProperty('v-else')
}

function isValueAttribute(attr) {
  return ['v-if', 'v-else', 'v-else-if', 'v-for', 'v-slot'].indexOf(attr) === -1
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

function isSlotAttribute(attr) {
  return attr.startsWith('#') || attr.startsWith('v-slot')
}
function getSlotAttribute(attrs) {
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
function extractChildrens(dObj) {
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

function isVFor(dObj) {
  return dObj.attribs.hasOwnProperty('v-for')
}
function renderChildren(defaultChildrens, dObj) {
  if (isVFor(dObj)) {
    const vForPath = dObj.attribs['v-for'].split('in ')
    const collection = vForPath[1]
    const definePath = vForPath[0].trim()
    return `{ ${collection}.map(${definePath} => <>${ defaultChildrens.map(renderDomObject).join('\\n') }</>) }`
  } else {
    const rs = defaultChildrens.map(renderDomObject).join('\n')
    console.log(rs)
    return rs;
  }
}

function preprocess(dObj) {
  // TODO: Pre-process remove all empty text node
  return dObj
}

module.exports = {
  renderDomObject
}
