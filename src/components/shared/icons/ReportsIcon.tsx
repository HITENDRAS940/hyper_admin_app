import * as React from 'react';
import Svg, { Defs, Rect, Path, SvgProps } from 'react-native-svg';

interface ReportsIconProps extends SvgProps {
  size?: number;
  color?: string;
}

const ReportsIcon: React.FC<ReportsIconProps> = ({
  size = 24,
  color = '#000000',
  ...props
}) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    {...props}
  >
    <Rect x={10} y={18} width={8} height={2} fill={color} />
    <Rect x={10} y={13} width={12} height={2} fill={color} />
    <Rect x={10} y={23} width={5} height={2} fill={color} />
    <Path
      d="M25,5H22V4a2,2,0,0,0-2-2H12a2,2,0,0,0-2,2V5H7A2,2,0,0,0,5,7V28a2,2,0,0,0,2,2H25a2,2,0,0,0,2-2V7A2,2,0,0,0,25,5ZM12,4h8V8H12ZM25,28H7V7h3v3H22V7h3Z"
      fill={color}
    />
  </Svg>
);

export default ReportsIcon;
