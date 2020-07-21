

const collectionAdd = require('diagram-js/lib/util/Collections').add;
const getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;

const CategoryHelper = {};

module.exports = CategoryHelper;

/**
 * Creates a new bpmn:CategoryValue inside a new bpmn:Category
 *
 * @param {ModdleElement} definitions
 * @param {BpmnFactory} bpmnFactory
 *
 * @return {ModdleElement} categoryValue.
 */
CategoryHelper.createCategoryValue = function(definitions, bpmnFactory) {
  const categoryValue = bpmnFactory.create('bpmn:CategoryValue');
  const category = bpmnFactory.create('bpmn:Category', {
    categoryValue: [ categoryValue ]
  });

  // add to correct place
  collectionAdd(definitions.get('rootElements'), category);
  getBusinessObject(category).$parent = definitions;
  getBusinessObject(categoryValue).$parent = category;

  return categoryValue;

};