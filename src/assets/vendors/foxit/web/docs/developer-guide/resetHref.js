var retryCount=0;
function locateEle(id){
    if(retryCount++>50)return;
    var ele = document.getElementById(id)
    if(!ele){
        setTimeout(() => {
            locateEle(id)
        }, 500);
    }else{
        window.location.href=window.location.href;
    }
}
window.onload=function(){
    var href = window.location.href;
    var index = href.indexOf('#')+1;
    if(index!==-1){
       var id = href.substr(index);
        locateEle(id);
    }
}