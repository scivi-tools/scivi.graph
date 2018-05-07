//@ts-check

/**
 * Id representer
 * @typedef {number|string} IdType
 */

/**
 * Ngraph node type, with all known extensions
 * @typedef {Object} NgNode
 * @property {IdType} id
 * @property {Object[]} links
 * @property {Object} data
 */

/**
 * @typedef {Object} NgLink
 * @property {IdType} fromId
 * @property {IdType} toId
 * @property {Object} data
 * @property {IdType} id
 */

/**
 * @typedef {function(NgNode):void} nodeCallback
 * @typedef {function(NgLink):void} linkCallback
 */

/**
 * @typedef {Object} NgGraph
 * @property {function(IdType, Object):NgNode} addNode
 * @property {function(IdType, IdType, Object):NgLink} addLink
 * @property {function(NgLink):boolean} removeLink
 * @property {function(IdType):boolean} removeNode
 * @property {function(IdType):NgLink} getNode
 * @property {function(void):number} getNodesCount
 * @property {function(void):number} getLinksCount
 * @property {function(IdType):NgLink[]} getLinks
 * @property {function(nodeCallback):void} forEachNode
 * @property {function(IdType, nodeCallback, boolean):void} forEachLinkedNode
 * @property {function(linkCallback):void} forEachLink
 * @property {function(void):void} clear
 * @property {function(IdType, IdType):NgLink} hasLink
 * @property {function(IdType, IdType):NgLink} getLink
 */

/**
 * @typedef {Object} NgGenericLayout
 * @property {function(void):boolean} step
 * @property {function(IdType):{x: number, y: number}} getNodePosition
 * @property {function(IdType, number, number, number):void} setNodePosition
 * @property {function(void):{x1: number, x2: number, y1: number, y2:number}} getGraphRect
 * @property {function(IdType):{from:{x: number, y: number}, to:{x: number, y: number}}} getLinkPosition
 * @property {function(NgNode):boolean} isNodePinned
 * @property {function(NgNode, boolean):void} pinNode
 * @property {number} lastMove
 */