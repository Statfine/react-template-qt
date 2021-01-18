import React, { memo } from 'react';

import AppendApi from './com/append';

function Share() {
  return (
    <>
      <AppendApi />
    </>
  );
}

export default memo(Share);
