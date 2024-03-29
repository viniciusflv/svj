#!/usr/bin/env node
import { writeFiles } from '@svjson/core';
import chalk from 'chalk';
import { Command } from 'commander';
// @ts-ignore
import inquirer from 'inquirer';

import { name, version } from '../package.json';

export async function runner() {
  const log = {
    _layout: (name: string, message: string) => console.log(name, message),
    success({ name = 'Success', message = '' }) {
      this._layout(
        chalk.bold.hex('#292836').bgHex('#00ff79')(` ${name} `),
        message,
      );
    },
    error({ name = 'Error', message = '' }) {
      this._layout(
        chalk.bold.hex('#fff').bgHex('#ff0056')(` ${name} `),
        message,
      );
    },
    warning({ name = 'Warning', message = '' }) {
      this._layout(
        chalk.bold.hex('#292836').bgHex('#e6ff8b')(` ${name} `),
        message,
      );
    },
    info({ name = 'Info', message = '' }) {
      this._layout(
        chalk.hex('#292836').bgHex('#74fffe').bold(` ${name} `),
        message,
      );
    },
  } as const;
  const err = Error();
  const cli = new Command(name);

  cli
    .version(
      `${chalk.green('svj')} version ${chalk.blue(version)}`,
      '-v, --version',
      'current version',
    )
    .option('-r, --recommended', 'use recommended options')
    .option('-i, --input [input]', 'input file')
    .option('-d, --dist [dist]', 'dist file')
    .option('-s, --suffix', 'use nested folders name to add suffix')
    .option('--svgo', 'use svgo optmizer')
    .option('--esm', 'use ECMAScript Modules')
    .option('--ts', 'use TypeScript')
    .parse(process.argv);

  // eslint-disable-next-line prefer-const
  let { input, dist, svgo, esm, ts, recommended, suffix } = cli.opts();
  let options;

  if (recommended) {
    ts = recommended;
    svgo = recommended;
    suffix = recommended;
  }

  try {
    if (!input) {
      const prompt = await inquirer.prompt([
        {
          type: 'input',
          name: 'input',
          message: 'Input Folder:',
        },
      ]);
      input = prompt.input;
      if (!prompt.input) {
        err.name = 'Missing input value';
        err.message = `Please use the option ${chalk.green(
          '-i',
        )} or ${chalk.green(
          '--input',
        )} to declare the path to your svgs folder.`;
        throw err;
      }
    }

    if (!dist) {
      const prompt = await inquirer.prompt([
        {
          type: 'input',
          name: 'dist',
          message: 'Dist File:',
          default: input,
        },
      ]);
      dist = prompt.dist;
      if (!prompt.dist) {
        dist = input;
        log.warning({
          name: 'Empty dist',
          message: `Using input path ${chalk.green(input)} as dist`,
        });
      }
    }

    if (!esm && !ts) {
      const prompt = await inquirer.prompt([
        {
          type: 'list',
          name: 'module',
          message: 'Use ECMAScript Modules?',
          choices: [
            { name: 'TypeScript', value: 'ts' },
            { name: 'ECMAScript', value: 'esm' },
            { name: 'CommonJS', value: 'cjs' },
          ],
        },
      ]);
      const handler = {
        ts: () => {
          ts = true;
          log.info({ message: `Using TypeScript` });
        },
        esm: () => {
          esm = true;
          log.info({ message: `Using ECMAScript Modules` });
        },
        cjs: () => {
          log.info({ message: `Using CommonJS` });
        },
      };

      handler[prompt.module as keyof typeof handler]();
    }

    if (!suffix) {
      const prompt = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'suffix',
          message: 'Should use recursive folder naming suffix?',
        },
      ]);
      suffix = prompt.suffix;
    }

    if (!svgo) {
      const prompt = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'svgo',
          message: 'Optimize with svgo?',
        },
      ]);
      svgo = prompt.svgo;
      if (!prompt.svgo) {
        log.warning({ message: `Not using svgo to optimize your SVGs` });
      }
    }

    if (svgo) {
      let pluginOptions;
      const svgoOptions = [
        'removeDoctype',
        'removeXMLProcInst',
        'removeComments',
        'removeMetadata',
        'removeTitle',
        'removeDesc',
        'removeUselessDefs',
        'removeEditorsNSData',
        'removeEmptyAttrs',
        'removeHiddenElems',
        'removeEmptyText',
        'removeEmptyContainers',
        'cleanupEnableBackground',
        'convertStyleToAttrs',
        'convertColors',
        'convertPathData',
        'convertTransform',
        'removeUnknownsAndDefaults',
        'removeNonInheritableGroupAttrs',
        'removeUselessStrokeAndFill',
        'removeUnusedNS',
        'cleanupIDs',
        'cleanupNumericValues',
        'moveGroupAttrsToElems',
        'collapseGroups',
        'removeRasterImages',
        'mergePaths',
        'convertShapeToPath',
        'sortAttrs',
        'removeDimensions',
      ];

      if (!recommended) {
        const { plugins } = await inquirer.prompt([
          {
            type: 'checkbox',
            name: 'plugins',
            message: 'Svgo plugins:',
            default: svgoOptions,
            choices: svgoOptions,
          },
        ]);

        pluginOptions = plugins;
      } else {
        pluginOptions = svgoOptions;
      }

      options = {
        plugins: pluginOptions.map((opt: string) => {
          const convertShapeToPath = {
            name: 'convertShapeToPath',
            params: {
              convertArcs: true,
            },
          };
          return opt === 'convertShapeToPath' ? convertShapeToPath : opt;
        }),
      };

      log.success({
        name: 'Optmizing',
        message: `Using ${chalk.green('svgo')}`,
      });
    }

    writeFiles({
      dist,
      input,
      options,
      withSuffix: suffix,
      format: esm ? 'esm' : ts ? 'ts' : 'cjs',
      onCompile: ({ fileName, distFile }) =>
        log.info({
          name: 'Compiling',
          message: `${fileName} ${chalk.grey('as')} ${chalk.bold(distFile)}`,
        }),
      onDone: ({ number }) =>
        log.success({
          name: 'Completed',
          message: `${chalk.gray('Compiled')} ${chalk.green(
            number,
            'files',
          )} ${chalk.gray('to')} ${chalk.bold(dist)}`,
        }),
    });
  } catch (err) {
    log.error(err as any);
  }
}
