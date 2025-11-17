var foxitdocs = [];


function newiframemessage(iframeid){
    
    console.log(iframeid);
}


function swapElements(obj1, obj2) {
    // save the location of obj2
    var parent2 = obj2.parentNode;
    var next2 = obj2.nextSibling;
    // special case for obj1 is the next sibling of obj2
    if (next2 === obj1) {
        // just put obj1 before obj2
        parent2.insertBefore(obj1, obj2);
    } else {
        // insert obj2 right before obj1
        obj1.parentNode.insertBefore(obj2, obj1);

        // now insert obj1 where obj2 was
        if (next2) {
            // if there was an element after obj2, then insert obj1 right before that
            parent2.insertBefore(obj1, next2);
        } else {
            // otherwise, just append as last child
            parent2.appendChild(obj1);
        }
    }
}

function getIframes(){
    var iframeElements = [];

    var rxcoreElements = RxCore.getdivcontainer().children;
    for(var i = 0; i < rxcoreElements.length; i++) {
        if (rxcoreElements[i].tagName.toLowerCase() == "iframe"){
            iframeElements.push(rxcoreElements[i]);
        }
    }
    return iframeElements;
}

function hideAllIframes(){
    var iframeElements = getIframes();
    
    for(var i = 0; i < iframeElements.length; i++) {
        iframeElements[i].style.zIndex = "0";
        iframeElements[i].style.visibility = "hidden";
    }
}

function bringIframeToFront(iframeid){
    
    var iframeElements = getIframes();
    
    for(var i = 0; i < iframeElements.length; i++) {
        if (iframeElements[i].getAttribute("id") == iframeid){
            
            iframeElements[i].style.zIndex = "2";
            iframeElements[i].style.visibility = "visible";
        }else{
            iframeElements[i].style.zIndex = "0";
            iframeElements[i].style.visibility = "hidden";

        }
        
    }

}

function removeIframe(num){
    var iframename = 'foxitframe' + num

    var iframe = document.getElementById(iframename);
    RxCore.getdivcontainer().removeChild(iframe);
}




function iframeload(foxframe){
    foxitdocs.push(foxframe);

        var curnum = foxitdocs.length - 1;
        if(curnum == 0){
            var curid = 'foxitframe';
        }else if (curnum > 0){
            curid = 'foxitframe' + curnum;
        }
        foxframe.setIframeName(curid);
}



function insertAfter(newNode, referenceNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

function addfoxitiframe(divid, container){
    console.log("add foxit frame");
    var iframe = document.createElement('iframe');
    iframe.style.position = "absolute";
    iframe.style.top = "0px";
    iframe.style.left = "0px";
    iframe.style.border = "none";
    iframe.width = "100%";
    iframe.height = "100%";

    iframe.setAttribute("id", divid);

    iframe.src = 'assets/html/foxpage.html';

    RxCore.getdivcontainer().insertBefore(iframe, container);
}

function setActive(foxitframe){


}

function foxitGetDoc(){

    var counter = 0;

    if(foxitdocs.length == 0){
        foxitdocs.push(document.getElementById('foxitframe').contentWindow.foxframeview);
    }

    while (foxitdocs[counter].fileOpen && counter < foxitdocs.length - 1){
        counter ++; 
    }
    
    return foxitdocs[counter];
}


function foxitgetnumDocs(){
    return foxitdocs.length;
}

function addFoxitdocBarebone(){
    var divnum = foxitdocs.length;

    var foxitframeid = 'foxitframe' + divnum;

    var bdoAddFrame = false;
    var counter = 0;

    if (foxitdocs.length > 0){
        while (foxitdocs[counter].fileOpen && counter < foxitdocs.length - 1){
            counter ++; 
        }

        if(counter == foxitdocs.length - 1){
            //all free foxit objects used add a new one.
            bdoAddFrame = true;
        }
        var curnum = foxitdocs.length - 1;
        if(curnum == 0){
            var foxframe = document.getElementById('foxitframe');
        }else if (curnum > 0){
            var curid = 'foxitframe' + curnum;
            foxframe = document.getElementById(curid);
        }
    }

    if(foxitdocs.length == 0){
        bdoAddFrame = true;
        foxitframeid = "foxitframe";
        foxframe = document.getElementById("rxcontainer").firstChild;
    }

    if(bdoAddFrame){
        addfoxitiframe(foxitframeid, foxframe);
    }
}

function addfoxitdoc(){
    var divnum = foxitdocs.length;

    var foxitframeid = 'foxitframe' + divnum;

    var bdoAddFrame = false;
    var counter = 0;

    if (foxitdocs.length > 0){
        while (foxitdocs[counter].fileOpen && counter < foxitdocs.length - 1){
            counter ++; 
        }

        if(counter == foxitdocs.length - 1){
            //all free foxit objects used add a new one.
            bdoAddFrame = true;
        }
        var curnum = foxitdocs.length - 1;
        if(curnum == 0){
            var foxframe = document.getElementById('foxitframe');
        }else if (curnum > 0){
            var curid = 'foxitframe' + curnum;
            foxframe = document.getElementById(curid);
        }
    }

    if(foxitdocs.length == 0){
        foxitdocs.push(document.getElementById('foxitframe').contentWindow.foxframeview);
        foxframe = document.getElementById("foxitframe");
    }

    if(bdoAddFrame){
        addfoxitiframe(foxitframeid, foxframe);
    }
}

function foxitgetOpenDocs(){

    var numOpen = 0;
    for(var dnum = 0; dnum < foxitdocs.length; dnum++){
        if (foxitdocs[dnum].fileOpen){
            numOpen ++;
        }
    }

    return numOpen;
    //return document.getElementById('foxitframe').contentWindow.foxitgetOpenDocs();
}


function removefoxitdoc(){

    //&& foxitdocs[dnum].divid != 'pdf-viewer'
    if (foxitdocs.length > 1){
        for(var dnum = 0; dnum < foxitdocs.length; dnum++){
            if (!foxitdocs[dnum].fileOpen ){
                //remove iframe from DOM.
                //foxitdocs[dnum].divelement.parentNode.removeChild(foxitdocs[dnum].divelement);
                foxitdocs[dnum].cleanUp();
                foxitdocs[dnum] = null;
                foxitdocs.splice(dnum,1);
                removeIframe(dnum);

            }
        }
    }
    //elem.parentNode.removeChild(elem);

}

