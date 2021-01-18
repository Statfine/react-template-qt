const domQuery = require('min-dom').query;
const escapeHTML = require('../../../../Utils').escapeHTML;
const utils = require('../../../../Utils');

function getScriptType(node) {
  return utils.selectedType('select[name=scriptType]', node.parentElement);
}

module.exports = function (
  scriptLanguagePropName,
  scriptValuePropName,
  isFormatRequired,
  translate,
) {
  return {
    template:
      `${
        '<div class="bpp-row bpp-textfield">' +
        '<label for="cam-script-format">'
      }${escapeHTML(translate('Script Format'))}</label>` +
      `<div class="bpp-field-wrapper">` +
      `<input id="cam-script-format" type="text" name="scriptFormat" />` +
      `<button class="clear" data-action="script.clearScriptFormat" data-show="script.canClearScriptFormat">` +
      `<span>X</span>` +
      `</button>` +
      `</div>` +
      `</div>` +
      `<div class="bpp-row">` +
      `<label for="cam-script-type">${escapeHTML(
        translate('Script Type'),
      )}</label>` +
      `<div class="bpp-field-wrapper">` +
      `<select id="cam-script-type" name="scriptType" data-value>` +
      `<option value="script" selected>${escapeHTML(
        translate('Inline Script'),
      )}</option>` +
      `<option value="scriptResource">${escapeHTML(
        translate('External Resource'),
      )}</option>` +
      `</select>` +
      `</div>` +
      `</div>` +
      `<div class="bpp-row bpp-textfield">` +
      `<label for="cam-script-resource-val" data-show="script.isScriptResource">${escapeHTML(
        translate('Resource'),
      )}</label>` +
      `<div class="bpp-field-wrapper" data-show="script.isScriptResource">` +
      `<input id="cam-script-resource-val" type="text" name="scriptResourceValue" />` +
      `<button class="clear" data-action="script.clearScriptResource" data-show="script.canClearScriptResource">` +
      `<span>X</span>` +
      `</button>` +
      `</div>` +
      `</div>` +
      `<div class="bpp-row">` +
      `<label for="cam-script-val" data-show="script.isScript">${escapeHTML(
        translate('Script'),
      )}</label>` +
      `<div class="bpp-field-wrapper" data-show="script.isScript">` +
      `<textarea id="cam-script-val" type="text" name="scriptValue"></textarea>` +
      `</div>` +
      `</div>`,

    get(element, bo) {
      const values = {};

      // read values from xml:
      const boScriptResource = bo.get('smart:resource');
      const boScript = bo.get(scriptValuePropName);
      const boScriptFormat = bo.get(scriptLanguagePropName);

      if (typeof boScriptResource !== 'undefined') {
        values.scriptResourceValue = boScriptResource;
        values.scriptType = 'scriptResource';
      } else {
        values.scriptValue = boScript;
        values.scriptType = 'script';
      }

      values.scriptFormat = boScriptFormat;

      return values;
    },

    set(element, values, containerElement) {
      const scriptFormat = values.scriptFormat;
      const scriptType = values.scriptType;
      const scriptResourceValue = values.scriptResourceValue;
      const scriptValue = values.scriptValue;

      // init update
      const update = {
        'smart:resource': undefined,
      };
      update[scriptValuePropName] = undefined;
      update[scriptLanguagePropName] = undefined;

      if (isFormatRequired) {
        // always set language
        update[scriptLanguagePropName] = scriptFormat || '';
      }
      // set language only when scriptFormat has a value
      else if (scriptFormat !== '') {
        update[scriptLanguagePropName] = scriptFormat;
      }

      // set either inline script or resource
      if (scriptType === 'scriptResource') {
        update['smart:resource'] = scriptResourceValue || '';
      } else {
        update[scriptValuePropName] = scriptValue || '';
      }

      return update;
    },

    validate(element, values) {
      const validationResult = {};

      if (values.scriptType === 'script' && !values.scriptValue) {
        validationResult.scriptValue = translate('Must provide a value');
      }

      if (
        values.scriptType === 'scriptResource' &&
        !values.scriptResourceValue
      ) {
        validationResult.scriptResourceValue = translate(
          'Must provide a value',
        );
      }

      if (
        isFormatRequired &&
        (!values.scriptFormat || values.scriptFormat.length === 0)
      ) {
        validationResult.scriptFormat = translate('Must provide a value');
      }

      return validationResult;
    },

    clearScriptFormat(element, inputNode, btnNode, scopeNode) {
      domQuery('input[name=scriptFormat]', scopeNode).value = '';

      return true;
    },

    canClearScriptFormat(element, inputNode, btnNode, scopeNode) {
      const input = domQuery('input[name=scriptFormat]', scopeNode);

      return input.value !== '';
    },

    clearScriptResource(element, inputNode, btnNode, scopeNode) {
      domQuery('input[name=scriptResourceValue]', scopeNode).value = '';

      return true;
    },

    canClearScriptResource(element, inputNode, btnNode, scopeNode) {
      const input = domQuery('input[name=scriptResourceValue]', scopeNode);

      return input.value !== '';
    },

    clearScript(element, inputNode, btnNode, scopeNode) {
      domQuery('textarea[name=scriptValue]', scopeNode).value = '';

      return true;
    },

    canClearScript(element, inputNode, btnNode, scopeNode) {
      const input = domQuery('textarea[name=scriptValue]', scopeNode);

      return input.value !== '';
    },

    isScriptResource(element, inputNode, btnNode, scopeNode) {
      const scriptType = getScriptType(scopeNode);
      return scriptType === 'scriptResource';
    },

    isScript(element, inputNode, btnNode, scopeNode) {
      const scriptType = getScriptType(scopeNode);
      return scriptType === 'script';
    },
  };
};
