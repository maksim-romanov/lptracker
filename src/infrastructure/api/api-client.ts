import { $fetch } from "ofetch";

import type { ApiClientConfig, ApiError } from "./types";

export class ApiClient {
  constructor(private readonly config: ApiClientConfig) {}

  async get<T>(path: string, options?: { params?: Record<string, any> }): Promise<T> {
    try {
      return await $fetch<T>(`${this.config.baseURL}${path}`, {
        method: "GET",
        headers: this.config.headers,
        timeout: this.config.timeout,
        params: options?.params,
      });
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async post<T>(path: string, options?: { body?: any; params?: Record<string, any> }): Promise<T> {
    try {
      return await $fetch<T>(`${this.config.baseURL}${path}`, {
        method: "POST",
        headers: this.config.headers,
        timeout: this.config.timeout,
        body: options?.body,
        params: options?.params,
      });
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async head(path: string, options?: { params?: Record<string, any> }): Promise<void> {
    try {
      await $fetch(`${this.config.baseURL}${path}`, {
        method: "HEAD",
        headers: this.config.headers,
        timeout: this.config.timeout,
        params: options?.params,
      });
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  private handleError(error: any): ApiError {
    const apiError = new Error(error.message || "API request failed") as ApiError;
    apiError.status = error.status || error.statusCode;
    apiError.statusText = error.statusText || error.statusMessage;
    return apiError;
  }
}
