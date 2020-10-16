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

import { mapData } from './data';

function converNewData(data) {
  let res = [];
  for (let i = 0; i < data.length; i += 1) {
    if (data[i].lines) res = res.concat(data[i].lines);
  }
  return res;
}

// const planePath = ['null', 'arrow'];
const planePath =
  'path://M1705.06,1318.313v-89.254l-319.9-221.799l0.073-208.063c0.521-84.662-26.629-121.796-63.961-121.491c-37.332-0.305-64.482,36.829-63.961,121.491l0.073,208.063l-319.9,221.799v89.254l330.343-157.288l12.238,241.308l-134.449,92.931l0.531,42.034l175.125-42.917l175.125,42.917l0.531-42.034l-134.449-92.931l12.238-241.308L1705.06,1318.313z';
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

  fullRef;

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
        // symbol: planePath, // 箭头
        effect: {
          // 特效
          show: true,
          period: 4, // 特效时间
          trailLength: 0,
          symbol: planePath,
          symbolSize: 15,
        },
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
          console.log('点');
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
    let series = [];
    series = series
      .concat(this.setPointAndLine('供应商', mapData.provider))
      .concat(this.setPointAndLine('RDF', mapData.rdf))
      .concat(this.setPointAndLine('FDC', mapData.fdc));

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
        formatter: params => {
          console.log(params);
          if (params.seriesType === 'effectScatter') {
            return `${params.data.name}<br />key:null<br/>key: null`;
          }
          if (params.seriesType === 'lines') {
            return `${params.data.fromName}->${params.data.toName}<br />运输`;
          }
          return params.name;
          // setTimeout(function (){
          //   // 仅为了模拟异步回调
          //   callback(ticket, `${params.data.name}<br />key:null<br/>key: null<br />`);
          // }, 3000)
          // if (params.seriesType === "effectScatter" && (!pointInfoLoadingRef.current || pointInfoLoadingRef.current !== params.data.name)) {
          //   pointInfoLoadingRef.current = params.data.name;
          //   axios.get('http://jsonplaceholder.typicode.com/comments').then(res => {
          //     callback(ticket, `${params.data.name}<br />key:null<br/>key: null<br />`);
          //   }).catch(err => {
          //     console.log(err);
          //     pointInfoLoadingRef.current = null;
          //   })
          // }
          // return "Loading";
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
      toolbox: {
        show: true,
        feature: {
          myFull: {
            show: true,
            title: `${this.fullRef ? '退出全屏' : '全屏展示'}`,
            icon: `${
              this.fullRef
                ? 'path://M745.12399 745.104035l185.747471 0c16.093537 0 29.283953-13.135158 29.283953-29.321816 0-16.303314-13.114692-29.323862-29.283953-29.323862L715.764312 686.458357c-8.037047 0-15.34857 3.28379-20.656459 8.591679-5.383614 5.306866-8.628518 12.617365-8.628518 20.694321l0 215.106126c0 16.07307 13.134135 29.283953 29.321816 29.283953 16.303314 0 29.321816-13.114692 29.321816-29.283953L745.122967 745.104035zM275.966751 745.104035l-185.747471 0c-16.093537 0-29.283953-13.135158-29.283953-29.321816 0-16.303314 13.114692-29.323862 29.283953-29.323862l215.107149 0c8.037047 0 15.34857 3.28379 20.656459 8.591679 5.383614 5.306866 8.628518 12.617365 8.628518 20.694321l0 215.106126c0 16.07307-13.133112 29.283953-29.321816 29.283953-16.303314 0-29.321816-13.114692-29.321816-29.283953L275.967774 745.104035zM745.12399 275.945773l185.747471 0c16.093537 0 29.283953 13.134135 29.283953 29.322839 0 16.303314-13.114692 29.321816-29.283953 29.321816L715.764312 334.590428c-8.037047 0-15.34857-3.282766-20.656459-8.590656-5.383614-5.306866-8.628518-12.618389-8.628518-20.693298L686.479335 90.199325c0-16.074094 13.134135-29.283953 29.321816-29.283953 16.303314 0 29.321816 13.114692 29.321816 29.283953L745.122967 275.945773zM275.966751 275.945773l-185.747471 0c-16.093537 0-29.283953 13.134135-29.283953 29.322839 0 16.303314 13.114692 29.321816 29.283953 29.321816l215.107149 0c8.037047 0 15.34857-3.282766 20.656459-8.590656 5.383614-5.306866 8.628518-12.618389 8.628518-20.693298L334.611405 90.199325c0-16.074094-13.133112-29.283953-29.321816-29.283953-16.303314 0-29.321816 13.114692-29.321816 29.283953L275.967774 275.945773z'
                : 'path://M119.579981 119.560026l185.746448 0c16.074094 0 29.283953-13.134135 29.283953-29.322839 0-16.303314-13.113669-29.321816-29.283953-29.321816l-215.107149 0c-8.037047 0-15.34857 3.282766-20.655436 8.590656-5.383614 5.307889-8.629541 12.619412-8.629541 20.694321L60.934303 305.306474c0 16.074094 13.134135 29.283953 29.321816 29.283953 16.303314 0 29.322839-13.114692 29.322839-29.283953L119.578957 119.560026zM901.51076 119.560026 715.764312 119.560026c-16.093537 0-29.283953-13.134135-29.283953-29.322839 0-16.303314 13.114692-29.321816 29.283953-29.321816l215.107149 0c8.037047 0 15.34857 3.282766 20.655436 8.590656 5.384637 5.307889 8.629541 12.619412 8.629541 20.694321L960.156438 305.306474c0 16.074094-13.134135 29.283953-29.321816 29.283953-16.303314 0-29.322839-13.114692-29.322839-29.283953L901.511783 119.560026zM119.579981 901.489782l185.746448 0c16.074094 0 29.283953 13.133112 29.283953 29.321816 0 16.303314-13.113669 29.321816-29.283953 29.321816l-215.107149 0c-8.037047 0-15.34857-3.28379-20.655436-8.590656-5.383614-5.306866-8.629541-12.619412-8.629541-20.694321L60.934303 715.744357c0-16.075117 13.134135-29.286 29.321816-29.286 16.303314 0 29.322839 13.114692 29.322839 29.286L119.578957 901.489782zM901.51076 901.489782 715.764312 901.489782c-16.093537 0-29.283953 13.133112-29.283953 29.321816 0 16.303314 13.114692 29.321816 29.283953 29.321816l215.107149 0c8.037047 0 15.34857-3.28379 20.655436-8.590656 5.384637-5.306866 8.629541-12.619412 8.629541-20.694321L960.156438 715.744357c0-16.075117-13.134135-29.286-29.321816-29.286-16.303314 0-29.322839 13.114692-29.322839 29.286L901.511783 901.489782z'
            }`,
            iconStyle: {
              borderColor: '#fff',
            },
            emphasis: {
              iconStyle: {
                borderColor: '#fff',
              },
            },
            onclick: () => {
              if (this.fullRef) {
                this.exitFullscreen();
                this.fullRef = false;
              } else {
                this.handleFullScreen();
                this.fullRef = true;
              }
              this.initData();
            },
          },
          restore: {
            // 配置项还原。
            show: true, // 是否显示该工具。
            title: '还原',
            iconStyle: {
              borderColor: '#fff',
            },
            emphasis: {
              iconStyle: {
                borderColor: '#fff',
              },
            },
          },
        },
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
    setTimeout(() => {
      this.myChart.resize();
    }, 200);
    return null;
  };

  exitFullscreen = () => {
    if(document.exitFullScreen) {
      document.exitFullScreen();
    } else if(document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if(document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if(document.msExitFullscreen) {
      document.msExitFullscreen();
    }
    setTimeout(() => {
      this.myChart.resize();
    }, 200);
  }

  handleRestore = () => {
    this.myChart.dispatchAction({
      type: 'restore'
    })
  }

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
