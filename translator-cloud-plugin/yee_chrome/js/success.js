function bar_event_listener(){
    var eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
    var eventer = window[eventMethod];
    var messageEvent = eventMethod == "attachEvent" ? "onmessage" : "message";
    eventer(messageEvent,postMessageListener, false);
}
bar_event_listener();
function postMessageListener(e){
	if(e.data.action=="SUCCESS"){
		$(".coupon_code").html(e.data.yeecloudCode)
	}
}
$(".closebtn").on("click",
    function() {
        window.parent.postMessage({
            action: "CLOSE_REG"
        },
        "*")
    });
$(".order").on("click",function(){
    window.open("http://www.yeecloud.com")
})