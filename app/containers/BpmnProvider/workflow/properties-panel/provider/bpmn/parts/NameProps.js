const nameEntryFactory = require('./implementation/Name');
const createCategoryValue = require('../../../helper/CategoryHelper')
  .createCategoryValue;
const is = require('bpmn-js/lib/util/ModelUtil').is;
const getBusinessObject = require('bpmn-js/lib/util/ModelUtil')
  .getBusinessObject;

module.exports = function(group, element, bpmnFactory, canvas, translate) {
  function initializeCategory(semantic) {
    const rootElement = canvas.getRootElement();
    const definitions = getBusinessObject(rootElement).$parent;
    const categoryValue = createCategoryValue(definitions, bpmnFactory);

    semantic.categoryValueRef = categoryValue;
  }

  function setGroupName(element, values) {
    const bo = getBusinessObject(element);
    const categoryValueRef = bo.categoryValueRef;

    if (!categoryValueRef) {
      initializeCategory(bo);
    }

    // needs direct call to update categoryValue properly
    return {
      cmd: 'element.updateLabel',
      context: {
        element,
        newLabel: values.categoryValue,
      },
    };
  }

  function getGroupName(element) {
    const bo = getBusinessObject(element);
    const value = (bo.categoryValueRef || {}).value;

    return { categoryValue: value };
  }

  if (!is(element, 'bpmn:Collaboration')) {
    let options;
    if (is(element, 'bpmn:TextAnnotation')) {
      options = { modelProperty: 'text', label: translate('Text') };
    } else if (is(element, 'bpmn:Group')) {
      options = {
        modelProperty: 'categoryValue',
        label: translate('Category Value'),
        get: getGroupName,
        set: setGroupName,
      };
    }

    // name
    group.entries = group.entries.concat(
      nameEntryFactory(element, options, translate),
    );
  }
};
