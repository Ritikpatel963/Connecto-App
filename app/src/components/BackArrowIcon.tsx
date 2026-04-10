import React from 'react';
import Svg, { Path } from 'react-native-svg';

type BackArrowIconProps = {
  color?: string;
  size?: number;
};

const BackArrowIcon: React.FC<BackArrowIconProps> = ({ color = '#FFFFFF', size = 20 }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round">
    <Path d="m12 19-7-7 7-7" />
    <Path d="M19 12H5" />
  </Svg>
);

export default BackArrowIcon;