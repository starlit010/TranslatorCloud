package com.grayliu.translator.util;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.util.*;

public class TranslateUtil {	
	/**
	 * 批量文字翻译。如果翻译失败，返回原值
	 * @param words  待翻译文字
	 * @param srcl  源语言
	 * @param tgtl  目标语言
	 * @return  翻译结果
	 */
	public static List<String> translate(List<String> words,String srcl,String tgtl){
		List<String> result = new ArrayList<String>();
		if(words!=null){
			for(int i=0;i<words.size();i++){
				result.add(words.get(i));
			}
		}
		try{
			Hashtable<Integer,Long> hashTime = new Hashtable<Integer,Long>();//线程启动时间
			Hashtable<Integer,String> hashResult = new Hashtable<Integer,String>();//翻译结果
			for(int i=0;i<words.size();i++){
				if(THREAD_COUNT>MAX_COUNT && hashTime.size()>0){//线程数满了，且有任务在执行
					//判断是否有超时线程,
					checkThread(words,hashTime,hashResult,false);
				}
				hashTime.put(i, System.currentTimeMillis());
				new TranslateThread(words.get(i),i,hashTime,hashResult,srcl,tgtl).start();				
			}
			checkThread(words,hashTime,hashResult,true);//保证所有线程都执行完成
			for(int i=0;i<words.size();i++){
				if(hashResult.containsKey(i)){
					result.set(i, hashResult.get(i));
				}
			}
		}
		catch(Exception e){}		
		return result;
	}
	/**
	 * 检查翻译线程
	 * @param words   待翻译文本
	 * @param hashTime   线程启动时间
	 * @param hashResult  翻译结果
	 * @param finish  是否需要判断翻译完成
	 */
	private static void checkThread(List<String> words,Hashtable<Integer,Long> hashTime,Hashtable<Integer,String> hashResult,boolean finish){
		while(true){
			if(hashTime.size()<=0)
				return;
			if(!finish){//不需要判断是否翻译完成
				if(THREAD_COUNT<MAX_COUNT)
					return;
			}
			try{
				Enumeration<Integer> idxs = hashTime.keys();
				while(idxs.hasMoreElements()){
					int id = idxs.nextElement();
					long time = hashTime.get(id);
					long now = System.currentTimeMillis();
					if((now-time)>=TIMEOUT){//超时了
						if(!hashResult.contains(id)){
							hashResult.put(id, words.get(id));
						}
						hashTime.remove(id);
					}
				}
			}
			catch(Exception e){}
			try{
				if(hashTime.size()>0 && THREAD_COUNT>=MAX_COUNT){
					Thread.sleep(5);
				}
			}catch(Exception e){}
		}
	}
	
	/**
	 * 当前翻译的线程数
	 */
	private static int THREAD_COUNT = 0;
	/**
	 * 最大翻译的线程数
	 */
	private static int MAX_COUNT = 100;
	/**
	 * 单个翻译的超时时间，单位ms
	 */
	private static final int TIMEOUT = 6000;
	/**
	 * 单个翻译的请求超时时间，单位ms
	 */
	private static final int REQ_TIMEOUT = 5000;
	
	private synchronized static void setCount(boolean add){
		if(add)
			THREAD_COUNT++;
		else
			THREAD_COUNT--;
	}
	
	private static class TranslateThread extends Thread{	
		private static Logger log = LoggerFactory.getLogger("com.grayliu.translator.util.TranslateUtil");
		private String words;
		private int idx;
		private Hashtable<Integer,Long> hashTime;
		private Hashtable<Integer,String> hashResult;
		private String srcl;
		private String tgtl;
		public TranslateThread(String words,int idx,Hashtable<Integer,Long> hashTime,Hashtable<Integer,String> hashResult,String srcl,String tgtl){
			this.words = words;
			this.idx = idx;
			this.hashTime = hashTime;
			this.hashResult = hashResult;
			this.srcl = srcl;
			this.tgtl = tgtl;
		}
		@Override
		public void run() {
			BufferedReader br = null;
			BufferedWriter bw = null;
			HttpURLConnection conn = null;
			boolean haveError = true;
			long bt = System.currentTimeMillis();
			int len = 0;
			String urls = "http://translateport.yeekit.com/translate";
			//外网翻译接口地址
//			String urls = "http://192.168.52.3/translate";
			//内网翻译接口地址
			try{
				setCount(true);
				len = words.length();
				
//				URL url = new URL("http://translateport.yeekit.com/translate");
				//外网访问地址
//				URL url = new URL("http://192.168.52.3/translate");
				//内网访问地址
				URL url = new URL(urls);
				conn = (HttpURLConnection)url.openConnection();
				conn.setReadTimeout(REQ_TIMEOUT);
				conn.setRequestMethod("POST");
				conn.setRequestProperty("contentType", "application/json");
				conn.setDoOutput(true);
				bw = new BufferedWriter(new OutputStreamWriter(conn.getOutputStream(),"UTF-8"));
				LinkedHashMap<String,String> data = new LinkedHashMap<String,String>();
				data.put("srcl", srcl);
				data.put("tgtl", tgtl);
				data.put("text", words);
				String parameter = "data="+URLEncoder.encode(JSONObject.toJSONString(data),"UTF-8");
				parameter = JSONObject.toJSONString(data);
				bw.write(parameter);
				bw.flush();
				
				if(conn.getResponseCode()==200){//正确返回
					br = new BufferedReader(new InputStreamReader(conn.getInputStream(),"UTF-8"));
					StringBuffer sb = new StringBuffer();
					String line;
					while((line=br.readLine())!=null){
						sb.append(line+"\r\n");
					}
					//System.out.println(sb.toString());
//					ArrayList<LinkedHashMap> translation = (ArrayList<LinkedHashMap>)((LinkedHashMap)JSON.parse(sb.toString())).get("translation");
//					ArrayList<LinkedHashMap>  translated = (ArrayList<LinkedHashMap>)(translation.get(0).get("translated"));


					JSONObject jsonObject = (JSONObject)JSONObject.parse(sb.toString());
					JSONArray translation = (JSONArray)jsonObject.get("translation");
					JSONObject translated0 = (JSONObject)translation.get(0);
					JSONArray translated = (JSONArray)translated0.get("translated");
//					JSONObject translatedItem = (JSONObject)translated.get(0);

					StringBuffer sb1 = new StringBuffer();
					for(int i=0;i<translated.size();i++){
						JSONObject info = (JSONObject)translated.get(i);
						sb1.append((String)info.get("text"));
					}
					hashResult.put(idx,sb1.toString());
					haveError = false;
				}
				else{//未正确返回
					hashResult.put(idx, words);
				}
			}
			catch(Exception e){
				hashResult.put(idx, words);
				log.error("Translate error:"+words+",url="+urls+",srcl="+srcl+",tgtl="+tgtl+",words="+words,e);
				//e.printStackTrace();
			}
			finally{
				setCount(false);
				hashTime.remove(idx);
				IOUtil.closeReader(br);
				IOUtil.closeWriter(bw);
				log.info("length="+len+";srcl="+srcl+";tgtl="+tgtl+";error="+haveError+";time="+(System.currentTimeMillis()-bt));
			}
		}
//		@Override
//		public void run() {
//			BufferedReader br = null;
//			BufferedWriter bw = null;
//			HttpURLConnection conn = null;
//			try{
//				setCount(true);
//				
//				URL url = new URL("http://translateport.yeekit.com/translate?srcl="+srcl+"&tgtl="+tgtl+"&text="+URLEncoder.encode(words, "UTF-8"));
//				conn = (HttpURLConnection)url.openConnection();
//				
//				if(conn.getResponseCode()==200){//正确返回
//					br = new BufferedReader(new InputStreamReader(conn.getInputStream(),"UTF-8"));
//					StringBuffer sb = new StringBuffer();
//					String line;
//					while((line=br.readLine())!=null){
//						sb.append(line+"\r\n");
//					}
//					System.out.println(sb.toString());
//					ArrayList<LinkedHashMap> translation = (ArrayList<LinkedHashMap>)((LinkedHashMap)JSON.decode(sb.toString())).get("translation");
//					ArrayList<LinkedHashMap>  translated = (ArrayList<LinkedHashMap>)(translation.get(0).get("translated"));
//					StringBuffer sb1 = new StringBuffer();
//					for(int i=0;i<translated.size();i++){
//						LinkedHashMap info = translated.get(i);
//						sb1.append((String)info.get("text"));
//					}
//					hashResult.put(idx,sb1.toString());
//				}
//				else{//未正确返回
//					hashResult.put(idx, words);
//				}
//			}
//			catch(Exception e){
//				hashResult.put(idx, words);
//				log.error("Translate error:"+words,e);
//				e.printStackTrace();
//			}
//			finally{
//				setCount(false);
//				hashTime.remove(idx);
//				com.ttsx.platform.tool.util.IOUtil.closeReader(br);
//				com.ttsx.platform.tool.util.IOUtil.closeWriter(bw);
//			}
//		}
	}
	
	public static void main(String[] s) throws Exception{
		List<String> list = new ArrayList<String>();
		for(int i=0;i<2;i++){
			list.add("Java有原生的API可用于发送HTTP请求，即java.net.URL、java.net.URLConnection，这些API很好用、很常用，但不够简便；所以，也流行有许多Java HTTP请求的framework，如Java有原生的API可用于发送HTTP请求，即java.net.URL、java.net.URLConnection，这些API很好用、很常用，但不够简便；所以，也流行有许多Java HTTP请求的framework，如Java有原生的API可用于发送HTTP请求，即java.net.URL、java.net.URLConnection，这些API很好用、很常用，但不够简便；所以，也流行有许多Java HTTP请求的framework，如Java有原生的API可用于发送HTTP请求，即java.net.URL、java.net.URLConnection，这些API很好用、很常用，但不够简便；所以，也流行有许多Java HTTP请求的framework，如Java有原生的API可用于发送HTTP请求，即java.net.URL、java.net.URLConnection，这些API很好用、很常用，但不够简便；所以，也流行有许多Java HTTP请求的framework，如Java有原生的API可用于发送HTTP请求，即java.net.URL、java.net.URLConnection，这些API很好用、很常用，但不够简便；所以，也流行有许多Java HTTP请求的framework，如Java有原生的API可用于发送HTTP请求，即java.net.URL、java.net.URLConnection，这些API很好用、很常用，但不够简便；所以，也流行有许多Java HTTP请求的framework，如Java有原生的API可用于发送HTTP请求，即java.net.URL、java.net.URLConnection，这些API很好用、很常用，但不够简便；所以，也流行有许多Java HTTP请求的framework，如Java有原生的API可用于发送HTTP请求，即java.net.URL、java.net.URLConnection，这些API很好用、很常用，但不够简便；所以，也流行有许多Java HTTP请求的framework，如Java有原生的API可用于发送HTTP请求，即java.net.URL、java.net.URLConnection，这些API很好用、很常用，但不够简便；所以，也流行有许多Java HTTP请求的framework，如Java有原生的API可用于发送HTTP请求，即java.net.URL、java.net.URLConnection，这些API很好用、很常用，但不够简便；所以，也流行有许多Java HTTP请求的framework，如Java有原生的API可用于发送HTTP请求，即java.net.URL、java.net.URLConnection，这些API很好用、很常用，但不够简便；所以，也流行有许多Java HTTP请求的framework，如Java有原生的API可用于发送HTTP请求，即java.net.URL、java.net.URLConnection，这些API很好用、很常用，但不够简便；所以，也流行有许多Java HTTP请求的framework，如Java有原生的API可用于发送HTTP请求，即java.net.URL、java.net.URLConnection，这些API很好用、很常用，但不够简便；所以，也流行有许多Java HTTP请求的framework，如Java有原生的API可用于发送HTTP请求，即java.net.URL、java.net.URLConnection，这些API很好用、很常用，但不够简便；所以，也流行有许多Java HTTP请求的framework，如Java有原生的API可用于发送HTTP请求，即java.net.URL、java.net.URLConnection，这些API很好用、很常用，但不够简便；所以，也流行有许多Java HTTP请求的framework，如Java有原生的API可用于发送HTTP请求，即java.net.URL、java.net.URLConnection，这些API很好用、很常用，但不够简便；所以，也流行有许多Java HTTP请求的framework，如Java有原生的API可用于发送HTTP请求，即java.net.URL、java.net.URLConnection，这些API很好用、很常用，但不够简便；所以，也流行有许多Java HTTP请求的framework，如Java有原生的API可用于发送HTTP请求，即java.net.URL、java.net.URLConnection，这些API很好用、很常用，但不够简便；所以，也流行有许多Java HTTP请求的framework，如Java有原生的API可用于发送HTTP请求，即java.net.URL、java.net.URLConnection，这些API很好用、很常用，但不够简便；所以，也流行有许多Java HTTP请求的framework，如Java有原生的API可用于发送HTTP请求，即java.net.URL、java.net.URLConnection，这些API很好用、很常用，但不够简便；所以，也流行有许多Java HTTP请求的framework，如Java有原生的API可用于发送HTTP请求，即java.net.URL、java.net.URLConnection，这些API很好用、很常用，但不够简便；所以，也流行有许多Java HTTP请求的framework，如Java有原生的API可用于发送HTTP请求，即java.net.URL、java.net.URLConnection，这些API很好用、很常用，但不够简便；所以，也流行有许多Java HTTP请求的framework，如Java有原生的API可用于发送HTTP请求，即java.net.URL、java.net.URLConnection，这些API很好用、很常用，但不够简便；所以，也流行有许多Java HTTP请求的framework，如Java有原生的API可用于发送HTTP请求，即java.net.URL、java.net.URLConnection，这些API很好用、很常用，但不够简便；所以，也流行有许多Java HTTP请求的framework，如Java有原生的API可用于发送HTTP请求，即java.net.URL、java.net.URLConnection，这些API很好用、很常用，但不够简便；所以，也流行有许多Java HTTP请求的framework，如Java有原生的API可用于发送HTTP请求，即java.net.URL、java.net.URLConnection，这些API很好用、很常用，但不够简便；所以，也流行有许多Java HTTP请求的framework，如Java有原生的API可用于发送HTTP请求，即java.net.URL、java.net.URLConnection，这些API很好用、很常用，但不够简便；所以，也流行有许多Java HTTP请求的framework，如Java有原生的API可用于发送HTTP请求，即java.net.URL、java.net.URLConnection，这些API很好用、很常用，但不够简便；所以，也流行有许多Java HTTP请求的framework，如Java有原生的API可用于发送HTTP请求，即java.net.URL、java.net.URLConnection，这些API很好用、很常用，但不够简便；所以，也流行有许多Java HTTP请求的framework，如Java有原生的API可用于发送HTTP请求，即java.net.URL、java.net.URLConnection，这些API很好用、很常用，但不够简便；所以，也流行有许多Java HTTP请求的framework，如Java有原生的API可用于发送HTTP请求，即java.net.URL、java.net.URLConnection，这些API很好用、很常用，但不够简便；所以，也流行有许多Java HTTP请求的framework，如Java有原生的API可用于发送HTTP请求，即java.net.URL、java.net.URLConnection，这些API很好用、很常用，但不够简便；所以，也流行有许多Java HTTP请求的framework，如Java有原生的API可用于发送HTTP请求，即java.net.URL、java.net.URLConnection，这些API很好用、很常用，但不够简便；所以，也流行有许多Java HTTP请求的framework，如Java有原生的API可用于发送HTTP请求，即java.net.URL、java.net.URLConnection，这些API很好用、很常用，但不够简便；所以，也流行有许多Java HTTP请求的framework，如Java有原生的API可用于发送HTTP请求，即java.net.URL、java.net.URLConnection，这些API很好用、很常用，但不够简便；所以，也流行有许多Java HTTP请求的framework，如Java有原生的API可用于发送HTTP请求，即java.net.URL、java.net.URLConnection，这些API很好用、很常用，但不够简便；所以，也流行有许多Java HTTP请求的framework，如Java有原生的API可用于发送HTTP请求，即java.net.URL、java.net.URLConnection，这些API很好用、很常用，但不够简便；所以，也流行有许多Java HTTP请求的framework，如，Apache的HttpClient。目前项目主要用到Java原生的方式，所以，这里主要介绍此方式");
		}
		String srcl = "zh";
		String tgtl = "en";
		long bt = System.currentTimeMillis();
		for(int k=0;k<1;k++){
			List<String> result = translate(list,srcl,tgtl);
			for(int i=0;i<result.size();i++){
				System.out.println(result.get(i));
			}
		}
		long et = System.currentTimeMillis();
		System.out.println((et-bt));
	}
}
