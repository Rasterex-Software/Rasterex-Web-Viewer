# UIExtension addons loader and gulp plugin

In the past, FoxitPDFSDKforWeb offers fragmentation method to load addons by default. The defect for this method is it makes many HTTP requests to addons. This slackens the loading speed particularly when the network is slow and there are many addons. To reduce the number of addon HTTP requests to speed up the SDK initialization time, we provide a loader and a plugin that can be applied for project with webpack and gulp. They are:

- addon-loader: It is used to preprocess addon files for webpack.
- gulp-merge-addon plugin：This plugin is implemented based on addon-loader. It is used for gulp project without webpack, and for the use case that the addons could be loaded separately as a foo.js.

_fragmentation addon loading method_

```js
<script>
    new PDFUI({
        fragments: [],
        addons: [
        '../../../lib/uix-addons/multi-media',
        ]
        // Omitting extraneous options ...
    });
</script>
```

## addon-loader

The addon-loader provides a way to import UIExtension addon as a module. This requires css-loader, style-loader and babel-loader.

_Import Example_

```
import TextObjectAddon from '@addons/text-object/addon.info.json';
```

_Note:This example assumes you have an existing project with webpack installed_

### install addon-loader

In the root directory of your project, execute:

```sh
    npm i -D @foxitsoftware/addon-loader
```

### Configure webpack.config.js

**module**

```js
module.exports = {
    module: {
        rules: [{
            test: /\.css$/,
            loader: ['style-loader', 'css-loader']
        },{
            test: /addon.info.json/,
            use: [{
                loader: 'babel-loader',
                options: {
                    "presets": ["@babel/preset-env"]
                }
            }, '@foxitsoftware/addon-loader'],
            type: 'javascript/auto'
        }]
    }, // Omitting extraneous options ...

```

**externals**

```js
    externals: ['PDFViewCtrl']  //PDFViewCtrl is only required by addon-loader
	}
```

Refer to _examples/use-merged-addon/addon-module/webpack.config.js_ for details.

### Import in index.js

```js
import TheAddonExportedLibrary from "path/to/the/addons/directory/addon.info.json";
//import more addons based on your need

new PDFUI({
  addons: [TheAddonExportedLibrary],
  // Omitting extraneous options ...
});
```

Refer to *examples/use-merged-addon/addon-module/src/index.js* for details.

## gulp-merge-addon Plugin

Some projects do not use webpack so they cannot use the addon-loader directly. This use case should first use the gulp-merge-addon plugin to merge addons as shown in Example 1 below, and then import the merged addons in one of ways as shown in the following Example 2 and Example 3. 

### Example 1： Merge addons

In root directory of your project, 

1. Install gulp-merge-addon plugin
   ```sh
   npm i -D @foxitsoftware/gulp-merge-addon
   ```

   if you don't have gulp installed, you should execute

   ```sh
   npm i -D gulp @foxitsoftware/gulp-merge-addon
   ```

2. Construct gulpfile.js

    You can new a blank gulpfile.js and paste the following contents into gulpfile.js

   ```js
   const gulp = require("gulp");
   const mergeAddon = require("@foxitsoftware/gulp-merge-addon");
   const libPath = "./lib/"; // path to the sdk's lib directory

   gulp.task("merge-addon", () => {
     return gulp
       .src([libPath + "uix-addons/*/addon.info.json"]) //uses the glob rule to match all addons in uix-addon
       .pipe(
         mergeAddon({
           library: "UIExtensionAddons", // an array global-variable
           filename: "merged-addons.js", // the output file name
           progress: true, // whether to show progress on console
         })
       )
       .pipe(gulp.dest("./dist/")); //output to the destination
   });
   ```

3. Merge addons

   ```sh 
   gulp merge-addon
   ```
   After done, you will get a `./dist/merged-addon.js` file. 
   For an example, please refer to `examples/use-merged-addon/addon-external`.Navigate to the root directory in this example project, and execute `npm run merge-addon` to start merging addons

### Example 2：Import merged-addons as modules

This example shows how to import the `merge-addons.js` as modules. This is useful when your project do not have a webpack. Refer to Example 1 for how to generate `merged-addons.js`.

**Configuration** 

Refer to the `rollup.config.js` in the example project  `rollup-load-addon` for configuration details.

**Import in index.js**

```js
import { default as addons } from "../dist/merged-addons";

new UIExtension.PDFUI({
  addons: addons,
  // Ignore other irrelevant options.
});
```
For an example, refer to the `src/index.js` in the example project `rollup-load-addon`.

### Example 3: Load merged-addons separately

This example shows how to load the `merged-addons.js`separately. Refer to Example 1 for how to generate `merged-addons.js`.

**Configuration** 

Some notes for configuring webpack.config.js

1. The global-variable name is UIExtensionAddons which is an array exposed by the mergeed-addons.js.
2. The UIExtension, PDFViewCtrl, and UIExtensionAddons should be excluded.
   ```js
   externals: ["PDFViewCtrl", "UIExtension", "UIExtensionAddons"];
   ```
3. Due to the load order of CSS files in webpack, UIExtension.css should be loaded separately.
4. Add `add-asset-html-webpack-plugin` to inject the external dependencies in the HTML.
   ```js
   new AddAssetHtmlWebpackPlugin([{
       filepath: path.resolve(libPath, 'UIExtension.css'),
       typeOfAsset: 'css'
   },{
       filepath: path.resolve(libPath, 'UIExtension.full.js'), //the addon doesn't run until UIExtension.full.js is loaded.
       outputPath: path.resolve(distPath, 'lib'),
       publicPath: '/lib/UIExtension.full.js'
   },{
       filepath: path.resolve(__dirname, 'dist/merged-addons.js')
   }]),
   ```

For details, refer to example project `examples/use-merged-addon/addon-external` and `examples/use-merged-addon/rollup-load-addon`.
