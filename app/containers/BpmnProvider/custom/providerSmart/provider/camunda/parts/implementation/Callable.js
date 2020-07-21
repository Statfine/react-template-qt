

const cmdHelper = require('../../../../helper/CmdHelper');
const entryFactory = require('../../../../factory/EntryFactory');
const elementHelper = require('../../../../helper/ElementHelper');
const extensionElementsHelper = require('../../../../helper/ExtensionElementsHelper');


const resultVariable = require('./ResultVariable');

const getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;
const is = require('bpmn-js/lib/util/ModelUtil').is;

const forEach = require('lodash/forEach');

const attributeInfo = {
  bpmn: {
    element: 'calledElement',
    binding: 'smart:calledElementBinding',
    version: 'smart:calledElementVersion',
    versionTag: 'smart:calledElementVersionTag',
    tenantId: 'smart:calledElementTenantId'
  },

  cmmn: {
    element: 'smart:caseRef',
    binding: 'smart:caseBinding',
    version: 'smart:caseVersion',
    tenantId: 'smart:caseTenantId'
  },

  dmn: {
    element: 'smart:decisionRef',
    binding: 'smart:decisionRefBinding',
    version: 'smart:decisionRefVersion',
    versionTag: 'smart:decisionRefVersionTag',
    tenantId: 'smart:decisionRefTenantId'
  }
};

const mapDecisionResultOptions = [
  {
    name: 'singleEntry (TypedValue)',
    value: 'singleEntry'
  },
  {
    name:'singleResult (Map<String, Object>)',
    value:'singleResult'
  },
  {
    name:'collectEntries (List<Object>)',
    value:'collectEntries'
  },
  {
    name:'resultList (List<Map<String, Object>>)',
    value:'resultList'
  }
];

const delegateVariableMappingOptions = [
  {
    name: 'variableMappingClass',
    value: 'variableMappingClass'
  },
  {
    name: 'variableMappingDelegateExpression',
    value: 'variableMappingDelegateExpression'
  }
];

function getSmartInWithBusinessKey(element) {
  const smartIn = [];
  const bo = getBusinessObject(element);

  const smartInParams = extensionElementsHelper.getExtensionElements(bo, 'smart:In');
  if (smartInParams) {
    forEach(smartInParams, function(param) {
      if (param.businessKey !== undefined) {
        smartIn.push(param);
      }
    });
  }
  return smartIn;
}

function setBusinessKey(element, text, bpmnFactory) {
  const commands = [];

  const smartInWithBusinessKey = getSmartInWithBusinessKey(element);

  if (smartInWithBusinessKey.length) {
    commands.push(cmdHelper.updateBusinessObject(element, smartInWithBusinessKey[0], {
      businessKey: text
    }));
  } else {
    const bo = getBusinessObject(element);
    let extensionElements = bo.extensionElements;

    if (!extensionElements) {
      extensionElements = elementHelper.createElement('bpmn:ExtensionElements', { values: [] }, bo, bpmnFactory);
      commands.push(cmdHelper.updateProperties(element, { extensionElements }));
    }

    const smartIn = elementHelper.createElement(
      'smart:In',
      { 'businessKey': text },
      extensionElements,
      bpmnFactory
    );

    commands.push(cmdHelper.addAndRemoveElementsFromList(
      element,
      extensionElements,
      'values',
      'extensionElements',
      [ smartIn ],[]
    ));
  }

  return commands;
}

function deleteBusinessKey(element) {
  const smartInExtensions = getSmartInWithBusinessKey(element);
  const commands = [];
  forEach(smartInExtensions, function(elem) {
    commands.push(extensionElementsHelper.removeEntry(getBusinessObject(element), element, elem));
  });
  return commands;
}

function isSupportedCallableType(type) {
  return [ 'bpmn', 'cmmn', 'dmn' ].indexOf(type) !== -1;
}

module.exports = function(element, bpmnFactory, options, translate) {

  const bindingOptions = [
    {
      name: translate('latest'),
      value: 'latest'
    },
    {
      name: translate('deployment'),
      value: 'deployment'
    },
    {
      name: translate('version'),
      value: 'version'
    },
    {
      name: translate('versionTag'),
      value: 'versionTag'
    }
  ];

  const getCallableType = options.getCallableType;

  let entries = [];

  function getAttribute(element, prop) {
    const type = getCallableType(element);
    return (attributeInfo[type] || {})[prop];
  }

  function getCallActivityBindingValue(element) {
    const type = getCallableType(element);
    const bo = getBusinessObject(element);
    const attr = (attributeInfo[type] || {}).binding;
    return bo.get(attr);
  }

  function getDelegateVariableMappingType(element) {
    const bo = getBusinessObject(element);

    const boVariableMappingClass = bo.get('smart:variableMappingClass');
    const boVariableMappingDelegateExpression = bo.get('smart:variableMappingDelegateExpression');

    let delegateVariableMappingType = '';
    if (typeof boVariableMappingClass !== 'undefined') {
      delegateVariableMappingType = 'variableMappingClass';
    } else

    if (typeof boVariableMappingDelegateExpression !== 'undefined') {
      delegateVariableMappingType = 'variableMappingDelegateExpression';
    }

    return delegateVariableMappingType;
  }


  entries.push(entryFactory.textField({
    id: 'callable-element-ref',
    dataValueLabel: 'callableElementLabel',
    modelProperty: 'callableElementRef',

    get(element, node) {
      let callableElementRef;

      const attr = getAttribute(element, 'element');
      if (attr) {
        const bo = getBusinessObject(element);
        callableElementRef = bo.get(attr);
      }

      let label = '';
      const type = getCallableType(element);
      if (type === 'bpmn') {
        label = translate('Called Element');
      }
      else if (type === 'cmmn') {
        label = translate('Case Ref');
      }
      else if (type === 'dmn') {
        label = translate('Decision Ref');
      }

      return {
        callableElementRef,
        callableElementLabel: label
      };
    },

    set(element, values, node) {
      const newCallableElementRef = values.callableElementRef;
      const attr = getAttribute(element, 'element');

      const props = {};
      props[attr] = newCallableElementRef || '';

      return cmdHelper.updateProperties(element, props);
    },

    validate(element, values, node) {
      const elementRef = values.callableElementRef;
      const type = getCallableType(element);
      return isSupportedCallableType(type) && !elementRef ? { callableElementRef: translate('Must provide a value') } : {};
    },

    hidden(element, node) {
      return !isSupportedCallableType(getCallableType(element));
    }

  }));

  entries.push(entryFactory.selectBox({
    id: 'callable-binding',
    label: translate('Binding'),
    selectOptions(element) {
      const type = getCallableType(element);
      let options;

      if (type === 'cmmn') {
        options = bindingOptions.filter(function(bindingOption) {
          return bindingOption.value !== 'versionTag';
        });
      } else {
        options = bindingOptions;
      }
      return options;
    },
    modelProperty: 'callableBinding',

    get(element, node) {
      let callableBinding;

      const attr = getAttribute(element, 'binding');
      if (attr) {
        const bo = getBusinessObject(element);
        callableBinding = bo.get(attr) || 'latest';
      }

      return {
        callableBinding
      };
    },

    set(element, values, node) {
      const binding = values.callableBinding;
      const attr = getAttribute(element, 'binding');
      const attrVer = getAttribute(element, 'version');
      const attrVerTag = getAttribute(element, 'versionTag');

      const props = {};
      props[attr] = binding;

      // set version and versionTag values always to undefined to delete the existing value
      props[attrVer] = undefined;
      props[attrVerTag] = undefined;

      return cmdHelper.updateProperties(element, props);
    },

    hidden(element, node) {
      return !isSupportedCallableType(getCallableType(element));
    }

  }));

  entries.push(entryFactory.textField({
    id: 'callable-version',
    label: translate('Version'),
    modelProperty: 'callableVersion',

    get(element, node) {
      let callableVersion;

      const attr = getAttribute(element, 'version');
      if (attr) {
        const bo = getBusinessObject(element);
        callableVersion = bo.get(attr);
      }

      return {
        callableVersion
      };
    },

    set(element, values, node) {
      const version = values.callableVersion;
      const attr = getAttribute(element, 'version');

      const props = {};
      props[attr] = version || undefined;

      return cmdHelper.updateProperties(element, props);
    },

    validate(element, values, node) {
      const version = values.callableVersion;

      const type = getCallableType(element);
      return (
        isSupportedCallableType(type) &&
        getCallActivityBindingValue(element) === 'version' && (
          !version ? { callableVersion: translate('Must provide a value') } : {}
        )
      );
    },

    hidden(element, node) {
      const type = getCallableType(element);
      return !isSupportedCallableType(type) || getCallActivityBindingValue(element) !== 'version';
    }

  }));

  entries.push(entryFactory.textField({
    id: 'callable-version-tag',
    label: translate('Version Tag'),
    modelProperty: 'versionTag',

    get(element, node) {
      let versionTag;

      const attr = getAttribute(element, 'versionTag');

      if (attr) {
        const bo = getBusinessObject(element);

        versionTag = bo.get(attr);
      }

      return {
        versionTag
      };
    },

    set(element, values, node) {
      const versionTag = values.versionTag;

      const attr = getAttribute(element, 'versionTag');

      const props = {};

      props[attr] = versionTag || undefined;

      return cmdHelper.updateProperties(element, props);
    },

    validate(element, values, node) {
      const versionTag = values.versionTag;

      const type = getCallableType(element);

      return (
        isSupportedCallableType(type) &&
        getCallActivityBindingValue(element) === 'versionTag' && (
          !versionTag ? { versionTag: translate('Must provide a value') } : {}
        )
      );
    },

    hidden(element, node) {
      const type = getCallableType(element);

      return !isSupportedCallableType(type) || getCallActivityBindingValue(element) !== 'versionTag';
    }

  }));

  entries.push(entryFactory.textField({
    id: 'tenant-id',
    label: translate('Tenant Id'),
    modelProperty: 'tenantId',

    get(element, node) {
      let tenantId;

      const attr = getAttribute(element, 'tenantId');
      if (attr) {
        const bo = getBusinessObject(element);
        tenantId = bo.get(attr);
      }

      return {
        tenantId
      };
    },

    set(element, values, node) {
      const tenantId = values.tenantId;
      const attr = getAttribute(element, 'tenantId');

      const props = {};
      props[attr] = tenantId || undefined;

      return cmdHelper.updateProperties(element, props);
    },

    hidden(element, node) {
      const type = getCallableType(element);
      return !isSupportedCallableType(type);
    }

  }));

  if (is(getBusinessObject(element), 'bpmn:CallActivity')) {
    entries.push(entryFactory.checkbox({
      id: 'callable-business-key',
      label: translate('Business Key'),
      modelProperty: 'callableBusinessKey',

      get(element, node) {
        const smartIn = getSmartInWithBusinessKey(element);

        return {
          callableBusinessKey: !!(smartIn && smartIn.length > 0)
        };
      },

      set(element, values, node) {
        if (values.callableBusinessKey) {
          return setBusinessKey(element, '#{execution.processBusinessKey}', bpmnFactory);
        } 
        return deleteBusinessKey(element);
        
      }
    }));
  }

  entries.push(entryFactory.textField({
    id: 'business-key-expression',
    label: translate('Business Key Expression'),
    modelProperty: 'businessKey',

    get(element, node) {
      const smartInWithBusinessKey = getSmartInWithBusinessKey(element);

      return {
        businessKey: (
          smartInWithBusinessKey.length ?
            smartInWithBusinessKey[0].get('smart:businessKey') :
            undefined
        )
      };
    },

    set(element, values, node) {
      const businessKey = values.businessKey;

      return setBusinessKey(element, businessKey, bpmnFactory);
    },

    validate(element, values, node) {
      const businessKey = values.businessKey;

      return businessKey === '' ? { businessKey: translate('Must provide a value') } : {};
    },

    hidden(element, node) {
      return !getSmartInWithBusinessKey(element).length;
    }

  }));

  entries = entries.concat(resultVariable(element, bpmnFactory, {
    id: 'dmn-resultVariable',
    getBusinessObject,
    getImplementationType: getCallableType,
    hideResultVariable(element, node) {
      return getCallableType(element) !== 'dmn';
    }
  }, translate));

  entries.push(entryFactory.selectBox({
    id: 'dmn-map-decision-result',
    label: translate('Map Decision Result'),
    selectOptions: mapDecisionResultOptions,
    modelProperty: 'mapDecisionResult',

    get(element, node) {
      const bo = getBusinessObject(element);
      return {
        mapDecisionResult: bo.get('smart:mapDecisionResult') || 'resultList'
      };
    },

    set(element, values, node) {
      return cmdHelper.updateProperties(element, {
        'smart:mapDecisionResult': values.mapDecisionResult || 'resultList'
      });
    },

    hidden(element, node) {
      const bo = getBusinessObject(element);
      const resultVariable = bo.get('smart:resultVariable');
      return !(getCallableType(element) === 'dmn' && typeof resultVariable !== 'undefined');
    }

  }));


  entries.push(entryFactory.selectBox({
    id: 'delegateVariableMappingType',
    label: translate('Delegate Variable Mapping'),
    selectOptions: delegateVariableMappingOptions,
    emptyParameter: true,
    modelProperty: 'delegateVariableMappingType',

    get(element, node) {
      return {
        delegateVariableMappingType : getDelegateVariableMappingType(element)
      };
    },

    set(element, values, node) {
      const delegateVariableMappingType = values.delegateVariableMappingType;

      const props = {
        'smart:variableMappingClass' : undefined,
        'smart:variableMappingDelegateExpression' : undefined
      };

      if (delegateVariableMappingType === 'variableMappingClass') {
        props['smart:variableMappingClass'] = '';
      }
      else if (delegateVariableMappingType === 'variableMappingDelegateExpression') {
        props['smart:variableMappingDelegateExpression'] = '';
      }

      return cmdHelper.updateProperties(element, props);
    },

    hidden(element, node) {
      return (getCallableType(element) !== 'bpmn');
    }

  }));

  entries.push(entryFactory.textField({
    id: 'delegateVariableMapping',
    dataValueLabel: 'delegateVariableMappingLabel',
    modelProperty: 'delegateVariableMapping',

    get(element, node) {
      const bo = getBusinessObject(element);

      let label = '';
      let delegateVariableMapping;
      const type = getDelegateVariableMappingType(element);

      if (type === 'variableMappingClass') {
        label = translate('Class');
        delegateVariableMapping = bo.get('smart:variableMappingClass');
      }
      else if (type === 'variableMappingDelegateExpression') {
        label = translate('Delegate Expression');
        delegateVariableMapping = bo.get('smart:variableMappingDelegateExpression');
      }

      return {
        delegateVariableMapping,
        delegateVariableMappingLabel: label
      };
    },

    set(element, values, node) {
      const delegateVariableMapping = values.delegateVariableMapping;

      const attr = `smart:${  getDelegateVariableMappingType(element)}`;

      const props = {};
      props[attr] = delegateVariableMapping || undefined;

      return cmdHelper.updateProperties(element, props);
    },

    validate(element, values, node) {
      const delegateVariableMapping = values.delegateVariableMapping;
      return (
        getCallableType(element) === 'bpmn' && (
          !delegateVariableMapping ? { delegateVariableMapping: translate('Must provide a value') } : {}
        )
      );
    },

    hidden(element, node) {
      return !(getCallableType(element) === 'bpmn' && getDelegateVariableMappingType(element) !== '');
    }

  }));

  return entries;
};
