package com.grayliu.translator.controller;

import lombok.extern.java.Log;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
