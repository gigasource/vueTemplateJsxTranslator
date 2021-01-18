const _ = require('lodash')

const {
  builtinDirectivesWithoutVModel, isVModel,convertText, isSlotAttribute,isBooleanAttrs,
  isVIf, isVElse, isVFor, isTextBlank,
  getCondition, getTag, getFirstChild, isEmptyObject, isText, getText, isVElseIf, getLoopCommand, getSlotProps, getSlotName, isBindingAttrs, getAttrName, builtinDirective,
  isEventListener, getModifiers, getListenerName, convertEventListenerName, convertEventListener
} = require('./helpers')

const renderSlots = (slots) => {
  if (Object.keys(slots).length === 0) return ''
  let res = ` v-slots={{ `
  Object.keys(slots).forEach(slotName => {
    let renderFn = slots[slotName].renderFn
    if (!renderFn.startsWith('<>')) renderFn = `<> ${renderFn} </>`
    if (!isTextBlank(slots[slotName].renderFn)) res = res + `'${slotName}': (${slots[slotName].slotProps}) => ${renderFn}, \n`
  })
  res += ` }}`
  return res
}

const convertAttrs = function (attrs) {
  const res = {}


  Object.keys(attrs).forEach(attrName => {
    if (isSlotAttribute(attrName)) return
    if (isBindingAttrs(attrName)) {
      res[getAttrName(attrName, ':')] = `{ ${attrs[attrName]} }`
    } else if (isEventListener(attrName)) {
      const eventListenerName = convertEventListenerName(attrName)
      const modifiers = getModifiers(attrName)
      const listener = convertEventListener(attrs[attrName], modifiers)
      res[eventListenerName] = `{${listener}}`
    } else if (isVModel(attrName)) {
      res[attrName] = `{${attrs[attrName]}}`
    } else if(isBooleanAttrs(attrs[attrName])) {
      res[attrName] = ""
    } else res[attrName] = `"${attrs[attrName]}"`
  })
  return res
}

const renderAttrs = function (attrs) {
  let res = ''
  Object.keys(attrs).forEach(attrName => {
    res += attrs[attrName] === '' ? `${attrName} ` : `${attrName}=${attrs[attrName]} ` // boolean attrs
  })
  return res === '' ? '' : ` ${res}`
}

const renderDoomObj = function (dObj) {
  if (isEmptyObject(dObj)) {
    return ''
  }
  if (isText(dObj)) return convertText(getText(dObj))
  const tag = getTag(dObj) === 'template' ? '' : getTag(dObj)

  const slots = renderVueDomObject(getFirstChild(dObj))
  const attrs = convertAttrs(_.cloneDeep(dObj.attribs))
  builtinDirectivesWithoutVModel.forEach(attr => delete attrs[attr])

  return (Object.keys(slots).length === 1) ? `<${tag}${renderAttrs(attrs)}> ${slots.default.renderFn} </${tag}>\n` :
    `<${tag}${renderAttrs(attrs)}${renderSlots(slots)}> </${tag}>\n`
}

const renderVIfSegment = function (first, last, nodes, isRoot) {

  const open = isRoot ? '{' : '('
  const close = isRoot ? '}' : ')'

  if (first + 1 === last) {
    return `${open} (${getCondition(nodes[first])}) && ${renderDoomObj(nodes[first])} ${close} \n`
  } else {
    if (isVElse(nodes[first + 1])) {
      return `${open} (${getCondition(nodes[first])}) ? ${renderDoomObj(nodes[first])} :
              ${renderDoomObj(nodes[first + 1])} ${close} \n`
    } else {
      return `${open} (${getCondition(nodes[first])}) ? ${renderDoomObj(nodes[first])} :
              ${renderVIfSegment(first + 1, last, nodes)} ${close} \n`
    }
  }
}

const renderVFor = function (dObj) {
  return `{${getLoopCommand(dObj)} => \n ${renderDoomObj(dObj)} )}`
}
const renderVueDomObject = function (dObj) {
  if (!dObj) return ''
  let _dObj = _.cloneDeep(dObj)

  let slots = {}

  slots.default = { slotProps: '', renderFn: '', nodes: [] }

  function addNode(dObj) {
    if (isEmptyObject(_dObj)) return
    const slotName = getSlotName(dObj)
    slots[slotName] = slots[slotName] || { slotProps: getSlotProps(dObj), nodes: [] }
    slots[slotName].nodes.push(dObj)
  }

  addNode(_dObj)
  while (_dObj.next) {
    _dObj = _dObj.next
    addNode(_dObj)
  }

  function renderNodes(nodes) {
    let res = ''
    for (let i = 0; i < nodes.length; i++) {
      if (isVIf(nodes[i])) {
        let j = i + 1
        while (j < nodes.length && isVElseIf(nodes[j])) j++
        if (j < nodes.length) {
          if (isVElse(nodes[j])) j++
        }
        res += renderVIfSegment(i, j, nodes, true)
        i = j - 1
      } else if (isVFor(nodes[i])) {
        res = res + renderVFor(nodes[i])
      } else {
        res = res + renderDoomObj(nodes[i])
      }
    }
    return res
  }

  Object.keys(slots).forEach(slotName => {
    let nodes = slots[slotName].nodes
    slots[slotName].renderFn = renderNodes(nodes)
  })
  return slots
}

module.exports = {
  renderVueDomObject
}
