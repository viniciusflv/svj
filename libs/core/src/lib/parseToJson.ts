// @ts-ignore
import cssToObject from 'css-to-object';
import { readFileSync } from 'fs';
// @ts-ignore
import { optimize as optimizeSVG } from 'svgo';
import { parse as parseSVG } from 'svgson';

export async function parseToJson(path: string, options: string[]) {
  const file = readFileSync(path, {
    encoding: 'utf8',
  });
  let content = file;

  if (options) {
    const { data } = await optimizeSVG(
      readFileSync(path, {
        encoding: 'utf8',
      }),
      options,
    );
    content = data;
  }

  const svgson = await parseSVG(content, { camelcase: true });

  const morph = ({ name: tag, attributes: props, children }: any): any => {
    const output = {
      props,
      tag,
      children: children?.length ? children.map(morph) : children,
    };
    return tag === 'svg' ? [output] : output;
  };

  const group = (morphed: any, root = true) => {
    return morphed?.reduce((acc: any, { tag, props, children }: any) => {
      const tags = acc?.children ?? [];
      const { class: className, style, ...rest } = props;
      const attr = {
        ...rest,
        className,
        style: style && cssToObject(style, { camelCase: true }),
      };
      const child = children.length
        ? [...tags, { tag, props: attr, ...group(children, false) }]
        : [...tags, { tag, props: attr }];
      return root
        ? child[0]
        : {
            ...acc,
            children: child,
          };
    }, {});
  };

  return group(morph(svgson));
}
