import { toastBus } from "../utils/toastBus";

class ApiService {
  private baseUrl: string;
  private apiBaseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    // Allow users to set NEXT_PUBLIC_API_URL with or without a trailing /api
    const normalizedBase = this.baseUrl.replace(/\/+$/, "");
    const baseWithoutApi = normalizedBase.replace(/\/api$/i, "");
    this.apiBaseUrl = `${baseWithoutApi}/api`;
  }

  private buildUrl(endpoint: string): string {
    const normalizedEndpoint = endpoint
      ? `/${endpoint.replace(/^\/+/, "")}`
      : "";
    const withoutApiPrefix = normalizedEndpoint.replace(/^\/api(\/|$)/, "/");
    const path = withoutApiPrefix === "/" ? "" : withoutApiPrefix;
    return `${this.apiBaseUrl}${path}`;
  }

  private getAuthHeaders(): HeadersInit {
    if (typeof window === "undefined") return {};

    const token = localStorage.getItem("campusor_jwt");
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return headers;
  }

  private unauthorizedCallback: (() => void) | null = null;

  public setUnauthorizedCallback(callback: () => void) {
    this.unauthorizedCallback = callback;
  }

  private handleUnauthorized() {
    toastBus.error("Session expired. Please login again.");
    this.unauthorizedCallback?.();
  }

  private async handleResponse(response: Response) {
    const data = await response.json().catch(() => ({}));

    if (response.status === 401 || response.status === 403) {
      this.handleUnauthorized();
    }

    if (!response.ok) {
      toastBus.error(data?.message || "Request failed");
      throw new Error(data?.message || "Request failed");
    }

    if (data?.success === true && data?.message) {
      toastBus.success(data.message);
    }

    if (data?.success === false && data?.message) {
      toastBus.error(data.message);
    }

    return data;
  }

  async post(endpoint: string, data: unknown, includeAuth = false) {
    const response = await fetch(this.buildUrl(endpoint), {
      method: "POST",
      headers: includeAuth
        ? this.getAuthHeaders()
        : { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    return this.handleResponse(response);
  }

  async get(endpoint: string, includeAuth = true) {
    const response = await fetch(this.buildUrl(endpoint), {
      method: "GET",
      headers: includeAuth
        ? this.getAuthHeaders()
        : { "Content-Type": "application/json" },
    });

    return this.handleResponse(response);
  }

  async put(endpoint: string, data: unknown, includeAuth = true) {
    const response = await fetch(this.buildUrl(endpoint), {
      method: "PUT",
      headers: includeAuth
        ? this.getAuthHeaders()
        : { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    return this.handleResponse(response);
  }

  async patch(endpoint: string, data: unknown, includeAuth = true) {
    const response = await fetch(this.buildUrl(endpoint), {
      method: "PATCH",
      headers: includeAuth
        ? this.getAuthHeaders()
        : { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    return this.handleResponse(response);
  }

  async delete(endpoint: string, includeAuth = true) {
    const response = await fetch(this.buildUrl(endpoint), {
      method: "DELETE",
      headers: includeAuth
        ? this.getAuthHeaders()
        : { "Content-Type": "application/json" },
    });

    return this.handleResponse(response);
  }
  async extendToken(tokenId: string, minutes?: number) {
    return this.post(`queues/tokens/${tokenId}/extend`, { minutes }, true);
  }

  async markNoShow(tokenId: string) {
    return this.post(`queues/tokens/${tokenId}/no-show`, {}, true);
  }

  async recallToken(tokenId: string) {
    return this.post(`queues/tokens/${tokenId}/recall`, {}, true);
  }

  async checkIn() {
    return this.post("user-status/check-in", {}, true);
  }
}

export const apiService = new ApiService();
