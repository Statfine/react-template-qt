

const forEach = require('lodash/forEach');

/**
 * A handler that implements a BPMN 2.0 property update
 * for business object lists which are not represented in the
 * diagram.
 *
 * This is useful in the context of the properties panel in
 * order to update child elements of elements visible in
 * the diagram.
 *
 * Example: perform an update of a specific event definition
 * of an intermediate event.
 *
 * @class
 * @constructor
 */
function UpdateBusinessObjectListHandler(elementRegistry, bpmnFactory) {
  this._elementRegistry = elementRegistry;
  this._bpmnFactory = bpmnFactory;
}

UpdateBusinessObjectListHandler.$inject = [ 'elementRegistry', 'bpmnFactory' ];

module.exports = UpdateBusinessObjectListHandler;

function ensureNotNull(prop, name) {
  if (!prop) {
    throw new Error(`${name  }required`);
  }
  return prop;
}

// api /////////////////////////////////////////////

/**
 * Updates a element under a provided parent.
 */
UpdateBusinessObjectListHandler.prototype.execute = function(context) {

  const currentObject = ensureNotNull(context.currentObject, 'currentObject');
  const propertyName = ensureNotNull(context.propertyName, 'propertyName');
  const updatedObjectList = context.updatedObjectList;
  const objectsToRemove = context.objectsToRemove || [];
  const objectsToAdd = context.objectsToAdd || [];
  const changed = [ context.element]; // this will not change any diagram-js elements
  let referencePropertyName;

  if (context.referencePropertyName) {
    referencePropertyName = context.referencePropertyName;
  }

  const objectList = currentObject[propertyName];
  // adjust array reference in the parent business object
  context.previousList = currentObject[propertyName];

  if (updatedObjectList) {
    currentObject[propertyName] = updatedObjectList;
  } else {
    let listCopy = [];
    // remove all objects which should be removed
    forEach(objectList, function(object) {
      if (objectsToRemove.indexOf(object) == -1) {
        listCopy.push(object);
      }
    });
    // add all objects which should be added
    listCopy = listCopy.concat(objectsToAdd);

    // set property to new list
    if (listCopy.length > 0 || !referencePropertyName) {

      // as long as there are elements in the list update the list
      currentObject[propertyName] = listCopy;
    } else if (referencePropertyName) {

      // remove the list when it is empty
      const parentObject = currentObject.$parent;
      parentObject.set(referencePropertyName, undefined);
    }
  }

  context.changed = changed;

  // indicate changed on objects affected by the update
  return changed;
};

/**
 * Reverts the update
 *
 * @method  CreateBusinessObjectListHandler#revert
 *
 * @param {Object} context
 *
 * @return {djs.mode.Base} the updated element
 */
UpdateBusinessObjectListHandler.prototype.revert = function(context) {

  const currentObject = context.currentObject;
  const propertyName = context.propertyName;
  const previousList = context.previousList;
  const parentObject = currentObject.$parent;

  if (context.referencePropertyName) {
    parentObject.set(context.referencePropertyName, currentObject);
  }

  // remove new element
  currentObject.set(propertyName, previousList);

  return context.changed;
};
