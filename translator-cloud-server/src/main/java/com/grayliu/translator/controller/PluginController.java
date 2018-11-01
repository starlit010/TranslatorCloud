package com.grayliu.translator.controller;

import com.grayliu.translator.bean.TranslatorRequest;
import com.grayliu.translator.bean.TranslatorResult;
import com.grayliu.translator.enums.Constants;
import com.grayliu.translator.util.DesUtil;
import com.grayliu.translator.util.TranslateUtil;
import lombok.extern.java.Log;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.ArrayList;
import java.util.List;

/**
 * Created by liuhui-ds9 on 2018/10/31.
 *
 * 登出
 * 登陆状态检测
 * 个人消息
 * 购买地址
 */

@Log
@RestController
@RequestMapping("/plugin")
public class PluginController {

    /**
     * 登出
     */
    @RequestMapping("/logout")
    public void logout(){

    }

    /**
     * 用户消息
     */
    @RequestMapping("/message")
    public void message(){

    }

    /**
     * 用户中心
     */
    @RequestMapping("/center")
    public void center(){

    }

    /**
     * 产品购买
     */
    @RequestMapping("/buy")
    public void buy(){

    }

    /**
     * 检测当前用户是否登陆
     */
    @RequestMapping("/user/me")
    public void logstatus(){

    }



}
