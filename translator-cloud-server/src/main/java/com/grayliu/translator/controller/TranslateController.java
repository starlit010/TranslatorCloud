package com.grayliu.translator.controller;

import com.grayliu.translator.bean.TranslatorRequest;
import com.grayliu.translator.bean.TranslatorResult;
import com.grayliu.translator.enums.Constants;
import com.grayliu.translator.util.DesUtil;
import com.grayliu.translator.util.TranslateUtil;
import lombok.extern.java.Log;
import org.apache.commons.lang3.StringUtils;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.ArrayList;
import java.util.List;

/**
 * Created by liuhui-ds9 on 2018/11/1.
 * 翻译中心
 * 通用领域获取
 * 语言检测
 */

@Log
@RestController
@RequestMapping("/translate")
public class TranslateController {

    @RequestMapping("/translate")
    public TranslatorResult translate(TranslatorRequest translatorRequest,HttpServletRequest request,HttpServletResponse response){

        log.info("/plugin/translate===>"+translatorRequest.toString());

        String access_token = request.getHeader("access_token");
        String access_param = request.getParameter("access_token");//为了解决Safari浏览器无法更改请求头的问题
        if(StringUtils.isNotBlank(access_token)){
            if(!DesUtil.yeekitDesCheck(access_token)){
                return new TranslatorResult(Constants.STATE_FAIL.getCode(), "暂无权限", null);
            }
        }else{
            if(StringUtils.isNotBlank(access_param)){
                if(!DesUtil.yeekitDesCheck(access_param)){
                    return new TranslatorResult(Constants.STATE_FAIL.getCode(), "暂无权限", null);
                }
            }else{
                return new TranslatorResult(Constants.STATE_FAIL.getCode(), "暂无权限", null);
            }
        }
        //遨游浏览器涉及到跨域，需要以下设置，才能保持session一致
        String url = request.getParameter("client_url");
        if(url!=null&&!url.equals("")){
            String laststr=url.substring(url.length()-1, url.length());//获取最后一个字符串如果是/则去除
            if(laststr.equals("/")){
                url=url.substring(0, url.length()-1);
            }
            response.setHeader("Access-Control-Allow-Origin", url);
            response.setHeader("Access-Control-Allow-Headers",
                    "Origin, X-Requested-With, Content-Type, Accept, Cookie");
            response.setHeader("Access-Control-Allow-Credentials", "true");
        }else{
            response.setHeader("Access-Control-Allow-Origin", "*");
        }
        //response.setHeader("Access-Control-Allow-Origin", "*");
        String[] wordArr = request.getParameterValues("word");
//		String[] wordArr = request.getParameter("word").replaceAll("\"", "").split(",");
        String srcl = request.getParameter("srcl");
        String tgtl = request.getParameter("tgtl");


        /**
         * 需要从配置数据库里查询
         * 暂时先不管，默认配置为1
         */
//        SysConfig sysConfig= sysConfigService.get("TRANSLATION_ENGINE_MANAGEMENT");//根据翻译引擎查询数据配置
        String newEngine = "1";

        if(StringUtils.isNotEmpty(newEngine)){
            if("1".equals(newEngine)){//使用新翻译引擎
                if(!((srcl.equals("zh")&&tgtl.equals("ko"))||(srcl.equals("ko")&&tgtl.equals("zh")))){
                    srcl="n"+srcl;
                    tgtl="n"+tgtl;
                }
            }else{//使用旧翻译引擎
                if(!((srcl.equals("zh")&&tgtl.equals("en"))||(srcl.equals("en")&&tgtl.equals("zh"))
                        ||(srcl.equals("zh")&&tgtl.equals("ko"))||(srcl.equals("ko")&&tgtl.equals("zh")))){//英-中，中-英，中-韩，韩-中：四种翻译模型不加n
                    srcl="n"+srcl;
                    tgtl="n"+tgtl;
                }
            }
        }else{//使用旧翻译引擎
            if(!((srcl.equals("zh")&&tgtl.equals("en"))||(srcl.equals("en")&&tgtl.equals("zh"))
                    ||(srcl.equals("zh")&&tgtl.equals("ko"))||(srcl.equals("ko")&&tgtl.equals("zh")))){
                srcl="n"+srcl;
                tgtl="n"+tgtl;
            }
        }

        List<String> words = new ArrayList<String>();
        if(srcl.equals("nde")){//德语翻译逗号加上
            if(wordArr !=null && wordArr.length > 0){
                for(String word:wordArr){
                    words.add(word+",");
                }
            }
        }else{
            if(wordArr !=null && wordArr.length > 0){
                for(String word:wordArr){
                    words.add(word);
                }
            }
        }

        List<String> result = TranslateUtil.translate(words, srcl, tgtl);
        if(srcl.equals("nde")){//德语翻译单词替换逗号
            List<String> result1=new ArrayList<String>();
            for (String string : result) {
                String r=string.trim().replace("，", ",");
                result1.add(r.replace(",", ""));
            }
            return new TranslatorResult(Constants.STATE_SUCCESS.getCode(), null, result1);
        }
        return new TranslatorResult(Constants.STATE_SUCCESS.getCode(), null, result);
    }

    /**
     * 获得通用领域
     */
    @RequestMapping("/project")
    public void project(){

    }

    /**
     * 语言检测
     */
    @RequestMapping("/lang/check")
    public void checkLanguage(){

    }

    /**
     * 系统消息
     */
    @RequestMapping("/query/message")
    public void message(){

    }

    /**
     * 即时消息
     */
    @RequestMapping("/query/timely")
    public void buy(){

    }



}
