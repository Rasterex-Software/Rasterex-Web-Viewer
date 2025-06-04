import '@lib/UIExtension.css';
import * as UIExtension from 'UIExtension';
import * as license from '../../../../license-key.js';
import FilePropertyAddon from '@addons/file-property/addon.info.json';
import MultiMediaAddon from '@addons/multi-media/addon.info.json';
import PasswordProtectAddon from '@addons/password-protect/addon.info.json';
import RedactionAddon from '@addons/redaction/addon.info.json';
import PathObjectsAddon from '@addons/path-objects/addon.info.json';
import PrintAddon from '@addons/print/addon.info.json';
import FullscreenAddon from '@addons/full-screen/addon.info.json';
import ImportFormAddon from '@addons/import-form/addon.info.json';
import ExportFormAddon from '@addons/export-form/addon.info.json';
import UndoRedoFormAddon from '@addons/undo-redo/addon.info.json';
import HContinuousPageModeAddon from '@addons/h-continuous/addon.info.json';
import TextObjectAddon from '@addons/text-object/addon.info.json';
import XThumbnailAddon from '@addons/thumbnail/addon.info.json';

PDFViewCtrl.Log.setLogLevel(PDFViewCtrl.Log.LEVELS.LEVEL_ERROR)

const pdfui = new UIExtension.PDFUI({
    viewerOptions: {
        libPath: '/lib',
        jr: {
            licenseKey: license.licenseKey,
            licenseSN: license.licenseSN,
            enginePath: './jr-engine/gsdk',
            fontPath: '../external/brotli'
        }
    },
    renderTo: '#pdf-ui',
    addons: [
        FilePropertyAddon,
        MultiMediaAddon,
        PasswordProtectAddon,
        RedactionAddon,
        PathObjectsAddon,
        PrintAddon,
        FullscreenAddon,
        ImportFormAddon,
        ExportFormAddon,
        UndoRedoFormAddon,
        HContinuousPageModeAddon,
        XThumbnailAddon
    ].concat(PDFViewCtrl.DeviceInfo.isMobile ? [] : [TextObjectAddon])
});

pdfui.openPDFByHttpRangeRequest({
    range:{
        url:'/docs/FoxitPDFSDKforWeb_DemoGuide.pdf',
    }
},{fileName:'FoxitPDFSDKforWeb_DemoGuide.pdf'});
