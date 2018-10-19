function bar_event_listener(){
    var eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
    var eventer = window[eventMethod];
    var messageEvent = eventMethod == "attachEvent" ? "onmessage" : "message";
    eventer(messageEvent,postMessageListener, false);
}
bar_event_listener();
function postMessageListener(e){
	if(e.data.action=="LOGIN_ERR"){
        $(".loginInfo").html(e.data.msg);
    }
}
$(".loginBtn").on("click",login_yeek)
function login_yeek(){
     var logininfo={};
     var phone_reg=/^[0-9]{5,11}/ ;
     var email_reg=/^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,4}$/;
     var passwor_reg=/.{6,18}/
     var space_reg= /^[^\s]+$/
      logininfo.userName=$(".userName input").val()
     if(passwor_reg.test($(".pwd input").val())){
            logininfo.userPassword=$(".pwd input").val();
           
        }else{
           $(".pwd input").val()?space_reg.test($(".pwd input").val())?$(".loginInfo").html("账号或密码错误！"):$(".loginInfo").html("不能包含空格！"):$(".loginInfo").html("请输入登录密码！")
           return false;
        }
    if( !space_reg.test($(".pwd input").val()) ){
        $(".loginInfo").html("不能包含空格！");
        return false;
    }
     window.parent.postMessage({
            action: "LOGIN",
            logininfo:logininfo
        },
        "*")
}
$(".closebtn").on("click",
    function() {
        window.parent.postMessage({
            action: "CLOSE_REG"
        },
        "*")
    });
$(document).on("keyup",function(e){
   if(e.keyCode=="13"){
    login_yeek()
   }
})
$(".NPWD").on("click",function(){
    $(".pwd input").val("")
})