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

import 'echarts/map/js/province/anhui';
import 'echarts/map/js/province/aomen';
import 'echarts/map/js/province/beijing';
import 'echarts/map/js/province/chongqing';
import 'echarts/map/js/province/fujian';
import 'echarts/map/js/province/gansu';
import 'echarts/map/js/province/guangdong';
import 'echarts/map/js/province/guangxi';
import 'echarts/map/js/province/guizhou';
import 'echarts/map/js/province/hainan';
import 'echarts/map/js/province/hebei';
import 'echarts/map/js/province/heilongjiang';
import 'echarts/map/js/province/henan';
import 'echarts/map/js/province/hubei';
import 'echarts/map/js/province/hunan';
import 'echarts/map/js/province/jiangsu';
import 'echarts/map/js/province/jiangxi';
import 'echarts/map/js/province/jilin';
import 'echarts/map/js/province/liaoning';
import 'echarts/map/js/province/neimenggu';
import 'echarts/map/js/province/ningxia';
import 'echarts/map/js/province/qinghai';
import 'echarts/map/js/province/shandong';
import 'echarts/map/js/province/shanghai';
import 'echarts/map/js/province/shanxi';
import 'echarts/map/js/province/shanxi1';
import 'echarts/map/js/province/sichuan';
import 'echarts/map/js/province/taiwan';
import 'echarts/map/js/province/tianjin';
import 'echarts/map/js/province/xianggang';
import 'echarts/map/js/province/xinjiang';
import 'echarts/map/js/province/xizang';
import 'echarts/map/js/province/yunnan';
import 'echarts/map/js/province/zhejiang';
import 'echarts/map/js/china';

export default class EchartPage extends PureComponent {
  myChart;

  componentDidMount() {
    this.myChart = echarts.init(document.getElementById('main'));
    this.initData();

    this.chinaChart = echarts.init(document.getElementById('china'));
    // 这种方式可以显示城市名称
    this.chinaChart.setOption({
      series: [
        {
          type: 'map',
          map: 'china',
          itemStyle: {
            normal: { label: { show: true } },
            emphasis: { label: { show: true } },
          },
        },
      ],
    });
    this.chinaChart.on('click', params => {
      const city = params.name;
      this.initData(city);
    });
  }

  initData = city => {
    const option = {
      backgroundColor: '#404a59',
      title: {
        text: city,
        // subtext: '数据纯属虚构',
        left: 'center',
        textStyle: {
          color: '#fff',
        },
      },
      // geo: {
      //   map: '湖北',
      //   type:'map',
      //   label: {
      //     show: true, // 地图文字
      //     color: '#fff',
      //     emphasis: { // 高亮状态
      //       show: true,
      //       color: '#fff',
      //     },
      //   },
      //   roam: true,
      //   itemStyle: {
      //     normal: {
      //       areaColor: '#323c48',
      //       borderColor: '#404a59',
      //     },
      //     emphasis: {
      //       areaColor: '#2a333d',
      //     },
      //   },
      // },
      // series,
      series: [
        {
          type: 'map',
          map: city,
          label: {
            show: true, // 地图文字
            color: '#fff',
            emphasis: {
              // 高亮状态
              show: true,
              color: '#fff',
            },
          },
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
        // {
        //   type: 'map',
        //   map: '甘肃',
        //   itemStyle:{
        //       normal:{label:{show:true}},
        //       emphasis:{label:{show:true}}
        //   }
        // }
      ],
    };
    this.myChart.setOption(option);
  };

  render() {
    return (
      <div style={{ display: 'flex' }}>
        <div id="china" style={{ flex: 1, height: 600 }} />
        <div id="main" style={{ flex: 1, height: 600 }} />
      </div>
    );
  }
}
