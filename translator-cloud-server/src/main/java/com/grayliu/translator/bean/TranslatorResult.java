package com.grayliu.translator.bean;

import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldNameConstants;

import java.util.List;

/**
 * Created by liuhui-ds9 on 2018/10/31.
 */

@Getter
@Setter
public class TranslatorResult {

    String msg;

    String code;

    List<String> data;

    public TranslatorResult(String code, String msg, List<String> data){
        this.code = code;
        this.msg = msg;
        this.data = data;
    }

}
