#!/usr/bin/env node

/*
require('yargs')
  .scriptName("zeos-bundler")
  .usage('$0 <cmd> [args]')
  .command('--input-path [path name]', 'Specify the path of the files you want to bundle', (yargs) => {
    yargs.positional('name', {
      type: 'string',
      default: 'Cambi',
      describe: 'the name to say hello to'
    })
  })
  .command('--input-path [path name] --project-path [project path]', 'Specify the path of the files you want to bundle', (yargs) => {
    yargs.positional('name', {
      type: 'string',
      default: 'Cambi',
      describe: 'the name to say hello to'
    })
  })
  .help()
  .argv
*/
const minify = require("./gulpfile");
const argv = require('yargs').argv;
const params = Object.keys(argv);

if (params.includes('help')) return console.info("");
if (!params.includes('input-path')) return console.error("\nError! You need to input the path of the angular dist folder, Ej: zeos-bundler --input-path path/of/dist --project-path path/of/project");
if (!params.includes('tar')) console.info("\nProcceding to minify without tarball compress")
if (params.includes('tar')) console.info("\nProcceding to minify with tarball compress")

minify(
  argv.inputPath,
  argv.projectPath ? argv.projectPath : '/',
  argv.tar ? true : false,
  argv.baseName ? argv.baseName : 'generated'
);