
const myGulpTask = module.exports = (inputPath, projectPath, tar) => {

  exec('npm i ngx-build-plus && ng build --vendor-chunk=false --output-hashing=none --base-href #', function (err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);

    fs.mkdir('generated', (err) => {
      console.log('Directory created successfully!');

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

      fse.copy(inputPath + '/assets', 'generated/assets', function (err) {
        if (err) {
          console.log('An error occurred while copying the folder.')
          //return console.error(err)
        }
        console.log('Copy completed!')
      });


      fse.copy(inputPath + '/assets', 'generated/index.htmlassets', function (err) {
        if (err) {
          console.log('An error occurred while copying the folder.')
          //return console.error(err)
        }
        console.log('Copy completed!')
      });

      fs.readdirSync("./generated/")
        .filter(f => !/[.]html$/.test(f) && !/assets$/.test(f))
        .map(f => fs.unlinkSync('./generated/' + f));
      
      var regexp = /\w*(\-\w{8}\.js){1}$|\w*(\-\w{8}\.css){1}$/;
      gulp.src(['./generated/*'])
        .pipe(deletefile({
          reg: regexp,
          deleteMatch: false
        }))

      return tar !== null ? tarball(inputPath, mainContent, styleScssContent, runtimeContent, polyfillsContent) : noTar(inputPath, mainContent, styleScssContent, runtimeContent, polyfillsContent)

    });
  });
}

function tarball(inputPath, mainContent, styleScssContent, runtimeContent, polyfillsContent) {
  gulp.src(inputPath + '/index.html')
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
    .pipe(replace(
      'src:url(',
      'src:url(./assets/fonts/'
    ))
    .pipe(replace(
      'url(arcade-normal',
      'src:url(./assets/fonts/arcade-normal'
    ))
    .pipe(replace(
      `<link rel="stylesheet" href="styles.css" media="print" onload="this.media='all'"><noscript><link rel="stylesheet" href="styles.css"></noscript>`,
      ''
    ))
    .pipe(tar('minified.tar'))
    .pipe(gzip())
    .pipe(gulp.dest('./generated'));
}