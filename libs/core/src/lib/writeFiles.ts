import { camelCase } from 'change-case';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { dirname, relative, resolve } from 'path';

import { parseToJson } from './parseToJson';
import { readdirFlattenSync } from './readdirFlattenSync';

export async function writeFiles({
  input,
  dist,
  withSuffix,
  format = 'cjs',
  options,
  onCompile,
  onDone,
}: {
  dist: string;
  input: string;
  withSuffix: boolean;
  format: 'cjs' | 'esm' | 'ts';
  options: any;
  onDone: (...args: any) => any;
  onCompile: (...args: any) => any;
}) {
  const rootDir = resolve(input);
  const fileNames = readdirFlattenSync(input);
  const fileExtension = format === 'ts' ? 'ts' : 'js';

  if (!existsSync(dist)) {
    mkdirSync(dist, { recursive: true });
  }

  const indexes = await fileNames
    .filter(({ fileName }) => {
      const { ext } = /\.(?<ext>.*)$/g.exec(fileName)?.groups || {};
      return ext === 'svg';
    })
    .reduce(async (acc, { fileName, path }) => {
      if (withSuffix) {
        let nestedSuffix = '';
        const nestedDir = relative(rootDir, dirname(path));

        if (nestedDir) {
          nestedSuffix = `-${nestedDir.replace(/\\|\//g, '-')}`;
        }

        fileName = fileName.replace(/(.*)(\.svg)/g, `$1${nestedSuffix}$2`);
      }
      const key = camelCase(fileName.split('.')[0]);
      const value = await parseToJson(path, options);
      const accumulator = await acc;
      const distFile = `${key}.${fileExtension}`;
      const jsonStr = JSON.stringify(value, undefined, 2);
      let asset;
      let indexer;

      onCompile?.({
        fileName,
        distFile,
      });

      if (format === 'esm' || format === 'ts') {
        asset = `export const ${key} = ${jsonStr}`;
        indexer = `export * from './${key}';\n`;
      } else {
        asset = `module.exports.${key} = ${jsonStr}`;
        indexer = `module.exports.${key} = require('./${key}').${key};\n`;
      }

      writeFileSync(resolve(dist, distFile), asset);

      return accumulator + indexer;
    }, Promise.resolve(''));

  writeFileSync(resolve(dist, `index.${fileExtension}`), indexes);

  onDone?.({ number: fileNames.length });
}
