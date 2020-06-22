/**
 * NotFoundPage
 *
 * This is the page we show when the user visits a url that doesn't have a route
 *
 */

import React from 'react';
import styled from 'styled-components';
import MissPng from './404.png';

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 860px;
  height: auto;
  margin: 40px auto;
`;

const Img = styled.img`
  width: 440px;
`;

const Title = styled.p`
  font-size: 120px;
  font-weight: 700;
  color: #4c4c4c;
  text-align: center;
`;
const Desc = styled.p`
  font-size: 28px;
  color: #7f7f7f;
  text-align: center;
`;

export default function NotFound() {
  return (
    <Container>
      <Img src={MissPng} />
      <div style={{ flex: 1 }}>
        <Title>404</Title>
        <Desc>抱歉您访问的页面不存在</Desc>
      </div>
    </Container>
  );
}
