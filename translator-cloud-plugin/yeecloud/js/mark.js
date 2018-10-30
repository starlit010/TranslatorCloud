var mark_Id={}; //书签id
var LANGUAGE_TYPE_LIST_DEFINED = {"zh":"中文","en":"英文","ru":"俄语","pt":"葡语","fr":"法语","de":"德语","ko":"韩语"}//语种
function bar_event_listener(){
    var eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
    var eventer = window[eventMethod];
    var messageEvent = eventMethod == "attachEvent" ? "onmessage" : "message";
    eventer(messageEvent,postMessageListener, false);
}
bar_event_listener();
function postMessageListener(e){
	var arr=e.data.data
	var mark_list=""
	for(var i=0;i<arr.length;i++){
		mark_list+="<tr data-id="+arr[i].id+" data-src="+arr[i].ctSrcl.split("_")[0]+" data-tgt="+arr[i].ctTgtl.split("_")[0]+">"+
					"<td class='titleName'><img src='http://"+arr[i].ctIco+"' style='height:16px;width:16px;margin:0 10px;float:left ' />"+arr[i].ctTitle+"</td>"+
					"<td class='ctsrc'>"+arr[i].ctSrcl.split("_")[1]+"</td>"+
					"<td class='cttgt'>"+arr[i].ctTgtl.split("_")[1]+"</td>"+
				  "</tr>"
	}
	$("#mark_info").html(mark_list)
	
};
function language(){
	var opt="";
	for(var i in LANGUAGE_TYPE_LIST_DEFINED){
		 opt+="<option value="+i+">"+LANGUAGE_TYPE_LIST_DEFINED[i]+"</option>"
	}
		$("#srclang").html(opt)
		$("#tgtlang").html(opt)
};
language();
$(".closebtn").on("click",
    function() {
        window.parent.postMessage({
            action: "CLOSE_MARK"
        },
        "*")
    });
$(document).on("click","#mark_info tr",function(){
	var data_id=$(this).attr("data-id");
	mark_Id.id=data_id;
	$("#mark_name span").html($(this).find(".titleName").html());
	$(this).addClass("active");
	$(this).siblings().removeClass("active");
	$("#srclang").val($(this).attr("data-src"));
	$("#tgtlang").val($(this).attr("data-tgt"));
	$("#mark_name").show();
	$("#srclang").attr("disabled",false)
	$("#tgtlang").attr("disabled",false);
	$("#save_mark").addClass("trClick");
	$("#remove_mark").addClass("trClick");
})
// 修改书签
$("#save_mark").on("click",function(){
	var save_markinfo={};
	save_markinfo.ctSrcl=$("#srclang").val();
	save_markinfo.ctTgtl=$("#tgtlang").val();
	save_markinfo.id=mark_Id.id;
	if($(this).hasClass("trClick")){
		window.parent.postMessage({
	            action: "SAVE_MARK",
	            markId: save_markinfo
	        },
	        "*")
	}
})
// 删除书签
$("#remove_mark").on("click",function(){
	var remove_id=""
	if($(this).hasClass("trClick")){
		window.parent.postMessage({
            action: "REMOVE_MARK",
            markId:mark_Id
        },
        "*")
	}
	
})