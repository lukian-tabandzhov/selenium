/**
 * @fileoverview Namespace resolver functions.
 */

goog.provide('wgxpath.nsResolver');

goog.require('goog.dom.NodeType');


/**
 * Returns a namespace resolve function for the given node.
 *
 * @param {!Node} node The context node.
 * @return {function(?string):?string} A lookupNamespaceURI function.
 */
wgxpath.nsResolver.getResolver = function(node) {
  // Adopted from W3C psuedocode specification:
  // http://www.w3.org/TR/DOM-Level-3-Core/namespaces-algorithms.html

  switch (node.nodeType) {
    case goog.dom.NodeType.ELEMENT:
      return goog.partial(wgxpath.nsResolver.resolveForElement_, node);

    case goog.dom.NodeType.DOCUMENT:
      return wgxpath.nsResolver.getResolver(node.documentElement);

    case goog.dom.NodeType.ATTRIBUTE:
      if (node.ownerElement) {
        return wgxpath.nsResolver.getResolver(node.ownerElement);
      }
      return wgxpath.nsResolver.nullResolver_;

    case goog.dom.NodeType.DOCUMENT_FRAGMENT:
    case goog.dom.NodeType.DOCUMENT_TYPE:
    case goog.dom.NodeType.ENTITY:
    case goog.dom.NodeType.NOTATION:
      return wgxpath.nsResolver.nullResolver_;

    default:
      if (node.parentNode) {
        return wgxpath.nsResolver.getResolver(node.parentNode);
      }
      return wgxpath.nsResolver.nullResolver_;
  }
};


/**
 * A resolver function that always returns null.
 *
 * @param {?string} prefix Namespace prefix or null for default namespace.
 * @return {?string} Null.
 * @private
 */
wgxpath.nsResolver.nullResolver_ = function(prefix) {
  return null;
};


/**
 * The default namespace URI for XHTML nodes.
 *
 * @const
 * @type {string}
 * @private
 */
wgxpath.nsResolver.HTML_NAMESPACE_URI_ = 'http://www.w3.org/1999/xhtml';


/**
 * Looks up the namespace URI for the given prefix and given element context.
 *
 * @param {!Element} elem Context element for the namespace resolution.
 * @param {?string} prefix Namespace prefix or null for default namespace.
 * @return {?string} The namespace URI for the given prefix, or null if none.
 * @private
 */
wgxpath.nsResolver.resolveForElement_ = function(elem, prefix) {
  if (elem.prefix == prefix) {
    return elem.namespaceURI || wgxpath.nsResolver.HTML_NAMESPACE_URI_;
  }

  var attr = elem.getAttributeNode('xmlns:' + prefix);
  if (attr && attr.specified) {
    return attr.value || null;
  }

  if (elem.parentNode &&
      elem.parentNode.nodeType != goog.dom.NodeType.DOCUMENT) {
    return wgxpath.nsResolver.resolveForElement_(
        /** @type {!Element} */ (elem.parentNode), prefix);
  }

  return null;
};
