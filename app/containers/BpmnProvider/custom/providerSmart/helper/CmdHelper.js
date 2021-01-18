const CmdHelper = {};
module.exports = CmdHelper;

CmdHelper.updateProperties = function(element, properties) {
  return {
    cmd: 'element.updateProperties',
    context: { element, properties },
  };
};

CmdHelper.updateBusinessObject = function(
  element,
  businessObject,
  newProperties,
) {
  return {
    cmd: 'properties-panel.update-businessobject',
    context: {
      element,
      businessObject,
      properties: newProperties,
    },
  };
};

CmdHelper.addElementsTolist = function(
  element,
  businessObject,
  listPropertyName,
  objectsToAdd,
) {
  return {
    cmd: 'properties-panel.update-businessobject-list',
    context: {
      element,
      currentObject: businessObject,
      propertyName: listPropertyName,
      objectsToAdd,
    },
  };
};

CmdHelper.removeElementsFromList = function(
  element,
  businessObject,
  listPropertyName,
  referencePropertyName,
  objectsToRemove,
) {
  return {
    cmd: 'properties-panel.update-businessobject-list',
    context: {
      element,
      currentObject: businessObject,
      propertyName: listPropertyName,
      referencePropertyName,
      objectsToRemove,
    },
  };
};

CmdHelper.addAndRemoveElementsFromList = function(
  element,
  businessObject,
  listPropertyName,
  referencePropertyName,
  objectsToAdd,
  objectsToRemove,
) {
  return {
    cmd: 'properties-panel.update-businessobject-list',
    context: {
      element,
      currentObject: businessObject,
      propertyName: listPropertyName,
      referencePropertyName,
      objectsToAdd,
      objectsToRemove,
    },
  };
};

CmdHelper.setList = function(
  element,
  businessObject,
  listPropertyName,
  updatedObjectList,
) {
  return {
    cmd: 'properties-panel.update-businessobject-list',
    context: {
      element,
      currentObject: businessObject,
      propertyName: listPropertyName,
      updatedObjectList,
    },
  };
};
