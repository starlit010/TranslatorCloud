package com.grayliu.translator.util;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.DESKeySpec;
import java.security.SecureRandom;
import java.text.SimpleDateFormat;
import java.util.Date;

/**
 * Created by liuhui-ds9 on 2018/10/30.
 */
public class EncryptUtil {

    private static String key = "yeekit";

    private static SimpleDateFormat dateFormat = new SimpleDateFormat("yyyyMMdd");

    public static String enCode()throws Exception {
        String key1 = dateFormat.format(new Date());
        String key2 = "_";
        String key3 = "yeekit";

        byte[] temp = desEncode(key.getBytes(),key1);
        temp = desEncode(temp,key2);
        temp = desEncode(temp,key3);
        return new String(temp);
    }


    public static String deCode(String src)throws Exception {
        String key1 = dateFormat.format(new Date());
        String key2 = "_";
        String key3 = "yeekit";

        byte[] temp = desDecode(src.getBytes(), key1);
        temp = desDecode(temp, key2);
        temp = desDecode(temp, key3);
        return new String(temp);
    }


    public static byte[] desEncode(byte[] src,String password)throws Exception{
        SecureRandom random = new SecureRandom();
        DESKeySpec desKey = new DESKeySpec(password.getBytes());
        //创建一个密匙工厂，然后用它把DESKeySpec转换成
        SecretKeyFactory keyFactory = SecretKeyFactory.getInstance("DES");
        SecretKey securekey = keyFactory.generateSecret(desKey);
        //Cipher对象实际完成加密操作
        Cipher cipher = Cipher.getInstance("DES");
        //用密匙初始化Cipher对象
        cipher.init(Cipher.ENCRYPT_MODE, securekey, random);
        //现在，获取数据并加密
        //正式执行加密操作
        return cipher.doFinal(src);
    }

    public static byte[] desDecode(byte[] src,String password)throws Exception{
        // DES算法要求有一个可信任的随机数源
        SecureRandom random = new SecureRandom();
        // 创建一个DESKeySpec对象
        DESKeySpec desKey = new DESKeySpec(password.getBytes());
        // 创建一个密匙工厂
        SecretKeyFactory keyFactory = SecretKeyFactory.getInstance("DES");
        // 将DESKeySpec对象转换成SecretKey对象
        SecretKey securekey = keyFactory.generateSecret(desKey);
        // Cipher对象实际完成解密操作
        Cipher cipher = Cipher.getInstance("DES");
        // 用密匙初始化Cipher对象
        cipher.init(Cipher.DECRYPT_MODE, securekey, random);
        // 真正开始解密操作
        return cipher.doFinal(src);
    }




}
