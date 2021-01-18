const isArray = require('lodash/isArray');
const isObject = require('lodash/isObject');

const DROPDOWN_TYPE = 'Dropdown';

const VALID_TYPES = ['String', 'Text', 'Boolean', 'Hidden', DROPDOWN_TYPE];

const PROPERTY_TYPE = 'property';
const SMART_PROPERTY_TYPE = 'smart:property';
const SMART_INPUT_PARAMETER_TYPE = 'smart:inputParameter';
const SMART_OUTPUT_PARAMETER_TYPE = 'smart:outputParameter';
const SMART_IN_TYPE = 'smart:in';
const SMART_OUT_TYPE = 'smart:out';
const SMART_IN_BUSINESS_KEY_TYPE = 'smart:in:businessKey';
const SMART_EXECUTION_LISTENER = 'smart:executionListener';
const SMART_FIELD = 'smart:field';

const VALID_BINDING_TYPES = [
  PROPERTY_TYPE,
  SMART_PROPERTY_TYPE,
  SMART_INPUT_PARAMETER_TYPE,
  SMART_OUTPUT_PARAMETER_TYPE,
  SMART_IN_TYPE,
  SMART_OUT_TYPE,
  SMART_IN_BUSINESS_KEY_TYPE,
  SMART_EXECUTION_LISTENER,
  SMART_FIELD,
];

/**
 * A element template validator.
 */
function Validator() {
  this._templatesById = {};

  this._validTemplates = [];
  this._errors = [];

  /**
   * Adds the templates.
   *
   * @param {Array<TemplateDescriptor>} templates
   *
   * @return {Validator} self
   */
  this.addAll = function(templates) {
    if (!isArray(templates)) {
      this._logError('templates must be []');
    } else {
      templates.forEach(this.add, this);
    }

    return this;
  };

  /**
   * Add the given element template, if it is valid.
   *
   * @param {TemplateDescriptor} template
   *
   * @return {Validator} self
   */
  this.add = function(template) {
    const err = this._validateTemplate(template);

    if (!err) {
      this._templatesById[template.id] = template;

      this._validTemplates.push(template);
    }

    return this;
  };

  /**
   * Validate given template and return error (if any).
   *
   * @param {TemplateDescriptor} template
   *
   * @return {Error} validation error, if any
   */
  this._validateTemplate = function(template) {
    let err;
    const id = template.id;
    const appliesTo = template.appliesTo;
    const properties = template.properties;
    const scopes = template.scopes;

    if (!id) {
      return this._logError('missing template id');
    }

    if (id in this._templatesById) {
      return this._logError(`template id <${id}> already used`);
    }

    if (!isArray(appliesTo)) {
      err = this._logError('missing appliesTo=[]', template);
    }

    if (!isArray(properties)) {
      err = this._logError('missing properties=[]', template);
    } else if (!this._validateProperties(properties)) {
      err = new Error('invalid properties');
    }

    if (scopes) {
      err = this._validateScopes(template, scopes);
    }

    return err;
  };

  this._validateScopes = function(template, scopes) {
    let err;
    let scope;
    let scopeName;

    if (!isObject(scopes) || isArray(scopes)) {
      return this._logError('invalid scopes, should be scopes={}', template);
    }

    for (scopeName in scopes) {
      scope = scopes[scopeName];

      if (!isObject(scope) || isArray(scope)) {
        err = this._logError('invalid scope, should be scope={}', template);
      }

      if (!isArray(scope.properties)) {
        err = this._logError(
          `missing properties=[] in scope <${scopeName}>`,
          template,
        );
      } else if (!this._validateProperties(scope.properties)) {
        err = new Error(`invalid properties in scope <${scopeName}>`);
      }
    }

    return err;
  };

  /**
   * Validate properties and return false if any is invalid.
   *
   * @param {Array<PropertyDescriptor>} properties
   *
   * @return {Boolean} true if all properties are valid
   */
  this._validateProperties = function(properties) {
    const validProperties = properties.filter(this._validateProperty, this);

    return properties.length === validProperties.length;
  };

  /**
   * Validate property and return false, if there was
   * a validation error.
   *
   * @param {PropertyDescriptor} property
   *
   * @return {Boolean} true if property is valid
   */
  this._validateProperty = function(property) {
    const type = property.type;
    const binding = property.binding;

    let err;

    const bindingType = binding.type;

    if (VALID_TYPES.indexOf(type) === -1) {
      err = this._logError(
        `invalid property type <${type}>; ` +
          `must be any of { ${VALID_TYPES.join(', ')} }`,
      );
    }

    if (type === DROPDOWN_TYPE && bindingType !== SMART_EXECUTION_LISTENER) {
      if (!isArray(property.choices)) {
        err = this._logError(
          `must provide choices=[] with ${DROPDOWN_TYPE} type`,
        );
      } else if (!property.choices.every(isDropdownChoiceValid)) {
        err = this._logError(
          `{ name, value } must be specified for ${DROPDOWN_TYPE} choices`,
        );
      }
    }

    if (!binding) {
      return this._logError('property missing binding');
    }

    if (VALID_BINDING_TYPES.indexOf(bindingType) === -1) {
      err = this._logError(
        `invalid property.binding type <${bindingType}>; ` +
          `must be any of { ${VALID_BINDING_TYPES.join(', ')} }`,
      );
    }

    if (
      bindingType === PROPERTY_TYPE ||
      bindingType === SMART_PROPERTY_TYPE ||
      bindingType === SMART_INPUT_PARAMETER_TYPE ||
      bindingType === SMART_FIELD
    ) {
      if (!binding.name) {
        err = this._logError(`property.binding <${bindingType}> requires name`);
      }
    }

    if (bindingType === SMART_OUTPUT_PARAMETER_TYPE) {
      if (!binding.source) {
        err = this._logError(
          `property.binding <${bindingType}> requires source`,
        );
      }
    }

    if (bindingType === SMART_IN_TYPE) {
      if (!binding.variables && !binding.target) {
        err = this._logError(
          `property.binding <${bindingType}> requires ` + `variables or target`,
        );
      }
    }

    if (bindingType === SMART_OUT_TYPE) {
      if (!binding.variables && !binding.source && !binding.sourceExpression) {
        err = this._logError(
          `property.binding <${bindingType}> requires ` +
            `variables, sourceExpression or source`,
        );
      }
    }

    if (bindingType === SMART_EXECUTION_LISTENER) {
      if (type !== 'Hidden') {
        err = this._logError(
          `invalid property type <${type}> for ${SMART_EXECUTION_LISTENER}; ` +
            `must be <Hidden>`,
        );
      }
    }

    return !err;
  };

  this._logError = function(err, template) {
    if (typeof err === 'string') {
      if (template) {
        err = `template(id: ${template.id}) ${err}`;
      }

      err = new Error(err);
    }

    this._errors.push(err);

    return err;
  };

  this.getErrors = function() {
    return this._errors;
  };

  this.getValidTemplates = function() {
    return this._validTemplates;
  };
}

module.exports = Validator;

// helpers ///////////////////////////////////

function isDropdownChoiceValid(c) {
  return 'name' in c && 'value' in c;
}
