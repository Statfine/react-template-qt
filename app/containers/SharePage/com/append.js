import React, {
  memo,
  createRef,
} from 'react';
import { Button } from 'antd';

import styled from 'styled-components';

const DivOne = styled.div`
  background: blue;
  width: 50px;
`;

const DivTwo = styled.div`
  background: green;
  padding: 10px;
  width: 100px;
`;

function AppendApi() {
  const oneRef = createRef();
  const twoRef = createRef();

  const handleAppendChange = () => {
    const el = oneRef.current;
    twoRef.current.appendChild(el);
  };

  return (
    <div>
      <DivOne ref={oneRef}>one div</DivOne>
      <DivTwo ref={twoRef}>two div</DivTwo>
      <Button onClick={handleAppendChange}>Append</Button>
    </div>
  );
}

export default memo(AppendApi);
