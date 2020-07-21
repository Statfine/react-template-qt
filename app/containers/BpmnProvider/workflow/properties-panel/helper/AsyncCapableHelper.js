

const map = require('lodash/map');

const extensionElementsHelper = require('./ExtensionElementsHelper');

/**
 * Returns true if the attribute 'smart:asyncBefore' is set
 * to true.
 *
 * @param  {ModdleElement} bo
 *
 * @return {boolean} a boolean value
 */
function isAsyncBefore(bo) {
  return !!(bo.get('smart:asyncBefore') || bo.get('smart:async'));
}

module.exports.isAsyncBefore = isAsyncBefore;

/**
 * Returns true if the attribute 'smart:asyncAfter' is set
 * to true.
 *
 * @param  {ModdleElement} bo
 *
 * @return {boolean} a boolean value
 */
function isAsyncAfter(bo) {
  return !!bo.get('smart:asyncAfter');
}

module.exports.isAsyncAfter = isAsyncAfter;

/**
 * Returns true if the attribute 'smart:exclusive' is set
 * to true.
 *
 * @param  {ModdleElement} bo
 *
 * @return {boolean} a boolean value
 */
function isExclusive(bo) {
  return !!bo.get('smart:exclusive');
}

module.exports.isExclusive = isExclusive;

/**
 * Get first 'smart:FailedJobRetryTimeCycle' from the business object.
 *
 * @param  {ModdleElement} bo
 *
 * @return {Array<ModdleElement>} a list of 'smart:FailedJobRetryTimeCycle'
 */
function getFailedJobRetryTimeCycle(bo) {
  return (extensionElementsHelper.getExtensionElements(bo, 'smart:FailedJobRetryTimeCycle') || [])[0];
}

module.exports.getFailedJobRetryTimeCycle = getFailedJobRetryTimeCycle;

/**
 * Removes all existing 'smart:FailedJobRetryTimeCycle' from the business object
 *
 * @param  {ModdleElement} bo
 *
 * @return {Array<ModdleElement>} a list of 'smart:FailedJobRetryTimeCycle'
 */
function removeFailedJobRetryTimeCycle(bo, element) {
  const retryTimeCycles = extensionElementsHelper.getExtensionElements(bo, 'smart:FailedJobRetryTimeCycle');
  return map(retryTimeCycles, function(cycle) {
    return extensionElementsHelper.removeEntry(bo, element, cycle);
  });
}

module.exports.removeFailedJobRetryTimeCycle = removeFailedJobRetryTimeCycle;