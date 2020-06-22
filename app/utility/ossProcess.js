export const ossProcess = (width = 240, height = 240) => 
  // ({ oss_process: `image/resize,m_pad,h_${height},w_${width}` });
  ({ oss_process: `image/resize,m_fill,h_${height},w_${width}` });

// 将图缩略成k宽度为 330，高度按比例处理
export const ossProcessResizeW = (width = 330) => 
  ({ oss_process: `image/resize,m_fill,w_${width}` });