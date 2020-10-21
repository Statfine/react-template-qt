import React, { useRef } from 'react';
import { Col, Menu, Row } from 'antd';
/*eslint-disable*/
/**
 * GGEditor       编辑器主控
 * Flow           流程图
 */
import GGEditor, {
  Command,
  constants,
  ContextMenu,
  EditableLabel,
  Flow,
  Item,
  ItemPanel,
  RegisterNode,
  setAnchorPointsState,
} from 'shaojia-gg-editor';

import Toolbar from './Toolbar';
import './style.scss';
import { CanvasPanel, EdgePanel, MultiPanel, NodePanel } from './Detailpanel';
import { ItemDiv, CircleItemDiv, TaskItemDiv, DiamondItemDiv } from './styled';

const { EditorCommand } = constants;

const data = {
  nodes: [
    // {
    //   id: '0',
    //   label: 'Node',
    //   x: 55,
    //   y: 55
    // },
    // {
    //   id: '1',
    //   label: 'Node',
    //   x: 55,
    //   y: 255
    // }
  ],
  edges: [
    // {
    //   label: 'Label',
    //   source: '0',
    //   target: '1'
    // }
  ]
};

function GGedit() {
  const editorRef = useRef();

  React.useEffect(() => {
    document.onselectstart = function(){return false;};
    setTimeout(() => {
      editorRef.current.state.graph.on(constants.GraphNodeEvent.onNodeClick, (graphEvent) => {
        console.log(graphEvent.item.getModel());
      });
    }, 0);
  }, [])

  return (
    <div className="app">
      <GGEditor ref={editorRef} className="editor">
        {/* 工具栏 */}
        <Row>
          <Col span={24}>
            <Toolbar />
          </Col>
        </Row>
        {/* 元素面板 + 画布 + 详情面板 */}
        <Row>
          {/* 元素面板 */}
          <Col flex="160px">
            {/* 自定义：写法一，源码添加circle实现锚点 */}
            <ItemPanel className="itempanel">
              <Item
                key="1"
                model={{
                  type: 'bizCircleNode',
                  size: 60,
                  label: '开始',
                }}
              >
                <ItemDiv draggable={false}>
                  <CircleItemDiv draggable={false}>起点</CircleItemDiv>
                </ItemDiv>
              </Item>
              <Item
                key="2"
                model={{
                  type: 'customNode',
                  size: 60,
                  label: '结束',
                  style: {
                    fill: '#fff',
                    stroke: '#000'
                  }
                }}
              >
                <ItemDiv>
                  <CircleItemDiv flag="end">结束</CircleItemDiv>
                </ItemDiv>
              </Item>
              <Item
                key="3"
                model={{
                  type: 'bizFlowNode',
                  size: [120, 80],
                  label: 'Service Task',
                }}
              >
                <ItemDiv>
                  <TaskItemDiv>Service Task</TaskItemDiv>
                </ItemDiv>
              </Item>
              <Item
                key="4"
                model={{
                  type: 'bizFlowNode',
                  size: [120, 80],
                  label: 'Send Task',
                }}
              >
                <ItemDiv>
                  <TaskItemDiv>Send Task</TaskItemDiv>
                </ItemDiv>
              </Item>
              <Item
                key="5"
                model={{
                  type: 'customDiamondNode',
                  size: [80, 80],
                  label: '网关1',
                }}
              >
                <ItemDiv>
                  <DiamondItemDiv><p>网关1</p></DiamondItemDiv>
                </ItemDiv>
              </Item>
              <Item
                key="6"
                model={{
                  type: 'image',
                  size: [80, 80],
                  label: '网关1',
                  img: "https://yyb.gtimg.com/aiplat/page/product/visionimgidy/img/demo6-16a47e5d31.jpg?max_age=31536000"
                }}
              >
                <ItemDiv>
                  <DiamondItemDiv><p>网关1</p></DiamondItemDiv>
                </ItemDiv>
              </Item>
              {/* 自定义：写法一，实现层添加circle实现锚点 */}
              <RegisterNode
                name="customNode"
                extend="circle"
                config={{
                  setState(name, value, item) {
                    setAnchorPointsState.call(
                      this,
                      name,
                      value,
                      item,
                      (item, anchorPoint) => {
                        const { width, height } = item.getKeyShape().getBBox();
                
                        const [x, y] = anchorPoint;
                
                        return {
                          x: width * x - width / 2,
                          y: height * y - height / 2,
                        };
                      },
                      (item, anchorPoint) => {
                        const { width, height } = item.getKeyShape().getBBox();
                
                        const [x, y] = anchorPoint;
                
                        return {
                          x: width * x - width / 2,
                          y: height * y - height / 2,
                        };
                      },
                    );
                  },
                  getAnchorPoints() {
                    return [
                      [0.5, 0],
                      [0.5, 1],
                      [0, 0.5],
                      [1, 0.5],
                    ];
                  },
                }}
              />
              {/* 自定义：写法一，实现层添加circle实现锚点 */}
              <RegisterNode
                name="customDiamondNode"
                extend="diamond"
                config={{
                  setState(name, value, item) {
                    setAnchorPointsState.call(
                      this,
                      name,
                      value,
                      item,
                      (item, anchorPoint) => {
                        const { width, height } = item.getKeyShape().getBBox();
                
                        const [x, y] = anchorPoint;
                
                        return {
                          x: width * x - width / 2,
                          y: height * y - height / 2,
                        };
                      },
                      (item, anchorPoint) => {
                        const { width, height } = item.getKeyShape().getBBox();
                
                        const [x, y] = anchorPoint;
                
                        return {
                          x: width * x - width / 2,
                          y: height * y - height / 2,
                        };
                      },
                    );
                  },
                  getAnchorPoints() {
                    return [
                      [0.5, 0],
                      [0.5, 1],
                      [0, 0.5],
                      [1, 0.5],
                    ];
                  },
                }}
              />
            </ItemPanel>
          </Col>
          {/* 画布 */}
          <Col flex="auto">
            <div style={{ position: 'relative' }}>
              <Flow
                className="flow"
                data={data}
                graphConfig={{
                  defaultNode: {
                    type: 'bizFlowNode',
                  },
                  defaultEdge: {
                    type: 'bizFlowEdge',
                  },
                }}
              />
            </div>
          </Col>
          {/* 详情面板 */}
          <Col flex="300px">
            <div className="detailpanel">
              <NodePanel />
              <EdgePanel />
              <MultiPanel />
              <CanvasPanel />
            </div>
          </Col>
        </Row>
        {/* 标签编辑 */}
        <EditableLabel />
        {/* 右键菜单 */}
        <div className="contextmenu">
          <ContextMenu
            type="canvas"
            renderContent={(item, position, hide) => {
              const { x: left, y: top } = position;
              return (
                <div style={{ position: 'absolute', top, left }}>
                  <Menu mode="vertical" selectable={false} onClick={hide}>
                    <Menu.Item>
                      <Command name={EditorCommand.Undo}>撤销</Command>
                    </Menu.Item>
                    <Menu.Item>
                      <Command name={EditorCommand.Redo}>重做</Command>
                    </Menu.Item>
                    <Menu.Item>
                      <Command name={EditorCommand.PasteHere}>粘贴</Command>
                    </Menu.Item>
                  </Menu>
                </div>
              );
            }}
          />
          <ContextMenu
            type="node"
            renderContent={(item, position, hide) => {
              const { x: left, y: top } = position;
              return (
                <div style={{ position: 'absolute', top, left }}>
                  <Menu mode="vertical" selectable={false} onClick={hide}>
                    <Menu.Item>
                      <Command name={EditorCommand.Copy}>复制</Command>
                    </Menu.Item>
                    <Menu.Item>
                      <Command name={EditorCommand.Remove}>删除</Command>
                    </Menu.Item>
                  </Menu>
                </div>
              );
            }}
          />
          <ContextMenu
            type="edge"
            renderContent={(item, position, hide) => {
              const { x: left, y: top } = position;
              return (
                <div style={{ position: 'absolute', top, left }}>
                  <Menu mode="vertical" selectable={false} onClick={hide}>
                    <Menu.Item>
                      <Command name={EditorCommand.Remove}>删除</Command>
                    </Menu.Item>
                  </Menu>
                </div>
              );
            }}
          />
        </div>
      </GGEditor>
    </div>
  );
}

export default GGedit;
