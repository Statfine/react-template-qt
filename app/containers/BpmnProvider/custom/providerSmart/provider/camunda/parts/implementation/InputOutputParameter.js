

const is = require('bpmn-js/lib/util/ModelUtil').is;

const elementHelper = require('../../../../helper/ElementHelper');
const inputOutputHelper = require('../../../../helper/InputOutputHelper');
const cmdHelper = require('../../../../helper/CmdHelper');
const utils = require('../../../../Utils');

const entryFactory = require('../../../../factory/EntryFactory');
const scriptImplementation = require('./Script');


function createElement(type, parent, factory, properties) {
  return elementHelper.createElement(type, properties, parent, factory);
}

function isScript(elem) {
  return is(elem, 'smart:Script');
}

function isList(elem) {
  return is(elem, 'smart:List');
}

function isMap(elem) {
  return is(elem, 'smart:Map');
}

function ensureInputOutputSupported(element, insideConnector) {
  return inputOutputHelper.isInputOutputSupported(element, insideConnector);
}

module.exports = function(element, bpmnFactory, options, translate) {

  const typeInfo = {
    'smart:Map': {
      value: 'map',
      label: translate('Map')
    },
    'smart:List': {
      value: 'list',
      label: translate('List')
    },
    'smart:Script': {
      value: 'script',
      label: translate('Script')
    }
  };

  options = options || {};

  const insideConnector = !!options.insideConnector;
  const idPrefix = options.idPrefix || '';

  const getSelected = options.getSelectedParameter;

  if (!ensureInputOutputSupported(element, insideConnector)) {
    return [];
  }

  const entries = [];

  const isSelected = function(element, node) {
    return getSelected(element, node);
  };


  // parameter name ////////////////////////////////////////////////////////

  entries.push(entryFactory.validationAwareTextField({
    id: `${idPrefix  }parameterName`,
    label: translate('Name'),
    modelProperty: 'name',

    getProperty(element, node) {
      return (getSelected(element, node) || {}).name;
    },

    setProperty(element, values, node) {
      const param = getSelected(element, node);
      return cmdHelper.updateBusinessObject(element, param, values);
    },

    validate(element, values, node) {
      const bo = getSelected(element, node);

      const validation = {};
      if (bo) {
        const nameValue = values.name;

        if (nameValue) {
          if (utils.containsSpace(nameValue)) {
            validation.name = translate('Name must not contain spaces');
          }
        } else {
          validation.name = translate('Parameter must have a name');
        }
      }

      return validation;
    },

    hidden(element, node) {
      return !isSelected(element, node);
    }
  }));


  // parameter type //////////////////////////////////////////////////////

  const selectOptions = [
    { value: 'text', name: translate('Text') },
    { value: 'script', name: translate('Script') },
    { value: 'list', name: translate('List') },
    { value: 'map', name: translate('Map') }
  ];

  entries.push(entryFactory.selectBox({
    id : `${idPrefix  }parameterType`,
    label: translate('Type'),
    selectOptions,
    modelProperty: 'parameterType',

    get(element, node) {
      const bo = getSelected(element, node);

      let parameterType = 'text';

      if (typeof bo !== 'undefined') {
        const definition = bo.get('definition');
        if (typeof definition !== 'undefined') {
          const type = definition.$type;
          parameterType = typeInfo[type].value;
        }
      }

      return {
        parameterType
      };
    },

    set(element, values, node) {
      const bo = getSelected(element, node);

      const properties = {
        value: undefined,
        definition: undefined
      };

      const createParameterTypeElem = function(type) {
        return createElement(type, bo, bpmnFactory);
      };

      const parameterType = values.parameterType;

      if (parameterType === 'script') {
        properties.definition = createParameterTypeElem('smart:Script');
      }
      else if (parameterType === 'list') {
        properties.definition = createParameterTypeElem('smart:List');
      }
      else if (parameterType === 'map') {
        properties.definition = createParameterTypeElem('smart:Map');
      }

      return cmdHelper.updateBusinessObject(element, bo, properties);
    },

    show(element, node) {
      return isSelected(element, node);
    }

  }));


  // parameter value (type = text) ///////////////////////////////////////////////////////

  entries.push(entryFactory.textBox({
    id : `${idPrefix  }parameterType-text`,
    label : translate('Value'),
    modelProperty: 'value',
    get(element, node) {
      return {
        value: (getSelected(element, node) || {}).value
      };
    },

    set(element, values, node) {
      const param = getSelected(element, node);
      values.value = values.value || undefined;
      return cmdHelper.updateBusinessObject(element, param, values);
    },

    show(element, node) {
      const bo = getSelected(element, node);
      return bo && !bo.definition;
    }

  }));


  // parameter value (type = script) ///////////////////////////////////////////////////////
  const script = scriptImplementation('scriptFormat', 'value', true, translate);
  entries.push({
    id: `${idPrefix  }parameterType-script`,
    html: `<div data-show="isScript">${ 
      script.template 
    }</div>`,
    get(element, node) {
      const bo = getSelected(element, node);
      return bo && isScript(bo.definition) ? script.get(element, bo.definition) : {};
    },

    set(element, values, node) {
      const bo = getSelected(element, node);
      const update = script.set(element, values);
      return cmdHelper.updateBusinessObject(element, bo.definition, update);
    },

    validate(element, values, node) {
      const bo = getSelected(element, node);
      return bo && isScript(bo.definition) ? script.validate(element, bo.definition) : {};
    },

    isScript(element, node) {
      const bo = getSelected(element, node);
      return bo && isScript(bo.definition);
    },

    script

  });


  // parameter value (type = list) ///////////////////////////////////////////////////////

  entries.push(entryFactory.table({
    id: `${idPrefix  }parameterType-list`,
    modelProperties: [ 'value' ],
    labels: [ translate('Value') ],
    addLabel: translate('Add Value'),

    getElements(element, node) {
      const bo = getSelected(element, node);

      if (bo && isList(bo.definition)) {
        return bo.definition.items;
      }

      return [];
    },

    updateElement(element, values, node, idx) {
      const bo = getSelected(element, node);
      const item = bo.definition.items[idx];
      return cmdHelper.updateBusinessObject(element, item, values);
    },

    addElement(element, node) {
      const bo = getSelected(element, node);
      const newValue = createElement('smart:Value', bo.definition, bpmnFactory, { value: undefined });
      return cmdHelper.addElementsTolist(element, bo.definition, 'items', [ newValue ]);
    },

    removeElement(element, node, idx) {
      const bo = getSelected(element, node);
      return cmdHelper.removeElementsFromList(element, bo.definition, 'items', null, [ bo.definition.items[idx] ]);
    },

    editable(element, node, prop, idx) {
      const bo = getSelected(element, node);
      const item = bo.definition.items[idx];
      return !isMap(item) && !isList(item) && !isScript(item);
    },

    setControlValue(element, node, input, prop, value, idx) {
      const bo = getSelected(element, node);
      const item = bo.definition.items[idx];

      if (!isMap(item) && !isList(item) && !isScript(item)) {
        input.value = value;
      } else {
        input.value = typeInfo[item.$type].label;
      }
    },

    show(element, node) {
      const bo = getSelected(element, node);
      return bo && bo.definition && isList(bo.definition);
    }

  }));


  // parameter value (type = map) ///////////////////////////////////////////////////////

  entries.push(entryFactory.table({
    id: `${idPrefix  }parameterType-map`,
    modelProperties: [ 'key', 'value' ],
    labels: [ translate('Key'), translate('Value') ],
    addLabel: translate('Add Entry'),

    getElements(element, node) {
      const bo = getSelected(element, node);

      if (bo && isMap(bo.definition)) {
        return bo.definition.entries;
      }

      return [];
    },

    updateElement(element, values, node, idx) {
      const bo = getSelected(element, node);
      const entry = bo.definition.entries[idx];

      if (isMap(entry.definition) || isList(entry.definition) || isScript(entry.definition)) {
        values = {
          key: values.key
        };
      }

      return cmdHelper.updateBusinessObject(element, entry, values);
    },

    addElement(element, node) {
      const bo = getSelected(element, node);
      const newEntry = createElement('smart:Entry', bo.definition, bpmnFactory, { key: undefined, value: undefined });
      return cmdHelper.addElementsTolist(element, bo.definition, 'entries', [ newEntry ]);
    },

    removeElement(element, node, idx) {
      const bo = getSelected(element, node);
      return cmdHelper.removeElementsFromList(element, bo.definition, 'entries', null, [ bo.definition.entries[idx] ]);
    },

    editable(element, node, prop, idx) {
      const bo = getSelected(element, node);
      const entry = bo.definition.entries[idx];
      return prop === 'key' || (!isMap(entry.definition) && !isList(entry.definition) && !isScript(entry.definition));
    },

    setControlValue(element, node, input, prop, value, idx) {
      const bo = getSelected(element, node);
      const entry = bo.definition.entries[idx];

      if (prop === 'key' || (!isMap(entry.definition) && !isList(entry.definition) && !isScript(entry.definition))) {
        input.value = value;
      } else {
        input.value = typeInfo[entry.definition.$type].label;
      }
    },

    show(element, node) {
      const bo = getSelected(element, node);
      return bo && bo.definition && isMap(bo.definition);
    }

  }));

  return entries;

};
