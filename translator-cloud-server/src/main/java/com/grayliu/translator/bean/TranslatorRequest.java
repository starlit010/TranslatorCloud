package com.grayliu.translator.bean;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

/**
 * Created by liuhui-ds9 on 2018/10/31.
 */
@Getter
@Setter
@ToString
public class TranslatorRequest {


    String srcl;

    String tgtl;

    String[] word;

}
