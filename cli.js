#!/usr/bin/env node

const bundle = require("./gulpfile");
const argv = require('yargs').argv;

if(!argv.inputPath) {
  throw console.error("You need to input the path of the angular dist folder, Ej: zeos-bundler --input-path path/of/dist --project-path path/of/project");
}

if (!argv.tar) {
  console.info("Procceding to bundle without tarball compress");
  bundle(argv.inputPath, argv.projectPath ? argv.projectPath : '/', null);
} else {
  console.info("Procceding to bundle using tarball");
  bundle(argv.inputPath, argv.projectPath ? argv.projectPath : '/', true);
}