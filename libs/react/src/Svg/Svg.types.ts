import type { ReactSVG } from 'react';

export interface Vector {
  children?: this[];
  tag: string | keyof ReactSVG;
  props?: Record<string, number | string>;
}

export type SvgProps = {
  alt: string;
  src: Vector;
  color?: string;
  width?: string;
  height?: string;
  className?: string;
  isCurrentColor?: boolean;
  clipPathId?: string;
};
