const assign = require('lodash/assign');
const map = require('lodash/map');
const entryFactory = require('../../../../factory/EntryFactory');
const cmdHelper = require('../../../../helper/CmdHelper');
const extensionElementsHelper = require('../../../../helper/ExtensionElementsHelper');
const elementHelper = require('../../../../helper/ElementHelper');

const DEFAULT_DELEGATE_PROPS = ['class', 'expression', 'delegateExpression'];

const DELEGATE_PROPS = {
  'smart:class': undefined,
  'smart:expression': undefined,
  'smart:delegateExpression': undefined,
  'smart:resultVariable': undefined,
};

const DMN_CAPABLE_PROPS = {
  'smart:decisionRef': undefined,
  'smart:decisionRefBinding': 'latest',
  'smart:decisionRefVersion': undefined,
  'smart:mapDecisionResult': 'resultList',
  'smart:decisionRefTenantId': undefined,
};

const EXTERNAL_CAPABLE_PROPS = {
  'smart:type': undefined,
  'smart:topic': undefined,
};

module.exports = function(element, bpmnFactory, options, translate) {
  const DEFAULT_OPTIONS = [
    { value: 'class', name: translate('Java Class') },
    { value: 'expression', name: translate('Expression') },
    { value: 'delegateExpression', name: translate('Delegate Expression') },
  ];

  const DMN_OPTION = [{ value: 'dmn', name: translate('DMN') }];

  const EXTERNAL_OPTION = [{ value: 'external', name: translate('External') }];

  const CONNECTOR_OPTION = [
    { value: 'connector', name: translate('Connector') },
  ];

  const SCRIPT_OPTION = [{ value: 'script', name: translate('Script') }];

  const getType = options.getImplementationType;
  const getBusinessObject = options.getBusinessObject;

  const hasDmnSupport = options.hasDmnSupport;
  const hasExternalSupport = options.hasExternalSupport;
  const hasServiceTaskLikeSupport = options.hasServiceTaskLikeSupport;
  const hasScriptSupport = options.hasScriptSupport;

  const entries = [];

  let selectOptions = DEFAULT_OPTIONS.concat([]);

  if (hasDmnSupport) {
    selectOptions = selectOptions.concat(DMN_OPTION);
  }

  if (hasExternalSupport) {
    selectOptions = selectOptions.concat(EXTERNAL_OPTION);
  }

  if (hasServiceTaskLikeSupport) {
    selectOptions = selectOptions.concat(CONNECTOR_OPTION);
  }

  if (hasScriptSupport) {
    selectOptions = selectOptions.concat(SCRIPT_OPTION);
  }

  selectOptions.push({ value: '' });

  entries.push(
    entryFactory.selectBox({
      id: 'implementation',
      label: translate('Implementation'),
      selectOptions,
      modelProperty: 'implType',

      get(element, node) {
        return {
          implType: getType(element) || '',
        };
      },

      set(element, values, node) {
        const bo = getBusinessObject(element);
        const oldType = getType(element);
        const newType = values.implType;

        let props = assign({}, DELEGATE_PROPS);

        if (DEFAULT_DELEGATE_PROPS.indexOf(newType) !== -1) {
          let newValue = '';
          if (DEFAULT_DELEGATE_PROPS.indexOf(oldType) !== -1) {
            newValue = bo.get(`smart:${oldType}`);
          }
          props[`smart:${newType}`] = newValue;
        }

        if (hasDmnSupport) {
          props = assign(props, DMN_CAPABLE_PROPS);
          if (newType === 'dmn') {
            props['smart:decisionRef'] = '';
          }
        }

        if (hasExternalSupport) {
          props = assign(props, EXTERNAL_CAPABLE_PROPS);
          if (newType === 'external') {
            props['smart:type'] = 'external';
            props['smart:topic'] = '';
          }
        }

        if (hasScriptSupport) {
          props['smart:script'] = undefined;

          if (newType === 'script') {
            props['smart:script'] = elementHelper.createElement(
              'smart:Script',
              {},
              bo,
              bpmnFactory,
            );
          }
        }

        const commands = [];
        commands.push(cmdHelper.updateBusinessObject(element, bo, props));

        if (hasServiceTaskLikeSupport) {
          const connectors = extensionElementsHelper.getExtensionElements(
            bo,
            'smart:Connector',
          );
          commands.push(
            map(connectors, function(connector) {
              return extensionElementsHelper.removeEntry(
                bo,
                element,
                connector,
              );
            }),
          );

          if (newType === 'connector') {
            let extensionElements = bo.get('extensionElements');
            if (!extensionElements) {
              extensionElements = elementHelper.createElement(
                'bpmn:ExtensionElements',
                { values: [] },
                bo,
                bpmnFactory,
              );
              commands.push(
                cmdHelper.updateBusinessObject(element, bo, {
                  extensionElements,
                }),
              );
            }
            const connector = elementHelper.createElement(
              'smart:Connector',
              {},
              extensionElements,
              bpmnFactory,
            );
            commands.push(
              cmdHelper.addAndRemoveElementsFromList(
                element,
                extensionElements,
                'values',
                'extensionElements',
                [connector],
                [],
              ),
            );
          }
        }

        return commands;
      },
    }),
  );

  return entries;
};
