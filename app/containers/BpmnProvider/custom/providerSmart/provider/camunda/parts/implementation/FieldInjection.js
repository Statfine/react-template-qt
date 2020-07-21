

const ModelUtil = require('bpmn-js/lib/util/ModelUtil');
const extensionElementsHelper = require('../../../../helper/ExtensionElementsHelper');
const elementHelper = require('../../../../helper/ElementHelper');
const cmdHelper = require('../../../../helper/CmdHelper');

const utils = require('../../../../Utils');

const entryFactory = require('../../../../factory/EntryFactory');

const extensionElementsEntry = require('./ExtensionElements');

const getBusinessObject = ModelUtil.getBusinessObject;

const assign = require('lodash/assign');


const DEFAULT_PROPS = {
  'stringValue': undefined,
  'string': undefined,
  'expression': undefined
};

const SMART_FIELD_EXTENSION_ELEMENT = 'smart:Field';

module.exports = function(element, bpmnFactory, translate, options) {

  options = options || {};

  const insideListener = !!options.insideListener;
  const idPrefix = options.idPrefix || '';
  const getSelectedListener = options.getSelectedListener;
  const businessObject = options.businessObject || getBusinessObject(element);

  const entries = [];

  const isSelected = function(element, node) {
    return getSelectedField(element, node);
  };

  function getSelectedField(element, node) {
    const selected = fieldEntry.getSelected(element, node.parentNode);

    if (selected.idx === -1) {
      return;
    }

    const fields = getSmartFields(element, node);

    return fields[selected.idx];
  }

  function getSmartFields(element, node) {
    if (!insideListener) {
      return (
        businessObject &&
        extensionElementsHelper.getExtensionElements(businessObject, SMART_FIELD_EXTENSION_ELEMENT)
      ) || [];
    }
    return getSmartListenerFields(element, node);
  }

  function getSmartListenerFields(element, node) {
    const selectedListener = getSelectedListener(element, node);
    return selectedListener && selectedListener.fields || [];
  }

  function getFieldType(bo) {
    let fieldType = 'string';

    const expressionValue = bo && bo.expression;
    const stringValue = bo && (bo.string || bo.stringValue);

    if (typeof stringValue !== 'undefined') {
      fieldType = 'string';
    } else if (typeof expressionValue !== 'undefined') {
      fieldType = 'expression';
    }

    return fieldType;
  }

  const setOptionLabelValue = function() {
    return function(element, node, option, property, value, idx) {
      const smartFields = getSmartFields(element, node);
      const field = smartFields[idx];

      value = (field.name) ? field.name : '<empty>';

      const label = `${idx  } : ${  value}`;

      option.text = label;
    };
  };

  const newElement = function() {
    return function(element, extensionElements, value, node) {

      const props = {
        name: '',
        string: ''
      };

      let newFieldElem;

      if (!insideListener) {

        newFieldElem = elementHelper.createElement(SMART_FIELD_EXTENSION_ELEMENT, props, extensionElements, bpmnFactory);
        return cmdHelper.addElementsTolist(element, extensionElements, 'values', [ newFieldElem ]);

      } 

      const selectedListener = getSelectedListener(element, node);
      newFieldElem = elementHelper.createElement(SMART_FIELD_EXTENSION_ELEMENT, props, selectedListener, bpmnFactory);
      return cmdHelper.addElementsTolist(element, selectedListener, 'fields', [ newFieldElem ]);

      

    };
  };

  const removeElement = function() {
    return function(element, extensionElements, value, idx, node) {
      const smartFields= getSmartFields(element, node);
      const field = smartFields[idx];
      if (field) {
        if (!insideListener) {
          return extensionElementsHelper.removeEntry(businessObject, element, field);
        }
        const selectedListener = getSelectedListener(element, node);
        return cmdHelper.removeElementsFromList(element, selectedListener, 'fields', null, [ field ]);
      }
    };
  };


  var fieldEntry = extensionElementsEntry(element, bpmnFactory, {
    id : `${idPrefix  }fields`,
    label : translate('Fields'),
    modelProperty: 'fieldName',
    idGeneration: 'false',

    businessObject,

    createExtensionElement: newElement(),
    removeExtensionElement: removeElement(),

    getExtensionElements(element, node) {
      return getSmartFields(element, node);
    },

    setOptionLabelValue: setOptionLabelValue()

  });
  entries.push(fieldEntry);


  entries.push(entryFactory.validationAwareTextField({
    id: `${idPrefix  }field-name`,
    label: translate('Name'),
    modelProperty: 'fieldName',

    getProperty(element, node) {
      return (getSelectedField(element, node) || {}).name;
    },

    setProperty(element, values, node) {
      const selectedField = getSelectedField(element, node);
      return cmdHelper.updateBusinessObject(element, selectedField, { name : values.fieldName });
    },

    validate(element, values, node) {
      const bo = getSelectedField(element, node);

      const validation = {};
      if (bo) {
        const nameValue = values.fieldName;

        if (nameValue) {
          if (utils.containsSpace(nameValue)) {
            validation.fieldName = translate('Name must not contain spaces');
          }
        } else {
          validation.fieldName = translate('Parameter must have a name');
        }
      }

      return validation;
    },

    hidden(element, node) {
      return !isSelected(element, node);
    }

  }));

  const fieldTypeOptions = [
    {
      name: translate('String'),
      value: 'string'
    },
    {
      name: translate('Expression'),
      value: 'expression'
    }
  ];

  entries.push(entryFactory.selectBox({
    id: `${idPrefix  }field-type`,
    label: translate('Type'),
    selectOptions: fieldTypeOptions,
    modelProperty: 'fieldType',

    get(element, node) {
      const bo = getSelectedField(element, node);

      const fieldType = getFieldType(bo);

      return {
        fieldType
      };
    },

    set(element, values, node) {
      const props = assign({}, DEFAULT_PROPS);

      const fieldType = values.fieldType;

      if (fieldType === 'string') {
        props.string = '';
      }
      else if (fieldType === 'expression') {
        props.expression = '';
      }

      return cmdHelper.updateBusinessObject(element, getSelectedField(element, node), props);
    },

    hidden(element, node) {
      return !isSelected(element, node);
    }

  }));


  entries.push(entryFactory.textBox({
    id: `${idPrefix  }field-value`,
    label: translate('Value'),
    modelProperty: 'fieldValue',

    get(element, node) {
      const bo = getSelectedField(element, node);
      const fieldType = getFieldType(bo);

      let fieldValue;

      if (fieldType === 'string') {
        fieldValue = bo && (bo.string || bo.stringValue);
      }
      else if (fieldType === 'expression') {
        fieldValue = bo && bo.expression;
      }

      return {
        fieldValue
      };
    },

    set(element, values, node) {
      const bo = getSelectedField(element, node);
      const fieldType = getFieldType(bo);

      const props = assign({}, DEFAULT_PROPS);

      const fieldValue = values.fieldValue || undefined;

      if (fieldType === 'string') {
        props.string = fieldValue;
      }
      else if (fieldType === 'expression') {
        props.expression = fieldValue;
      }

      return cmdHelper.updateBusinessObject(element, bo, props);

    },

    validate(element, values, node) {
      const bo = getSelectedField(element, node);

      const validation = {};
      if (bo) {
        if (!values.fieldValue) {
          validation.fieldValue = translate('Must provide a value');
        }
      }

      return validation;
    },

    show(element, node) {
      return isSelected(element, node);
    }

  }));

  return entries;

};
