package com.grayliu.translator;

import com.alibaba.fastjson.JSONObject;
import com.grayliu.translator.enums.Menu;

import java.util.Map;

/**
 * Created by liuhui-ds9 on 2018/11/6.
 */
public class MenuTest {

    public static void main(String...args){

        Map<String,Map<String, Map<String,String>>> object = Menu.Ch.getTree();

        System.out.println(object);

        System.out.println(JSONObject.toJSONString(object));

    }



}
