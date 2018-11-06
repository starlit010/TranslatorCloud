package com.grayliu.translator.enums;

import java.util.HashMap;
import java.util.Map;

/**
 * Created by liuhui-ds9 on 2018/11/6.
 */
public enum Menu {

    En("en"),Ch("ch");

    String value = null;

    Menu(String lan){
        this.value = lan;
    }

    public Map<String,Map<String, Map<String,String>>> getTree(){
        Map<String,Map<String, Map<String,String>>> rtn = new HashMap<String,Map<String, Map<String,String>>>();

        for(Menu menu : Menu.values()){
            rtn.put(menu.value,Field.common.getTree(menu));
        }

        return rtn;
    }


}
