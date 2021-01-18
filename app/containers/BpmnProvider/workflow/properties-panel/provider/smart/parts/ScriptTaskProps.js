const getBusinessObject = require('bpmn-js/lib/util/ModelUtil')
  .getBusinessObject;
const is = require('bpmn-js/lib/util/ModelUtil').is;
const entryFactory = require('../../../factory/EntryFactory');
const cmdHelper = require('../../../helper/CmdHelper');
const scriptImplementation = require('./implementation/Script');

module.exports = function(group, element, bpmnFactory, translate) {
  let bo;

  if (is(element, 'bpmn:ScriptTask')) {
    bo = getBusinessObject(element);
  }

  if (!bo) {
    return;
  }

  const script = scriptImplementation(
    'scriptFormat',
    'script',
    false,
    translate,
  );
  group.entries.push({
    id: 'script-implementation',
    label: translate('Script'),
    html: script.template,

    get(element) {
      return script.get(element, bo);
    },

    set(element, values, containerElement) {
      const properties = script.set(element, values, containerElement);

      return cmdHelper.updateProperties(element, properties);
    },

    validate(element, values) {
      return script.validate(element, values);
    },

    script,

    cssClasses: ['bpp-textfield'],
  });

  group.entries.push(
    entryFactory.textField({
      id: 'scriptResultVariable',
      label: translate('Result Variable'),
      modelProperty: 'scriptResultVariable',

      get(element, propertyName) {
        const boResultVariable = bo.get('smart:resultVariable');

        return { scriptResultVariable: boResultVariable };
      },

      set(element, values, containerElement) {
        return cmdHelper.updateProperties(element, {
          'smart:resultVariable': values.scriptResultVariable.length
            ? values.scriptResultVariable
            : undefined,
        });
      },
    }),
  );
};
