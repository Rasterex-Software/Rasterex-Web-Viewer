# Introduce

This is scaffold demo for UIExtension, including a open-source UI addon. It shows how to customize UI and how to using declaration file. Since some technical problem, there some wrong cases in declaration file.

# How to run demo

## Setup library

Excute command `npm i` in demo root folder.

## Start demo

Excute command:
`npm start`

# Source code

These are what in src folder:
<pre>
│  addons.js                        --- shows how to use foxit addons.
│  index.js                         --- entry.
│
└─addonExample                      --- an addon example. 
    │  addon.info.json              --- addon entry file, which specified all related file in an addon.
    │  index.css                    --- style sheet
    │  index.js                     --- addon script entry. DON'T modify it's file name.
    │
    ├─locales                       --- i18n files
    │      en-US.json
    │      zh-CN.json
    │
    ├─stateHandlers                 --- State Handler Classes which extend IStateHandler 
    │      addTextField.js
    │
    └─templates
            custom-dialog.art       --- Art template for customed dialog.
            tab-template.art        --- Art template for customed tool bar.
</pre>

## addon.info.json

<pre>
{
    "library": "ExampleUIXAddon",
    "i18n": {
        "ns": "example",
        "sources": {
            "en-US": "./locales/en-US.json",
            "zh-CN": "./locales/zh-CN.json"
        }
    },
    "css": [
        "./index.css"
    ]
}
</pre>

### "i18n" field
this field is used to config localization. "ns" specify namespace. "sources" specify files.

After configuration, we can use `[i18n-namespace]:[i18n-key]` to localize.

In this case, i18n namespace is "example", "i18n-key" could be "toolbar.title", "dialog.title" or "buttons.addText"(Refer to zh-CN.json for details). 

For example, 
> &lt;h6&gt;example:dialog.title&lt;/h6&gt;

will be translat to 
> &lt;h6&gt;Dialog title&lt;/h6&gt;

and 
> &lt;h6&gt;对话框标题&lt;/h6&gt;

### "css" field
Specify style sheets("index.css" is the output of style-loader).  Only css can work. 


## src/addonExample/index.js
Script entry for addon(Don't change it's filename). Please refer to source file for more details.

# Foxit addons
## Predefined addons
In `FoxitPDFSDKForWeb/lib/uix-addons` folder, there are 16 predifiened addon.
<pre>
├─edit-graphics
├─example
├─export-form
├─file-property
├─full-screen
├─h-continuous
├─h-facing
├─h-single
├─import-form
├─multi-media
├─password-protect
├─path-objects
├─print
├─redaction
├─text-object
└─undo-redo
</pre>

You can load them freely. In this demo, <i>path-objects</i> and <i>edit-graphics</i> are loaded. Please refer to `src/addons.js` to find out how to load them.

In other demos, predifiened addons is used individual. However, the can be merged into one file. Please refer to [addon-loader](https://www.npmjs.com/package/@foxitsoftware/addon-loader) and
[gulp-merge-addon](https://www.npmjs.com/package/@foxitsoftware/gulp-merge-addon)

## Structure of addons.
### addon entry
File `addon.info.json` is the entry of an addon. This file specifies addon's name, i18n files and css files.
### Script entry.
File `src/addonExample/index.js` shows how to register a dialog and how to bind event handler.

Generlly, an addon is a js class which contains 3 static methods:
``` javascript
static getName(){...} //Return addon's name.
static getLoader(){...} //Loader for addon.
static init(){...}  //Called after an addon is loaded. This would register some UI component.
```                             
and a member:
```javascript
fragments(){...} //Customize UI such as toolbar, side pannel.
```
