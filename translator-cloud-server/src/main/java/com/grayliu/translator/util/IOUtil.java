package com.grayliu.translator.util;

import java.io.BufferedReader;
import java.io.BufferedWriter;

/**
 * Created by liuhui-ds9 on 2018/10/31.
 */
public class IOUtil{

    public static void closeReader(BufferedReader br){
        if(br != null){
            try{
                br.close();
            }catch(Exception e){

            }
        }
    }

    public static void closeWriter(BufferedWriter bw){
        if(bw != null){
            try{
                bw.close();
            }catch(Exception e){

            }
        }
    }

}
