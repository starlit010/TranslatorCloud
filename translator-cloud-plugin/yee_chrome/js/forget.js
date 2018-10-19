var uid="";
var code="";
var confir={};
var emailOrphone=""
function bar_event_listener(){
    var eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
    var eventer = window[eventMethod];
    var messageEvent = eventMethod == "attachEvent" ? "onmessage" : "message";
    eventer(messageEvent,postMessageListener, false);
}
bar_event_listener();
function postMessageListener(e){
	if(e.data.action=="complete_UID"){
        uid=e.data.data.uid
         code=e.data.data.code
         emailOrphone=e.data.data.emailOrphone
	}else if(e.data.action=="save_err"){
        $(".loginInfo").html(e.data.errInfo);
    }
}

$(".Btn").on("click",function(){
    var passwor_reg=/.{6,32}$/
        var passwor_reg2=/^\d+$/ 
        var space_reg= /^[^\s]+$/
        if(passwor_reg.test($(".pwd input").val())&&!passwor_reg2.test($(".pwd input").val())&&$(".pwd input").val().length<33){
            confir.confirmpassword=$(".confirmpwd input").val();
           $(".loginInfo").html()
        }else if($(".pwd input").val()==""){
           $(".loginInfo").html("请设置密码")
            return false;
        }else if(passwor_reg2.test($(".pwd input").val())){
            $(".loginInfo").html("密码不能为纯数字");
            return false;
        }else{
            $(".loginInfo").html("你的设置格式不正确");
            return false;
        }
        if(!space_reg.test($(".pwd input").val())){
            $(".loginInfo").html("不能包含空格！");
            return false;
        }
        if($(".pwd input").val()!=$(".confirmpwd input").val()){
            $(".loginInfo").html("请确认密码一致");
            return false;
        }else{
            $(".loginInfo").html("");
        }
        
        confir.passWord=$(".pwd input").val();
        confir.uid=uid;
        confir.code=code;
        confir.emailOrphone=emailOrphone;
		window.parent.postMessage({
            action: "SAVEPWD",
            data:confir
        },
        "*")
})

function time_out(obj,time){
    var yhtml=obj.html();
    var timer="";
    var i=time;
    
    if(obj.hasClass("timeout")){
        return false;
    }else{
      obj.addClass("timeout");  
        timer=setInterval(function(){
            i--;
            obj.html(i+"秒")
            if(i==0){
                clearInterval(timer);
                i=time;
                obj.html(yhtml)
                obj.removeClass("timeout")
            }
        },1000)
        return true;
    }
}
$(".closebtn").on("click",
    function() {
        window.parent.postMessage({
            action: "CLOSE_REG"
        },
        "*")
    });