package com.grayliu.translator.bean.result.translate;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

/**
 * Created by liuhui-ds9 on 2018/11/6.
 */

@Getter
@Setter
@ToString
public class LanguageResult {

    String lang;

    String text;

    public LanguageResult(){}

    public LanguageResult(String lang, String text){
        this.lang = lang;
        this.text = text;
    }

}
