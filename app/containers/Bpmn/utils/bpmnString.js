import bpmbJson from './bpmn.json';

// Participant 屏幕起始位置和默认宽高
const defaultParticipantX = 200;
const defaultParticipantY = 10;
const defaultParticipantWidth = 600;
const defaultParticipantHeight = 250;

// Task 默认宽高
const defaultTaskWidth = 100;
const defaultTaskHeight = 80;

function JsonToString() {
  const participantList = [];
  const BPMNPlaneList = [];
  const processList = [];
  const participantX = defaultParticipantX;
  let participantY = defaultParticipantY;
  bpmbJson.forEach((element, index) => {
    const id = `Participant_${index}`;
    const processId = `Process_${index}`;
    participantY = defaultParticipantHeight * index + participantY;
    participantList.push(participant(id, element.role, processId));
    const process = defaultProcess(
      processId,
      element.activity,
      participantX,
      participantY,
    );
    processList.push(process.process);
    BPMNPlaneList.push(bpmnPlan('participant', id, participantX, participantY));
    BPMNPlaneList.push(...process.bpmnPlan);
  });
  return defaultBpmnString(participantList, BPMNPlaneList, processList);
}

/**
 * collaboration 放置所有Participant
 * processList 放置Participant和子集task
 */
function defaultBpmnString(participantList, BPMNPlaneList, processList) {
  console.log(BPMNPlaneList.join(''));
  return `<?xml version="1.0" encoding="UTF-8"?><bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" id="Definitions_06armuw" targetNamespace="http://bpmn.io/schema/bpmn" exporter="bpmn-js (https://demo.bpmn.io)" exporterVersion="7.0.0">
    <bpmn:collaboration id="Collaboration_1">${participantList.join(
    '',
  )}</bpmn:collaboration>
    ${processList.join('')}
    <bpmndi:BPMNDiagram id="BPMNDiagram_1">
      <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Collaboration_1">
        ${BPMNPlaneList.join('')}
      </bpmndi:BPMNPlane>
    </bpmndi:BPMNDiagram>
  </bpmn:definitions>`;
}

/**
 * processRef作为Process的id （放置Task合集）
 * Process是当前participant的task集合
 */
function participant(id, name, processId) {
  return `<bpmn:participant id="${id}" name="${name}" processRef="${processId}" />`;
}

/**
 * bpmnElement为participant或者task 的id
 * id 为participant或者task 的id + '_di'
 */
function bpmnPlan(type, id, x, y) {
  let width = 0;
  let height = 0;
  if (type === 'participant') {
    width = defaultParticipantWidth;
    height = defaultParticipantHeight;
    return `<bpmndi:BPMNShape id="${id}_di" bpmnElement="${id}">
      <dc:Bounds x="${x}" y="${y}" width="${width}" height="${height}" isHorizontal="true" />
    </bpmndi:BPMNShape>`;
  }
  if (type === 'task') {
    width = defaultTaskWidth;
    height = defaultTaskHeight;
    return `<bpmndi:BPMNShape id="${id}_di" bpmnElement="${id}">
      <dc:Bounds x="${x}" y="${y}" width="${width}" height="${height}" bioc:stroke="black" bioc:fill="white" />
    </bpmndi:BPMNShape>`;
  }
  return null;
}

// participant下的task集合
function defaultProcess(processId, activitys, parentX, parentY) {
  const taskList = [];
  const bpmnPlanList = [];
  activitys.forEach((activity, index) => {
    const activityeId = `Activity_${processId}_${index}`;
    const x = 110 * index + 200 + 40;
    taskList.push(defaultTask(activityeId, activity));
    bpmnPlanList.push(bpmnPlan('task', activityeId, x, parentY));
  });
  return {
    process: `<bpmn:process id="${processId}">
        ${taskList}
      </bpmn:process>`,
    bpmnPlan: bpmnPlanList,
  };
}

function defaultTask(id, activity) {
  return `<bpmn:task id="${id}" name="${activity.title}" link_id="${activity.id}" />`;
}

export default JsonToString;
