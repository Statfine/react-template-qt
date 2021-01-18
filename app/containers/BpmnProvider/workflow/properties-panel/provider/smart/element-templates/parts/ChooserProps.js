const entryFactory = require('../../../../factory/EntryFactory');
const is = require('bpmn-js/lib/util/ModelUtil').is;
const getTemplate = require('../Helper').getTemplate;
const getTemplateId = require('../Helper').getTemplateId;

const find = require('lodash/find');

const TEMPLATE_ATTR = require('../Helper').TEMPLATE_ATTR;

function isAny(element, types) {
  return types.reduce(function (result, type) {
    return result || is(element, type);
  }, false);
}

module.exports = function (group, element, elementTemplates, translate) {
  const options = getTemplateOptions(element, elementTemplates, translate);

  if (options.length === 1 && !options[0].isDefault) {
    return;
  }

  // select element template (via dropdown)
  group.entries.push(
    entryFactory.selectBox({
      id: 'elementTemplate-chooser',
      label: translate('Element Template'),
      modelProperty: 'smart:modelerTemplate',
      selectOptions: options,
      set(element, properties) {
        return applyTemplate(
          element,
          properties[TEMPLATE_ATTR],
          elementTemplates,
        );
      },
      disabled() {
        const template = getTemplate(element, elementTemplates);

        return template && isDefaultTemplate(template);
      },
    }),
  );
};

// helpers //////////////////////////////////////

function applyTemplate(element, newTemplateId, elementTemplates) {
  // cleanup
  // clear input output mappings
  // undo changes to properties defined in template

  // re-establish
  // set input output mappings
  // apply changes to properties as defined in new template

  const oldTemplate = getTemplate(element, elementTemplates);
  const newTemplate = elementTemplates.get(newTemplateId);

  if (oldTemplate === newTemplate) {
    return;
  }

  return {
    cmd: 'propertiesPanel.smart.changeTemplate',
    context: {
      element,
      oldTemplate,
      newTemplate,
    },
  };
}

function getTemplateOptions(element, elementTemplates, translate) {
  const currentTemplateId = getTemplateId(element);

  const emptyOption = {
    name: '',
    value: '',
  };

  const allOptions = elementTemplates.getAll().reduce(
    function (templates, t) {
      if (!isAny(element, t.appliesTo)) {
        return templates;
      }

      return templates.concat({
        name: translate(t.name),
        value: t.id,
        isDefault: t.isDefault,
      });
    },
    [emptyOption],
  );

  const defaultOption = find(allOptions, function (option) {
    return isDefaultTemplate(option);
  });

  let currentOption = find(allOptions, function (option) {
    return option.value === currentTemplateId;
  });

  if (currentTemplateId && !currentOption) {
    currentOption = unknownTemplate(currentTemplateId, translate);

    allOptions.push(currentOption);
  }

  if (!defaultOption) {
    // return all options, including empty
    // and optionally unknownTemplate option
    return allOptions;
  }

  // special limited handling for
  // default options

  const options = [];

  // current template not set
  if (!currentTemplateId) {
    options.push({
      name: '',
      value: '',
    });
  }

  // current template not default
  if (currentOption && currentOption !== defaultOption) {
    options.push(currentOption);
  }

  options.push(defaultOption);

  // [ (empty), (current), defaultOption ]
  return options;
}

function unknownTemplate(templateId, translate) {
  return {
    name: translate('[unknown template: {templateId}]', { templateId }),
    value: templateId,
  };
}

function isDefaultTemplate(elementTemplate) {
  return elementTemplate.isDefault;
}
