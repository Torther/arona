/* eslint-disable prettier/prettier */
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { ElMessage } from "element-plus";
import showCodeMessage from "@/api/code";
import { formatJsonToUrlParams, instanceObject } from "@/utils/format";
import { Group } from "@/interface";

const BASE_PREFIX = import.meta.env.VITE_API_BASEURL;

// 创建实例
const axiosInstance: AxiosInstance = axios.create({
  // 前缀
  baseURL: BASE_PREFIX,
  // 超时
  timeout: 1000 * 30,
  // 请求头
  headers: {
    "Content-Type": "application/json",
  },
});

// 请求拦截器
axiosInstance.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    // TODO 在这里可以加上想要在请求发送前处理的逻辑
    // TODO 比如 loading 等
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

// 响应拦截器
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    if (response.status === 200) {
      const resp = response.data as ServerResponse<unknown>;
      if (resp && resp.code !== 200 && resp.message) {
        ElMessage({
          type: "warning",
          message: resp.message,
        });
      }
      return response.data;
    }
    ElMessage.info(JSON.stringify(response.status));
    return response;
  },
  (error: AxiosError) => {
    const { response } = error;
    if (response) {
      ElMessage.error(showCodeMessage(response.status));
      return Promise.reject(response.data);
    }
    ElMessage.warning("网络连接异常,请稍后再试!");
    return Promise.reject(error);
  },
);

interface ServerResponse<T> {
  code: number;
  message: string;
  data: T;
}

const service = {
  get<T>(url: string, data?: object): Promise<ServerResponse<T>> {
    return axiosInstance.get(url, { params: data });
  },

  post<T>(url: string, data?: object): Promise<ServerResponse<T>> {
    return axiosInstance.post(url, data);
  },

  put<T>(url: string, data?: object): Promise<ServerResponse<T>> {
    return axiosInstance.put(url, data);
  },

  delete<T>(url: string, data?: object): Promise<ServerResponse<T>> {
    return axiosInstance.delete(url, data);
  },

  upload: (url: string, file: FormData | File) =>
    axiosInstance.post(url, file, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  download: (url: string, data: instanceObject) => {
    window.location.href = `${BASE_PREFIX}/${url}?${formatJsonToUrlParams(data)}`;
  },

  raw<T>(config: AxiosRequestConfig): Promise<ServerResponse<T>> {
    return axiosInstance(config) as unknown as Promise<ServerResponse<T>>;
  },
};

export default service;
