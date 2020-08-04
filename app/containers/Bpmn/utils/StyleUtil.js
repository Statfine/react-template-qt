const StyleUtil = {
  changeArrows() {
    const markerList = document.getElementsByTagName("marker");
    console.log(typeof markerList);
    markerList.forEach((item) => {
      console.log(item);
      if (item.id.startsWith("sequenceflow-end-white-black")) { // 实线箭头
        item.setAttribute("markerWidth","6");
        item.setAttribute("markerHeight","6");
      }
      if (item.id.startsWith("messageflow-end-white-black")) { // 虚线箭头
        item.setAttribute("markerWidth","8");
        item.setAttribute("markerHeight","8");
      }
    })
    // for (let i = 0; i < markerList.length; i += 1) {
    //   const item = markerList[i];
    //   if (item.id.startsWith('sequenceflow-end-white-black')) {
    //     // 实线箭头
    //     item.setAttribute('markerWidth', '6');
    //     item.setAttribute('markerHeight', '6');
    //   }
    //   if (item.id.startsWith('messageflow-end-white-black')) {
    //     // 虚线箭头
    //     item.setAttribute('markerWidth', '8');
    //     item.setAttribute('markerHeight', '8');
    //   }
    // }
  },
}

export default StyleUtil;