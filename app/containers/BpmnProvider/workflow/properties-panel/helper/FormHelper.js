const getBusinessObject = require('bpmn-js/lib/util/ModelUtil')
  .getBusinessObject;
const getExtensionElements = require('./ExtensionElementsHelper')
  .getExtensionElements;

const FormHelper = {};

module.exports = FormHelper;

/**
 * Return form data from business object or undefined if none exist
 *
 * @param  {djs.model.Base} element
 *
 * @return {ModdleElement|undefined} formData
 *
 * 此方法废弃
 *
 */
FormHelper.getFormData = function(element) {
  /* var bo = getBusinessObject(element);

  var formFields = getExtensionElements(bo, 'smart:FormProperty');

  var formData = {}

  if (typeof formData !== 'undefined') {
    return formData[0];
  } */
  return {};
};

/**
 * Return all form fields existing in the business object, and
 * an empty array if none exist.
 *
 * @param  {djs.model.Base} element
 *
 * @return {Array} a list of form field objects
 */
FormHelper.getFormFields = function(element) {
  /** 直接获取 ExtensionElements的 smart:FormProperty元素 */
  const bo = getBusinessObject(element);

  const formFields = getExtensionElements(bo, 'smart:FormProperty');

  return formFields || [];
};

/**
 * Get a form field from the business object at given index
 *
 * @param {djs.model.Base} element
 * @param {number} idx
 *
 * @return {ModdleElement} the form field
 */
FormHelper.getFormField = function(element, idx) {
  const formFields = this.getFormFields(element);

  return formFields[idx];
};

/**
 * Get all constraints for a specific form field from the business object
 *
 * @param  {ModdleElement} formField
 *
 * @return {Array<ModdleElement>} a list of constraint objects
 */
FormHelper.getConstraints = function(formField) {
  if (formField && formField.validation && formField.validation.constraints) {
    return formField.validation.constraints;
  }
  return [];
};

/**
 * Get all smart:value objects for a specific form field from the business object
 *
 * @param  {ModdleElement} formField
 *
 * @return {Array<ModdleElement>} a list of smart:value objects
 */
FormHelper.getEnumValues = function(formField) {
  if (formField && formField.values) {
    return formField.values;
  }
  return [];
};
