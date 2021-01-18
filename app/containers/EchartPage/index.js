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

import { geoCoordMap, KMData } from './data';

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

const planePath = 'arrow';
const color = ['#a6c84c', '#ffa022', '#46bee9'];

export default class EchartPage extends PureComponent {
  myChart;

  componentDidMount() {
    this.myChart = echarts.init(document.getElementById('main'));
    // this.myChart.setOption({
    //   series: [
    //     {
    //       type: 'map',
    //       map: 'china',
    //     },
    //   ],
    // });
    this.initData();
  }

  // initData = () => {
  //   const series = [];
  //   [['昆明', KMData]].forEach(function(item, i) {
  //     series.push(
  //       // 线
  //       {
  //         name: item[0],
  //         type: 'lines',
  //         zlevel: 2,
  //         // effect: {
  //         //   show: true,
  //         //   period: 10,
  //         //   trailLength: 0,
  //         //   symbol: planePath,
  //         //   symbolSize: 15,
  //         // },
  //         symbol: planePath,
  //         lineStyle: {
  //           normal: {
  //             color: color[i],
  //             width: 1,
  //             opacity: 0.4,
  //             curveness: 0.2,
  //           },
  //         },
  //         data: convertData(item[1]),
  //       },
  //       {
  //         name: item[0],
  //         type: 'effectScatter',
  //         coordinateSystem: 'geo',
  //         zlevel: 2,
  //         rippleEffect: {
  //           brushType: 'stroke',
  //         },
  //         label: {
  //           normal: {
  //             show: true,
  //             position: 'right',
  //             formatter: '{b}',
  //           },
  //         },
  //         symbolSize: 10,
  //         itemStyle: {
  //           normal: {
  //             color: color[i],
  //           },
  //         },
  //         data: item[1].map(function(dataItem) {
  //           return {
  //             name: dataItem[1].name,
  //             value: geoCoordMap[dataItem[1].name].concat([dataItem[1].value]),
  //           };
  //         }),
  //       },
  //     );
  //   });

  //   const option = {
  //     backgroundColor: '#404a59',
  //     title: {
  //       text: '2017-2020年出差情况',
  //       //subtext: '数据纯属虚构',
  //       left: 'center',
  //       textStyle: {
  //         color: '#fff',
  //       },
  //     },
  //     /*
  //   tooltip : {
  //       trigger: 'item',
  //       formatter:function(params, ticket, callback){
  //           console.log(params);
  //           if(params.seriesType=="effectScatter") {
  //               return params.data.name+""+params.data.value[2];
  //           }else{
  //               return params.name;
  //           }
  //       }
  //   },
  //   */
  //     tooltip: {
  //       trigger: 'item',
  //       formatter: function(params, ticket, callback) {
  //         console.log(params);
  //         if (params.seriesType == 'effectScatter') {
  //           return params.data.name + '' + params.data.value[2];
  //         } else if (params.seriesType == 'lines') {
  //           return (
  //             params.data.fromName +
  //             '->' +
  //             params.data.toName +
  //             '<br />' +
  //             params.data.value
  //           );
  //         } else {
  //           return params.name;
  //         }
  //       },
  //     },
  //     legend: {
  //       orient: 'vertical',
  //       top: 'bottom',
  //       left: 'right',
  //       data: ['昆明'],
  //       textStyle: {
  //         color: '#fff',
  //       },
  //       selectedMode: 'single',
  //     },
  //     geo: {
  //       map: 'china',
  //       label: {
  //         emphasis: {
  //           show: false,
  //         },
  //       },
  //       roam: true,
  //       itemStyle: {
  //         normal: {
  //           areaColor: '#323c48',
  //           borderColor: '#404a59',
  //         },
  //         emphasis: {
  //           areaColor: '#2a333d',
  //         },
  //       },
  //     },
  //     series,
  //   };
  //   this.myChart.setOption(option);
  // };

  initData = () => {
    const series = [];
    [[KMData]].forEach(function(item, i) {
      series.push(
        // 线
        {
          name: '昆明', // legend 对应
          type: 'lines',
          zlevel: 3,
          // effect: {
          //   show: true,
          //   period: 10,
          //   trailLength: 0,
          //   symbol: planePath,
          //   symbolSize: 15,
          // },
          lineStyle: {
            normal: {
              color: '#ffa022',
              width: 1,
              opacity: 0.4,
              curveness: 0.2,
            },
          },
          symbol: planePath, // 箭头
          data: convertData(item[0]),
        },

        // 点
        {
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
              color: color[i],
            },
          },
          data: item[0].map(function(dataItem) {
            return {
              // 用于提及显示
              name: dataItem[1].name,
              value: geoCoordMap[dataItem[1].name].concat([dataItem[1].value]),
            };
          }),
        },
      );
    });

    const option = {
      backgroundColor: '#404a59',
      title: {
        text: '2017-2020年出差情况',
        // subtext: '数据纯属虚构',
        left: 'center',
        textStyle: {
          color: '#fff',
        },
      },
      tooltip: {
        trigger: 'item',
        formatter: (params, ticket, callback) => {
          console.log(params);
          if (params.seriesType === 'effectScatter') {
            return `${params.data.name}${params.data.value[2]}`;
          }
          if (params.seriesType === 'lines') {
            return (
              params.data.fromName +
              '->' +
              params.data.toName +
              '<br />' +
              params.data.value
            );
          }
          return params.name;
        },
      },
      legend: {
        orient: 'vertical',
        top: 'bottom',
        left: 'right',
        data: ['昆明'],
        textStyle: {
          color: '#fff',
        },
        selectedMode: 'single',
      },
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
  };

  render() {
    return (
      <div>
        <div id="main" style={{ width: 1000, height: 1000 }} />
      </div>
    );
  }
}
