import React, { PureComponent } from 'react';
import { Button } from 'antd';

import BpmnModeler from 'bpmn-js/lib/Modeler';
import propertiesPanelModule from 'bpmn-js-properties-panel';   // 这里引入的是右侧属性栏这个框
import 'bpmn-js/dist/assets/diagram-js.css' // 左边工具栏以及编辑节点的样式
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-codes.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css'
import 'bpmn-js-properties-panel/dist/assets/bpmn-js-properties-panel.css';

import $ from 'jquery';

import propertiesProviderModule from './workflow/properties-panel/provider/smart'; // 而这个引入的是右侧属性栏里的内容
import smartPackage from '../Bpmn/utils/smart.json';  // 如果要在属性面板中维护smart：XXX属性，则需要此 


import xmlInit from '../Bpmn/init.bpmn';
import '../Bpmn/styled.css';
import './css/app.css';
import StyleUtil from '../Bpmn/utils/StyleUtil';
import customTranslate from './workflow/customTranslate/customTranslate';

const NEED_RELEVANCY_STYEL = { stroke: '#666', fill: '#666' };
const RELEVANCY_STYEL = { stroke: 'black', fill: 'white' };

const customTranslateModule = {
  translate: [ 'value', customTranslate ]
};

export default class BpmnPage extends PureComponent {

  state = {
  }

  bpmnModeler;

  componentDidMount() {
    this.bpmnModeler = new BpmnModeler({
      container: '#js-canvas',
      propertiesPanel: {
        parent: '#js-properties-panel'
      },
      // bpmnRenderer: {
      //   defaultFillColor: 'green',
      //   defaultStrokeColor: 'yellow'
      // },
      additionalModules: [
        // { zoomScroll: ['value', 'value'] } // 禁止滚动
        // customModule, // 自定义render
        propertiesPanelModule, // 右侧工具栏
        propertiesProviderModule,
        customTranslateModule,
      ],
      moddleExtensions: {
        smart: smartPackage,
      }
    });
    this.initDiagram(xmlInit);
  }

  // '<?xml version="1.0" encoding="UTF-8"?><bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" id="Definitions_06armuw" targetNamespace="http://bpmn.io/schema/bpmn" exporter="bpmn-js (https://demo.bpmn.io)" exporterVersion="7.0.0"><bpmn:collaboration id="Collaboration_0jiv3ag"><bpmn:participant id="Participant_16bft7w" processRef="Process_1" /></bpmn:collaboration><bpmn:process id="Process_1" /><bpmndi:BPMNDiagram id="BPMNDiagram_1"><bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Collaboration_0jiv3ag"><bpmndi:BPMNShape id="Participant_16bft7w_di" bpmnElement="Participant_16bft7w" isHorizontal="true"><dc:Bounds x="250" y="30" width="410" height="140" /></bpmndi:BPMNShape></bpmndi:BPMNPlane></bpmndi:BPMNDiagram></bpmn:definitions>'
  initDiagram = async (xml) => {
    try {
      await this.bpmnModeler.importXML(xml);
      this.addToolTitle();
      this.setNodeColor();
      this.changeClassName();
      StyleUtil.changeArrows();
    } catch (error) {
      console.error(error);
    }
  };

  changeClassName = () => {
    const canvas = this.bpmnModeler.get('canvas')
    // canvas.zoom('fit-viewport', 'auto') // 适应，居中
    const colorClass = 'nodeSuccess';
    const elementRegistry = this.bpmnModeler.get('elementRegistry');
    // const relevancyNode = []; // 正常的Task节点
    const participantNode = elementRegistry.filter((item) => {
      console.log('elementRegistry', item)
      return item.type === 'bpmn:Participant';
    });
    participantNode.forEach((item) => {
      console.log('forEach', item);
      // if (i % 2 === 0) canvas.addMarker(item.id, colorClass)
      canvas.addMarker(item.id, colorClass)
    })
    // canvas.addMarker("Participant_19mj649", colorClass)
    // setTimeout(() => {
    //   canvas.removeMarker("Participant_19mj649", colorClass);
    // }, 1000)
  }

  // 动态再工具栏上添加div
  addToolTitle = () => {
    if ($(".custom-tool-title").length < 1) {
      $(".djs-palette-entries").before("<div class='custom-tool-title'>基本信息</div>");
    }
  }

  setNodeColor = () => {
    // 目的：为第一个节点添加绿色，为第二个节点添加黄色
    // 实现步骤：1、找到页面里所有节点
    const elementRegistry = this.bpmnModeler.get('elementRegistry');
    // const relevancyNode = []; // 正常的Task节点
    const needRelevancyNode = elementRegistry.filter((item) => {
      console.log('elementRegistry', item)
      // if (item.type === 'bpmn:Task' && item.businessObject.$attrs.link_id) relevancyNode.push(item)
      return this.verifyNeedRelevancy(item);
    });
    console.log(needRelevancyNode);
    // 此时得到的Task 便是流程图中所有的节点的集合
    // 步骤2 ：为节点添加颜色
    // modeling.setColor(参数1：节点，可以是单个元素实例，也可是多个节点组成的数组，参数2：class类);
    // const modeling = this.bpmnModeler.get('modeling');
    // if (needRelevancyNode.length > 0) modeling.setColor(needRelevancyNode, NEED_RELEVANCY_STYEL);
    // modeling.setColor(relevancyNode, RELEVANCY_STYEL);
  }

  // 验证是否需要关联，true-需要
  verifyNeedRelevancy = (element) => element.type === 'bpmn:Task' && !element.businessObject.$attrs.link_id

  setSigleNodeColor = (element) => {
    const modeling = this.bpmnModeler.get('modeling');
    modeling.setColor(element, this.verifyNeedRelevancy(element) ? NEED_RELEVANCY_STYEL : RELEVANCY_STYEL);
  }

  // 弹框回调
  handleChangeEl = (el, name, link) => {
    // const elementRegistry = this.bpmnModeler.get('elementRegistry');
    // const ele = elementRegistry.get(el.id)
    const modeling = this.bpmnModeler.get('modeling');
    modeling.updateProperties(el, {
      name,
      link_id: link
    });
    if (link) this.setSigleNodeColor(el)
  }

  getExtension = (element, type) => {
    if (!element.businessObject.extensionElements) {
      return null;
    }
    return element.businessObject.extensionElements.values.filter((e) => e.$instanceOf(type))[0];
  }

  // 前进
  handleRedo = () => {
    this.bpmnModeler.get('commandStack').redo();
  };

  // 后退
  handleUndo = () => {
    const commandStack = this.bpmnModeler.get('commandStack');
    commandStack.undo();
  };

  // 清空
  handleClear = () => {
    this.bpmnModeler.clear();
    this.initDiagram(xmlInit, false);
  };

  // 保存
  handleSave = () => {
    this.bpmnModeler.saveXML({format: true}, (err, xml) => {
      console.log(xml);
    });
    this.bpmnModeler.saveSVG({format: true}, (err, data) => {
      console.log(data);
    });
  };

  // 下载 SVG 格式
  handleDownloadSvg = () => {
    this.bpmnModeler.saveSVG({format: true}, (err, data) => {
      this.download('svg', data);
    });
  };

  // 下载 XML 格式
  handleDownloadXml = () => {
    this.bpmnModeler.saveXML({format: true}, (err, data) => {
      this.download('xml', data);
    });
  };

  // 下载xml/svg
  download = (type, data, name) => {
    let dataTrack = '';
    const a = document.createElement('a');
    switch (type) {
      case 'xml':
        dataTrack = 'bpmn';
        break;
      case 'svg':
        dataTrack = 'svg';
        break;
      default:
        break;
    }
    const downName = name || `diagram.${dataTrack}`;
    a.setAttribute(
      'href',
      `data:application/bpmn20-xml;charset=UTF-8,${encodeURIComponent(data)}`
    );
    a.setAttribute('target', '_blank');
    a.setAttribute('dataTrack', `diagram:download-${dataTrack}`);
    a.setAttribute('download', downName);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  render() {
    return (
      <div style={{ margin: '10px', position: 'relative' }}>
        <div style={{ position: 'absolute', bottom: '-40px' }}>
          <Button  onClick={this.handleClear}>清空</Button>
          <Button  onClick={this.handleSave}>保存</Button>
          <Button  onClick={this.handleDownloadSvg}>下载 SVG</Button>
          <Button  onClick={this.handleDownloadXml}>下载 XML</Button>
        </div>
        <div style={{ width: '100%', height: '400px', border: '1px solid #DBECFF', overflow: 'scroll' }} id="js-canvas">
        </div>
        <div className="smart-content" id="js-properties-panel"></div>
      </div>
    )
  }
}