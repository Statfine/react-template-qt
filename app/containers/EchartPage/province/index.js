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
      visualMap: {
        // type:"piecewise",
        // show: true,
        // min: 0, // 指定 visualMapContinuous 组件的允许的最小值。'min' 必须用户指定。[visualMap.min, visualMax.max] 形成了视觉映射的『定义域』。
        // max: 300, // 指定 visualMapContinuous 组件的允许的最大值
        // text: ['High', 'Low'], // 两端的文本，如 ['High', 'Low'] 如例子：http://www.echartsjs.com/gallery/editor.html?c=doc-example/map-visualMap-continuous-text&edit=1&reset=1
        // realtime: false, // 拖拽时，是否实时更新。
        // calculable: false, // 是否显示拖拽用的手柄（手柄能拖拽调整选中范围）。
        // hoverLink: false, // 打开 hoverLink 功能时，鼠标悬浮到 visualMap 组件上时，鼠标位置对应的数值 在 图表中对应的图形元素，会高亮。
        top: 'bottom',
        left: 10,
        splitNumber: 6,
        seriesIndex: [0],
        itemWidth: 20, // 每个图元的宽度
        itemGap: 2, // 每两个图元之间的间隔距离，单位为px
        outOfRange: {
          //不在范围内颜色
          color: ['#4885ed'],
        },
        pieces: [
          // 自定义每一段的范围，以及每一段的文字
          { gte: 300, label: '10000人以上', color: '#80291f' }, // 不指定 max，表示 max 为无限大（Infinity）。
          { gte: 200, lte: 299, label: '1000-9999人', color: '#ad4d3b' },
          { gte: 100, lte: 200, label: '500-999人', color: '#d35e46' },
          { gte: 50, lte: 100, label: '100-499人', color: '#f58443' },
          { gte: 20, lte: 50, label: '10-99人', color: '#fec35f' },
          { lte: 20, label: '1-9人', color: '#fff9bd' }, // 不指定 min，表示 min 为无限大（-Infinity）。
        ],
        textStyle: {
          color: '#737373',
        },
      },
      // 鼠标悬浮提示信息
      tooltip: {
        trigger: 'item',
        formatter: params => {
          console.log(params);
          return `${params.name}:${params.value}`;
        },
      },
      series: [
        {
          type: 'map',
          map: 'china',
          // itemStyle: {
          //   normal: { label: { show: true } },
          //   emphasis: { label: { show: true } },
          // },
          itemStyle: {
            normal: {
              borderColor: '#e3e3e3',
              borderWidth: 1,
              label: { show: true },
            },
            emphasis: { label: { show: true } },
          },
          data: [
            { name: '北京', value: 120 },
            { name: '天津', value: 120 },
            { name: '上海', value: 80 },
            { name: '重庆', value: 100 },
            { name: '河北', value: 100 },
            { name: '河南', value: 100 },
            { name: '云南', value: 40 },
            { name: '辽宁', value: 120 },
            { name: '黑龙江', value: 100 },
            { name: '湖南', value: 80 },
            { name: '安徽', value: 80 },
            { name: '山东', value: 100 },
            { name: '新疆', value: 40 },
            { name: '江苏', value: 80 },
            { name: '浙江', value: 60 },
            { name: '江西', value: 80 },
            { name: '湖北', value: 100 },
            { name: '广西', value: 40 },
            { name: '甘肃', value: 120 },
            { name: '山西', value: 120 },
            { name: '内蒙古', value: 140 },
            { name: '陕西', value: 120 },
            { name: '吉林', value: 120 },
            { name: '福建', value: 60 },
            { name: '贵州', value: 80 },
            { name: '广东', value: 40 },
            { name: '青海', value: 100 },
            { name: '西藏', value: 40 },
            { name: '四川', value: 80 },
            { name: '宁夏', value: 140 },
            { name: '海南', value: 20 },
            { name: '台湾', value: 40 },
            { name: '香港', value: 20 },
            { name: '澳门', value: 20 },
            { name: '南海诸岛', value: 20 },
          ],
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
      // backgroundColor: '#404a59',
      title: {
        text: city,
        // subtext: '数据纯属虚构',
        left: 'center',
        textStyle: {
          color: '#4885ed',
        },
      },
      // 鼠标悬浮提示信息
      tooltip: {
        trigger: 'item',
        formatter: params => {
          console.log(params);
        },
      },
      visualMap: {
        top: 'bottom',
        left: 10,
        splitNumber: 6,
        seriesIndex: [0],
        itemWidth: 20, // 每个图元的宽度
        itemGap: 2, // 每两个图元之间的间隔距离，单位为px
        outOfRange: {
          //不在范围内颜色
          color: ['#4885ed'],
        },
        // show: true,
        // min: 0, // 指定 visualMapContinuous 组件的允许的最小值。'min' 必须用户指定。[visualMap.min, visualMax.max] 形成了视觉映射的『定义域』。
        // max: 100, // 指定 visualMapContinuous 组件的允许的最大值
        // text: ['High', 'Low'], // 两端的文本，如 ['High', 'Low'] 如例子：http://www.echartsjs.com/gallery/editor.html?c=doc-example/map-visualMap-continuous-text&edit=1&reset=1
        // realtime: false, // 拖拽时，是否实时更新。
        // calculable: false, // 是否显示拖拽用的手柄（手柄能拖拽调整选中范围）。
        // hoverLink: false, // 打开 hoverLink 功能时，鼠标悬浮到 visualMap 组件上时，鼠标位置对应的数值 在 图表中对应的图形元素，会高亮。
        // inRange: {
        //   // inRange (object)定义 在选中范围中 的视觉元素。（用户可以和 visualMap 组件交互，用鼠标或触摸选择范围）1、symbol: 图元的图形类别。2、symbolSize: 图元的大小。3、color: 图元的颜色。4、colorAlpha: 图元的颜色的透明度。5、opacity: 图元以及其附属物（如文字标签）的透明度。6、
        //   color: ['#fff9bd', '#fec35f', '#f58443', '#d35e46', '#ad4d3b', '#80291f'],
        // },
        pieces: [
          // 自定义每一段的范围，以及每一段的文字
          { gte: 100, label: '10000人以上', color: '#80291f' }, // 不指定 max，表示 max 为无限大（Infinity）。
          { gte: 50, lte: 99, label: '1000-9999人', color: '#ad4d3b' },
          { gte: 40, lte: 49, label: '500-999人', color: '#d35e46' },
          { gte: 30, lte: 39, label: '100-499人', color: '#f58443' },
          { gte: 20, lte: 29, label: '10-99人', color: '#fec35f' },
          { lte: 19, label: '1-9人', color: '#fff9bd' }, // 不指定 min，表示 min 为无限大（-Infinity）。
        ],
      },
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
          data: [
            { name: '郑州市', value: 9 },
            { name: '开封市', value: 6 },
            { name: '洛阳市', value: 5 },
            { name: '平顶山市', value: 7 },
            { name: '安阳市', value: 2 },
            { name: '鹤壁市', value: 35 },
            { name: '新乡市', value: 26 },
            { name: '焦作市', value: 62 },
            { name: '濮阳市', value: 82 },
            { name: '许昌市', value: 56 },
            { name: '漯河市', value: 24 },
            { name: '三门峡市', value: 32 },
            { name: '南阳市', value: 29 },
            { name: '商丘市', value: 42 },
            { name: '信阳市', value: 22 },
            { name: '周口市', value: 12 },
            { name: '驻马店市', value: 42 },
            { name: '济源市', value: 5 },
          ],
        },
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
