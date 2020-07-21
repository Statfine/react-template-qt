

const ImplementationTypeHelper = require('../../../helper/ImplementationTypeHelper');
const InputOutputHelper = require('../../../helper/InputOutputHelper');

const utils = require('../../../Utils');
const escapeHTML = utils.escapeHTML;
const triggerClickEvent = utils.triggerClickEvent;

const implementationType = require('./implementation/ImplementationType');
const delegate = require('./implementation/Delegate');
const external = require('./implementation/External');
const callable = require('./implementation/Callable');
const resultVariable = require('./implementation/ResultVariable');

const entryFactory = require('../../../factory/EntryFactory');

const domQuery = require('min-dom').query;
const domClosest = require('min-dom').closest;
const domClasses = require('min-dom').classes;

function getImplementationType(element) {
  return ImplementationTypeHelper.getImplementationType(element);
}

function getBusinessObject(element) {
  return ImplementationTypeHelper.getServiceTaskLikeBusinessObject(element);
}

function isDmnCapable(element) {
  return ImplementationTypeHelper.isDmnCapable(element);
}

function isExternalCapable(element) {
  return ImplementationTypeHelper.isExternalCapable(element);
}

function isServiceTaskLike(element) {
  return ImplementationTypeHelper.isServiceTaskLike(element);
}

module.exports = function(group, element, bpmnFactory, translate) {

  if (!isServiceTaskLike(getBusinessObject(element))) {
    return;
  }

  const hasDmnSupport = isDmnCapable(element);
  const hasExternalSupport = isExternalCapable(getBusinessObject(element));

  // implementation type ////////////////////////////////////

  group.entries = group.entries.concat(implementationType(element, bpmnFactory, {
    getBusinessObject,
    getImplementationType,
    hasDmnSupport,
    hasExternalSupport,
    hasServiceTaskLikeSupport: true
  }, translate));


  // delegate (class, expression, delegateExpression) //////////

  group.entries = group.entries.concat(delegate(element, bpmnFactory, {
    getBusinessObject,
    getImplementationType
  }, translate));


  // result variable /////////////////////////////////////////

  group.entries = group.entries.concat(resultVariable(element, bpmnFactory, {
    getBusinessObject,
    getImplementationType,
    hideResultVariable(element, node) {
      return getImplementationType(element) !== 'expression';
    }
  }, translate));

  // external //////////////////////////////////////////////////

  if (hasExternalSupport) {
    group.entries = group.entries.concat(external(element, bpmnFactory, {
      getBusinessObject,
      getImplementationType
    }, translate));
  }


  // dmn ////////////////////////////////////////////////////////

  if (hasDmnSupport) {
    group.entries = group.entries.concat(callable(element, bpmnFactory, {
      getCallableType: getImplementationType
    }, translate));
  }


  // connector ////////////////////////////////////////////////

  const isConnector = function(element) {
    return getImplementationType(element) === 'connector';
  };

  group.entries.push(entryFactory.link({
    id: 'configureConnectorLink',
    label: translate('Configure Connector'),
    handleClick(element, node, event) {

      const connectorTabEl = getTabNode(node, 'connector');

      if (connectorTabEl) {
        triggerClickEvent(connectorTabEl);
      }

      // suppress actual link click
      return false;
    },
    showLink(element, node) {
      const link = domQuery('a', node);
      link.textContent = '';

      domClasses(link).remove('bpp-error-message');

      if (isConnector(element)) {
        const connectorId = InputOutputHelper.getConnector(element).get('connectorId');
        if (connectorId) {
          link.textContent = translate('Configure Connector');
        } else {
          link.innerHTML = `<span class="bpp-icon-warning"></span> ${  escapeHTML(translate('Must configure Connector'))}`;
          domClasses(link).add('bpp-error-message');
        }

        return true;
      }

      return false;
    }
  }));

};



// helpers ///////////////////////////

function getTabNode(el, id) {
  const containerEl = domClosest(el, '.bpp-properties-panel');

  return domQuery(`a[data-tab-target="${  id  }"]`, containerEl);
}