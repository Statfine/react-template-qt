import styled from 'styled-components';
import { Button } from 'antd';
import BgBanner from './images/banner.jpg';

export const Container = styled.div`
  background-image: url(${BgBanner});
  background-repeat: no-repeat;
  background-size: 100% 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const ActionBtn = styled(Button)`
  margin: 0 12px;
`;