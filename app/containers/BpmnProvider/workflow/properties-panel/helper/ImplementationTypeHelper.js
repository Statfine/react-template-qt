const ModelUtil = require('bpmn-js/lib/util/ModelUtil');
const is = ModelUtil.is;
const getBusinessObject = ModelUtil.getBusinessObject;

const eventDefinitionHelper = require('./EventDefinitionHelper');
const extensionsElementHelper = require('./ExtensionElementsHelper');

const ImplementationTypeHelper = {};

module.exports = ImplementationTypeHelper;

/**
 * Returns 'true' if the given element is 'smart:ServiceTaskLike'
 *
 * @param {djs.model.Base} element
 *
 * @return {boolean} a boolean value
 */
ImplementationTypeHelper.isServiceTaskLike = function(element) {
  return is(element, 'smart:ServiceTaskLike');
};

/**
 * Returns 'true' if the given element is 'smart:DmnCapable'
 *
 * @param {djs.model.Base} element
 *
 * @return {boolean} a boolean value
 */
ImplementationTypeHelper.isDmnCapable = function(element) {
  return is(element, 'smart:DmnCapable');
};

/**
 * Returns 'true' if the given element is 'smart:ExternalCapable'
 *
 * @param {djs.model.Base} element
 *
 * @return {boolean} a boolean value
 */
ImplementationTypeHelper.isExternalCapable = function(element) {
  return is(element, 'smart:ExternalCapable');
};

/**
 * Returns 'true' if the given element is 'smart:TaskListener'
 *
 * @param {djs.model.Base} element
 *
 * @return {boolean} a boolean value
 */
ImplementationTypeHelper.isTaskListener = function(element) {
  return is(element, 'smart:TaskListener');
};

/**
 * Returns 'true' if the given element is 'smart:ExecutionListener'
 *
 * @param {djs.model.Base} element
 *
 * @return {boolean} a boolean value
 */
ImplementationTypeHelper.isExecutionListener = function(element) {
  return is(element, 'smart:ExecutionListener');
};

/**
 * Returns 'true' if the given element is 'smart:ExecutionListener' or
 * 'smart:TaskListener'
 *
 * @param {djs.model.Base} element
 *
 * @return {boolean} a boolean value
 */
ImplementationTypeHelper.isListener = function(element) {
  return this.isTaskListener(element) || this.isExecutionListener(element);
};

/**
 * Returns 'true' if the given element is 'bpmn:SequenceFlow'
 *
 * @param {djs.model.Base} element
 *
 * @return {boolean} a boolean value
 */
ImplementationTypeHelper.isSequenceFlow = function(element) {
  return is(element, 'bpmn:SequenceFlow');
};

/**
 * Get a 'smart:ServiceTaskLike' business object.
 *
 * If the given element is not a 'smart:ServiceTaskLike', then 'false'
 * is returned.
 *
 * @param {djs.model.Base} element
 *
 * @return {ModdleElement} the 'smart:ServiceTaskLike' business object
 */
ImplementationTypeHelper.getServiceTaskLikeBusinessObject = function(element) {
  if (
    is(element, 'bpmn:IntermediateThrowEvent') ||
    is(element, 'bpmn:EndEvent')
  ) {
    // change business object to 'messageEventDefinition' when
    // the element is a message intermediate throw event or message end event
    // because the smart extensions (e.g. smart:class) are in the message
    // event definition tag and not in the intermediate throw event or end event tag
    const messageEventDefinition = eventDefinitionHelper.getMessageEventDefinition(
      element,
    );
    if (messageEventDefinition) {
      element = messageEventDefinition;
    }
  }

  return this.isServiceTaskLike(element) && getBusinessObject(element);
};

/**
 * Returns the implementation type of the given element.
 *
 * Possible implementation types are:
 * - dmn
 * - connector
 * - external
 * - class
 * - expression
 * - delegateExpression
 * - script
 * - or undefined, when no matching implementation type is found
 *
 * @param  {djs.model.Base} element
 *
 * @return {String} the implementation type
 */
ImplementationTypeHelper.getImplementationType = function(element) {
  let bo = this.getServiceTaskLikeBusinessObject(element);

  if (!bo) {
    if (this.isListener(element)) {
      bo = element;
    } else {
      return;
    }
  }

  if (this.isDmnCapable(bo)) {
    const decisionRef = bo.get('smart:decisionRef');
    if (typeof decisionRef !== 'undefined') {
      return 'dmn';
    }
  }

  if (this.isServiceTaskLike(bo)) {
    const connectors = extensionsElementHelper.getExtensionElements(
      bo,
      'smart:Connector',
    );
    if (typeof connectors !== 'undefined') {
      return 'connector';
    }
  }

  if (this.isExternalCapable(bo)) {
    const type = bo.get('smart:type');
    if (type === 'external') {
      return 'external';
    }
  }

  const cls = bo.get('smart:class');
  if (typeof cls !== 'undefined') {
    return 'class';
  }

  const expression = bo.get('smart:expression');
  if (typeof expression !== 'undefined') {
    return 'expression';
  }

  const delegateExpression = bo.get('smart:delegateExpression');
  if (typeof delegateExpression !== 'undefined') {
    return 'delegateExpression';
  }

  if (this.isListener(bo)) {
    const script = bo.get('script');
    if (typeof script !== 'undefined') {
      return 'script';
    }
  }
};
