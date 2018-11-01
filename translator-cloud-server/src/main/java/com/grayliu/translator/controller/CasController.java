package com.grayliu.translator.controller;

import lombok.extern.java.Log;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Created by liuhui-ds9 on 2018/11/1.
 *
 * 只负责单点登陆
 * 生成token
 *
 */

@Log
@RestController
@RequestMapping("/cas/author")
public class CasController {

    @RequestMapping("/token")
    public String token(){

        return "";
    }

}
