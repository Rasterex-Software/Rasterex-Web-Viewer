'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function round(value, decimals) {
    return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
}

function loadFromParent() {
    window.parent.iframeload(addfoxitdoc());
    //window.parent.foxitopenFile();
}

function loadmessage(){
    //console.log("I have loaded");

    window.parent.newiframemessage(window.frameElement.id);
    console.log(window.parent.foxitgetOpenDocs());

    //console.log(window.frameElement.id);

    

}

var foxframeview = undefined;



var foxitdocs = [];

var foxitViewer = function foxitViewer(zsdivid, divnum, libpath) {
    var foxview = this;
    var PixelToPoint = 72 / 96; //0.75
    var PointToPixel = 96 / 72; //1.3333

    //window.onscroll = this.onScroll;

    var RxCore = undefined;

    window.$ = PDFViewCtrl.jQuery;

    this.divnum = divnum;
    this.libpath = libpath;
    this.PDFViewer = PDFViewCtrl.PDFViewer;
    this.PDFPageRendering = PDFViewCtrl.PDFPageRendering;

    this.IViewMode = PDFViewCtrl.IViewMode;

    this.useblobfromurl = true;

    this.busePassword = false;
    this.password = '';

    this.createRxDoc = false;
    this.vBarOn = false;
    this.hBarOn = false;
    this.onVBar = false;
    this.onHBar = false;

    this.onVBarGrip = false;
    this.onHBarGrip = false;

    this.sBarWidth = 0;

    this.iframename = null;
    this.rxindex = 0;
    this.firstrendered = false;
    this.pdfViewer = null;
    this.numpages = 0;
    this.curpage = 0;
    this.divid = zsdivid;
    this.divelement = document.getElementById(zsdivid);
    this.filename = '';
    this.redraw = false;
    this.rendering = false;
    this.fileOpen = false;
    this.firstrender = true;
    this.scale = 1;

    this.originalrotation = 0;
    
    this.dummypageAdded = false;

    this.firstpagewidth = 300;
    this.firstpageheight = 300;
    this.pagestates = [];
    this.docrect = null;
    this.rxcorescrollpagenum = 0;
    this.curypos = 0;
    this.lastoperation = 0;
    this.gotopagepending = null;
    this.scrollWidthfactor = 1;
    this.scrollHeightfactor = 1;
    this.gotopageused = false;
    this.rxresize = false;
    this.snapinprogress = false;
    this.nMaxScale = 10;

    this.curpagerender = null;


    const markSelectClassName = 'fv__mark-selection-blank';
    const markSelectSelector = '.' + markSelectClassName;


    window.onscroll = function () {
        myScroll();
    };

    function myScroll() {

        //var scrollposy = window.scrollY || window.pageYOffset || 0;
        //var scrollposx = window.scrollX || window.pageXOffset || 0;

        //console.log(foxview.curpage);
        if (!foxview.rxresize) {
            //foxview.setmarkupPosition(foxview.curpage);
            var pagepos = foxview.getPagePos(foxview.curpage);
            //console.log(pagepos);

            RxCore.scrollBarCheck();
            RxCore.foxitonScrollupdate(pagepos, foxview.curpage);
        }
    }

    window.onresize = function () {
        myResize();
    };

    function myResize() {
        //console.log(foxview.curpage);
        if (!foxview.rxresize) {
            //foxview.setmarkupPosition(foxview.curpage);
            RxCore.scrollBarCheck();
        }
    }

    //Adds a marker to the selected range
    function appendSelectMark($parent, rectArray) {
        removeSelectMark($parent);
        if (!rectArray) {
            return;
        }
        let $frag = $(document.createDocumentFragment());
        for (let i = 0, j = rectArray.length; i < j; i++) {
            let rect = rectArray[i];
            let style = ['top:' + rect.top + 'px', 'left:' + rect.left + 'px', 'width:' + (rect.right - rect.left) + 'px', 'height:' + (rect.bottom - rect.top) + 'px'].join(';')
            $frag.append('<mark class="' + markSelectClassName + '" style="' + style + '"></mark>')
        }
        $parent.append($frag);
    }

    //Removes the selection range marker
    function removeSelectMark($parent) {
        $parent.find(markSelectSelector).remove();
    }

    //Converts PDF range rectangle to device range rectangle
    function transformRectArray(page, rectArray, pageRender) {
        let deviceRectArray = [];
        let scale = pageRender.scale;
        for (let i = rectArray.length; i--;) {
            let rect = rectArray[i];
            deviceRectArray[i] = page.getDeviceRect(rect, scale);
        }
        return deviceRectArray;
    }


    //operations
    //0 - none;
    //1 - scale;
    //2 - scroll;
    //3 - gotopage;


    var CustomPageRendering = function (_foxview$PDFPageRende) {
        _inherits(CustomPageRendering, _foxview$PDFPageRende);

        function CustomPageRendering() {
            _classCallCheck(this, CustomPageRendering);

            return _possibleConstructorReturn(this, (CustomPageRendering.__proto__ || Object.getPrototypeOf(CustomPageRendering)).apply(this, arguments));
        }

        _createClass(CustomPageRendering, [{
            key: 'rendered',

            /*constructor(docRender) {
                super(docRender)
            }*/

            value: function rendered() {

                if (foxview.firstrender) {

                    var foxitpage = {
                        docindex: 0,
                        pageindex: 0,
                        canvases: [],
                        hidden: [],
                        visible: [],
                        transScale: 1,
                        indexarray: [],
                        pagescale: 1,
                        width: foxview.firstpagewidth,
                        height: foxview.firstpageheight
                    };

                    foxitpage = foxview.getCanvases(foxitpage);
                    if (foxitpage.canvases.length > 0) {
                        //RxCore.quickPage(foxitpage);
                    }

                    foxview.firstrender = false;

                    if (foxview.createRxDoc) {
                        foxview.rxindex = RxCore.createFoxitDoc(foxview);
                        RxCore.hidedisplayCanvas(true);
                    }
                }
            }
        }, {
            key: 'rendering',
            value: function rendering() {}
        }]);

        return CustomPageRendering;
    }(foxview.PDFPageRendering);

    function init() {

        //offsetx = 0;
        //offsety = 0;
        RxCore = window.parent.RxCore;

        foxview.busePassword = false;
        foxview.password = '';

        foxview.createRxDoc = false;
        foxview.vBarOn = false;
        foxview.hBarOn = false;

        foxview.onVBar = false;
        foxview.onHBar = false;

        foxview.onVBarGrip = false;
        foxview.onHBarGrip = false;

        foxview.sBarWidth = 0;
        foxview.pdfViewer = null;
        foxview.rxindex = 0;
        foxview.firstrendered = false;
        foxview.numpages = 0;
        foxview.curpage = 0;
        foxview.filename = '';
        foxview.redraw = false;
        foxview.rendering = false;
        foxview.fileOpen = false;
        foxview.firstrender = true;
        foxview.scale = 1;
        foxview.dummypageAdded = false;
        foxview.firstpagewidth = 300;
        foxview.firstpageheight = 300;
        foxview.nMaxScale = 10;
        foxview.pagestates = [];
        foxview.docrect = window.document.body.getBoundingClientRect();
        foxview.rxcorescrollpagenum = 0;
        foxview.curypos = 0;
        foxview.scrollWidthfactor = 1;
        foxview.scrollHeightfactor = 1;
        foxview.gotopageused = false;
        foxview.rxresize = false;



        var fontMaps = [ 
            {
                    nameMatches: [/Arial/i],
                    glyphs: [
                            {
                                //bold: -1,
                                flags: 32 ,
                                url: 'http://viewserver.rasterex.com/rxweb/assets/fonts/arial.ttf'
                            }
                    ],
        
                    charsets: [0]
        
            },
            {
                    nameMatches: [/Arial Bold/i],
                    glyphs: [
                        {
                                //bold: -1,
                                flags: 32 ,
                                url: 'http://viewserver.rasterex.com/rxweb/assets/fonts/arialbd.ttf'
                        }
                    ],
                    charsets: [0]
                },
                {
                    nameMatches: [/Arial bold italic/i],
                    glyphs: [
                        {
                            //bold: -1,
                            flags: 32 ,
                            url: 'http://viewserver.rasterex.com/rxweb/assets/fonts/arialbi.ttf'
                        }
                    ],
                    charsets: [0]
                },
                {
                    nameMatches: [/Arial italic/i],
                    glyphs: [
                        {
                                //bold: -1,
                                flags: 32 ,
                                url: 'http://viewserver.rasterex.com/rxweb/assets/fonts/ariali.ttf'
                        }
                    ],
                    charsets: [0]
                },
                {
                    nameMatches: [/Arial black/i],
                    glyphs: [
                        {
                            //bold: -1,
                            flags: 32 ,
                            url: 'http://viewserver.rasterex.com/rxweb/assets/fonts/ariblk.ttf'
                        }
                    ],
                    charsets: [0]
                },
                {
                    nameMatches: [/Times New Roman/i],
                    glyphs: [
                        {
                            //bold: -1,
                            flags: 32 ,
                            url: 'http://viewserver.rasterex.com/rxweb/assets/fonts/times.ttf'
                        }
                    ],
                    charsets: [0]
                },
                {
                    nameMatches: [/Times New Roman bold/i],
                    glyphs: [
                        {
                            //bold: -1,
                            flags: 32 ,
                            url: 'http://viewserver.rasterex.com/rxweb/assets/fonts/timesbd.ttf'
                        }
                    ],
                    charsets: [0]
                },
                {
                    nameMatches: [/Times New Roman bold italic/i],
                    glyphs: [
                        {
                            //bold: -1,
                            flags: 32 ,
                            url: 'http://viewserver.rasterex.com/rxweb/assets/fonts/timesbi.ttf'
                        }
                    ],
                    charsets: [0]
                },
                {
                    nameMatches: [/Times New Roman italic/i],
                    glyphs: [
                        {
                            //bold: -1,
                            flags: 32 ,
                            url: 'http://viewserver.rasterex.com/rxweb/assets/fonts/timesi.ttf'
                        }
                    ],
                    charsets: [0]
                },

        ]

            
        //
        //
        //


        


        foxview.pdfViewer = new foxview.PDFViewer({
            //fontPath: './assets/fonts',
            //fontInfoPath: './assets/fontInfo.csv',   // Set the path for the font information file.
            libPath: foxview.libpath,
            noJSFrame: false,
            jr: {
                licenseSN: licenseSN,
                licenseKey: licenseKey
            },
            maxScale :foxview.nMaxScale
        });

        var szdivhashid = '#' + zsdivid;

        foxview.pdfViewer.config.noJSFrame = true;
        foxview.pdfViewer.init(szdivhashid);


        if (foxview.pdfViewer) {
            foxview.onLicenseSuccess(foxview.pdfViewer, PDFViewCtrl.Events);
        }

        /*foxview.pdfViewer.eventEmitter.on(ViewerEvents.jrLicenseSuccess, () => {
            
            console.log("foxit ready");
            //do something
        })*/


    }

    this.reset = function () {
        foxview.createRxDoc = false;

        foxview.busePassword = false;
        foxview.password = '';

        foxview.vBarOn = false;
        foxview.hBarOn = false;

        foxview.onVBar = false;
        foxview.onVBarGrip = false;
        foxview.onHBar = false;
        foxview.onHBarGrip = false;

        foxview.sBarWidth = 0;
        foxview.rxindex = 0;
        foxview.firstrendered = false;
        foxview.numpages = 0;
        foxview.curpage = 0;
        foxview.filename = '';
        foxview.redraw = false;
        foxview.rendering = false;
        foxview.fileOpen = false;
        foxview.firstrender = true;
        foxview.scale = 1;
        foxview.dummypageAdded = false;
        foxview.firstpagewidth = 300;
        foxview.firstpageheight = 300;
        foxview.pagestates = [];
        foxview.docrect = window.document.body.getBoundingClientRect();
        foxview.rxcorescrollpagenum = 0;
        foxview.curypos = 0;
        foxview.scrollWidthfactor = 1;
        foxview.scrollHeightfactor = 1;
        foxview.gotopageused = false;
        foxview.rxresize = false;
    };

    this.onScroll = function () {};

    this.setIframeName = function (frameid) {
        foxview.iframename = frameid;
    };

    this.limitedClenup = function(){
        if (foxview.pdfViewer && !foxview.fileOpen) {
            //foxview.pdfViewer.webPDFJR.api.workerPromise.worker.terminate();
            //delete foxview.pdfViewer.webPDFJR.api.workerPromise.worker;
            //foxview.pdfViewer = undefined;
            foxview.pdfViewer = null;
        }

    };

    this.cleanUp = function () {
        if (foxview.pdfViewer && !foxview.fileOpen) {
            foxview.pdfViewer.webPDFJR.api.workerPromise.worker.terminate();
            delete foxview.pdfViewer.webPDFJR.api.workerPromise.worker;
            foxview.pdfViewer = null;
        }
    };

    this.closeFile = function () {
        if (foxview.pdfViewer) {
            foxview.pdfViewer.close(function () {
                return true;
            }, function () {
                foxview.fileOpen = false;
                foxview.cleanUp();
                //foxview.limitedClenup();
                init();
                console.log('file closed');
            });
        }
    };

    this.openFDF = function (url) {

        if (foxview.pdfViewer) {}
    };


    this.onLicenseSuccess = function (pdfViewer, ViewerEvents){

        if (pdfViewer) {
            
            foxview.pdfViewer.eventEmitter.on(ViewerEvents.jrLicenseSuccess, () => {
            
                //do something
                if(RxCore){
                    //console.log("foxit ready");
                    RxCore.initFoxit(foxview.divnum);
                }
                
                
            })
    
        }

    };

    function getURLFile(s){
        var path = "";
        var sp = s.split('/');
        for (var i = 0; i < sp.length - 1; i++) {
            path += sp[i] + "/";
        }
        //var file = sp[sp.length-1];
        //alert(file);
        return sp[sp.length-1];

    }

    function getFileName(s) {
        var path = "";
        var file = "";
         if(s){
           if(s.indexOf('https://') > -1){
               file = getURLFile(s);
            }else if (s.indexOf('http://') > -1){
               file = getURLFile(s);
            }else{
               var sp = s.split('\\');
               for (var i = 0; i < sp.length - 1; i++) {
                       path += sp[i] + "\\";
                   }
               file = sp[sp.length - 1];
               //alert(file);
            }
         }
        return file;
   
    }

    function blobToFile(theBlob, fileName,contentType, sliceSize){

        //contentType='', sliceSize=512
        //var byteCharacters = atob(theBlob.replace(/^data:image\/(png|jpeg|jpg);base64,/, ''));
        var byteCharacters = atob(theBlob.replace(/^data:application\/pdf;base64,/, ''));

        
        //const byteCharacters = atob(theBlob);
        const byteArrays = [];

        for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            const slice = byteCharacters.slice(offset, offset + sliceSize);

            const byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
            }

            const byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
        }

        const blob = new Blob(byteArrays, {type: contentType});



        //A Blob() is almost a File() - it's just missing the two properties below which we will add
        blob.lastModifiedDate = new Date();
        blob.name = fileName;
        return blob;
    }

    this.getBlobfromURL = function (url, filename){


        if(filename == undefined){
            filename = getFileName(url);
        }

        var request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.responseType = 'blob';
        request.onload = function() {
            var reader = new FileReader();
            reader.readAsDataURL(request.response);
            reader.onload =  function(e){
                
                //function blobToFile(theBlob, fileName,contentType, sliceSize){
                //contentType='', sliceSize=512
                var file = blobToFile(e.target.result, filename, '', 512);

                foxview.openPDF(file, false);

                //console.log('DataURL:', e.target.result);
            };
        };
        request.send();
        
    };    

    this.openPDFURL = function (url, filename) {

        if (foxview.useblobfromurl){
            foxview.getBlobfromURL(url, filename);
            return;
        }


        if (foxview.pdfViewer) {

            foxview.createRxDoc = false;
            foxview.onOpenURL(foxview.pdfViewer, PDFViewCtrl.Events);
            foxview.onRenderSuccess(foxview.pdfViewer, PDFViewCtrl.Events);
            foxview.onpageLayoutRedraw(foxview.pdfViewer, PDFViewCtrl.Events);
            foxview.onZoomToSuccess(foxview.pdfViewer, PDFViewCtrl.Events);
            foxview.onZoomToFailed(foxview.pdfViewer, PDFViewCtrl.Events);

            foxview.pdfViewer.openPDFByHttpRangeRequest({
                range: {
                    url: url
                    //chunkSize: 10 * 1024 * 1024
                }
            }).catch(function (error) {
                console.log(error);
            });
        }
    };

    this.setRxResize = function (onoff) {
        foxview.rxresize = onoff;
    };

    this.setPassword = function (password) {
        foxview.busePassword = true;
        foxview.password = password;
        //call reopen file.
    };

    //this.openPDF = function (file) {
    this.openPDF = function (file, createfile) {
    
        if (foxview.pdfViewer) {
            var pdf, fdf;
            var filename = file.name.toLowerCase();

            /*if (/\.pdf$/.test(filename)) {
                pdf = file;
            } else if (/\.(x)?fdf$/.test(filename)) {
                fdf = file;
            }*/

            if (/\.(x)?fdf$/.test(filename)) {
                fdf = file;
            }else if(/\.pdf$/.test(filename)){
                pdf = file;
            }else{
                pdf = file;
            }


            foxview.filename = filename;

            if(createfile == undefined){
                foxview.createRxDoc = true;
            }else{
                foxview.createRxDoc = createfile;
            }


            //foxview.createRxDoc = true;

            foxview.onOpen(foxview.pdfViewer, PDFViewCtrl.Events);
            foxview.onPageChange(foxview.pdfViewer, PDFViewCtrl.Events);
            foxview.onRenderSuccess(foxview.pdfViewer, PDFViewCtrl.Events);
            foxview.onpageLayoutRedraw(foxview.pdfViewer, PDFViewCtrl.Events);
            foxview.onZoomToSuccess(foxview.pdfViewer, PDFViewCtrl.Events);
            foxview.onZoomToFailed(foxview.pdfViewer, PDFViewCtrl.Events);

            foxview.pdfViewer.openPDFByFile(pdf, { password: '', fdf: { file: fdf } }).catch(function (error) {
                //console.log(error);

                let manager = foxview.pdfViewer.viewModeManager;
                manager.switchTo("continuous-view-mode");

                if (error.error == 3) {

                    console.log('invalid password');
                }
            });
        }
    };



    this.getTextSearch = function (szkeyword, pageindex, returnmethod, casesens) {
        var pdfDoc = undefined;

        if (foxview.pdfViewer) {

            pdfDoc = foxview.pdfViewer.getCurrentPDFDoc(); //.getLayerNodesJson().then(function (layernodes){

            if (pdfDoc) {

                if(casesens){
                    var searchtext = pdfDoc.getTextSearch(szkeyword, 1);
                }else{
                    searchtext = pdfDoc.getTextSearch(szkeyword, 0);
                }
                

                searchtext.setCurrentPageIndex(pageindex);
                if(searchtext && szkeyword != ""){
                    searchtext.findNexts().then(function (match) {

                        if (match) {
                            returnmethod(match, szkeyword, pageindex);
                        }
    
                        
                    }).catch(function (error) {
                        console.log(error);
                    });
                }
            }
        }
    };

    this.getBookmarks = function () {
        if (foxview.pdfViewer) {
            foxview.pdfViewer.getCurrentPDFDoc().getBookmarksJson().then(function (bookmarks) {
                if (bookmarks) {

                    RxCore.setPDFBookmarks(bookmarks.children);
                }
            });
        }
    };

    this.getLayerNodes = function () {
        if (foxview.pdfViewer) {
            foxview.pdfViewer.getCurrentPDFDoc().getLayerNodesJson().then(function (layernodes) {

                RxCore.setPDFLayers(layernodes.children);
            });
        }
    };

    this.getBitmapRect = function(pagenum, scale, rect, callback) {

        if (foxview.pdfViewer) {
            foxview.pdfViewer.getCurrentPDFDoc().getPageByIndex(pagenum).then(function (page) {
                var pgindex = page.info.index;

                //var scale = birdseye.scale;
                //var scale = 0.12;
                var pagescale = scale * PixelToPoint;
                var rotate = 0;

                
                var pwwidth = Math.round(foxview.pagestates[pgindex].width * scale);
                var pheight = Math.round(foxview.pagestates[pgindex].height * scale);

                //console.log(scale);

                var area = { x: rect.x, y: rect.y, width : rect.w, height : rect.h };



                var contentsFlags = ["page"];
                var usage = 'view';

                //foxview.pagestates[0].width = pwidth;
                //foxview.pagestates[0].height = pheight;


                page.render(pagescale, rotate, area, contentsFlags, usage).then(function (bitmap) {
                    pgindex = page.info.index;
                    //RxCore.setBirdsEyeFoxit(bitmap, pgindex);
                    //RxCore.setPageBitmap(bitmap, pgindex);
                    callback(bitmap);

                    //foxview.pagestates[pagenum].thumbadded = true;
                }).catch(function (error) {
                    //console.log(error);
                    callback(error);
                    console.log(error);
                });
            });
        }

    };    
    this.getBitmap = function (pagenum, scale, callback) {
        if (foxview.pdfViewer) {
            foxview.pdfViewer.getCurrentPDFDoc().getPageByIndex(pagenum).then(function (page) {
                var pgindex = page.info.index;

                //var scale = birdseye.scale;
                //var scale = 0.12;
                var pagescale = scale * PixelToPoint;
                var rotate = 0;


                var pwwidth = Math.round(foxview.pagestates[pgindex].width * scale);
                var pheight = Math.round(foxview.pagestates[pgindex].height * scale);

                var area = { x: 0, y: 0, width : pwwidth, height : pheight };

                //var area = { x: 0, y: 0, width: foxview.pagestates[pgindex].width * scale, height: foxview.pagestates[pgindex].height * scale };
                var contentsFlags = ["page"];
                var usage = 'view';

                //foxview.pagestates[0].width = pwidth;
                //foxview.pagestates[0].height = pheight;


                page.render(pagescale, rotate, area, contentsFlags, usage).then(function (bitmap) {
                    pgindex = page.info.index;
                    //RxCore.setBirdsEyeFoxit(bitmap, pgindex);
                    //RxCore.setPageBitmap(bitmap, pgindex);
                    callback(bitmap);

                    //foxview.pagestates[pagenum].thumbadded = true;
                }).catch(function (error) {
                    //console.log(error);
                    callback(error);
                    console.log(error);
                });
            });
        }
    };

    //this.getBirdsEye = function (pagenum) {
    this.getBirdsEye = function (pagenum, rotation) {
        if (foxview.pdfViewer) {
            foxview.pdfViewer.getCurrentPDFDoc().getPageByIndex(pagenum).then(function (page) {
                var pgindex = page.info.index;
                var ph = foxview.pagestates[pgindex].height;
                var pw = foxview.pagestates[pgindex].width;
                //var birdseye = RxCore.getBirdseyeDim(pgindex, foxview.pagestates[pgindex].width, foxview.pagestates[pgindex].height);

                var birdseyeWidth = 350;
                var birdseyeHeight = 275;

                if (pw > ph) {

                    var wscale = birdseyeWidth / pw;
                    var hscale = birdseyeHeight / ph;
                } else {
                    wscale = birdseyeHeight / pw;
                    hscale = birdseyeWidth / ph;
                }

                var scale = Math.max(wscale, hscale);

                //var scale = birdseye.scale;
                //var scale = 0.12;
                var pagescale = scale * PixelToPoint;
                var rotate = 0;

                if(rotation == 270 || rotation == 90){
                    var area = { x: 0, y: 0, width: foxview.pagestates[pgindex].height * scale, height: foxview.pagestates[pgindex].width * scale};
                }else{
                    area = { x: 0, y: 0, width: foxview.pagestates[pgindex].width * scale, height: foxview.pagestates[pgindex].height * scale };
                }


                //var area = { x: 0, y: 0, width: foxview.pagestates[pgindex].width * scale, height: foxview.pagestates[pgindex].height * scale };
                var contentsFlags = ["page"];
                var usage = 'view';

                page.render(pagescale, rotate, area, contentsFlags, usage).then(function (bitmap) {
                    pgindex = page.info.index;
                    RxCore.setBirdsEyeFoxit(bitmap, pgindex);
                    //foxview.pagestates[pagenum].thumbadded = true;
                });
            });
        }
    };

    this.getThumbnail = function (pagenum) {
        if (foxview.pdfViewer) {
            foxview.pdfViewer.getCurrentPDFDoc().getPageByIndex(pagenum).then(function (page) {
                var pgindex = page.info.index;
                page.getThumb(0, 1.5).then(function (thumbnail) {
                    pgindex = page.info.index;
                    RxCore.setThumbnailFoxit(thumbnail, pagenum);
                    foxview.pagestates[pagenum].thumbadded = false;
                });
            });
        }
    };

    this.rotatePage = function (pagenum, nrotation){

        /*Enumerator
            rotation0 	0 degree rotation.
            rotation1 	90 degree rotation.
            rotation2 	180 degree rotation.
            rotation3 	270 degree rotation.*/

        var nfoxrot = 0;

        if (nrotation == 0){nfoxrot = 0;}
        if (nrotation == 90){nfoxrot = 1;}
        if (nrotation == 180){nfoxrot = 2;}
        if (nrotation == 270){nfoxrot = 3;}



        if (foxview.pdfViewer) {

            /*foxview.pdfViewer.rotateTo(nrotation).then(function(){
                foxview.pagestates[pagenum].rendered = false;
            }).catch(function (error) {
                console.log(error);
            });*/

                /*page.getThumb().then(function (thumbnail) {
                    pgindex = page.info.index;
                    RxCore.setThumbnailFoxit(thumbnail, pagenum);
                    foxview.pagestates[pagenum].thumbadded = false;
                });*/

            foxview.pdfViewer.getCurrentPDFDoc().getPageByIndex(pagenum).then(function (page) {
                //var pgindex = page.info.index;
                
                page.setRotation(nfoxrot).then(function () {
                        // rotation change success
                        //console.log("rotate success");
                        foxview.pagestates[pagenum].rendered = false;
                });
                
            });
        }


    };


    this.forceRedraw = function () {

        foxview.redraw = true;
        foxview.pdfViewer.redraw();
        //console.log('redraw');

    };

    this.savePDF = function () {

        var pdfDoc = undefined;

        if (foxview.pdfViewer) {

            pdfDoc = foxview.pdfViewer.getCurrentPDFDoc(); //.getLayerNodesJson().then(function (layernodes){

            if (pdfDoc) {
                var bufferArray = [];
                return pdfDoc.getStream(function (_ref) {
                    var arrayBuffer = _ref.arrayBuffer,
                        offset = _ref.offset,
                        size = _ref.size;

                    bufferArray.push(arrayBuffer);
                }).then(function (size) {
                    console.log('The total size of the stream', size);
                    return new Blob(bufferArray, { type: 'application/pdf' });
                });
            }
        }
    };

    this.importFDF = function (blob) {

        var pdfDoc = undefined;

        if (foxview.pdfViewer) {
            pdfDoc = foxview.pdfViewer.getCurrentPDFDoc(); //.getLayerNodesJson().then(function (layernodes){

            if (pdfDoc) {
                pdfDoc.importAnnotsFromFDF(blob, true).then(function () {

                    pdfDoc.getAnnots().then(function(annotarray){
                        console.log(annotarray);
                    })
                    
                });
            }
        }
    };

    this.exportFDF = function () {

        if (foxview.pdfViewer) {
            pdfDoc = foxview.pdfViewer.getCurrentPDFDoc(); //.getLayerNodesJson().then(function (layernodes){

            if (pdfDoc) {
                pdfDoc.exportAnnotsToFDF(0, null).then(function (blob) {

                    RxCore.exportFDF(blob);
                });
            }
        }
    };

    this.setLayerState = function (szID, state) {
        if (foxview.pdfViewer) {

            foxview.pdfViewer.getCurrentPDFDoc().setLayerNodeVisiable(szID, state);
            foxview.pdfViewer.redraw();
            foxview.redraw = true;
        }
    };

    this.renderScale = function (pagenum, factor) {

        if (foxview.pdfViewer && pagenum == foxview.curpage && foxview.firstrendered) {

            foxview.scale *= factor;
            foxview.pdfViewer.zoomTo(foxview.scale);
            foxview.setpagerender(false);
        }
    };

    this.getpagerender = function (pagenum) {
        return foxview.pagestates[pagenum].rendered;
    };

    this.setpagerender = function (state) {
        for (var pgsi = 0; pgsi < foxview.pagestates.length; pgsi++) {
            foxview.pagestates[pgsi].rendered = state;
        }
    };

    this.setpagscale = function (scale) {
        /*for(var pgsi = 0; pgsi < foxview.pagestates.length; pgsi++){
            foxview.pagestates[pgsi].scale = scale;
        }*/

    };

    this.zoomOut = function (pagenum, factor) {
        if (foxview.pagestates[foxview.curpage].doscroll || foxview.rendering) {
            return;
        }
        
        if (factor > foxview.nMaxScale){
            return;
        }


        if (foxview.pdfViewer && pagenum == foxview.curpage) {
            foxview.scale /= factor;
            foxview.pdfViewer.zoomTo(foxview.scale);
            foxview.pagestates[pagenum].rendered = false;
        }
    };

    this.zoomIn = function (pagenum, factor) {
        if (foxview.pagestates[foxview.curpage].doscroll || foxview.rendering) {
            return;
        }

        if (factor > foxview.nMaxScale){
            return;
        }


        if (foxview.pdfViewer && pagenum == foxview.curpage) {
            foxview.scale *= factor;

            foxview.pdfViewer.zoomTo(foxview.scale);
            foxview.pagestates[pagenum].rendered = false;
        }
    };


    this.removeTextSelect = function(tselectobj){

        if(tselectobj.$handler != null){
            removeSelectMark(tselectobj.$handler);
        }


    };

    this.selectText = function(npagenum, tselectobj, callback){


        if(tselectobj.bstart){

            if(foxview.curpagerender != null){
                //pgscale = foxview.curpagerender.getScale();
                tselectobj.$handler = foxview.curpagerender.$handler;
            }
    
            if(tselectobj.$handler != null){
                removeSelectMark(tselectobj.$handler);
            }

            callback(tselectobj);
            
            return;
        }

        if(tselectobj.bend){


            if(tselectobj.$handler != null){
                removeSelectMark(tselectobj.$handler);
            }
            
            console.log('mouse up');
            callback(tselectobj);

            return;
            
        }


        

        if (foxview.pdfViewer && npagenum == foxview.curpage){

            foxview.pdfViewer.getCurrentPDFDoc().getPageByIndex(npagenum).then(function (page) {


                page.getTextContinuousRectsAtPoints(tselectobj.startpos, tselectobj.endpos, 8, tselectobj.start, tselectobj.end).then(function (rectarray) {
                    tselectobj.rectarray = rectarray;


                    if(foxview.curpagerender != null && tselectobj.$handler != null ){
                        var devrectarr = transformRectArray(page, tselectobj.rectarray, foxview.curpagerender);
                        appendSelectMark(tselectobj.$handler, devrectarr);
    
                    }
    
                    if(tselectobj.rectarray[0]){
                        var one = tselectobj.rectarray[0];
                        if (typeof one.text === 'string') {
                            tselectobj.start = one.start;
                            tselectobj.end = one.end;
                        }
                    }
                    

                    callback(tselectobj);
                    
                    
    
                });



            });

        }



    };

    this.getRenderStatus = function(){
        return foxview.rendering;
    };

    this.pantopoint = function(pagenum,newpos) {

        var position = {pageIndex : pagenum, x : newpos.x, y : newpos.y};

        foxview.pdfViewer.zoomTo(foxview.scale, position);

    };

    this.zoomtopointdirect = function(pagenum, factor, newpos){

        if(isNaN(factor)){
            return;
        }


        if (factor >= foxview.nMaxScale){
            return;
        }


        foxview.scale = factor;

        //{pageIndex : pagenum, x : newpos.x, y : newpos.y};
        var position = {pageIndex : pagenum, x : newpos.x, y : newpos.y};

        foxview.pagestates[pagenum].rendered = false;

        foxview.rendering = true;


        foxview.pdfViewer.zoomTo(foxview.scale, position);

    }; 


    this.zoomToPoint = function (pagenum, factor, deltaf, mousepoint, offset, center, bIn ){

        //thispage.DocRef.foxitdoc.zoomToPoint(thispage.pagenumber, scalefactor, factor, point, bin);

        if(isNaN(factor)){
            return;
        }


        if (factor >= foxview.nMaxScale){
            return;
        }


        if (foxview.pdfViewer && pagenum == foxview.curpage && factor > 0) {
            
            //var curscale = foxview.scale;

            if(factor >= foxview.nMaxScale){
                return;
            }

            foxview.scale = factor;

            if(bIn){

                var mouseposdiffx = (((mousepoint.x - offset.x) * deltaf) -(mousepoint.x - offset.x));
                var mouseposdiffy = (((mousepoint.y - offset.y) * deltaf) -(mousepoint.y - offset.y));

            }else{
                
                mouseposdiffx = (((mousepoint.x - offset.x) / deltaf) -(mousepoint.x - offset.x));
                mouseposdiffy = (((mousepoint.y - offset.y) / deltaf) -(mousepoint.y - offset.y));

            }

            
            var newpos = {x : Math.round(offset.x + mouseposdiffx), y : Math.round(offset.y + mouseposdiffy)};


            var position = {pageIndex : pagenum, x : newpos.x, y : newpos.y};

            foxview.pagestates[pagenum].rendered = false;


            foxview.rendering = true;

            foxview.pdfViewer.zoomTo(foxview.scale, position);
        




        }


    };

    this.zoomdirect = function (pagenum, factor, scrolldata) {
        /*if(foxview.pagestates[foxview.curpage].doscroll || foxview.rendering){
            return;
        }*/

        /*if(foxview.pagestates[foxview.curpage].doscroll){
            return;
        }*/

        if(isNaN(factor)){
            return;
        }


        if (factor >= foxview.nMaxScale){
            return;
        }


        if (foxview.pdfViewer && pagenum == foxview.curpage && factor > 0) {
            foxview.scale = factor;
            //console.log(foxview.scale);

            foxview.pagestates[pagenum].rendered = false;

            foxview.rendering = true;
            foxview.pdfViewer.zoomTo(foxview.scale);

            


            if (scrolldata) {
                if (scrolldata.pagerect.w >= scrolldata.cw) {
                    foxview.pagestates[pagenum].doscroll = true;
                    foxview.pagestates[pagenum].scrollArr.push(scrolldata);
                } else {
                    foxview.pagestates[pagenum].doscroll = false;
                    foxview.pagestates[pagenum].scrollArr = [];
                }
            } else {
                foxview.pagestates[pagenum].doscroll = false;
                foxview.pagestates[pagenum].scrollArr = [];
            }
            //foxview.setpagerender(false);
            //foxview.pdfViewer.redraw();

        }
    };

    this.restorePage = function (num) {

        foxview.pagestates[num].rendered = false;
        foxview.gotoPage(num);
    };

    this.setnotrendered = function (num) {
        if (foxview.fileOpen && foxview.pdfViewer) {

            foxview.pagestates[num].rendered = false;
        }
    };

    this.setCurPage = function (num) {
        foxview.curpage = num;
    };

    this.pageScroll = function (pagepos, pagenum) {
        var scrollposy = window.scrollY || window.pageYOffset || 0;
        var scrollposx = window.scrollX || window.pageXOffset || 0;

        //foxitpage.scrolldata.width = window.document.body.scrollWidth;
        //foxitpage.scrolldata.height = window.document.body.scrollHeight;

        //console.log(document.body.scrollTop);
        //console.log(window.document.body.scrollTop);
        //console.log(window.pageYOffset);
        
        if (pagepos != undefined){
            scrollposy += pagepos.top;
        }
        
        

        //console.log(pagepos.top);
        

        var pagscalediff = foxview.scale / foxview.pagestates[pagenum].pagescale;

        //console.log(pagscalediff);     

        if (foxview.scale == foxview.pagestates[pagenum].pagescale) {
            //window.scrollTo(scrollposx,scrollposy);    
        }
        
        //test disabling scrollto
        window.scrollTo(scrollposx, scrollposy);

        //console.log("pageScroll");
        

    };

    this.gotoPage = function (num) {
        if (foxview.fileOpen && foxview.pdfViewer) {

            if (foxview.numpages == 1) {
                return;
            }

            var pagepos = foxview.getPagePos(num);
            var scrpos = foxview.getScrollPos(window.document.body);

            if (num == foxview.numpages - 1) {
                foxview.pdfViewer.goToPage(num);
            } else {

                if(num <= foxview.numpages - 1 && num >= 0 ){
                    foxview.pdfViewer.goToPage(num);    
                }
                //foxview.pdfViewer.goToPage(num);
                //var pagepos = foxview.getPagePos(num);
                //foxview.pageScroll(pagepos, num);
                
            }

            foxview.gotopageused = true;
            //foxview.pdfViewer.goToPage(num);
            //foxview.lastoperation = 3;
            //foxview.gotopagepending = num;

            if (foxview.docrect != null && pagepos != undefined) {
                var ypos = pagepos.top - foxview.docrect.top;
                ypos += scrpos.top;
            } else {
                if (pagepos != undefined) {
                    ypos = pagepos.top;
                } else {
                    ypos = 0;
                }
            }

            if (num == foxview.numpages - 1) {
                ypos = window.document.body.scrollHeight;
            }

            //RxCore.refreshThumbnails();
            //window.scrollTo(0,ypos);
            //setting previous page does not always work so go an extra page.    
            /*if(num < foxview.curpage){
                //foxview.pdfViewer.goToPage(num - 2);
                window.scrollTo(0,ypos);
            }else{
                foxview.pdfViewer.goToPage(num);
            }*/

            //var scrpos  = foxview.getScrollPos(window.document.body);
            //var pagewidth = foxview.pagestates[num].width * PointToPixel * foxview.scale;
            //var pageheight = foxview.pagestates[num].height * PointToPixel * foxview.scale;
            //left, top, right, bottom, x, y, width, height.
            /*x: 8
            y: 1356
            width: 2016
            height: 1440
            top: 1356
            right: 2024
            bottom: 2796
            left: 8*/

            foxview.setCurPage(num);


            /*if(num == 0){
                window.scrollTo(0,scrpos.top - pageheight);
            }*/

            foxview.pagestates[num].rendered = false;
            //foxview.rendering = true;


            /*if(foxview.pagestates[num].rendered && foxview.pagestates[num].foxitscale == foxview.scale){
                //no need to render page                
            }else {
                foxview.pdfViewer.goToPage(num);
                foxview.pagestates[num].rendered = false;
                console.log('page index', num);
            }*/
        }
    };

    this.onOpenURL = function (pdfViewer, ViewerEvents) {
        if (pdfViewer) {
            pdfViewer.eventEmitter.on(ViewerEvents.openFileSuccess, function (pdfDoc) {

                foxview.pagestates = [];
                var pnum = pdfDoc.getPageCount();
                foxview.numpages = pnum;

                RxCore.checkLargePDF(foxview.numpages);

                for (var pi = 0; pi < foxview.numpages; pi++) {


                    foxview.pagestates.push({ 
                        pageindex: pi, 
                        rendered: false, 
                        pagescale: null, 
                        width: 0, 
                        height: 0, 
                        rotation : 0, 
                        originalrotation : 0,
                        foxitscale: foxview.scale, 
                        thumbadded: false, 
                        doscroll: false, 
                        scrollComplete: false, 
                        scrollReset: true, 
                        scrollposx: 0, 
                        scrollposy: 0, 
                        rxscrollposx: 0, 
                        rxscrollposy: 0, 
                        scrollTop: 0, 
                        scrollupdate: false, 
                        scrollArr: [] });
                }

                pdfDoc.getPageByIndex(0).then(function (page) {

                    var pwidth = page.getWidth();
                    var pheight = page.getHeight();
                    var rotation = page.getRotationAngle();
                    foxview.originalrotation = rotation;

                    foxview.pagestates[0].width = pwidth;
                    foxview.pagestates[0].height = pheight;
                    foxview.pagestates[0].rotation = rotation;
                    foxview.pagestates[0].originalrotation = rotation;

                    foxview.firstpagewidth = pwidth;
                    foxview.firstpageheight = pheight;

                    var initscale = RxCore.getPDFintialScale(pwidth, pheight);
                    RxCore.hidedisplayCanvas(true);

                    if (foxview.iframename != null) {
                        RxCore.bringIframeToFront(foxview.iframename);
                    }

                    foxview.scale = initscale;

                    foxview.pdfViewer.config.defaultScale = initscale;

                    var stateobj = {
                        iscompare: false,
                        numOpenFiles: 1,
                        isPDF: true,
                        is3D: false,
                        is2D: false,
                        numpages: foxview.numpages,
                        currentpage: 0,
                        activefile: true,
                        disableMenu: false,
                        source: 'forcepagesState'
                    };

                    RxCore.forcepagesState(stateobj);
                    RxCore.scrollBarCheck();
                });

                //console.log('file open', pnum);
                foxview.fileOpen = true;
            });
        }
    };

    this.getAnnotCanvases = function (foxitpage) {
        var allannottiles = undefined;
        var annotobjs = [];

        /*var foxitpage = {
            docindex : foxview.rxindex,
            pageindex : pgindex,
            canvases : [],
            hidden : [],
            transScale : transcale,
            indexarray : [],
            pagescale : pgscale,
            width : pagewidth,
            height : pageheight
        };*/

        var viewmodecontainers = foxview.divelement.getElementsByClassName("fv__pdf-view-mode-item");
        if (viewmodecontainers.length == 0) {
            return foxitpage;
        }
        var annotcontainers = viewmodecontainers[foxitpage.pageindex].getElementsByClassName("fv__pdf-page-annot-container");

        var handlercontainers = viewmodecontainers[foxitpage.pageindex].getElementsByClassName("fv__pdf-page-annot-handler-container");

        for (var andc = 0; andc < annotcontainers.length; andc++) {

            if (annotcontainers[andc] != undefined) {
                var annotstyle = annotcontainers[andc].style;

                var annotpos = {
                    left: annotstyle.left,
                    top: annotstyle.top,
                    width: annotstyle.width,
                    height: annotstyle.height,
                    scale: annotstyle.transform
                };

                if (annotpos.scale != "" && annotpos.scale != "none") {
                    annotpos.scale = parseFloat(annotpos.scale.split('(')[1].split(')')[0]);
                } else {
                    annotpos.scale = 1.0;
                }
                if (annotpos.left != "") {
                    annotpos.left = parseFloat(annotpos.left.replace("px", ""));
                }

                if (annotpos.top != "") {
                    annotpos.top = parseFloat(annotpos.top.replace("px", ""));
                }

                if (annotpos.width != "") {
                    annotpos.width = parseFloat(annotpos.width.replace("px", ""));
                }

                if (annotpos.height != "") {
                    annotpos.height = parseFloat(annotpos.height.replace("px", ""));
                }

                allannottiles = annotcontainers[andc].getElementsByClassName("fv__tiles-canvas");
                if (allannottiles.length > 0) {
                    annotobjs.push({ pos: annotpos, tiles: allannottiles });
                }
            }
        }

        for (var handc = 0; handc < handlercontainers.length; handc++) {
            if (handlercontainers[handc] != undefined) {
                var annotstyle = handlercontainers[handc].style;

                var annotpos = {
                    left: annotstyle.left,
                    top: annotstyle.top,
                    width: annotstyle.width,
                    height: annotstyle.height,
                    scale: annotstyle.transform
                };

                if (annotpos.scale != "") {
                    annotpos.scale = parseFloat(annotpos.scale.split('(')[1].split(')')[0]);
                } else {
                    annotpos.scale = 1.0;
                }
                if (annotpos.left != "") {
                    annotpos.left = parseFloat(annotpos.left.replace("px", ""));
                }

                if (annotpos.top != "") {
                    annotpos.top = parseFloat(annotpos.top.replace("px", ""));
                }

                if (annotpos.width != "") {
                    annotpos.width = parseFloat(annotpos.width.replace("px", ""));
                }

                if (annotpos.height != "") {
                    annotpos.height = parseFloat(annotpos.height.replace("px", ""));
                }

                allannottiles = handlercontainers[handc].getElementsByClassName("fv__tiles-canvas");
                if (allannottiles.length > 0) {
                    annotobjs.push({ pos: annotpos, tiles: allannottiles });
                }
            }
        }

        if (annotobjs) {
            foxitpage.annots = annotobjs;
        }

        return foxitpage;
    };

    this.getPagePos = function (pagenum) {
        var pagepos = undefined;
        var pagecontainers = foxview.divelement.getElementsByClassName("fv__pdf-page-container");

        for (var pgdc = 0; pgdc < pagecontainers.length; pgdc++) {
            var divpageindx = parseInt(pagecontainers[pgdc].dataset.index);
            if (divpageindx == pagenum) {
                //pagepos = foxview.getScrollPos(pagecontainers[pgdc]);
                pagepos = pagecontainers[pgdc].getBoundingClientRect();
                break;
            }
        }

        if(pagepos == undefined){
            //get last known from rxcore
        }

        


        return pagepos;
    };

    this.getCanvases = function (foxitpage) {

        var allcanvastiles = [];
        var allcanvaselements = undefined;

        var containerlyt = undefined;
        var pagepositions = undefined;

        var transcale = 1.0;

        var pagecontainers = foxview.divelement.getElementsByClassName("fv__pdf-page-container");

        for (var pgdc = 0; pgdc < pagecontainers.length; pgdc++) {

            var divpageindx = parseInt(pagecontainers[pgdc].dataset.index);
            if (divpageindx == foxitpage.pageindex) {

                foxitpage.pagepos = pagecontainers[pgdc].getBoundingClientRect();

                containerlyt = pagecontainers[pgdc].getElementsByClassName("fv__tiles-container fv__pdf-page-content-container");
                //get style width and height


                if (containerlyt[0] != undefined) {

                    if (containerlyt[0]) {
                        foxitpage.divwidth = containerlyt[0].style.width;
                        foxitpage.divheight = containerlyt[0].style.height;

                        var sztransscale = containerlyt[0].style.transform;
                        if (sztransscale != "") {
                            transcale = parseFloat(sztransscale.split('(')[1].split(')')[0]);
                        } else {
                            transcale = 1.0;
                        }
                    } else {
                        transcale = 1.0;
                    }

                    allcanvaselements = containerlyt[0].getElementsByClassName("fv__tiles-canvas");

                    var columns = foxitpage.columns;
                    var rows = foxitpage.rows;

                    for (var elcs = 0; elcs < allcanvaselements.length; elcs++) {

                        var szdataset = allcanvaselements[elcs].dataset.index.split(',');
                        var tile = { row: parseInt(szdataset[0]), column: parseInt(szdataset[1]), ct: elcs };

                        if (allcanvaselements[elcs].parentNode.classList.contains('fv__hide')) {
                            foxitpage.hidden.push(tile);
                        } else {
                            foxitpage.indexarray.push(tile);
                            allcanvastiles.push(allcanvaselements[elcs]);

                            columns = tile.column;
                            rows = tile.row;
                        }
                    }

                    rows += 1;
                    columns += 1;
                }
            }
        }

        if (allcanvastiles) {

            foxitpage.rows = rows;
            foxitpage.columns = columns;

            foxitpage.transScale = transcale;
            foxitpage.canvases = allcanvastiles;
        }

        return foxitpage;
    };

    this.printDocument = function () {
        window.print();
    };

    //foxview.onPageChange(foxview.pdfViewer, PDFViewCtrl.Events):
    this.onPageChange = function (pdfViewer, ViewerEvents){
        if (pdfViewer) {
            pdfViewer.eventEmitter.on(ViewerEvents.pageNumberChange, function (newPageNumber) {
                
                var bcurpagenotvisible = false;

                var pagepos = foxview.getPagePos(foxview.curpage);
                var scrpos = foxview.getScrollPos(window.document.body);

                if(pagepos != undefined){
                    var midpage = pagepos.height / 2;
                    bcurpagenotvisible = (pagepos.bottom <= midpage);
                }


                if(foxview.gotopageused){
                    if(newPageNumber != foxview.curpage + 1 || bcurpagenotvisible){

                        if (foxview.docrect != null && pagepos != undefined) {
                            var ypos = pagepos.top - foxview.docrect.top;
                            ypos += scrpos.top;
                        } else {
                            if (pagepos != undefined) {
                                ypos = pagepos.top;
                            } else {
                                ypos = 0;
                            }
                        }
    
                        window.scrollTo(0,ypos);
    
    
                        //pagecorrect = newPageNumber - (foxview.curpage + 1);
    
                        //foxview.setCurPage(newPageNumber - 1);
    
                        //console.log(pagecorrect);  
    
                        /*if(foxview.curpage - pagecorrect > 0){
                            foxview.pdfViewer.goToPage(foxview.curpage - pagecorrect);
                        }*/
                        
                    }else{
                        foxview.setCurPage(newPageNumber - 1);
                    }
                    foxview.gotopageused = false;

                }else{
                    foxview.setCurPage(newPageNumber - 1);
                }

                
                
                //console.log(newPageNumber);

                RxCore.foxitPageEvt(newPageNumber);
                // newPageNumber = pageIndex + 1
           });
        }
    };


    this.onOpen = function (pdfViewer, ViewerEvents) {
        if (pdfViewer) {
            pdfViewer.eventEmitter.on(ViewerEvents.openFileSuccess, function (pdfDoc) {
                var pnum = pdfDoc.getPageCount();

                //foxview.rxindex = RxCore.createFoxitDoc(foxview);
                //RxCore.hidedisplayCanvas(true);

                foxview.numpages = pnum;
                foxview.pagestates = [];

                RxCore.checkLargePDF(foxview.numpages);

                for (var pi = 0; pi < foxview.numpages; pi++) {

                    foxview.pagestates.push(
                        { 
                            pageindex: pi, 
                            rendered: false, 
                            pagescale: null, 
                            width: 0, 
                            height: 0,
                            rotation : 0, 
                            originalrotation : 0,
                            foxitscale: foxview.scale, 
                            thumbadded: false, 
                            doscroll: false, 
                            scrollComplete: false, 
                            scrollposx: 0, 
                            scrollposy: 0, 
                            rxscrollposx: 0, 
                            rxscrollposy: 0, 
                            scrollTop: 0, 
                            scrollupdate: false, 
                            scrollArr: [] 
                        }
                    );
                }

                pdfDoc.getPageByIndex(0).then(function (page) {

                    var pwidth = page.getWidth();
                    var pheight = page.getHeight();
                    var rotation = page.getRotationAngle();
                    foxview.originalrotation = rotation;


                    foxview.pagestates[0].width = pwidth;
                    foxview.pagestates[0].height = pheight;
                    foxview.pagestates[0].rotation = rotation;
                    foxview.pagestates[0].originalrotation = rotation;
                    

                    foxview.firstpagewidth = pwidth;
                    foxview.firstpageheight = pheight;

                    var initscale = RxCore.getPDFintialScale(pwidth, pheight);
                    RxCore.hidedisplayCanvas(true);

                    if (foxview.iframename != null) {
                        RxCore.bringIframeToFront(foxview.iframename);
                    }

                    foxview.scale = initscale;

                    var stateobj = {
                        iscompare: false,
                        numOpenFiles: 1,
                        isPDF: true,
                        is3D: false,
                        is2D: false,
                        numpages: foxview.numpages,
                        currentpage: 0,
                        activefile: true,
                        disableMenu: false,
                        source: 'forcepagestate'
                    };

                    RxCore.forcepagesState(stateobj);

                    RxCore.scrollBarCheck();
                });

                if (foxview.createRxDoc) {
                    foxview.rxindex = RxCore.createFoxitDoc(foxview);
                    RxCore.hidedisplayCanvas(true);
                }
                //console.log('file open', pnum);
                foxview.fileOpen = true;
            });
        }
    };

    this.setmarkupPosition = function (num) {

        var pagepos = foxview.getPagePos(num);
        RxCore.foxitcalibratepagemarkup(pagepos, num);


    };
    
    this.setmarkupPositionScale = function(num){

        var pagepos = foxview.getPagePos(num);

        if (foxview.pdfViewer){

            if(foxview.curpagerender != null){
                var pgscale = foxview.curpagerender.getScale();
                RxCore.foxitcalibratepagemarkupEx(pagepos, pgscale, num);
            }
        }

    };

    this.getViewport = async function(pdfPage){
        let rect = await pdfPage.getViewportRect();
        return rect;

    };


    this.getpageinfodim = function(npagenum, callback) {
        

        var foxitpage = {
            pagepos : null,
            pagescale : 1,
            rotation : 0,
            width : 0,
            height : 0,
            pdfwidth : 0,
            pdfheight : 0,
            foxscale : 1
        };



        foxitpage.pagepos = foxview.getPagePos(npagenum);

        
        if (foxview.pdfViewer){

            if(foxview.curpagerender != null){

                foxitpage.pagescale = foxview.curpagerender.getScale();
                
            }


            foxview.pdfViewer.getCurrentPDFDoc().getPageByIndex(npagenum).then(function (page) {
            
                    //bottom: 1931
                    //height: 2043
                    //left: 10.5
                    //right: 1455.5
                    //top: -112
                    //width: 1445
                    //x: 10.5
                    //y: -112


                //var prect = foxview.getViewport(page);
                //console.log(prect);

                //var prect = foxview.getViewport(page);

                //page.getDeviceRect()

                foxitpage.foxscale = foxview.scale;                

                //var rotation = page.getRotationAngle();
                foxitpage.rotation = page.getRotationAngle();

                foxitpage.pdfwidth = page.info.width;
                foxitpage.pdfheight = page.info.height;

                foxitpage.width = page.getWidth();
                foxitpage.height = page.getHeight();

                var devrect = {bottom : foxitpage.pdfheight, left : 0, right : foxitpage.pdfwidth, top : 0};
                var revrect = page.reverseDeviceRect(devrect, 1, foxitpage.rotation);



                if(foxitpage.pagepos == undefined){
                    foxitpage.pagepos = {
                        bottom : foxitpage.pdfheight,
                        height: foxitpage.pdfheight,
                        left : 0,
                        right : foxitpage.pdfwidth,
                        top : 0,
                        width :  foxitpage.pdfwidth,
                        x : 0,
                        y : 0
                    };
                }

                callback(foxitpage);                


            });
    

        }

        
        //foxview.setmarkupPositionScale(num);

        //return returnobj;
        

    };

    this.getpagedim = function(num){

        var pagepos = foxview.getPagePos(num);

        //foxview.pagestates[pgindex].width = pagewidth;
        //foxview.pagestates[pgindex].height = pageheight;


        return {pagedim : pagepos, pagenum : num, width : foxview.pagestates[num].width, height : foxview.pagestates[num].height};
        //RxCore.foxitcalibratepagemarkup(pagepos, num);

    }

    this.scrollupperleft = function (num) {

        var pagepos = foxview.getPagePos(num);

        //test disabling scrollto
        window.scrollTo(0, pagepos.top);

    };

    /*this.getScrollbarwidth = function(){
          return window.document.body.offsetWidth - window.document.body.clientWidth;
      };*/

    this.getScrollbarWidth = function () {
        return window.innerWidth - document.documentElement.clientWidth;
    };

    this.onScollHGrip = function (onOff) {

        foxview.onHBarGrip = onOff;
    };

    this.onScollVGrip = function (onOff) {

        foxview.onVBarGrip = onOff;
    };

    this.onScollV = function (onOff) {

        foxview.onVBar = onOff;
    };

    this.onScollH = function (onOff) {

        foxview.onHBar = onOff;
    };

    this.hasScrollbar = function () {
        // The Modern solution
        if (typeof window.innerWidth === 'number') return window.innerWidth > document.documentElement.clientWidth;

        // rootElem for quirksmode
        var rootElem = document.documentElement || document.body;

        // Check overflow style property on body for fauxscrollbars
        var overflowStyle;

        if (typeof rootElem.currentStyle !== 'undefined') overflowStyle = rootElem.currentStyle.overflow;

        overflowStyle = overflowStyle || window.getComputedStyle(rootElem, '').overflow;

        // Also need to check the Y axis overflow
        var overflowYStyle;

        if (typeof rootElem.currentStyle !== 'undefined') overflowYStyle = rootElem.currentStyle.overflowY;

        overflowYStyle = overflowYStyle || window.getComputedStyle(rootElem, '').overflowY;

        var contentOverflows = rootElem.scrollHeight > rootElem.clientHeight;

        var overflowShown = /^(visible|auto)$/.test(overflowStyle) || /^(visible|auto)$/.test(overflowYStyle);

        var alwaysShowScroll = overflowStyle === 'scroll' || overflowYStyle === 'scroll';

        return contentOverflows && overflowShown || alwaysShowScroll;
    };

    this.vscrollbarvisible = function () {

        //var ScrollHeight = window.document.body.scrollHeight;
        //var clientHeight = window.document.body.clientHeight;

        return window.innerWidth > document.documentElement.clientWidth;

        //return ScrollHeight > clientHeight;
    };

    this.hscrollbarvisible = function () {

        //var ScrollWidth = window.document.body.scrollWidth;
        //var clientWidth = window.document.body.clientWidth;

        return window.innerHeight > document.documentElement.clientHeight;

        //return ScrollWidth > clientWidth;
    };

    this.setScrollFactors = function (cw, ch) {

        var scrbarw = foxview.getScrollbarWidth();

        //assume button heights same as width
        //subtract from canvas ch and cw
        //each end
        var canvswidth = cw - scrbarw * 2;
        var canvsheight = ch - scrbarw * 2;

        foxview.scrollWidthfactor = window.document.body.scrollWidth / canvswidth;
        foxview.scrollHeightfactor = window.document.body.scrollHeight / canvsheight;
    };

    this.getScrollFactors = function (cw, ch) {

        var scrbarw = foxview.getScrollbarWidth();

        //assume button heights same as width
        //subtract from canvas ch and cw
        //each end
        var canvswidth = cw - scrbarw * 2;
        var canvsheight = ch - scrbarw * 2;

        var ScrollWidthfactor = window.document.body.scrollWidth / canvswidth;
        var ScrollHeightfactor = window.document.body.scrollHeight / canvsheight;

        return { ScrollWfactor: ScrollWidthfactor, ScrollHfactor: ScrollHeightfactor };
    };

    this.getScrollBarStatus = function () {

        //console.log(foxview.hasScrollbar());

        foxview.vBarOn = foxview.vscrollbarvisible();
        foxview.hBarOn = foxview.hscrollbarvisible();

        return { vBarOn: foxview.vBarOn, hBarOn: foxview.hBarOn };
    };

    /*this.getScrollbarData = function(cw, ch){
          
        //foxview.vBarOn = false;
        //foxview.hBarOn = false;
          //foxview.onVBar = false;
        //foxview.onHBar = false;
          return {onVBar : foxview.onVBar, onHBar : foxview.onHBar, vBarOn : foxview.vBarOn, hBarOn : foxview.hBarOn};
          //{onVBar : foxview.onVBar, onHBar : foxview.onHBar, vBarOn : foxview.vBarOn, hBarOn : foxview.hBarOn, ScrollWfactor : ScrollWidthfactor, ScrollHfactor : ScrollHeightfactor};
          
    };*/

    this.getScrollGrip = function (w, h) {

        //assume button heights same as width
        var gripoffset = foxview.getScrollbarWidth();

        //var scrollposy = window.scrollY || document.body.scrollTop || 0;
        //var scrollposx = window.scrollX || document.body.scrollLeft || 0;

        var scrollposy = window.scrollY || window.pageYOffset || 0;
        var scrollposx = window.scrollX || window.pageXOffset || 0;

        scrollposy = scrollposy / foxview.scrollHeightfactor + gripoffset;
        scrollposx = scrollposx / foxview.scrollWidthfactor + gripoffset;

        var sizefactor = 1.5;
        //var gripsizeV = sizefactor * foxview.scrollHeightfactor;  
        //var gripsizeH = sizefactor * foxview.scrollWidthfactor;

        var gripsizeV = h / foxview.scrollHeightfactor;
        var gripsizeH = w / foxview.scrollWidthfactor;

        return { sizeH: gripsizeH, sizeV: gripsizeV, posy: scrollposy, posx: scrollposx };
    };

    this.updateScrollPosition = function (x, y) {

        //var scrollposy = window.scrollY || document.body.scrollTop || 0;
        //var scrollposx = window.scrollX || document.body.scrollLeft || 0;

        var scrollposy = window.scrollY || window.pageYOffset || 0;
        var scrollposx = window.scrollX || window.pageXOffset || 0;


        scrollposy += y;
        scrollposx += x;

        var ScrollWidth = window.document.body.scrollWidth;
        var ScrollHeight = window.document.body.scrollHeight;

        if (scrollposx < 0) {
            scrollposx = 0;
        }
        if (scrollposy < 0) {
            scrollposy = 0;
        }

        if (scrollposx > ScrollWidth) {
            scrollposx = ScrollWidth;
        }
        if (scrollposy > ScrollHeight) {
            scrollposy = ScrollHeight;
        }

        //test disabling scrollto
        window.scrollTo(scrollposx, scrollposy);
        

        

        //foxview.setmarkupPosition(pagenum);

    };

    this.onScrollVbuttonTop = function () {
        //move 40px up  when clicking scrollbar top button

        foxview.updateScrollPosition(0, -40);
        foxview.setmarkupPosition(foxview.curpage);
    };

    this.onScrollVbuttonBottom = function () {
        //move 40px down when clicking scrollbar bottom button

        foxview.updateScrollPosition(0, 40);
        foxview.setmarkupPosition(foxview.curpage);
    };

    this.onScrollHbuttonLeft = function () {
        //move 40px to the left when clicking scrollbar left button
        foxview.updateScrollPosition(-40, 0);
        foxview.setmarkupPosition(foxview.curpage);
    };

    this.onScrollHbuttonRight = function () {
        //move 40px to the right when clicking scrollbar right button
        foxview.updateScrollPosition(40, 0);
        foxview.setmarkupPosition(foxview.curpage);
    };

    this.onScrollHPageLeft = function (w, h) {
        //move w to the left when clicking outside grip to the left
        foxview.updateScrollPosition(-w, 0);
    };

    this.onScrollHPageRight = function (w, h) {
        //move w to the right when clicking outside grip to the right
        foxview.updateScrollPosition(w, 0);
    };

    this.onScrollVPageUp = function (w, h) {
        //move h up when clicking above grip
        foxview.updateScrollPosition(0, -h);
    };

    this.onScrollVPageDown = function (w, h) {
        //move h down when clicking below grip
        foxview.updateScrollPosition(0, h);
    };

    this.scrolldeltaupdate = function (mouse, pagenum) {


        if(!foxview.fileOpen){
            return;
        }

        foxview.setCurPage(pagenum);

        //var scrollposy = window.scrollY || document.body.scrollTop || 0;
        //var scrollposx = window.scrollX || document.body.scrollLeft || 0;

        var scrollposy = window.scrollY || window.pageYOffset || 0;
        var scrollposx = window.scrollX || window.pageXOffset || 0;


        if (foxview.onVBarGrip && foxview.vBarOn) {

            scrollposy -= mouse.my * foxview.scrollHeightfactor;
            //scrollposx -= mouse.mx * foxview.scrollWidthfactor;

            //console.log(foxview.getScrollGrip());
            //foxview.scrollWidthfactor = window.document.body.scrollWidth / cw;
            //foxview.scrollHeightfactor = window.document.body.scrollHeight / ch;
        } else if (foxview.onHBarGrip && foxview.hBarOn) {
            scrollposx -= mouse.mx * foxview.scrollWidthfactor;
            //scrollposy += mouse.my;  
            //scrollposx += mouse.mx;
        } else {
            scrollposy += mouse.my;
            scrollposx += mouse.mx;
        }

        var ScrollWidth = window.document.body.scrollWidth;
        var ScrollHeight = window.document.body.scrollHeight;

        if (scrollposx < 0) {
            scrollposx = 0;
        }
        if (scrollposy < 0) {
            scrollposy = 0;
        }

        if (scrollposx > ScrollWidth) {
            scrollposx = ScrollWidth;
        }
        if (scrollposy > ScrollHeight) {
            scrollposy = ScrollHeight;
        }

        if (scrollposx == 0) {
            RxCore.foxitcalibratepagePosX(pagenum, false);
        }

        if (scrollposx == ScrollWidth) {
            RxCore.foxitcalibratepagePosX(pagenum, true);
        }

        if (foxview.numpages > 1) {

            if (pagenum == 0 && scrollposy == 0) {
                RxCore.foxitcalibratepagePosY(pagenum);
            }

            if (pagenum == foxview.numpages - 1 && scrollposy == ScrollHeight) {
                RxCore.foxitcalibratepagePosY(pagenum);
            }
        }

        if(foxview.pagestates[pagenum] != undefined){
            foxview.pagestates[pagenum].rxscrollposy = scrollposy;
        }

        //test disabling scrollto
        window.scrollTo(scrollposx, scrollposy);

        //console.log(scrollposy);


        foxview.setmarkupPosition(pagenum);
    };

    this.scrollPageAdjust = function (pagepos) {

        //var scrollposy = window.scrollY || document.body.scrollTop || 0;
        //var scrollposx = window.scrollX || document.body.scrollLeft || 0;

        var scrollposy = window.scrollY || window.pageYOffset || 0;
        var scrollposx = window.scrollX || window.pageXOffset || 0;


        scrollposy += pagepos.top;
        scrollposx += pagepos.left;

        return { pagex: scrollposx, pagey: scrollposy };
    };

    this.scrollupdate = function (pagerect, cw, ch, pagenum, visiblechanged) {

        var pagepos = foxview.getPagePos(foxview.curpage);
        var pageoffsets = foxview.scrollPageAdjust(pagepos);

        var ScrollWidth = window.document.body.scrollWidth;
        var ScrollHeight = window.document.body.scrollHeight;

        var xpos = -pagerect.x;
        var ypos = -pagerect.y;

        ypos += pageoffsets.pagey;

        if (xpos < 0) {
            xpos = 0;
        }
        if (ypos < 0) {
            ypos = 0;
        }

        //var xposp = xpos / cw; 
        //var yposp = ypos / ch; 

        //var scrollwidthfactor = xpos / -(cw - (ScrollWidth));
        //var scrollheightfactor = ypos / -(ch - (ScrollHeight));


        if (xpos > ScrollWidth) {
            xpos = ScrollWidth;
        }
        if (ypos > ScrollHeight) {
            ypos = ScrollHeight;
        }

        //test disabling scrollto
        window.scrollTo(xpos, ypos);

        //console.log('position ', xpos, ypos,'page ', pagenum, 'pageoffset ',pageoffsets);


        if (visiblechanged) {
            foxview.redraw = true;
            foxview.pagestates[foxview.curpage].scrollupdate = true;
        }
    };

    this.getScrollPos = function (doc, offsettop) {

        var left = (window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0);
        var top = (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0);

        return {
            left: left,
            top: top,
            bzeropos: left == 0 && top == offsettop
        };
    };

    this.onZoomToSuccess = function (pdfViewer, ViewerEvents) {
        if (pdfViewer) {
            pdfViewer.eventEmitter.on(ViewerEvents.zoomToSuccess, function (newScale, oldScale) {
                
                /*foxview.vBarOn = foxview.vscrollbarvisible();
                foxview.hBarOn = foxview.hscrollbarvisible();

                RxCore.scrollBarCheck();

                if (foxview.hBarOn) {
                    foxview.sBarWidth = 15;
                } else {
                    foxview.sBarWidth = 0;
                }*/

                
                var scalechanged = true;

                foxview.setpagerender(false);

                var pagepos = foxview.getPagePos(foxview.curpage);

                //foxview.pageScroll(pagepos, foxview.curpage);

                if (foxview.pagestates[foxview.curpage].doscroll) {

                    foxview.pagestates[foxview.curpage].doscroll = false;

                    //foxview.pagestates[foxview.curpage].pagescale  

                    var scrollpos = foxview.pagestates[foxview.curpage].scrollArr.pop();

                    var pagepos = foxview.getPagePos(foxview.curpage);

                    foxview.scrollupdate(scrollpos.pagerect, scrollpos.cw, scrollpos.ch, scrollpos.pagenum, true);
                    foxview.setmarkupPosition(foxview.curpage);
                }

                //console.log('zoomsuccess');
            });
        }
    };

    this.onZoomToFailed = function (pdfViewer, ViewerEvents) {
        if (pdfViewer) {
            pdfViewer.eventEmitter.on(ViewerEvents.zoomToFailed, function (newScale, oldScale) {
                //var scalechanged = false;

                //foxview.setpagerender(false);
                //foxview.gotoPage(foxview.curpage);
                //foxview.redraw = true;
                foxview.rendering = false;

                //try again

                if (foxview.pagestates[foxview.curpage].doscroll) {
                    var scrollpos = foxview.pagestates[foxview.curpage].scrollArr.pop();
                    foxview.zoomdirect(foxview.curpage, newScale, scrollpos);
                }
            });
        }
    };

    this.getdisplaypagepos = function (pgindex) {

        var pagepos = foxview.getPagePos(pgindex);
        var csize = RxCore.getCanvasSize();

        //pagestart, pageend, curpagenum, lastpage

        var ty = csize.h * 0.5;

        var bBelowTop = false;
        var bBelowCenter = false;
        var bAboveBottom = false;
        var bAboveCenter = false;
        var bAllabove = false;
        var bAllbelow = false;

        bAllabove = pagepos.bottom < 0;
        bAllbelow = pagepos.top > csize.h;

        //page below top = prev page visible
        bBelowTop = pagepos.top > 10 && pgindex > 0;

        //page below center switch to previous page
        bBelowCenter = pagepos.top - 10 > ty && pgindex > 0;

        //page above bottom = next page visible
        bAboveBottom = pagepos.bottom < csize.h && pgindex < foxview.numpages - 1;

        //page above center switch to next page
        bAboveCenter = pagepos.bottom + 10 < ty && pgindex < foxview.numpages - 1;

        return { bt: bBelowTop, bc: bBelowCenter, ab: bAboveBottom, ac: bAboveCenter, aa: bAllabove, aab: bAllbelow };
    };

    this.checkpagecurrent = function (pgindex) {

        var curpage = pgindex;
        var pgepos = foxview.getdisplaypagepos(pgindex);

        if (!pgepos.aa && !pgepos.aab) {
            //within view

            if (pgepos.bc) {
                curpage = pgindex - 1;
            }
            if (pgepos.ac) {
                curpage = pgindex + 1;
            }

            if (foxview.curpage != curpage) {
                //console.log('curdisplay', curpage, foxview.curpage);

                //RxCore.gotoPage(curpage);
                //foxview.setCurPage(curpage);
                foxview.setmarkupPosition(foxview.curpage);
            }
        }
    };

    this.getpageClientRect = function(npagenum){
        var clientrect = undefined;
        
        if (foxview.pdfViewer){


            var pdfrender = foxview.pdfViewer.getPDFDocRender();
            if(pdfrender != null){
                var clientrects = pdfrender.getBoundingClientRects();
                for(var i = 0; i < clientrects.length; i++){
                    if(clientrects[i].index == npagenum){
                        clientrect = clientrects[i];
                    }
                }
                
            }

        }
        return clientrect;

    };

    this.getcurPageScale = function(){
        var pgscale = null;

        if(foxview.curpagerender != null){
            pgscale = foxview.curpagerender.getScale();
        }

        if(pgscale == null){
            var scale = foxview.scale;
        }else{
            scale = pgscale;
        }

        return scale;

    };



    this.getSnapPoint = function(npagenum, x, y, callback){

        var point = {x : x, y : y};

        //console.log(point);

        var mode = [];
        var pgscale = null;
        var endPoint = PDFViewCtrl.constants.SNAP_MODE.EndPoint;
        var midPoint = PDFViewCtrl.constants.SNAP_MODE.MidPoint;
        var IntersectionPoint = PDFViewCtrl.constants.SNAP_MODE.IntersectionPoint;
        
        var nearestPoint = PDFViewCtrl.constants.SNAP_MODE.NearestPoint; 
        
        
        var pdfrect = undefined;


        if (foxview.pdfViewer){

            if(foxview.curpagerender != null){
                pgscale = foxview.curpagerender.getScale();
            }
           
            
            foxview.pdfViewer.getCurrentPDFDoc().getPageByIndex(npagenum).then(function (page) {


                if(pgscale == null){
                    var scale = foxview.scale;
                }else{
                    scale = pgscale;
                }

                //var rotation = page.getRotationAngle();

                //var orgpointarray = [point.x, point.y];

                //foxview.pagestates[pgindex].rotation = pageRender.page.getRotationAngle();

                //var rotpoint = page.reverseDevicePoint(orgpointarray, 1, rotation);

                //console.log(rotpoint);
                
                var pointrd = {x : point.x, y : point.y};

                //var pointrd = {x : rotpoint[0], y : rotpoint[1]};

                mode.push(endPoint);
                mode.push(midPoint);
                mode.push(IntersectionPoint);

                //mode.push(nearestPoint);

                
                //console.log(dvcpoint);
                if(foxview.snapinprogress){
                    return; 
                }

                page.getSnappedPoint( pointrd, mode ).then(function (fxsnapPoint){

                    foxview.snapinprogress = true;
                    if(fxsnapPoint){
                        if(fxsnapPoint.x != pointrd.x && fxsnapPoint.y != pointrd.y){
                        
                            var pointarray = [fxsnapPoint.x, fxsnapPoint.y];
                            var dvcpoint = page.getDevicePoint(pointarray, scale, 0);
                            var pointrt = {x : dvcpoint[0], y : dvcpoint[1]};
                            
    
                            callback({found: true, x: pointrt.x, y: pointrt.y, type: 1, scale : scale});
                            foxview.snapinprogress = false;
    
    
                        }else{
                            callback({found: false, x: fxsnapPoint.x, y: fxsnapPoint.y, type: 1, scale : scale});
                            foxview.snapinprogress = false;
                        } 
    
                    }

                }).catch(function (reason){
                    
                    foxview.snapinprogress = false;
                    console.log(reason, pointrd.x, pointrd.y);

                    /*if(fxsnapPoint){
                        callback({found: false, x: fxsnapPoint.x, y: fxsnapPoint.y, type: 1, scale : scale});  
                    }*/
                    callback({found: false, x: pointrd.x, y: pointrd.y, type: 1, scale : scale});

                })
                
                
            });
        }


    };


    this.onpageLayoutRedraw = function (pdfViewer, ViewerEvents) {
        if (pdfViewer) {
            pdfViewer.eventEmitter.on(ViewerEvents.pageLayoutRedraw, function (pageRender) {
                //console.log('page layout changed');

                //console.log('redraw event');
            });
        }
    };

    this.onRenderSuccess = function (pdfViewer, ViewerEvents) {

        if (pdfViewer) {
            pdfViewer.eventEmitter.on(ViewerEvents.renderPageSuccess, function (pageRender) {

                foxview.curpagerender = pageRender;
                
                //console.log('redraw event success');

                //get page scale
                var pgscale = pageRender.getScale();
                
                


                //console.log(pgscale);

                var pagewidth = pageRender.page.getWidth();
                var pageheight = pageRender.page.getHeight();

                foxview.vBarOn = foxview.vscrollbarvisible();
                foxview.hBarOn = foxview.hscrollbarvisible();

                RxCore.scrollBarCheck();

                if (foxview.hBarOn) {
                    foxview.sBarWidth = 15;
                } else {
                    foxview.sBarWidth = 0;
                }

                /*thispage.pdfpagewidth = foxitpage.width;
                thispage.pdfpageheight = foxitpage.height;
                thispage.originalwidth = foxitpage.width;
                thispage.originalheight = foxitpage.width;
                
                thispage.width = foxitpage.pagepos.width;
                thispage.height = foxitpage.pagepos.height;
                
                foxitpage.pagescale;*/

                //var pxwidth =  pageRender.page._pxWdith;
                //var pxheight =  pageRender.page._pxHeight;

                var tilesize = foxview.pdfViewer.config.tileSize;

                var pgindex = pageRender.page.info.index;
                
                var PDFpagewidth = pageRender.page.info.width;
                var PDFpageheight = pageRender.page.info.height;

                foxview.pagestates[pgindex].rotation = pageRender.page.getRotationAngle();


                foxview.setmarkupPositionScale(pgindex);


                var foxitpageEx = {width: pagewidth, height : pageheight, pagescale : pgscale, docindex: foxview.rxindex, pageindex : pgindex, pagepos : undefined};

                var pagerect = foxview.getpageClientRect(pgindex);
                if(pagerect != undefined){
                    foxitpageEx.pagepos = pagerect;
                }

                //var pagepos = foxview.getPagePos(pgindex);


                if (!foxview.pagestates[foxview.curpage].doscroll && foxview.pagestates[pgindex].pagescale == pgscale) {
                    foxview.checkpagecurrent(pgindex);
                }


                //foxview.gotopageused = false;    

                if (pgindex >= foxview.numpages) {
                    foxview.rendering = false;
                    return;
                }

                /*if(foxitpageEx.pagepos != undefined){
                    RxCore.setfoxitPageSizeEx(foxitpageEx);

                    if (foxview.curpage == pgindex) {
                        foxview.setmarkupPosition(foxview.curpage);
                    }

                }*/

                if (foxview.pagestates[pgindex].rendered && !foxview.redraw) {
                    
                    
                    foxview.rendering = false;
                    return;
                }

                if(foxview.pagestates[pgindex].originalrotation == undefined){
                    foxview.pagestates[pgindex].originalrotation == foxview.pagestates[pgindex].rotation;
                }


                var foxitpage = {
                    docindex: foxview.rxindex,
                    pageindex: pgindex,
                    pagepos: undefined,
                    canvases: [],
                    annots: [],
                    hidden: [],
                    visible: [],
                    nonvisible: [],
                    scrollArray: [],
                    readytoDraw: false,
                    scrolldata: { x: 0, y: 0, width: 0, height: 0, scrollsizex: 0, scrollsizey: 0 },
                    scrollComplete: false,
                    transScale: 1,
                    indexarray: [],
                    pagescale: 1,
                    width: pagewidth,
                    height: pageheight,
                    pdfwidth : PDFpagewidth,
                    pdfheight : PDFpageheight,
                    rotation : foxview.pagestates[pgindex].rotation,
                    originalrotation : foxview.pagestates[pgindex].originalrotation,
                    divwidth: 0,
                    divheight: 0,
                    rows: 1,
                    columns: 1,
                    tileSize: tilesize,
                    scaleupdate: false,
                    scrollupdate: false
                    //pxwidth : pageRender.page._pixelwidth;
                };

                if (foxview.pagestates[pgindex].pagescale == pgscale && foxview.pagestates[pgindex].scrollupdate) {
                    foxitpage.scrollupdate = true;
                    foxitpage.scaleupdate = false;
                } else {
                    foxitpage.scrollupdate = false;
                    foxitpage.scaleupdate = true;
                }

                //console.log('page index render', pgindex);


                foxview.scale = pgscale;
                foxitpage.docindex = foxview.rxindex;
                foxitpage.pageindex = pgindex;
                foxitpage.indexarray = [];
                foxitpage.hidden = [];
                foxitpage.canvases = [];
                foxitpage.annots = [];
                foxitpage.visible = [];
                foxitpage.nonvisible = [];
                foxitpage.scrollArray = [];

                foxitpage.scrolldata.x = foxview.pagestates[pgindex].scrollposx;
                foxitpage.scrolldata.y = foxview.pagestates[pgindex].scrollposy;

                foxitpage.scrolldata.width = window.document.body.scrollWidth;
                foxitpage.scrolldata.height = window.document.body.scrollHeight;

                foxitpage.scrollComplete = foxview.pagestates[pgindex].scrollComplete;

                foxitpage.width = pagewidth;
                foxitpage.height = pageheight;
                foxitpage.pagescale = pgscale;

                /*foxitpage = {
                    docindex : foxview.rxindex,
                    pageindex : pgindex,
                    canvases : [],
                    hidden : [],
                    transScale : transcale,
                    indexarray : [],
                    pagescale : pgscale,
                    width : pagewidth,
                    height : pageheight
                };*/

                foxitpage = foxview.getCanvases(foxitpage);
                //foxitpage = foxview.getAnnotCanvases(foxitpage);

                foxview.pagestates[pgindex].scrollTop = foxitpage.pagepos.top;

                RxCore.setfoxitPageSize(foxitpage);

                if (foxview.curpage == pgindex) {
                    foxview.setmarkupPosition(foxview.curpage);
                }

                //console.log('render success called');

                foxview.rendering = false;
                //console.log(foxview.rendering);
                foxview.redraw = false;

                if (pgindex == 0 && !foxview.firstrendered) {
                    foxview.firstrendered = true;
                }


                if (foxitpage.canvases.length > 0) {

                    if (foxitpage.canvases.length > 1) {
                        if (foxview.curpage == pgindex) {

                            //RxCore.createTempcanvArray(foxitpage);
                            /*foxitpage = RxCore.checkVisibleTiles(foxitpage);
                                    if (!foxitpage.readytoDraw && !foxview.pagestates[pgindex].doscroll){
                                foxview.updateScrollArrEx(foxitpage);    
                                
                                return;
                            }else if (foxview.pagestates[pgindex].doscroll){
                                foxview.doScroll(foxitpage);
                                return;
                            }*/

                        }
                    }

                    //foxitpage = foxview.getCanvases(foxitpage);
                    //foxitpage = foxview.getAnnotCanvases(foxitpage);

                    //RxCore.createPageTileArray(foxitpage);

                    

                    /*
                    RxCore.setfoxitPageSize(foxitpage);

                    if (foxview.curpage == pgindex) {
                        foxview.setmarkupPosition(foxview.curpage);
                    }

                    //console.log('render success called');

                    foxview.rendering = false;
                    //console.log(foxview.rendering);
                    foxview.redraw = false;

                    if (pgindex == 0 && !foxview.firstrendered) {
                        foxview.firstrendered = true;
                    } */
                }

                foxview.pagestates[pgindex].pageindex = pgindex;
                foxview.pagestates[pgindex].rendered = true;
                foxview.pagestates[pgindex].pagescale = pgscale;
                foxview.pagestates[pgindex].width = pagewidth;
                foxview.pagestates[pgindex].height = pageheight;
                foxview.pagestates[pgindex].foxitscale = foxview.scale;
                foxview.pagestates[pgindex].scrollComplete = false;

                foxitpage = {};

                /*var layout = {
                    width : 0,
                    height : 0
                }
                  
                if (pagelayout[0]){
                    var szcanvwidth = pagelayout[0].style.width;
                    var szcanheight = pagelayout[0].style.height;
                    layout.width = szcanvwidth.replace("px","");
                    layout.height = szcanheight.replace("px","");
                }*/
            });
        };
    };

    init();
};

function foxitGetDoc() {

    //check if existing foxit object with fileOpen = false exist and reuse.

    var counter = 0;

    if (foxitdocs.length == 0) {
        //foxitdocs.push(new foxitViewer(divid, divnum, libpath));
        foxitdocs.push(document.getElementById('foxitframe').contentWindow.foxview);
    }

    while (foxitdocs[counter].fileOpen && counter < foxitdocs.length - 1) {
        counter++;
    }

    /*if(counter == foxitdocs.length - 1){
        //all free foxit objects used add a new one.
        addfoxitdoc();
    }*/

    return foxitdocs[counter];
}

function foxitgetOpenDocs() {

    var numOpen = 0;
    for (var dnum = 0; dnum < foxitdocs.length; dnum++) {
        if (foxitdocs[dnum].fileOpen) {
            numOpen++;
        }
    }
    return numOpen;
}

function foxitgetnumDocs() {

    return foxitdocs.length;
}

function addfoxitDiv(divid) {

    //var foxitdivWidth = document.getElementById('rxcontainer').offsetWidth;
    //var foxitdivHeight = document.getElementById('rxcontainer').offsetHeight;

    var foxnode = document.createElement("div");
    foxnode.setAttribute("id", divid);

    //foxnode.style.position = "fixed";
    //foxnode.style.left = "100px";
    //foxnode.style.top = "100px";
    //foxnode.style.border = "1px solid red";
    //foxnode.style.width = foxitdivWidth + "px";
    //foxnode.style.height = foxitdivHeight + "px";
    //foxnode.style.overflow = "auto";
    //foxnode.style.visibility = "hidden";    
    return foxnode;
}

function addfoxitdoc(libpath) {

    if (!libpath) {
        var libpath = './foxit/web/lib';

        //webnew
    }

    var maindiv = document.getElementById('foxitdocs');

    var divid = "pdf-viewer";

    //var count = maindiv.childElementCount;

    var divnum = foxitdocs.length;

    //how many open PDF documents are there in rxcore?
    var bdoAddDiv = false;
    var counter = 0;

    foxframeview = new foxitViewer(divid, divnum, libpath);

    /*if (foxitdocs.length > 0){
        while (foxitdocs[counter].fileOpen && counter < foxitdocs.length - 1){
            counter ++; 
        }
        
        if(counter == foxitdocs.length - 1){
            //all free foxit objects used add a new one.
            bdoAddDiv = true;
        }
    }*/

    /*if(foxitdocs.length == 0){
        foxitdocs.push(new foxitViewer(divid, divnum, libpath));
    }*/

    /*if(bdoAddDiv){
        divid = "pdf-viewer" + divnum;
        maindiv.appendChild(addfoxitDiv(divid));
        foxitdocs.push(new foxitViewer(divid, divnum, libpath));
    }*/
    return foxframeview;
}