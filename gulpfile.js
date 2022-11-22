#!/usr/bin/env node
const gulp = require('gulp');
const fs = require('fs');
const replace = require('gulp-replace');
const imageToBase64 = require('image-to-base64');
var exec = require('child_process').exec;
const fse = require("fs-extra");
const tar = require('gulp-tar');
const gzip = require('gulp-gzip');
var uglify = require('gulp-uglify');
var map = require('map-stream');
const svg64 = require('svg64');
const { readFileSync } = require('fs');
const gulpif = require('gulp-if');

/**
 * 
 * 1st. First we have to find all matching paths
 * 2nd. We have to get the type extension of that paths
 * 3rd. Convert the media assets to base64
 * 4th. Replace the paths of the 1st. point with the base64 data
 * 
 */
const myGulpTask = module.exports = (inputPath, projectPath, tar, baseName) => {

  exec('npm i ngx-build-plus && ng build --vendor-chunk=false --output-hashing=none --base-href #', function (err, stdout, stderr) {
    gulp.task('clean', function () {
      return del(['generated/**', '!generated'], { force: true });
    });

    fs.mkdir('generated', async (err) => {
      console.log('Directory created successfully!');

      const indexContent = fs.readFileSync(inputPath + '/index.html', 'utf8', function (err, data) {
        if (err) {
          return console.log(err);
        }
      });

      const mainContent = fs.readFileSync(inputPath + '/main.js', 'utf8', function (err, data) {
        if (err) {
          return console.log(err);
        }
      });

      const styleScssContent = fs.readFileSync(inputPath + '/styles.css', 'utf8', function (err, data) {
        if (err) {
          return console.log(err);
        }
      });

      const runtimeContent = fs.readFileSync(inputPath + '/runtime.js', 'utf8', function (err, data) {
        if (err) {
          return console.log(err);
        }
      });

      const polyfillsContent = fs.readFileSync(inputPath + '/polyfills.js', 'utf8', function (err, data) {
        if (err) {
          return console.log(err);
        }
      });

      // fse.copy(inputPath + '/assets', 'generated/assets', function (err) {
      //   if (err) {
      //     console.log('An error occurred while copying the folder.')
      //     //return console.error(err)
      //   }
      //   console.log('Copy completed!')
      // });

      // fs.rm('generated/assets', { recursive: true }, err => {
      //   if (err) {
      //     throw err
      //   }

      //   console.log(`is deleted!`)
      // })

      fs.readdirSync("./generated/")
        .filter(f => !/[.]html$/.test(f) && !/assets$/.test(f))
        .map(f => fs.unlinkSync('./generated/' + f));

      const regExpPng = new RegExp('(?:\.)(\/[a-z_\-\s0-9\.]+)+\.(png)', 'g');
      const regExpSvg = new RegExp('(?:\.)(\/[a-z_\-\s0-9\.]+)+\.(svg)', 'g');
      const regExpWasm = new RegExp('(?:\.)(\/[a-z_\-\s0-9\.]+)+\.(wasm)', 'g');

      var fixedIndexContent = await replaceAllSvg(await replaceAllPng(indexContent || 'id0', inputPath), inputPath);
      var fixedMainContent = await replaceAllSvg(await replaceAllPng(mainContent || 'id0', inputPath), inputPath);
      var fixedStyleScssContent = await replaceAllSvg(await replaceAllPng(styleScssContent || 'id1', inputPath), inputPath);
      var fixedRuntimeContent = await replaceAllSvg(await replaceAllPng(runtimeContent || 'id2', inputPath), inputPath);
      var fixedPolyfillsContent = await replaceAllSvg(await replaceAllPng(polyfillsContent || 'id3', inputPath), inputPath);

      return generate(
        inputPath,
        fixedIndexContent,
        fixedMainContent,
        fixedStyleScssContent,
        fixedRuntimeContent,
        fixedPolyfillsContent,
        baseName
      )
    });
  });
}

async function replaceAllSvg(content, inputPath) {
  const regExpPng = new RegExp("(?:\.)(\/[a-z\s0-9\\_\\-\\.]+)+\.(svg)", 'g');
  var fixedMainContent = content;
  var values = [];

  console.log("Content length: ", content.length + " Content match: " + content.match(regExpPng))
  const contentMatch = content.match(regExpPng);
  if (!contentMatch) return content;

  const pathMatchesPng = contentMatch.forEach(async (value) => {
    fixedValue = value.replace("./assets", "./" + inputPath + "/assets")

    if (!fixedValue.includes('w3.org')) {
      console.log(value);
      let svg = readFileSync(fixedValue, 'utf-8');
      // This is your SVG in base64 representation
      let base64fromSVG = svg64(svg);
      values.push(base64fromSVG)
    } else {
      values.push(null);
    };
  });

  const myPromise = await new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve("foo");
    }, 2500);
  });

  contentMatch.forEach(async (value, index) => {
    fixedValue = value.replace("./assets", "./" + inputPath + "/assets")
    if (!value.includes('w3.org')) fixedMainContent = fixedMainContent.replace(value, values[index]);
  });

  console.log(values)

  return fixedMainContent;
}

async function replaceAllPng(content, inputPath) {
  const regExpPng = new RegExp("(?:\.)(\/[a-z\s0-9\\_\\-\\.]+)+\.(png)", 'g');
  var fixedMainContent = content;
  var values = [];

  console.log("Content length: ", content.length + " Content match: " + content.match(regExpPng))
  const contentMatch = content.match(regExpPng);
  if (!contentMatch) return content;

  const pathMatchesPng = contentMatch.forEach(async (value) => {
    fixedValue = value.replace("./assets", "./" + inputPath + "/assets")
    console.log(value)
    values.push(await imageToBase64(fixedValue).then((base64) => base64).catch((error) => {
      throw new Error("Image (png extension) couldn't be converted to Base64 string")
    }));
  });

  const myPromise = await new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve("foo");
    }, 2500);
  });

  contentMatch.forEach(async (value, index) => {
    fixedValue = value.replace("./assets", "./" + inputPath + "/assets")
    fixedMainContent = fixedMainContent.replace(value, "data:image/png;base64, " + values[index]);
  });

  return fixedMainContent;
}

function generate(inputPath, indexContent, mainContent, styleScssContent, runtimeContent, polyfillsContent, baseName) {
  return gulp.src(inputPath + '/index.html')
    .pipe(map(function (file, cb) {
      var fileContents = file.contents.toString();
      // --- do any string manipulation here ---
      fileContents = fileContents.replace(/foo/, 'bar');
      fileContents = 'First line\n' + fileContents;
      // ---------------------------------------
      file.contents = new Buffer(indexContent);
      cb(null, file);
    }))
    .pipe(replace(
      '<script src="main.js" type="module"></script>',
      '<script type="module">' + mainContent + '</script>'))
    .pipe(replace(
      '<style>',
      '<style>' + styleScssContent
    ))
    .pipe(replace(
      '<script src="runtime.js" type="module"></script>',
      '<script type="module">' + runtimeContent + '</script>'
    ))
    .pipe(replace(
      '<script src="polyfills.js" type="module"></script>',
      '<script type="module">' + polyfillsContent + '</script>'
    ))
    .pipe(replace(
      '<script src="scripts.js" defer></script>',
      ''
    ))
    // replace url('*') with url(base64)
    .pipe(replace(
      'url(arcade-normal',
      'src:url(./assets/fonts/arcade-normal'
    ))
    .pipe(replace(
      `<link rel="stylesheet" href="styles.css" media="print" onload="this.media='all'"><noscript><link rel="stylesheet" href="styles.css"></noscript>`,
      ''
    ))
    //.pipe(uglify())
    .pipe(gulpif(tar == true, gzip()))
    .pipe(gulp.dest('./generated'));
}
gulp.task('zeos-bundler', myGulpTask);