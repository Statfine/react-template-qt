import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  html,
  body {
    height: 100%;
    width: 100%;
  }

  body {
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  }

  #app {
    min-height: 100%;
    min-width: 100%;
  }

  body,
  dl,
  dd,
  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  p,
  form {
    margin: 0;
  }
  ol, li, ul {
    margin: 0;
    padding: 0;
  }
  input,
  button {
    outline: none;
  }

  input, select {
    font-family: inherit;
    font-size: inherit;
  }
  li {
    list-style:none;
    outline: none;
  }
`;

export default GlobalStyle;
