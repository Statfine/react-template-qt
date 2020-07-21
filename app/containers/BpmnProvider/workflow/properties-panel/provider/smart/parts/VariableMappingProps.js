

const is = require('bpmn-js/lib/util/ModelUtil').is;
const isAny = require('bpmn-js/lib/features/modeling/util/ModelingUtil').isAny;
const getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;

const filter = require('lodash/filter');

const extensionElementsHelper = require('../../../helper/ExtensionElementsHelper');
const cmdHelper = require('../../../helper/CmdHelper');
const elementHelper = require('../../../helper/ElementHelper');
const eventDefinitionHelper = require('../../../helper/EventDefinitionHelper');

const extensionElementsEntry = require('./implementation/ExtensionElements');

const entryFactory = require('../../../factory/EntryFactory');

/**
  * return depend on parameter 'type' smart:in or smart:out extension elements
  */
function getSmartInOutMappings(element, type) {
  const bo = getBusinessObject(element);

  const signalEventDefinition = eventDefinitionHelper.getSignalEventDefinition(bo);

  return extensionElementsHelper.getExtensionElements(signalEventDefinition || bo, type) || [];
}

/**
  * return depend on parameter 'type' smart:in or smart:out extension elements
  * with source or sourceExpression attribute
  */
function getVariableMappings(element, type) {
  const smartMappings = getSmartInOutMappings(element, type);

  return filter(smartMappings, function(mapping) {
    return !mapping.businessKey;
  });
}

function getInOutType(mapping) {
  let inOutType = 'source';

  if (mapping.variables === 'all') {
    inOutType = 'variables';
  }
  else if (typeof mapping.source !== 'undefined') {
    inOutType = 'source';
  }
  else if (typeof mapping.sourceExpression !== 'undefined') {
    inOutType = 'sourceExpression';
  }

  return inOutType;
}

const SMART_IN_EXTENSION_ELEMENT = 'smart:In';
const SMART_OUT_EXTENSION_ELEMENT = 'smart:Out';

const WHITESPACE_REGEX = /\s/;


module.exports = function(group, element, bpmnFactory, translate) {

  const inOutTypeOptions = [
    {
      name: translate('Source'),
      value: 'source'
    },
    {
      name: translate('Source Expression'),
      value: 'sourceExpression'
    },
    {
      name: translate('All'),
      value: 'variables'
    }
  ];

  const signalEventDefinition = eventDefinitionHelper.getSignalEventDefinition(element);

  if (!is(element, 'smart:CallActivity') && !signalEventDefinition) {
    return;
  }

  if (signalEventDefinition && !(isAny(element, [
    'bpmn:IntermediateThrowEvent',
    'bpmn:EndEvent'
  ]))) {
    return;
  }

  const isSelected = function(element, node) {
    return !!getSelected(element, node);
  };

  var getSelected = function(element, node) {
    const parentNode = node.parentNode;
    let selection = inEntry.getSelected(element, parentNode);

    let parameter = getVariableMappings(element, SMART_IN_EXTENSION_ELEMENT)[selection.idx];

    if (!parameter && outEntry) {
      selection = outEntry.getSelected(element, parentNode);
      parameter = getVariableMappings(element, SMART_OUT_EXTENSION_ELEMENT)[selection.idx];
    }

    return parameter;
  };

  const setOptionLabelValue = function(type) {
    return function(element, node, option, property, value, idx) {
      const variableMappings = getVariableMappings(element, type);
      const mappingValue = variableMappings[idx];
      let label = `${mappingValue.target || '<undefined>'  } := `;
      const mappingType = getInOutType(mappingValue);

      if (mappingType === 'variables') {
        label = 'all';
      }
      else if (mappingType === 'source') {
        label += (mappingValue.source || '<empty>');
      }
      else if (mappingType === 'sourceExpression') {
        label += (mappingValue.sourceExpression || '<empty>');
      } else {
        label += '<empty>';
      }

      option.text = label;
    };
  };

  const newElement = function(type) {
    return function(element, extensionElements, value) {
      const newElem = elementHelper.createElement(type, { source: '' }, extensionElements, bpmnFactory);

      return cmdHelper.addElementsTolist(element, extensionElements, 'values', [ newElem ]);
    };
  };

  const removeElement = function(type) {
    return function(element, extensionElements, value, idx) {
      const variablesMappings= getVariableMappings(element, type);
      const mapping = variablesMappings[idx];

      if (mapping) {
        return extensionElementsHelper
          .removeEntry(signalEventDefinition || getBusinessObject(element), element, mapping);
      }
    };
  };

  // in mapping for source and sourceExpression ///////////////////////////////////////////////////////////////

  var inEntry = extensionElementsEntry(element, bpmnFactory, {
    id: 'variableMapping-in',
    label: translate('In Mapping'),
    modelProperty: 'source',
    prefix: 'In',
    idGeneration: false,
    resizable: true,
    businessObject: signalEventDefinition || getBusinessObject(element),

    createExtensionElement: newElement(SMART_IN_EXTENSION_ELEMENT),
    removeExtensionElement: removeElement(SMART_IN_EXTENSION_ELEMENT),

    getExtensionElements(element) {
      return getVariableMappings(element, SMART_IN_EXTENSION_ELEMENT);
    },

    onSelectionChange(element, node, event, scope) {
      outEntry && outEntry.deselect(element, node.parentNode);
    },

    setOptionLabelValue: setOptionLabelValue(SMART_IN_EXTENSION_ELEMENT)
  });
  group.entries.push(inEntry);

  // out mapping for source and sourceExpression ///////////////////////////////////////////////////////

  if (!signalEventDefinition) {
    var outEntry = extensionElementsEntry(element, bpmnFactory, {
      id: 'variableMapping-out',
      label: translate('Out Mapping'),
      modelProperty: 'source',
      prefix: 'Out',
      idGeneration: false,
      resizable: true,

      createExtensionElement: newElement(SMART_OUT_EXTENSION_ELEMENT),
      removeExtensionElement: removeElement(SMART_OUT_EXTENSION_ELEMENT),

      getExtensionElements(element) {
        return getVariableMappings(element, SMART_OUT_EXTENSION_ELEMENT);
      },

      onSelectionChange(element, node, event, scope) {
        inEntry.deselect(element, node.parentNode);
      },

      setOptionLabelValue: setOptionLabelValue(SMART_OUT_EXTENSION_ELEMENT)
    });
    group.entries.push(outEntry);
  }

  // label for selected mapping ///////////////////////////////////////////////////////

  group.entries.push(entryFactory.label({
    id: 'variableMapping-typeLabel',
    get(element, node) {
      const mapping = getSelected(element, node);

      let value = '';
      if (is(mapping, SMART_IN_EXTENSION_ELEMENT)) {
        value = translate('In Mapping');
      }
      else if (is(mapping, SMART_OUT_EXTENSION_ELEMENT)) {
        value = translate('Out Mapping');
      }

      return {
        label: value
      };
    },

    showLabel(element, node) {
      return isSelected(element, node);
    }
  }));


  group.entries.push(entryFactory.selectBox({
    id: 'variableMapping-inOutType',
    label: translate('Type'),
    selectOptions: inOutTypeOptions,
    modelProperty: 'inOutType',
    get(element, node) {
      const mapping = getSelected(element, node) || {};
      return {
        inOutType: getInOutType(mapping)
      };
    },
    set(element, values, node) {
      const inOutType = values.inOutType;

      const props = {
        'source' : undefined,
        'sourceExpression' : undefined,
        'variables' : undefined
      };

      if (inOutType === 'source') {
        props.source = '';
      }
      else if (inOutType === 'sourceExpression') {
        props.sourceExpression = '';
      }
      else if (inOutType === 'variables') {
        props.variables = 'all';
        props.target = undefined;
      }

      const mapping = getSelected(element, node);
      return cmdHelper.updateBusinessObject(element, mapping, props);
    },
    hidden(element, node) {
      return !isSelected(element, node);
    }

  }));


  group.entries.push(entryFactory.textField({
    id: 'variableMapping-source',
    dataValueLabel: 'sourceLabel',
    modelProperty: 'source',
    get(element, node) {
      const mapping = getSelected(element, node) || {};

      let label = '';
      const inOutType = getInOutType(mapping);
      if (inOutType === 'source') {
        label = translate('Source');
      }
      else if (inOutType === 'sourceExpression') {
        label = translate('Source Expression');
      }

      return {
        source: mapping[inOutType],
        sourceLabel: label
      };
    },
    set(element, values, node) {
      values.source = values.source || undefined;

      const mapping = getSelected(element, node);
      const inOutType = getInOutType(mapping);

      const props = {};
      props[inOutType] = values.source || '';

      return cmdHelper.updateBusinessObject(element, mapping, props);
    },
    // one of both (source or sourceExpression) must have a value to make
    // the configuration easier and more understandable
    // it is not engine conform
    validate(element, values, node) {
      const mapping = getSelected(element, node);

      const validation = {};
      if (mapping) {
        if (!values.source) {
          validation.source =
          validation.source = values.sourceLabel ?
            translate('Mapping must have a {value}', { value: values.sourceLabel.toLowerCase() }) :
            translate('Mapping must have a value');
        }

        const inOutType = getInOutType(mapping);

        if (WHITESPACE_REGEX.test(values.source) && inOutType !== 'sourceExpression') {
          validation.source = translate('{label} must not contain whitespace', { label: values.sourceLabel });
        }
      }

      return validation;
    },
    hidden(element, node) {
      const selectedMapping = getSelected(element, node);
      return !selectedMapping || (selectedMapping && selectedMapping.variables);
    }
  }));


  group.entries.push(entryFactory.textField({
    id: 'variableMapping-target',
    label: translate('Target'),
    modelProperty: 'target',
    get(element, node) {
      return {
        target: (getSelected(element, node) || {}).target
      };
    },
    set(element, values, node) {
      values.target = values.target || undefined;
      const mapping = getSelected(element, node);
      return cmdHelper.updateBusinessObject(element, mapping, values);
    },
    validate(element, values, node) {
      const mapping = getSelected(element, node);

      const validation = {};
      if (mapping) {
        const mappingType = getInOutType(mapping);

        if (!values.target && mappingType !== 'variables') {
          validation.target = translate('Mapping must have a target');
        }

        if (values.target
          && WHITESPACE_REGEX.test(values.target)
          && mappingType !== 'variables') {
          validation.target = translate('Target must not contain whitespace');
        }
      }

      return validation;
    },
    hidden(element, node) {
      const selectedMapping = getSelected(element, node);
      return !selectedMapping || (selectedMapping && selectedMapping.variables);
    }
  }));


  group.entries.push(entryFactory.checkbox({
    id: 'variableMapping-local',
    label: translate('Local'),
    modelProperty: 'local',
    get(element, node) {
      return {
        local: (getSelected(element, node) || {}).local
      };
    },
    set(element, values, node) {
      values.local = values.local || false;
      const mapping = getSelected(element, node);
      return cmdHelper.updateBusinessObject(element, mapping, values);
    },
    hidden(element, node) {
      return !isSelected(element, node);
    }
  }));

};
