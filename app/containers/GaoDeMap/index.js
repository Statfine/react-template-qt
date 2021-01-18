/* eslint-disable no-undef */
import React, { PureComponent } from 'react';

export default class GaoDeMap extends PureComponent {
  componentDidMount() {
    const url =
      'https://webapi.amap.com/maps?v=1.4.15&key=97617fb9aa9d9c9d0bc1177a1a8ec396&plugin=AMap.DistrictSearch,AMap.Walking,AMap.Driving,AMap.Autocomplete';
    // const url = 'https://webapi.amap.com/maps?v=1.4.3&key=57cb86bf9a638d62199828d9c4f3c0de';
    const jsapi = document.createElement('script');
    jsapi.charset = 'utf-8';
    jsapi.src = url;
    document.head.appendChild(jsapi);
    // jsapi.onload = () => this.initLbs();
    jsapi.onload = () => this.init();
  }

  map;

  initLbs = () => {
    this.map = new AMap.Map('container', {
      zoom: 13, // 级别
      center: [-112.334238, 37.00708, 22.543673], // 中心点坐标
      vectorMapForeign: 'Local',
    });
  };

  init = () => {
    this.map = new AMap.Map('container', {
      zoom: 13, // 级别
      center: [114.059614, 22.543673], // 中心点坐标
      viewMode: '3D', // 使用3D视图
      // lang:'en',
    });
    this.map.on('click', this.handleMapClick);
    this.handleAddDefaultMark();

    this.handleDistrict('440304');
    // this.handleDistrict('440306');

    this.handleWalkPlan();

    AMap.plugin('AMap.ToolBar', () => {
      // 异步加载插件
      const toolbar = new AMap.ToolBar();
      this.map.addControl(toolbar);
    });
  };

  // 只显示特定区域
  handleShowPointAre = () => {
    new AMap.DistrictSearch({
      extensions: 'all',
      subdistrict: 0,
    }).search('福田区', (status, result) => {
      console.log(status, result);
      const outer = [
        new AMap.LngLat(-360, 90, true),
        new AMap.LngLat(-360, -90, true),
        new AMap.LngLat(360, -90, true),
        new AMap.LngLat(360, 90, true),
      ];
      const holes = result.districtList[0].boundaries;

      const pathArray = [outer];
      // eslint-disable-next-line prefer-spread
      pathArray.push.apply(pathArray, holes);
      const polygon = new AMap.Polygon({
        pathL: pathArray,
        // 线条颜色，使用16进制颜色代码赋值。默认值为#006600
        strokeColor: 'rgb(20,164,173)',
        strokeWeight: 4,
        // 轮廓线透明度，取值范围[0,1]，0表示完全透明，1表示不透明。默认为0.9
        strokeOpacity: 0.5,
        // 多边形填充颜色，使用16进制颜色代码赋值，如：#FFAA00
        fillColor: 'rgba(255, 255, 255)',
        // 多边形填充透明度，取值范围[0,1]，0表示完全透明，1表示不透明。默认为0.9
        fillOpacity: 1,
        // 轮廓线样式，实线:solid，虚线:dashed
        strokeStyle: 'solid',
        /* 勾勒形状轮廓的虚线和间隙的样式，此属性在strokeStyle 为dashed 时有效， 此属性在    
          ie9+浏览器有效 取值： 
          实线：[0,0,0] 
          虚线：[10,10] ，[10,10] 表示10个像素的实线和10个像素的空白（如此反复）组成的虚线
          点画线：[10,2,10]， [10,2,10] 表示10个像素的实线和2个像素的空白 + 10个像素的实 
          线和10个像素的空白 （如此反复）组成的虚线
        */
        strokeDasharray: [10, 2, 10],
      });
      polygon.setPath(pathArray);
      this.map.add(polygon);
    });
  };

  // 绑定事件
  handleMapClick = e => {
    console.log(e.lnglat);
    this.handleAddMark(e.lnglat.getLng(), e.lnglat.getLat());
  };

  // 默认添加标记，标记添加事件
  handleAddDefaultMark = () => {
    const infoWindow = new AMap.InfoWindow({
      // 创建信息窗体
      isCustom: true, // 使用自定义窗体
      content: '<div>信息窗体</div>', // 信息窗体的内容可以是任意html片段
      offset: new AMap.Pixel(16, -45),
    });
    const onMarkerClick = e => {
      infoWindow.open(this.map, e.target.getPosition()); // 打开信息窗体
      // e.target就是被点击的Marker
    };
    const markerTwo = new AMap.Marker({
      position: [114.049228, 22.556118],
      title: '北京大学医院',
    });
    this.map.add(markerTwo);
    // 鼠标点击marker弹出自定义的信息窗体
    AMap.event.addListener(markerTwo, 'click', onMarkerClick);
  };

  // 添加标记
  handleAddMark = (lng, lat) => {
    const marker = new AMap.Marker({
      position: [lng, lat], // 位置
      icon: '//vdata.amap.com/icons/b18/1/2.png', // 添加 Icon 图标 URL
      title: `您在[${lng},${lat}]的位置！`,
    });
    this.map.add(marker); // 添加到地图
    this.handleAddLine([114.049228, 22.556118], [lng, lat]);
  };

  handleAddLine = (startPath, endPath) => {
    const lineArr = [startPath, endPath];
    const polyline = new AMap.Polyline({
      path: lineArr, // 设置线覆盖物路径
      strokeColor: '#3366FF', // 线颜色
      strokeWeight: 5, // 线宽
      strokeStyle: 'solid', // 线样式
      showDir: true,
      lineCap: 'round', // 折线两端线帽的绘制样式，默认值为'butt'无头，其他可选值：'round'圆头、'square'方头
    });
    this.map.add(polyline);
  };

  // 遮罩 区划编码（adcode）  440304-福田区  440306-宝安
  handleDistrict = (adcode, returnFlag) => {
    new AMap.DistrictSearch({
      extensions: 'all',
      subdistrict: 0,
      // }).search('深圳市', (status,result) => {
    }).search(adcode, (status, result) => {
      // 外多边形坐标数组和内多边形坐标数组
      const outer = [
        new AMap.LngLat(-360, 90, true),
        new AMap.LngLat(-360, -90, true),
        new AMap.LngLat(360, -90, true),
        new AMap.LngLat(360, 90, true),
      ];
      const holes = result.districtList[0].boundaries;

      const pathArray = [outer];
      // eslint-disable-next-line prefer-spread
      pathArray.push.apply(pathArray, holes);
      const polygon = new AMap.Polygon({
        // map: this.map,
        pathL: pathArray,
        strokeColor: '#00eeff',
        strokeWeight: 1,
        fillColor: '#71B3ff',
        fillOpacity: 0.5,
      });
      polygon.setPath(pathArray);
      if (returnFlag) return polygon;
      return this.map.add(polygon);
      // polygon.setMap(this.map);
    });
  };

  handleWalkPlan = () => {
    const driving = new AMap.Driving({
      // 驾车路线规划策略，AMap.DrivingPolicy.LEAST_TIME是最快捷模式
      policy: AMap.DrivingPolicy.LEAST_TIME,
    });
    // 步行导航
    // const walking = new AMap.Walking({
    //   map: this.map,
    //   panel: "panel"
    // });
    // walking.search([[121.549792,29.868388],[121.549792,29.468388]], (status, result) => {
    driving.search(
      [
        // {keyword: '华强北(地铁站)',city:'深圳'},
        // {keyword: '华新(地铁站)',city:'深圳'}
        { keyword: '水湾(地铁站)', city: '深圳' },
        { keyword: '蛇口大厦', city: '深圳' },
      ],
      (status, result) => {
        // result即是对应的步行路线数据信息，相关数据结构文档请参考  https://lbs.amap.com/api/javascript-api/reference/route-search#m_WalkingResult
        if (status === 'complete') {
          console.log('success', '绘制步行路线完成', JSON.stringify(result));
        } else {
          console.log('error', `步行路线数据查询失败${result}`);
        }
      },
    );
  };

  render() {
    return (
      <>
        <div style={{ width: 600, height: 360 }} id="container"></div>
        <div onClick={() => window.history.go(-1)}>Back</div>
      </>
    );
  }
}
