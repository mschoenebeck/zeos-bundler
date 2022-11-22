
# Minified Angular


Gui package that **bundles all the angular files in a single index.html**.

All of the '/dist/*' files will be embedded on the same index.html, making this index.html standalone.

With the index.html being standalone you will be able to:
* Distribute a index.html
* Make a **double-clickable file, without the need of a web server**

The downsides of using this package:
* **NO** lazy loading
* **NO** cache on the web browser




## Installation

Install zeos-bundler with npm

```bash
  npm install zeos-bundler
```

When installed, you can configure a build command on your package.json


```bash
  "scripts": {
    ...
    "minified-build": "zeos-bundler --input-path dist/ --project-path /",
    ...
  },
```

This way you will be able to run it using npm run

```bash
  npm run minified-build
```
## Usage/Examples

As you can see you will need to specify your dist folder generation path, usually defined in the angular.json file, property: "outputPath"

```bash
  zeos-bundler --input-path <dist folder path> --project-path <project path>
```

Being on the angular root path of your project (let's call it 'sample') you will be able to compile doing:

```bash
  zeos-bundler --input-path dist/sample --project-path /
```

