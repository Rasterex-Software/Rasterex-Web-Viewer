var UIConfig = (function() {


    let ConfigJSON = {
        "UIConfig" : {
            
                "canFileOpen": true,
                "canSaveFile": true,
                "canGetFileInfo": true,
                "canPrint": true,
                "canExport": true,
                "canAnnotate": true,
                "canCompare": true,
                "canSignature": false,
                "canConsolidate": true,
                "convertPDFAnnots" : false,
                "createPDFAnnotproxy" : false,
                "canCollaborate": false,
                "canLogin" : true,
                "showmarkupZoom" : false,
                "showAnnotationsOnLoad" : false,
                //"localStoreStamp" : true,
                "localStoreAnnotation": false,
                "disable2DVectorInfoButton" : false,
                "watermarkdemo" : false,
                "forceLogin" : false,
                "logoUrl": "/assets/images/logo.svg"
            
        },
        "UIStyles" : [
            
                { "name": "accent", "value": "#31BD59" },
                { "name": "accent-secondary", "value": "#F0F7F9" },
                { "name": "main", "value": "#333C4E" },
                { "name": "secondary", "value": "#A4ABAE" },
                { "name": "light-secondary", "value": "#EDF1F2" },
                { "name": "background", "value": "#D6DADC" },
                { "name": "background-light", "value": "#F0F7F9" },
                { "name": "side-nav-background", "value": "#F0F7F9" },
                { "name": "side-nav-background-active", "value": "#FFFFFF" },
                { "name": "background-secondary", "value": "#F5F5F5" },
                { "name": "side-nav-color", "value": "#A6ADB0" },
                { "name": "side-nav-color-active", "value": "#31BD59" },
                { "name": "side-nav-panel-background", "value": "#FFFFFF" },
                { "name": "top-nav-background", "value": "#FFFFFF" },
                { "name": "top-nav-color", "value": "#333C4E" },
                { "name": "top-nav-background-active", "value": "#F0F7F9" },
                { "name": "top-nav-color-active", "value": "#333C4E" },
                { "name": "top-nav-border-bottom-color-active", "value": "transparent" },
                { "name": "toolbar-background", "value": "#FFFFFF" },
                { "name": "toolbar-color", "value": "#333C4E" },
                { "name": "toolbar-background-active", "value": "#31BD59" },
                { "name": "logo-height", "value": "auto" }
        ],
        "demofiles" : [
            {
              "name": "CAD Drawings",
              "items":
              [
                {"id": "CAD_AUTOCAD", "name": "AutoCAD Drawing", "file": "demo1.dwg", "type": "2D", "size": 106, "thumbnail" : this.cacheUrl + "demo1-1aaac-468d814f/1_1T.PNG"},
                {"id": "CAD_MIROSTATION", "name": "Microstation Drawing", "file": "demo5.dgn", "type": "2D", "size": 5706},
        
                {"id": "CAD_INVENTOR", "name": "Inventor drawing", "file": "brewing-main.idw", "type": "2D", "size": 5706}
        
                
                //{"id": "CAD_SOLIDWORKS", "name": "SolidWorks Drawing", "file": "Sprinkler.SLDDRW", "type": "2D", "size": 3127},
                //{"id": "CAD_COMPARE", "name": "Compare", "action": "compare", "file": ["RXHDEMO5.dwg","Rxhdemo6.dwg"], "type": "2D"}
              ]
            },
            {
              "name": "3D Models",
              "items":
              [
                {"id": "C3D_IFCMODEL", "name": "IFC model", "file": "AC11-FZK-Haus-IFC.ifc", "type": "3D", "size": 4048},
                {"id": "C3D_KARLSRUHE", "name": "Karlsruhe institue", "file": "AC11-Institute-Var-2-IFC.ifc", "type": "3D", "size": 2769},
                {"id": "C3D_HITO", "name": "HITO School building", "file": "Plan_20070203_2x3.ifc", "type": "3D", "size": 72915},
        
                {"id": "C3D_TIE", "name": "7181 TIE Interceptor.stp", "file": "7181 TIE Interceptor.stp", "type": "3D", "size": 72915},
        
                {"id": "C3D_APPLE", "name": "Apple.igs", "file": "Apple.igs", "type": "3D", "size": 72915},
                {"id": "C3D_VALVE", "name": "Valve.ipt", "file": "Valve.ipt", "type": "3D", "size": 72915}
        
        
        
              ]
            },
            {
              "name": "Plotter Files",
              "items":
              [
                {"id": "PLOTTER_HPGL", "name": "HPGL Plot File", "file": "demo2.plt", "type": "2D", "size": 38},
                {"id": "PLOTTER_GERBER", "name": "Gerber File",  "file": "demo.gbr", "type": "2D", "size": 62}
              ]
            },
            {
              "name": "Image Files",
              "items":
              [
                {"id": "IMAGE_TIFF", "name": "Color Tiff", "file": "demo6.tif", "type": "2D", "size": 193},
                {"id": "IMAGE_TIFF_MONO", "name": "Mono Tiff", "file": "demo7.tif", "type": "2D", "size": 396},
                {"id": "IMAGE_MULTIPAGE", "name": "Multipage Tiff", "file": "demo8.tif", "type": "2D", "size": 870},
                {"id": "IMAGE_JPEG", "name": "Jpeg", "file": "X-35.jpg", "type": "2D", "size": 714}
              ]
            },
            {
              "name": "Office Documents",
              "items":
              [
                //{"id": "OFFICE_EXCEL", "name": "Excel Spreadsheet", "file": "demo11.xlsx", "type": "2D"},
                {"id": "OFFICE_PDF", "name": "PDF Document", "file": "040915 MOBSLAKT.pdf", "type": "PDF", "size": 125},
                {"id": "RXVIEW360_API_REFERENCE", "name": "API reference", "file": "RxView360_API_Specification.pdf", "type": "PDF", "size": 1727},
                {"id": "demo9", "name": "Sign demo", "file": "demo9.pdf", "type": "PDF", "size": 68}
              ]
            }
        ]
    };


    return {
        
        ConfigJSON : ConfigJSON

    };



})();