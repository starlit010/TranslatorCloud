var uid=""; //uid
function bar_event_listener(){
    var eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
    var eventer = window[eventMethod];
    var messageEvent = eventMethod == "attachEvent" ? "onmessage" : "message";
    eventer(messageEvent,postMessageListener, false);
}
bar_event_listener();
function postMessageListener(e){
    if(e.data.action =="forget_UID"){
        uid=e.data.data;
        $(".Btn").addClass("BtnActive");
    }else if(e.data.action=="forget_emailNo"){
      $(".loginInfo").html("账号不存在！请输入正确的邮箱账号")  
      clearInterval(timer)
        $(".getcode").removeClass("timeout")
        $(".getcode").html("获取验证码")
    }else if(e.data.action=="forget_phoneNo"){
      $(".loginInfo").html("账号不存在！请输入正确的手机号")
      clearInterval(timer)
        $(".getcode").removeClass("timeout")
        $(".getcode").html("获取验证码")
      
    }else if(e.data.action=="err_code"){
     $(".loginInfo").html("短信码错误！请输入正确的短信码")
    }
}
// 切换方式
$("#backType").on("change",function(){
	var typeName=$(this).val();
	if(typeName=="phone"){
		$(".phone").show();
		$(".email").hide();
        $(".email input").val("")
	}else if(typeName=="email"){
		$(".phone").hide();
		$(".email").show();
        $(".phone input").val("")
	}
    $(".loginInfo").html();
})

$(".Btn").on("click",function(){
    if( !$(".Btn").hasClass("BtnActive") ) return;
    var typeName=$("#backType").val();
    var back_info={};
    back_info.code=$(".code input").val();
    back_info.uid=uid;
        if($(".code input").val()!=""&&$(".code input").val().length<7){
        if(typeName=="phone"){
            back_info.emailOrphone=$(".phone input").val()
        }else if(typeName=="email"){
            back_info.emailOrphone=$(".email input").val()
            $(".loginInfo").html("")
        }          
        }else if($(".code input").val()==''){
            $(".loginInfo").html("请输入短信码!")
            return false;
        }else{
           $(".loginInfo").html("验证码错误,请重新输入！")
           return false;
        }
    
	window.parent.postMessage({
            action: "BACK_PWD",
            backinfo:back_info
        },
        "*")
})
$(".getcode").on("click",function(){
    var phone_reg=/^[0-9]{5,11}/ ;
    var code_info={};
    var passwor_reg=/[a-zA-Z0-9_-]{6,18}/
     var space_reg= /^[^\s'"!@#$%]+$/
    if($("#backType").val()=="phone"){
        
        
         if(phone_reg.test($(".phone input").val())){
            code_info.phone=$(".phone input").val()
            $(".loginInfo").html("")
         }else{
            $(".phone input").val()? $(".loginInfo").html("账号不存在！请输入正确的手机号"):$(".loginInfo").html("请输入注册手机号！")
            return false;
         }
         if(passwor_reg.test($(".pwd input").val())){
            code_info.userPassword=$(".pwd input").val();
           
        }else{
           $(".pwd input").val()?space_reg.test($(".pwd input").val())?$(".loginInfo").html("账号或密码错误！"):$(".loginInfo").html("不能包含空格"):$(".loginInfo").html("请输入登录密码！")
           return false;
        }
         code_info.type="regist";

    }else if($("#backType").val()=="email"){
        var email_reg=/^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,4}$/;
        if(email_reg.test($(".email input").val())){
          code_info.email=$(".email input").val();   
          $(".loginInfo").html("")      
        }else{
            $(".email input").val()? $(".loginInfo").html("账号不存在！请输入正确的邮箱号"):$(".loginInfo").html("请输入注册邮箱")
           
            return false;
        } 
         
    }
    var flag=time_out($(".getcode"),60,$(".backType"))
    if(!flag){
        return false
    }
    code_info.type="forget";
	code_info.type="forget";
	window.parent.postMessage({
            action: "BACK_CODE",
            back_code:code_info
        },
        "*")
})
$(".closebtn").on("click",
    function() {
        window.parent.postMessage({
            action: "CLOSE_REG"
        },
        "*")
    });
var timer="";
function time_out(obj,time,btn){

    var yhtml=obj.html();
    
    var i=time;
    btn.on("change",function(){
        clearInterval(timer)
        i=time;
        obj.html("获取验证码")
        obj.removeClass("timeout")

    })
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

