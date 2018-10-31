package com.grayliu.translator.enums;

/**
 * Created by liuhui-ds9 on 2018/10/31.
 */
public enum Constants {

    STATE_SUCCESS("1"),STATE_FAIL("0");

    String code;

    Constants(String code){
        this.code = code;
    }

    public String getCode(){
        return code;
    }


}
