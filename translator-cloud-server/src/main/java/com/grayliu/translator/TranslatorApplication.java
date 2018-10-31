package com.grayliu.translator;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;
import org.springframework.context.annotation.ImportResource;

/**
 * Created by liuhui-ds9 on 2018/10/31.
 */

@SpringBootApplication
@ImportResource({"classpath:spring/spring.xml"})
public class TranslatorApplication extends SpringBootServletInitializer{

//    @Override
//    protected SpringApplicationBuilder configure(SpringApplicationBuilder application) {
//        return application.sources(TranslatorApplication.class);
//    }

    public static void main(String[] args){
        SpringApplication.run(TranslatorApplication.class, args);
    }

}
