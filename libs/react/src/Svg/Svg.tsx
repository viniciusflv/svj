import { forwardRef, useCallback, useMemo } from 'react';

import { useId } from '@react-aria/utils';

import type { SvgProps } from './Svg.types';

export const Svg = forwardRef<SVGSVGElement, SvgProps>(
  (
    {
      alt,
      src,
      color,
      className,
      clipPathId,
      isCurrentColor = false,
      width = clipPathId ? '0' : '100%',
      height = clipPathId ? '0' : '100%',
    },
    ref,
  ) => {
    const ariaId = useId(alt?.replace(/\s/g, '-'));

    const jsonToJSX = useCallback(
      ({ tag: Tag, props, children }: any, i = 0) => {
        const svgProps = { ref, width, height, 'aria-hidden': 'true' };
        const pathProps = {
          fill: isCurrentColor
            ? 'currentColor'
            : color ??
              props?.fill?.replace(/^url\((.*)\)$/, `url($1-${ariaId})`),
        };
        const clipPathProps = {
          id: clipPathId,
          clipPathUnits: 'objectBoundingBox',
        };
        return (
          <Tag
            {...props}
            {...(Tag === 'svg' && svgProps)}
            {...(Tag === 'path' && pathProps)}
            key={`${ariaId}-${i}`}
            id={props?.id ? `${props?.id}-${ariaId}` : undefined}
            {...(Tag === 'clipPath' && clipPathProps)}
          >
            {children?.map(jsonToJSX)}
          </Tag>
        );
      },
      [ariaId, color, isCurrentColor, width, height],
    );

    const svg = useMemo(
      () => (src ? jsonToJSX(src) : null),
      [src, color, isCurrentColor, width, height],
    );

    return (
      <i
        className={className}
        role={clipPathId ? undefined : 'img'}
        aria-label={clipPathId ? undefined : alt}
        aria-hidden={!!clipPathId}
      >
        {svg}
      </i>
    );
  },
);
