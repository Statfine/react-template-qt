

const getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;
const getExtensionElements = require('../../../helper/ExtensionElementsHelper').getExtensionElements;
const removeEntry = require('../../../helper/ExtensionElementsHelper').removeEntry;
const extensionElements = require('./implementation/ExtensionElements');
const properties = require('./implementation/Properties');
const entryFactory = require('../../../factory/EntryFactory');
const elementHelper = require('../../../helper/ElementHelper');
const cmdHelper = require('../../../helper/CmdHelper');
const formHelper = require('../../../helper/FormHelper');
const utils = require('../../../Utils');
const is = require('bpmn-js/lib/util/ModelUtil').is;
const find = require('lodash/find');
const each = require('lodash/forEach');

function generateValueId() {
  return utils.nextId('Value_');
}

/**
 * Generate a form field specific textField using entryFactory.
 *
 * @param  {string} options.id
 * @param  {string} options.label
 * @param  {string} options.modelProperty
 * @param  {function} options.validate
 *
 * @return {Object} an entryFactory.textField object
 */
function formFieldTextField(options, getSelectedFormField) {

  const id = options.id;
  const label = options.label;
  const modelProperty = options.modelProperty;
  const validate = options.validate;

  return entryFactory.textField({
    id,
    label,
    modelProperty,
    get(element, node) {
      const selectedFormField = getSelectedFormField(element, node) || {};
      const values = {};

      values[modelProperty] = selectedFormField[modelProperty];

      return values;
    },

    set(element, values, node) {
      const commands = [];

      if (typeof options.set === 'function') {
        const cmd = options.set(element, values, node);

        if (cmd) {
          commands.push(cmd);
        }
      }

      const formField = getSelectedFormField(element, node);
      const properties = {};

      properties[modelProperty] = values[modelProperty] || undefined;

      commands.push(cmdHelper.updateBusinessObject(element, formField, properties));

      return commands;
    },
    hidden(element, node) {
      return !getSelectedFormField(element, node);
    },
    validate
  });
}

function ensureFormKeyAndDataSupported(element) {
  return (
    is(element, 'bpmn:StartEvent') && !is(element.parent, 'bpmn:SubProcess')
  ) || is(element, 'bpmn:UserTask');
}

module.exports = function(group, element, bpmnFactory, translate) {

  if (!ensureFormKeyAndDataSupported(element)) {
    return;
  }


  /**
   * Return the currently selected form field querying the form field select box
   * from the DOM.
   *
   * @param  {djs.model.Base} element
   * @param  {DOMElement} node - DOM element of any form field text input
   *
   * @return {ModdleElement} the currently selected form field
   */
  function getSelectedFormField(element, node) {
    const selected = formFieldsEntry.getSelected(element, node.parentNode);

    if (selected.idx === -1) {
      return;
    }

    return formHelper.getFormField(element, selected.idx);
  }

  // [FormKey] form key text input field
  group.entries.push(entryFactory.textField({
    id : 'form-key',
    label : translate('Form Key'),
    modelProperty: 'formKey',
    get(element, node) {
      const bo = getBusinessObject(element);

      return {
        formKey: bo.get('smart:formKey')
      };
    },
    set(element, values, node) {
      const bo = getBusinessObject(element);
      const formKey = values.formKey || undefined;

      return cmdHelper.updateBusinessObject(element, bo, { 'smart:formKey': formKey });
    }
  }));

  // [FormData] form field select box
  var formFieldsEntry = extensionElements(element, bpmnFactory, {
    id: 'form-fields',
    label: translate('Form Fields'),
    modelProperty: 'id',
    prefix: 'FormField',
    createExtensionElement(element, extensionElements, value) {
      const bo = getBusinessObject(element); const commands = [];

      if (!extensionElements) {
        extensionElements = elementHelper.createElement('bpmn:ExtensionElements', { values: [] }, bo, bpmnFactory);
        commands.push(cmdHelper.updateProperties(element, { extensionElements }));
      }

      let formData = formHelper.getFormData(element);

      if (!formData) {
        formData = elementHelper.createElement('smart:FormData', { fields: [] }, extensionElements, bpmnFactory);
        commands.push(cmdHelper.addAndRemoveElementsFromList(
          element,
          extensionElements,
          'values',
          'extensionElements',
          [formData],
          []
        ));
      }

      const field = elementHelper.createElement('smart:FormField', { id: value }, formData, bpmnFactory);
      if (typeof formData.fields !== 'undefined') {
        commands.push(cmdHelper.addElementsTolist(element, formData, 'fields', [ field ]));
      } else {
        commands.push(cmdHelper.updateBusinessObject(element, formData, {
          fields: [ field ]
        }));
      }
      return commands;
    },
    removeExtensionElement(element, extensionElements, value, idx) {
      const formData = getExtensionElements(getBusinessObject(element), 'smart:FormData')[0];
      const entry = formData.fields[idx];
      const commands = [];

      if (formData.fields.length < 2) {
        commands.push(removeEntry(getBusinessObject(element), element, formData));
      } else {
        commands.push(cmdHelper.removeElementsFromList(element, formData, 'fields', null, [entry]));

        if (entry.id === formData.get('businessKey')) {
          commands.push(cmdHelper.updateBusinessObject(element, formData, { 'businessKey': undefined }));
        }
      }

      return commands;
    },
    getExtensionElements(element) {
      return formHelper.getFormFields(element);
    },
    hideExtensionElements(element, node) {
      return false;
    }
  });
  group.entries.push(formFieldsEntry);

  // [FormData] business key form field select box
  const formBusinessKeyFormFieldEntry = entryFactory.selectBox({
    id: 'form-business-key',
    label: translate('Business Key'),
    modelProperty: 'businessKey',
    selectOptions(element, inputNode) {
      const selectOptions = [{ name: '', value: '' }];
      const formFields = formHelper.getFormFields(element);
      each(formFields, function(field) {
        if (field.type !== 'boolean') {
          selectOptions.push({ name: field.id, value: field.id });
        }
      });
      return selectOptions;
    },
    get(element, node) {
      let result = { businessKey: '' };
      const bo = getBusinessObject(element);
      const formDataExtension = getExtensionElements(bo, 'smart:FormData');
      if (formDataExtension) {
        const formData = formDataExtension[0];
        const storedValue = formData.get('businessKey');
        result = { businessKey: storedValue };
      }
      return result;
    },
    set(element, values, node) {
      const formData = getExtensionElements(getBusinessObject(element), 'smart:FormData')[0];
      return cmdHelper.updateBusinessObject(element, formData, { 'businessKey': values.businessKey || undefined });
    },
    hidden(element, node) {
      const isStartEvent = is(element,'bpmn:StartEvent');
      return !(isStartEvent && formHelper.getFormFields(element).length > 0);
    }
  });
  group.entries.push(formBusinessKeyFormFieldEntry);

  // [FormData] Form Field label
  group.entries.push(entryFactory.label({
    id: 'form-field-header',
    labelText: translate('Form Field'),
    showLabel(element, node) {
      return !!getSelectedFormField(element, node);
    }
  }));

  // [FormData] form field id text input field
  group.entries.push(entryFactory.validationAwareTextField({
    id: 'form-field-id',
    label: translate('ID'),
    modelProperty: 'id',

    getProperty(element, node) {
      const selectedFormField = getSelectedFormField(element, node) || {};

      return selectedFormField.id;
    },

    setProperty(element, properties, node) {
      const formField = getSelectedFormField(element, node);

      return cmdHelper.updateBusinessObject(element, formField, properties);
    },

    hidden(element, node) {
      return !getSelectedFormField(element, node);
    },

    validate(element, values, node) {

      const formField = getSelectedFormField(element, node);

      if (formField) {

        const idValue = values.id;

        if (!idValue || idValue.trim() === '') {
          return { id: 'Form field id must not be empty' };
        }

        const formFields = formHelper.getFormFields(element);

        const existingFormField = find(formFields, function(f) {
          return f !== formField && f.id === idValue;
        });

        if (existingFormField) {
          return { id: 'Form field id already used in form data.' };
        }
      }
    }
  }));

  // [FormData] form field type combo box
  group.entries.push(entryFactory.comboBox({
    id: 'form-field-type',
    label: translate('Type'),
    selectOptions: [
      { name: 'string', value: 'string' },
      { name: 'long', value: 'long' },
      { name: 'boolean', value: 'boolean' },
      { name: 'date', value: 'date' },
      { name: 'enum', value: 'enum' }
    ],
    modelProperty: 'type',
    emptyParameter: true,

    get(element, node) {
      const selectedFormField = getSelectedFormField(element, node);

      if (selectedFormField) {
        return { type: selectedFormField.type };
      } 
      return {};
      
    },
    set(element, values, node) {
      const selectedFormField = getSelectedFormField(element, node);
      const formData = getExtensionElements(getBusinessObject(element), 'smart:FormData')[0];
      const commands = [];

      if (selectedFormField.type === 'enum' && values.type !== 'enum') {
        // delete smart:value objects from formField.values when switching from type enum
        commands.push(cmdHelper.updateBusinessObject(element, selectedFormField, { values: undefined }));
      }
      if (values.type === 'boolean' && selectedFormField.get('id') === formData.get('businessKey')) {
        commands.push(cmdHelper.updateBusinessObject(element, formData, { 'businessKey': undefined }));
      }
      commands.push(cmdHelper.updateBusinessObject(element, selectedFormField, values));

      return commands;
    },
    hidden(element, node) {
      return !getSelectedFormField(element, node);
    }
  }));

  // [FormData] form field label text input field
  group.entries.push(formFieldTextField({
    id: 'form-field-label',
    label: translate('Label'),
    modelProperty: 'label'
  }, getSelectedFormField));

  // [FormData] form field defaultValue text input field
  group.entries.push(formFieldTextField({
    id: 'form-field-defaultValue',
    label: translate('Default Value'),
    modelProperty: 'defaultValue'
  }, getSelectedFormField));


  // [FormData] form field enum values label
  group.entries.push(entryFactory.label({
    id: 'form-field-enum-values-header',
    labelText: translate('Values'),
    divider: true,
    showLabel(element, node) {
      const selectedFormField = getSelectedFormField(element, node);

      return selectedFormField && selectedFormField.type === 'enum';
    }
  }));

  // [FormData] form field enum values table
  group.entries.push(entryFactory.table({
    id: 'form-field-enum-values',
    labels: [ translate('Id'), translate('Name') ],
    modelProperties: [ 'id', 'name' ],
    show(element, node) {
      const selectedFormField = getSelectedFormField(element, node);

      return selectedFormField && selectedFormField.type === 'enum';
    },
    getElements(element, node) {
      const selectedFormField = getSelectedFormField(element, node);

      return formHelper.getEnumValues(selectedFormField);
    },
    addElement(element, node) {
      const selectedFormField = getSelectedFormField(element, node);
      const id = generateValueId();

      const enumValue = elementHelper.createElement(
        'smart:Value',
        { id, name: undefined },
        getBusinessObject(element),
        bpmnFactory
      );

      return cmdHelper.addElementsTolist(element, selectedFormField, 'values', [enumValue]);
    },
    removeElement(element, node, idx) {
      const selectedFormField = getSelectedFormField(element, node);
      const enumValue = selectedFormField.values[idx];

      return cmdHelper.removeElementsFromList(element, selectedFormField, 'values', null, [enumValue]);
    },
    updateElement(element, value, node, idx) {
      const selectedFormField = getSelectedFormField(element, node);
      const enumValue = selectedFormField.values[idx];

      value.name = value.name || undefined;
      return cmdHelper.updateBusinessObject(element, enumValue, value);
    },
    validate(element, value, node, idx) {

      const selectedFormField = getSelectedFormField(element, node);
      const enumValue = selectedFormField.values[idx];

      if (enumValue) {
        // check if id is valid
        const validationError = utils.isIdValid(enumValue, value.id, translate);

        if (validationError) {
          return { id: validationError };
        }
      }
    }
  }));

  // [FormData] Validation label
  group.entries.push(entryFactory.label({
    id: 'form-field-validation-header',
    labelText: translate('Validation'),
    divider: true,
    showLabel(element, node) {
      return !!getSelectedFormField(element, node);
    }
  }));

  // [FormData] form field constraints table
  group.entries.push(entryFactory.table({
    id: 'constraints-list',
    modelProperties: [ 'name', 'config' ],
    labels: [ translate('Name'), translate('Config') ],
    addLabel: translate('Add Constraint'),
    getElements(element, node) {
      const formField = getSelectedFormField(element, node);

      return formHelper.getConstraints(formField);
    },
    addElement(element, node) {

      const commands = [];
      const formField = getSelectedFormField(element, node);
      let validation = formField.validation;

      if (!validation) {
        // create validation business object and add it to form data, if it doesn't exist
        validation = elementHelper.createElement('smart:Validation', {}, getBusinessObject(element), bpmnFactory);

        commands.push(cmdHelper.updateBusinessObject(element, formField, { 'validation': validation }));
      }

      const newConstraint = elementHelper.createElement(
        'smart:Constraint',
        { name: undefined, config: undefined },
        validation,
        bpmnFactory
      );

      commands.push(cmdHelper.addElementsTolist(element, validation, 'constraints', [ newConstraint ]));

      return commands;
    },
    updateElement(element, value, node, idx) {
      const formField = getSelectedFormField(element, node);
      const constraint = formHelper.getConstraints(formField)[idx];

      value.name = value.name || undefined;
      value.config = value.config || undefined;

      return cmdHelper.updateBusinessObject(element, constraint, value);
    },
    removeElement(element, node, idx) {
      const commands = [];
      const formField = getSelectedFormField(element, node);
      const constraints = formHelper.getConstraints(formField);
      const currentConstraint = constraints[idx];

      commands.push(cmdHelper.removeElementsFromList(
        element,
        formField.validation,
        'constraints',
        null,
        [ currentConstraint ]
      ));

      if (constraints.length === 1) {
        // remove smart:validation if the last existing constraint has been removed
        commands.push(cmdHelper.updateBusinessObject(element, formField, { validation: undefined }));
      }

      return commands;
    },
    show(element, node) {
      return !!getSelectedFormField(element, node);
    }
  }));

  // [FormData] Properties label
  group.entries.push(entryFactory.label({
    id: 'form-field-properties-header',
    labelText: translate('Properties'),
    divider: true,
    showLabel(element, node) {
      return !!getSelectedFormField(element, node);
    }
  }));

  // [FormData] smart:properties table
  group.entries.push(properties(element, bpmnFactory, {
    id: 'form-field-properties',
    modelProperties: [ 'id', 'value' ],
    labels: [ translate('Id'), translate('Value') ],
    getParent(element, node) {
      return getSelectedFormField(element, node);
    },
    show(element, node) {
      return !!getSelectedFormField(element, node);
    }
  }, translate));
};
