#!/usr/bin/env node

const chalk = require('chalk');
const inquirer = require('inquirer');
const { resolve } = require('path');
const { parse } = require('svgson');
const { optimize } = require('svgo');
const { Command } = require('commander');
const {
  readFileSync,
  readdirSync,
  writeFileSync,
  existsSync,
  mkdirSync,
} = require('fs');

const { name, version } = require('./package.json');

async function runner() {
  const log = {
    _layout: (name, message) => console.log(name, message),
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
  };
  const err = Error();
  const cli = new Command(name);

  cli
    .version(
      `${chalk.green('svj')} version ${chalk.blue(version)}`,
      '-v, --version',
      'current version',
    )
    .option('-i, --input [input]', 'input file')
    .option('-d, --dist [dist]', 'dist file')
    .option('--svgo', 'use svgo optmizer')
    .option('--esm', 'use ECMAScript Modules')
    .parse(process.argv);

  let { input, dist, svgo, esm } = cli.opts();
  let options = {};

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

    if (!esm) {
      const prompt = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'esm',
          message: 'Use ECMAScript Modules?',
        },
      ]);
      esm = prompt.esm;
      if (!prompt.esm) {
        log.info({
          message: `Using CommonJS`,
        });
      }
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
        log.warning({
          message: `Not using svgo to optimize your SVGs`,
        });
      }
    }

    if (svgo) {
      const { plugins } = await inquirer.prompt([
        {
          type: 'checkbox',
          name: 'plugins',
          message: 'Svgo plugins:',
          default: [
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
          ],
          choices: [
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
          ],
        },
      ]);

      options = {
        plugins: plugins.map((opt) =>
          opt === 'convertShapeToPath'
            ? {
                name: 'convertShapeToPath',
                params: {
                  convertArcs: true,
                },
              }
            : opt,
        ),
      };

      log.success({
        name: 'Optmizing',
        message: `Using ${chalk.green('svgo')}`,
      });
    } else {
      log.warning({
        message: `Not optmizing your SVGs`,
      });
    }

    function handleChildren(child) {
      return child.reduce((acc, { name, attributes, children }) => {
        if (['path', 'stop', 'animate'].includes(name)) {
          if (acc[`${name}s`]) {
            if (children.length === 0) {
              return {
                ...acc,
                [`${name}s`]: [...acc[`${name}s`], attributes],
              };
            }
            return {
              ...acc,
              [`${name}s`]: [
                ...acc[`${name}s`],
                { ...attributes, ...handleChildren(children) },
              ],
            };
          }
          if (children.length === 0)
            return { ...acc, [`${name}s`]: [attributes] };
          return {
            ...acc,
            [`${name}s`]: [{ ...attributes, ...handleChildren(children) }],
          };
        }
        if (children.length === 0) return { ...acc, [name]: attributes };
        return { ...acc, [name]: handleChildren(children) };
      }, {});
    }

    async function parseToJson(fileName) {
      const file = readFileSync(resolve(input, fileName), {
        encoding: 'utf8',
      });
      let content = file;

      if (svgo) {
        const { data } = await optimize(
          readFileSync(resolve(input, fileName), {
            encoding: 'utf8',
          }),
          options,
        );
        content = data;
      }

      const {
        attributes: { viewBox, fill },
        children,
      } = await parse(content, { camelcase: true });

      return {
        viewBox,
        fill,
        ...handleChildren(children),
      };
    }

    async function writeFiles(done) {
      const fileNames = readdirSync(input);

      if (!existsSync(dist)) {
        mkdirSync(dist);
      }

      const indexes = await fileNames
        .filter((fileName) => {
          const { ext } = /\.(?<ext>.*)$/g.exec(fileName).groups || {};
          return ext === 'svg';
        })
        .reduce(async (acc, fileName) => {
          const key = fileName.split('.')[0];
          const value = await parseToJson(fileName);
          const accumulator = await acc;
          const distFile = `${key}.js`;
          const jsonStr = JSON.stringify(value, undefined, 2);
          let asset;
          let indexer;

          log.info({
            name: 'Compiling',
            message: `${fileName} ${chalk.grey('as')} ${chalk.bold(distFile)}`,
          });

          if (esm) {
            asset = `export const ${key} = ${jsonStr}`;
            indexer = `export * from './${key}';\n`;
          } else {
            asset = `module.exports.${key} = ${jsonStr}`;
            indexer = `module.exports.${key} = require('./${key}').${key};\n`;
          }

          writeFileSync(resolve(dist, distFile), asset);

          return accumulator + indexer;
        }, Promise.resolve(''));

      writeFileSync(resolve(dist, 'index.js'), indexes);

      done({ number: fileNames.length });
    }

    writeFiles(({ number }) =>
      log.success({
        name: 'Completed',
        message: `${chalk.gray('Compiled')} ${chalk.green(
          number,
          'files',
        )} ${chalk.gray('to')} ${chalk.bold(dist)}`,
      }),
    );
  } catch (err) {
    log.error(err);
  }
}

runner();
