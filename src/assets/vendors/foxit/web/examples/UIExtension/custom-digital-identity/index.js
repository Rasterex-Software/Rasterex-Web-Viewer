var PDFUI = UIExtension.PDFUI;
var PDFViewerCtrl = UIExtension.PDFViewCtrl;
var $ = UIExtension.vendors.jQuery;
var FRAGMENT_ACTION = UIExtension.UIConsts.FRAGMENT_ACTION;
var COMPONENT_EVENTS = UIExtension.UIConsts.COMPONENT_EVENTS;

// Create custom identity information button controller
var CustomIdentityInfoButtonController = PDFViewerCtrl.shared.createClass({
    mounted(){
        var languageHandler = ()=>{
            this.pdfUI.getCurrentLanguage().then(currentLng=>{
                if(currentLng === 'zh-CN'){
                    this.component.show()
                }else{
                    this.component.hide();
                }
            });
        }
        languageHandler();
        this.pdfUI.addViewerEventListener('change-language-success', languageHandler);
    },
    // Show custom identity information dialog
    handle() {
        this.dialog = this.component.getRoot().querySelector('@custom:identity-info-dialog');
        this.dialog.show();
    },
}, UIExtension.Controller, {
    // statics
    getName: function () {
        return 'CustomIdentityInfoButtonController';
    }
})

var CustomIdentityInfoDialogSuperClass = UIExtension.SeniorComponentFactory.createSuperClass({
    template: document.getElementById('custom-identity-information-template').innerHTML
});

// Create custom identity information dialog component
var CustomIdentityInfoDialog = PDFViewCtrl.shared.createClass({
    postlink: function () {
        CustomIdentityInfoDialogSuperClass.prototype.postlink.call(this);
        const domArr = ['surname', 'name', 'title', 'associationName', 'organizationName', 'ok', 'cancel']
        for (let index = 0; index < domArr.length; index++) {
            const ele = domArr[index];
            this['$' + ele] = $(this.element).find('[name=' + ele + ']')
        }
    },
    mounted: function () {
        CustomIdentityInfoDialogSuperClass.prototype.mounted.call(this);
        this.bindEvent();
    },
    updateUI: function (identityInfo) {
        Object.entries(identityInfo).forEach(item => {
            var ele = item[0];
            this['$' + ele].val(item[1]);
        })
    },
    bindEvent() {
        var that = this;
        this.$cancel.on("click", function () {
            that.hide()
        })
        this.$ok.on("click", function () {
            let info = {};
            const domArr = ['surname', 'name', 'title', 'associationName', 'organizationName']
            for (let index = 0; index < domArr.length; index++) {
                const ele = domArr[index];
                info[ele] = that['$' + ele].val()
            }
            that.pdfUI.callAddonAPI("DigitalStampUIXAddon", "setIdentityInfo", [info]).then(_=>{
                that.hide();
            });
        })
    }
}, CustomIdentityInfoDialogSuperClass, {
    // statics
    getName: function () {
        return 'identity-info-dialog';
    }
})

// Create custom identity information dialog controller
var CustomIdentityInfoDialogController = PDFViewCtrl.shared.createClass({
    mounted: function () {
        var that = this
        this.component.on(COMPONENT_EVENTS.SHOWN, function () {
            that.pdfUI.callAddonAPI("DigitalStampUIXAddon", "getIdentityInfo").then(info => {
                that.updateDom(info);
            })
        })
    },
    updateDom(info){
        this.component.updateUI(info);
    }
}, UIExtension.Controller, {
    // statics
    getName: function () {
        return 'CustomIdentityInfoDialogController';
    }
})

var customModule = UIExtension.modular.module('custom', [])
customModule.registerComponent(CustomIdentityInfoDialog);
customModule.registerController(CustomIdentityInfoDialogController);
customModule.registerController(CustomIdentityInfoButtonController);

var pdfui = new PDFUI({
    viewerOptions: {
        libPath: '../../../lib',
        jr: {
            licenseSN: licenseSN,
            licenseKey: licenseKey
        }
    },
    // Set default language. You can also change language by PDFUI::changeLanguage.
    i18n:{
        lng:'zh-CN'
    },
    renderTo: '#pdf-ui',
    fragments: [{
        target: 'template-container',
        action: FRAGMENT_ACTION.APPEND,
        template: '<custom:identity-info-dialog>',
        config: {
            target: 'custom-identity-information-dialog',
            callback: CustomIdentityInfoDialogController
        }
    }, {
        target: 'fv--search-bar',
        template: '<button class="fv__ui-toolbar-change-identity-info-button" name="changeIdentity">身份信息</button>',
        action: FRAGMENT_ACTION.BEFORE,
        config: [{
            target: 'changeIdentity',
            callback: CustomIdentityInfoButtonController
        }]
    }],
    addons: UIExtension.PDFViewCtrl.DeviceInfo.isMobile ?
        '../../../lib/uix-addons/allInOne.mobile.js' : '../../../lib/uix-addons/allInOne.js'
});

pdfui.openPDFByHttpRangeRequest({
    range: {
        url: '../../../docs/FoxitPDFSDKforWeb_DemoGuide.pdf',
    }
}, {
    fileName: 'FoxitPDFSDKforWeb_DemoGuide.pdf'
})
