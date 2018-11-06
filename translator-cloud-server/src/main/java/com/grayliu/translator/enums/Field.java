package com.grayliu.translator.enums;

import java.util.HashMap;
import java.util.Map;

/**
 * Created by liuhui-ds9 on 2018/11/6.
 *
 * 领域
 */
public enum Field {

    common("通用领域","Common"),engine("国际工程","Engine"),law("法律合同","Law"),news("新闻传媒","News"),medicine("生物医学","Medicine"),it("IT通讯","IT"),
    patent("专利产权","Patent"),spoken("旅游口语","Spoken"),finance("金融财经","Finance");

    String valueCh;
    String valueEn;

    Field(String valueCh,String valueEn){
        this.valueCh = valueCh;
        this.valueEn = valueEn;
    }

    public Map<String,Map<String,String>> getTree(Menu menu){
        Map<String, Map<String,String>> tree = new HashMap<String,Map<String,String>>();
        tree.put("zh-en",getField(menu,Field.values()));
        tree.put("default",getField(menu,Field.common));
        tree.put("en-zh",getField(menu,Field.values()));
        return tree;
    }

    public Map<String, String> getField(Menu menu,Field...fields){
        Map<String, String> rtn = new HashMap<String, String>();
        switch(menu){
            case En:
                for(Field field : fields){
                    rtn.put(field.name(), field.valueEn);
                }
                break;
            case Ch:
                for(Field field : fields){
                    rtn.put(field.name(), field.valueCh);
                }
                break;
            default:

        }
        return rtn;
    }

}
