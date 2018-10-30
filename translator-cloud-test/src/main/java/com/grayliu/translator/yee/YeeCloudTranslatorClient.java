package com.grayliu.translator.yee;

import com.grayliu.translator.util.EncryptUtil;
import com.grayliu.translator.util.StreamUtil;

import org.apache.http.HttpHost;
import org.apache.http.client.config.RequestConfig;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClientBuilder;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;

/**
 * Created by liuhui-ds9 on 2018/10/30.
 */
public class YeeCloudTranslatorClient {

    public static void main(String...args)throws Exception {
        try {


            HttpHost proxy = new HttpHost("127.0.0.1",8888);
            RequestConfig requestConfig = RequestConfig.custom().setProxy(proxy).build();
            CloseableHttpClient httpClient= HttpClientBuilder.create().setDefaultRequestConfig(requestConfig).build();

            HttpPost httpPost = new HttpPost("http://web.yeekit.com/plugin/translate");
            httpPost.addHeader("Content-Type", "application/x-www-form-urlencoded");
            httpPost.addHeader("access_token", "0D894C3F57E991E16BFA6C4FAFE39ED8");
//            StringEntity data = new StringEntity("{\"src\":\"en\",\"tgt\":\"zh\",\"word\":[\"english\"]}");
//            data.setContentType("ContentType:applciation/json;charset=UTF8");
//            httpPost.setEntity(data);
            StringEntity param = new StringEntity("srcl=en&tgtl=zh&word=english");
//            param.setContentType("Content-Type:application/x-www-form-urlencoded;charset=UTF-8");
            httpPost.setEntity(param);
            CloseableHttpResponse closeableHttpResponse = httpClient.execute(httpPost);
            System.out.println("=============>"+StreamUtil.inputStreamToString(closeableHttpResponse.getEntity().getContent()));
        } catch (IOException e) {
            e.printStackTrace();
        }
    }






}
