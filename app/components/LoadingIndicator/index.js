import React from 'react';
import { Spin } from 'antd';
import styled from 'styled-components';

const Wrapper = styled.div`
  margin: 0 auto;
  width: 40px;
  height: 40px;
  position: relative;
  padding: 100px;
`;

const LoadingIndicator = () => (
  <Wrapper>
    <Spin size="large" />
  </Wrapper>
);

export default LoadingIndicator;
