package com.grayliu.translator.service;

import org.springframework.context.ApplicationListener;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;

/**
 * Created by liuhui-ds9 on 2018/10/31.
 */

@Service
public class LogComponent implements ApplicationListener<ContextRefreshedEvent> {

    @Override
    public void onApplicationEvent(ContextRefreshedEvent event) {
        if (event.getApplicationContext().getParent() == null) {//root application context 没有parent，他就是老大.
            System.out.println("开机自启动------------开机自启动-------开机自启动-------开机自启动");
        }
    }

}
