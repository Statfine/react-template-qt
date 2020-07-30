/* eslint-disable no-undef */
import React, { PureComponent } from 'react';

export default class GaoDeMap extends PureComponent {

  componentDidMount() {
    const script = document.createElement("script");
    // wCKzG98XL4oikbPFjzGXG4Go8kB0eDNM
    const url = "https://api.map.baidu.com/api?v=3.0&ak=wCKzG98XL4oikbPFjzGXG4Go8kB0eDNM";
    script.type = "text/javascript";
    script.src = url;
    document.head.appendChild(script);
    script.onload = () => setTimeout(() => this.init(), 1000) ;
  }

  map;

  init = () => {
    this.map = new BMap.Map('container'); 
    this.map.centerAndZoom(new BMap.Point(114.059614, 22.543673), 11); 
    this.map.enableScrollWheelZoom(true);

    this.map.addControl(new BMap.NavigationControl());    
    this.map.addControl(new BMap.ScaleControl());    
    this.map.addControl(new BMap.OverviewMapControl());    
    this.map.addControl(new BMap.MapTypeControl());  
  }

  setCenter = () => {
    const point = new BMap.Point(116.331398,39.897445);
    this.map.centerAndZoom(point,12);
  }

  setLayer = () => {
    const traffic = new BMap.TrafficLayer();        // 创建交通流量图层实例      
    this.map.addTileLayer(traffic); 
  }

  render () {
    return(
      <>
        <div style={{ width: 600, height: 360  }} id="container"></div> 
        <div onClick={this.setCenter}>center</div>
        <div onClick={this.setLayer}>layer</div>
      </>
    )
  }
}