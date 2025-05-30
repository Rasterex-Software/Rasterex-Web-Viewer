/**
 * We offer a loader("@foxitsoftware/addon-loader") to load foxit addons.
 * In this demo's package.json, pageckage 'UIExtension' is refer to 'FoxitPDFSDKForWeb/lib' path.
 */
import EditAddon from '@lib/uix-addons/edit-graphics/addon.info.json';
import PathAddon from '@lib/uix-addons/path-objects/addon.info.json';
import Thumbnail from '@lib/uix-addons/thumbnail/addon.info.json';
export default [EditAddon,PathAddon,Thumbnail];