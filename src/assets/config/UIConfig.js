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
                "canLogin" : false,
                "showmarkupZoom" : false,
                "showAnnotationsOnLoad" : false,
                "localStoreStamp" : true,
                "localStoreAnnotation": false,
                "disable2DVectorInfoButton" : false,
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
        ]
    };


    return {
        
        ConfigJSON : ConfigJSON

    };



})();