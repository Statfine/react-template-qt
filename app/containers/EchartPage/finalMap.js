/* eslint-disable */
/**
 * api https://echarts.apache.org/zh/option.html#geo.emphasis
 * demo https://gallery.echartsjs.com/editor.html?c=x4_ztBIf5u
 */
import React, { PureComponent } from 'react';

import echarts from 'echarts/lib/echarts';
import 'echarts/lib/chart/bar';
import 'echarts/lib/chart/line';
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/title';
import 'echarts/lib/component/geo';
import 'echarts/lib/component/legend';
import './china';

import { geoCoordMap, KMData, mapData } from './data';

function convertData(data) {
  const res = [];
  for (let i = 0; i < data.length; i += 1) {
    const dataItem = data[i];
    const fromCoord = geoCoordMap[dataItem[0].name];
    const toCoord = geoCoordMap[dataItem[1].name];
    if (fromCoord && toCoord) {
      res.push({
        fromName: dataItem[0].name,
        toName: dataItem[1].name,
        coords: [fromCoord, toCoord],
        value: dataItem[1].value,
      });
    }
  }
  return res;
}

function converNewData(data) {
  let res = [];
  for (let i = 0; i < data.length; i += 1) {
    if (data[i].lines) res = res.concat(data[i].lines);
  }
  return res;
}

const planePath = 'arrow';
const color = ['#a6c84c', '#ffa022', '#46bee9'];
const defaultConfig = {
  供应商: {
    name: '供应商',
    zlevel: 3,
    color: '#a6c84c',
    lineWidth: 3,
    symbolSize: 16,
  },
  RDF: {
    name: 'RDF',
    zlevel: 2,
    color: '#ffa022',
    lineWidth: 2,
    symbolSize: 10,
  },
  FDC: {
    name: 'FDC',
    zlevel: 1,
    color: '#46bee9',
    lineWidth: 1,
    symbolSize: 7,
  },
};

export default class EchartPage extends PureComponent {
  myChart;

  componentDidMount() {
    this.myChart = echarts.init(document.getElementById('main'));
    this.initData();
  }

  setPointAndLine = (role, data) => {
    const config = defaultConfig[role];
    const series = [];
    series.push(
      // 线
      {
        name: config.name, // legend 对应
        type: 'lines',
        zlevel: config.zlevel,
        lineStyle: {
          normal: {
            color: config.color,
            width: config.lineWidth,
            opacity: 0.8,
            curveness: 0.2,
          },
        },
        symbol: planePath, // 箭头
        data: converNewData(data),
      },
      // 点
      {
        name: config.name, // legend 对应
        type: 'effectScatter',
        coordinateSystem: 'geo',
        zlevel: config.zlevel,
        rippleEffect: {
          brushType: 'stroke',
        },
        label: {
          normal: {
            show: true,
            position: 'right',
            formatter: '{b}',
          },
        },
        symbolSize: config.symbolSize,
        itemStyle: {
          normal: {
            color: config.color,
          },
        },
        data: data.map(dataItem => {
          return {
            // 用于提及显示
            name: dataItem.name,
            value: dataItem.position,
            info: dataItem.infoData,
          };
        }),
      },
    );
    return series;
  };

  initData = () => {
    const series = [];
    // series = series.concat(this.setPointAndLine('供应商', mapData.provider));
    // series = series.concat(this.setPointAndLine('RDF', mapData.rdf));
    // series = series.concat(this.setPointAndLine('FDC', mapData.fdc));
    // // 供应商 点&线
    series.push(
      // 线
      {
        name: '供应商', // legend 对应
        type: 'lines',
        zlevel: 3,
        lineStyle: {
          normal: {
            color: color[0],
            width: 3,
            opacity: 0.8,
            curveness: 0.2,
          },
        },
        symbol: planePath, // 箭头
        data: converNewData(mapData.provider),
      },
      // 点
      {
        name: '供应商', // legend 对应
        type: 'effectScatter',
        coordinateSystem: 'geo',
        zlevel: 3,
        rippleEffect: {
          brushType: 'stroke',
        },
        label: {
          normal: {
            show: true,
            position: 'right',
            formatter: '{b}',
          },
        },
        symbolSize: 16,
        itemStyle: {
          normal: {
            color: color[0],
          },
        },
        data: mapData.provider.map(function (dataItem) {
          return {
            // 用于提及显示
            name: dataItem.name,
            value: dataItem.position,
            info: dataItem.infoData,
          };
        }),
      },
    );

    // RDF 点&线
    series.push(
      // 线
      {
        name: 'RDF', // legend 对应
        type: 'lines',
        zlevel: 2,
        lineStyle: {
          normal: {
            color: color[1],
            width: 1,
            opacity: 0.8,
            curveness: 0.2,
          },
        },
        symbol: planePath, // 箭头
        data: converNewData(mapData.rdf),
      },
      // 点
      {
        name: 'RDF', // legend 对应
        type: 'effectScatter',
        coordinateSystem: 'geo',
        zlevel: 2,
        rippleEffect: {
          brushType: 'stroke',
        },
        label: {
          normal: {
            show: true,
            position: 'right',
            formatter: '{b}',
          },
        },
        symbolSize: 10,
        itemStyle: {
          normal: {
            color: color[1],
          },
        },
        data: mapData.rdf.map(function (dataItem) {
          return {
            // 用于提及显示
            name: dataItem.name,
            value: dataItem.position,
            info: dataItem.infoData,
          };
        }),
      },
    );

    // FDC 点&线
    series.push(
      // 线
      {
        name: 'FDC', // legend 对应
        type: 'lines',
        zlevel: 2,
        lineStyle: {
          normal: {
            color: color[2],
            width: 1,
            opacity: 0.8,
            curveness: 0.2,
          },
        },
        symbol: planePath, // 箭头
      },
      // 点
      {
        name: 'FDC',
        type: 'effectScatter',
        coordinateSystem: 'geo',
        zlevel: 1,
        rippleEffect: {
          brushType: 'stroke',
        },
        label: {
          normal: {
            show: true,
            position: 'right',
            formatter: '{b}',
          },
        },
        symbolSize: 7,
        itemStyle: {
          normal: {
            color: color[2],
          },
        },
        data: mapData.fdc.map(function (dataItem) {
          return {
            // 用于提及显示
            name: dataItem.name,
            value: dataItem.position,
            info: dataItem.infoData,
          };
        }),
      },
    );

    const option = {
      backgroundColor: '#404a59',
      title: {
        text: '供应链产品-智慧库存',
        subtext: '全国数据',
        left: 'center',
        textStyle: {
          color: '#fff',
        },
      },

      // 鼠标悬浮提示信息
      tooltip: {
        trigger: 'item',
        formatter: (params, ticket, callback) => {
          console.log(params);
          if (params.seriesType === 'effectScatter') {
            return `${params.data.name}<br />key:null<br/>key: null`;
          }
          if (params.seriesType === 'lines') {
            return `${params.data.fromName}->${params.data.toName}<br />运输`;
          }
          return params.name;
        },
      },

      // 右下角提示
      legend: {
        orient: 'vertical',
        top: 'bottom',
        left: 'right',
        data: ['供应商', 'RDF', 'FDC'],
        textStyle: {
          color: '#fff',
        },
        // selectedMode: 'single',
      },

      // 地图
      geo: {
        map: 'china',
        label: {
          show: true, // 地图文字
          color: '#fff',
          emphasis: {
            // 高亮状态
            show: true,
            color: '#fff',
          },
        },
        roam: true,
        itemStyle: {
          normal: {
            areaColor: '#323c48',
            borderColor: '#404a59',
          },
          emphasis: {
            areaColor: '#2a333d',
          },
        },
      },
      series,
    };
    this.myChart.setOption(option);
    window.onresize = () => {
      this.myChart.resize();
    };
  };

  handleFullScreen = () => {
    const videoDom = document.getElementById('main');
    if (videoDom.requestFullscreen) {
      videoDom.requestFullscreen();
    } else if (videoDom.webkitRequestFullScreen) {
      videoDom.webkitRequestFullScreen();
    } else if (videoDom.mozRequestFullScreen) {
      videoDom.mozRequestFullScreen();
    } else {
      videoDom.msRequestFullscreen();
    }
    return null;
  };

  render() {
    return (
      <div style={{ width: '100%' }}>
        <div style={{ position: 'relative', width: '80%' }}>
          <div id="main" style={{ width: '100%', height: 700 }} />
          <div
            style={{
              position: 'absolute',
              bottom: 100,
              right: 10,
              color: '#fff',
              cursor: 'pointer',
            }}
            onClick={this.handleFullScreen}
          >
            全屏
          </div>
        </div>
      </div>
    );
  }
}
