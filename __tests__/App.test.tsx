/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

jest.mock('../src/screen/splash/SplashScreen', () => () => null);

test('renders correctly', async () => {
  let app: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(() => {
    app = ReactTestRenderer.create(<App />);
  });
  await ReactTestRenderer.act(() => {
    app!.unmount();
  });
});
