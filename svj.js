const { resolve } = require("path");
const { parse } = require("svgson");
const { optimize } = require("svgo");
const { Command } = require("commander");
const { bold, green, red, yellow, blue } = require("chalk");
const {
  readFileSync,
  readdirSync,
  writeFileSync,
  existsSync,
  mkdirSync,
} = require("fs");

const { name, version } = require("./package.json");

const log = {
  _layout: (name, message) => console.log(name, "-", message),
  success({ name = "Success", message = "" }) {
    this._layout(green(bold(name)), message);
  },
  error({ name = "Error", message = "" }) {
    this._layout(red(bold(name)), message);
  },
  warning({ name = "Warning", message = "" }) {
    this._layout(yellow(bold(name)), message);
  },
  info({ name = "Info", message = "" }) {
    this._layout(blue(bold(name)), message);
  },
};
const err = Error();
const cli = new Command(name);

cli
  .version(
    `${green("svj")} version ${blue(version)}`,
    "-v, --version",
    "current version"
  )
  .option("-i, --input [input]", "input file")
  .option("-d, --dist [dist]", "dist file")
  .option("--svgo [svgo]", "use svgo plugins")
  .parse(process.argv);

const { input, dist = input, svgo } = cli.opts();

try {
  if (!input) {
    err.name = "Missing input value";
    err.message = `Please use the option ${green("-i")} or ${green(
      "--input"
    )} to declare the path to your svgs folder.`;
    throw err;
  }

  if (dist === input) {
    log.warning({
      name: "Dist not declared",
      message: `Using input path "${green(input)}" as dist path`,
    });
  }

  let options = {};

  if (svgo) {
    log.success({ name: "Optmizing", message: `Using ${green("svgo")}` });
    options = {
      plugins: [
        "removeDoctype",
        "removeXMLProcInst",
        "removeComments",
        "removeMetadata",
        "removeTitle",
        "removeDesc",
        "removeUselessDefs",
        "removeEditorsNSData",
        "removeEmptyAttrs",
        "removeHiddenElems",
        "removeEmptyText",
        "removeEmptyContainers",
        "cleanupEnableBackground",
        "convertStyleToAttrs",
        "convertColors",
        "convertPathData",
        "convertTransform",
        "removeUnknownsAndDefaults",
        "removeNonInheritableGroupAttrs",
        "removeUselessStrokeAndFill",
        "removeUnusedNS",
        "cleanupIDs",
        "cleanupNumericValues",
        "moveGroupAttrsToElems",
        "collapseGroups",
        "removeRasterImages",
        "mergePaths",
        {
          name: "convertShapeToPath",
          params: {
            convertArcs: true,
          },
        },
        "sortAttrs",
        "removeDimensions",
      ],
    };
  } else {
    log.warning({
      message: `Not using ${green("svgo")} to optimize your svgs`,
    });
  }

  function handleChildren(child) {
    return child.reduce((acc, { name, attributes, children }) => {
      if (["path", "stop", "animate"].includes(name)) {
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
      encoding: "utf8",
    });
    let content = file;

    if (svgo) {
      const { data } = await optimize(
        readFileSync(resolve(input, fileName), {
          encoding: "utf8",
        }),
        options
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
        return ext === "svg";
      })
      .reduce(async (acc, fileName) => {
        log.info({ message: `Compiling ${green(fileName)}` });

        const key = fileName.split(".")[0];
        const value = await parseToJson(fileName);
        const accumulator = await acc;

        writeFileSync(
          resolve(dist, `${key}.js`),
          `export const ${key} = ${JSON.stringify(value, undefined, 2)}`
        );

        return `${accumulator}export * from './${key}';\n`;
      }, Promise.resolve(""));

    writeFileSync(resolve(dist, "index.js"), indexes);

    done({ number: fileNames.length });
  }

  writeFiles(({ number }) =>
    log.success({
      name: "Completed",
      message: `Compiled ${green(number, "files")} to ${blue(dist)}`,
    })
  );
} catch (error) {
  log.error(error);
}
