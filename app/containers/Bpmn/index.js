import React, { PureComponent, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button, Modal, Input, Select, Form } from 'antd';

import BpmnModeler from 'bpmn-js/lib/Modeler';
import propertiesPanelModule from 'bpmn-js-properties-panel';   // 右侧工具栏
import elementHelper from 'bpmn-js-properties-panel/lib/helper/ElementHelper';
import propertiesProviderModule from 'bpmn-js-properties-panel/lib/provider/camunda';
import camundaModdleDescriptor from 'camunda-bpmn-moddle/resources/camunda.json';
import 'bpmn-js/dist/assets/diagram-js.css' // 左边工具栏以及编辑节点的样式
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-codes.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css'
import 'bpmn-js-properties-panel/dist/assets/bpmn-js-properties-panel.css';

import $ from 'jquery';

import xmlData from './data.bpmn';
// import xmlEmpty from './empty.bpmn';
import xmlInit from './init.bpmn';
import './styled.css';
// import customModule from './custom';
import StyleUtil from './utils/StyleUtil';
import customTranslate from './customTranslate/customTranslate';

import JsonToString from './utils/bpmnString';
import qaPackage from './utils/qaPackage.json';

const customTranslateModule = {
  translate: [ 'value', customTranslate ]
};

const NEED_RELEVANCY_STYEL = { stroke: '#666', fill: '#666' };
const RELEVANCY_STYEL = { stroke: 'black', fill: 'white' };

const { Option } = Select;
const SetModal = (props) => {
  const { el, handleCancelModal, handleCallback } = props;
  const [form] = Form.useForm();

  const [value, setValue] = useState('');
  const [link, setLink] = useState('');

  useEffect(() => {
    setValue(el.businessObject.name);
    setLink(el.businessObject.$attrs.link_id);
  }, [])

  return (
    <Modal
      title="Basic Modal"
      destroyOnClose
      visible
      onOk={() => {
        form
          .validateFields()
          .then(values => {
            form.resetFields();
            handleCallback(el, values.name, values.link)
          })
          .catch(info => {
            console.log('Validate Failed:', info);
          });
      }}
      onCancel={handleCancelModal}
    >
      <Form
        form={form}
        layout="vertical"
        name="form_in_modal"
        initialValues={{ name: value, link }}
      >
        <Form.Item
          name="name"
          label="标题"
          rules={[{ required: true, message: '输入名称!' }]}
        >
          <Input placeholder="输入名称" />
        </Form.Item>
        <Form.Item name="link" label="关联" rules={[{ required: true, message: '选择关联!' }]}>
          <Select placeholder="选择关联" style={{ width: '100%' }}>
            <Option value="id">idid</Option>
            <Option value="id1">id1</Option>
            <Option value="id2">id2</Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};
SetModal.propTypes = {
  handleCancelModal: PropTypes.func,
  handleCallback: PropTypes.func,
  el: PropTypes.object,
};

export default class BpmnPage extends PureComponent {

  state = {
    scale: 1, // 流程图比例
    modalVisible: false,
    choosedEl: {},
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
        camunda: camundaModdleDescriptor,
        qa: qaPackage
      }
    });
    this.initDiagram(xmlData);
  }

  // '<?xml version="1.0" encoding="UTF-8"?><bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" id="Definitions_06armuw" targetNamespace="http://bpmn.io/schema/bpmn" exporter="bpmn-js (https://demo.bpmn.io)" exporterVersion="7.0.0"><bpmn:collaboration id="Collaboration_0jiv3ag"><bpmn:participant id="Participant_16bft7w" processRef="Process_1" /></bpmn:collaboration><bpmn:process id="Process_1" /><bpmndi:BPMNDiagram id="BPMNDiagram_1"><bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Collaboration_0jiv3ag"><bpmndi:BPMNShape id="Participant_16bft7w_di" bpmnElement="Participant_16bft7w" isHorizontal="true"><dc:Bounds x="250" y="30" width="410" height="140" /></bpmndi:BPMNShape></bpmndi:BPMNPlane></bpmndi:BPMNDiagram></bpmn:definitions>'
  initDiagram = async (xml, first = true) => {
    try {
      await this.bpmnModeler.importXML(xml);
      this.addToolTitle();
      this.setNodeColor();
      this.changeClassName();
      if (first) this.addEventBusListener();
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
    this.setState({ modalVisible: false });
    if (link) this.setSigleNodeColor(el)
  }
  
  addEventBusListener = () => {
    // 监听 element
    const eventBus = this.bpmnModeler.get('eventBus')
    const eventTypes = ['element.click', 'element.dblclick', 'element.changed', 'element.updateLabel', 'shape.added', 'shape.removed']
    eventTypes.forEach((eventType) => {
      eventBus.on(eventType, (e) => {
        console.log(eventType, e.element.type, e)
        if (!e || e.element.type === 'bpmn:Process') return
        if (eventType === 'shape.added') {
          if (e.element.type === 'bpmn:Task') {
            if ((!e.element.businessObject || !e.element.businessObject.$attrs.link_id)) { // 回退新增，新增触发
              this.setState({ modalVisible: true, choosedEl: e.element  });
            }
          }
          return;
        }
        if (eventType === 'shape.removed') {
          return;
        }
        if (eventType === 'element.changed') {
          // that.elementChanged(e)
          if (e.element.type === 'bpmn:Task') {
            // this.setState({ modalVisible: true, choosedEl: e.element  });
          }
        } else if (eventType === 'element.click') {
          console.log('点击了element', e)
          // if (e.element.type === 'bpmn:Task') {
          //   console.log(e.element.businessObject)
          // const modeling = this.bpmnModeler.get('modeling');
          //   modeling.updateProperties(e.element, {
          //     name: '我是修改后的Task名称',
          //     link_id: 'task'
          //   });
          // modeling.setColor(e.element, {
          //   stroke: 'yellow',
          //   fill: 'blue',
          //   strokeWidth: 1,
          // });
          //   if (!e.element.businessObject.$attrs.link_id) {
          //     this.setState({ modalVisible: true, choosedEl: e.element  });
          //   }
          //   this.setState({ modalVisible: true, choosedEl: e.element });
          // }
          // 创建一个BPMN element , 并且载入到导出的xml里
          // const modeling = this.bpmnModeler.get('modeling');
          // const extensionElements = this.bpmnModeler.get('moddle').create('bpmn:ExtensionElements', {
          //   body: '${ value > 100 }'
          // });
          // extensionElements.values = [];
          // modeling.updateProperties(e.element, {
          //   extensionElements
          // });
          // const elementRegistry = this.bpmnModeler.get('elementRegistry');
          // const parent = elementRegistry.get('Activity_0igoslw')
          const parent = e.element
          // const extensionElements = this.bpmnModeler.get('bpmnFactory').create("bpmn:ExtensionElements")
          // parent.businessObject.extensionElements = extensionElements;

          const bpmnFactory = this.bpmnModeler.get('bpmnFactory');
          const elCom = elementHelper.createElement("qa:Comment", { text: 'hwoolo', author: "sj" }, parent, bpmnFactory)
          const el = elementHelper.createElement("qa:AnalysisDetails", { name: 'haha', body: 'helo', comments: [elCom]  }, parent, bpmnFactory)
          // const elele = this.bpmnModeler.get('bpmnFactory').create("qa:AnalyzedNode")
          if (!parent.businessObject.extensionElements) {
            // parent.businessObject.extensionElements.values = []
            const modeling = this.bpmnModeler.get('modeling');
            const extensionElements = this.bpmnModeler.get('moddle').create('bpmn:ExtensionElements', {
              // eslint-disable-next-line no-template-curly-in-string
              body: "${ value > 100 }"
            });
            // 设置更新
            modeling.updateProperties(e.element, {
              extensionElements
            });
          }
          parent.businessObject.extensionElements.values.push(el);
          // console.log(el, elele)
          // const son = elementHelper.createElement("qa:AnalysisDetails", { name: 'son', id: 'qa_son', body: 'helo son' }, el, this.bpmnModeler.get('bpmnFactory'))
          // el.businessObject.documentation.push(son);
          // console.log('son', son)
          console.log('getExtension', this.getExtension(e.element, 'qa:AnalysisDetails'))
        } else if (eventType === 'element.dblclick' && e.element.type === 'bpmn:Task') {
          this.setState({ modalVisible: true, choosedEl: e.element });
        } else if (eventType === 'element.updateLabel') {
          console.log('element.updateLabel', e.element)
        }
      })
    })
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

  // json解析
  handleParseJson = () => {
    this.bpmnModeler.clear();
    const xml = JsonToString();
    console.log(xml)
    this.initDiagram(xml, false);
  }

  // 流程图放大缩小
  handleZoom = radio => {
    const { scale } = this.state;
    const newScale = !radio
      ? 1.0 // 不输入radio则还原
      : scale + radio <= 0.2 // 最小缩小倍数
        ? 0.2
        : scale + radio;

    this.bpmnModeler.get('canvas').zoom(newScale);
    this.setState({
      scale: newScale,
    });
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
    const { modalVisible, choosedEl } = this.state;
    return (
      <div style={{ padding: '10px' }}>
        <div>
          <Button  onClick={this.handleRedo}>前进</Button>
          <Button  onClick={this.handleUndo}>后退</Button>
          <Button  onClick={this.handleClear}>清空</Button>
          <Button  onClick={() => this.handleZoom(0.1)}>放大</Button>
          <Button  onClick={() => this.handleZoom(-0.1)}>缩小</Button>
          <Button  onClick={this.handleZoom}>重置大小</Button>
          <Button  onClick={this.handleSave}>保存</Button>
          <Button  onClick={this.handleDownloadSvg}>下载 SVG</Button>
          <Button  onClick={this.handleDownloadXml}>下载 XML</Button>
          <Button  onClick={this.handleParseJson}>数据解析</Button>
        </div>
        <div style={{ width: '100%', height: '400px', border: '1px solid #4885ed', overflow: 'scroll' }} id="js-canvas">
        </div>
        <div id="js-properties-panel" style={{ position: 'absolute', right: '0', top: '0', width: '300px' }}></div>
        {
          modalVisible && <SetModal
            el={choosedEl}
            handleCancelModal={() => {
              // const modeling = this.bpmnModeler.get('modeling');
              // const elementRegistry = this.bpmnModeler.get('elementRegistry');
              // const ele = elementRegistry.get(this.state.choosedEl.id)
              // modeling.updateProperties(ele, {});
              this.setState({ modalVisible: false })
              // 弹框移除取消选中状态
              $('.djs-direct-editing-parent').remove();
              $("div").removeClass("djs-label-hidden");
              $("g").removeClass("djs-label-hidden");
            }}
            handleCallback={this.handleChangeEl}
          />
        }
      </div>
    )
  }
}