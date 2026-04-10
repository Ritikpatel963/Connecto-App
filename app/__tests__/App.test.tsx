/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

jest.mock('../src/navigation/AppNavigator', () => {
  const React = require('react');
  const { View } = require('react-native');

  const MockNavigator = () => React.createElement(View, { testID: 'mock-navigator' });
  return MockNavigator;
});

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});
