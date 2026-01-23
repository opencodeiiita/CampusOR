class ApiService {
  private baseUrl: string;
  private apiBaseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    this.apiBaseUrl = `${this.baseUrl.replace(/\/+$/, "")}/api`;
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
    if (this.unauthorizedCallback) {
      this.unauthorizedCallback();
    }
  }

  async post(endpoint: string, data: unknown, includeAuth: boolean = false) {
    const response = await fetch(this.buildUrl(endpoint), {
      method: "POST",
      headers: includeAuth
        ? this.getAuthHeaders()
        : { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (response.status === 401 || response.status === 403) {
      this.handleUnauthorized();
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`,
      );
    }

    return response.json();
  }

  async get(endpoint: string, includeAuth: boolean = true) {
    const response = await fetch(this.buildUrl(endpoint), {
      method: "GET",
      headers: includeAuth
        ? this.getAuthHeaders()
        : { "Content-Type": "application/json" },
    });

    if (response.status === 401 || response.status === 403) {
      this.handleUnauthorized();
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`,
      );
    }

    return response.json();
  }

  async put(endpoint: string, data: unknown, includeAuth: boolean = true) {
    const response = await fetch(this.buildUrl(endpoint), {
      method: "PUT",
      headers: includeAuth
        ? this.getAuthHeaders()
        : { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (response.status === 401 || response.status === 403) {
      this.handleUnauthorized();
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`,
      );
    }

    return response.json();
  }

  async patch(endpoint: string, data: unknown, includeAuth: boolean = true) {
    const response = await fetch(this.buildUrl(endpoint), {
      method: "PATCH",
      headers: includeAuth
        ? this.getAuthHeaders()
        : { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (response.status === 401 || response.status === 403) {
      this.handleUnauthorized();
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`,
      );
    }

    // Handle possible empty or non-JSON responses gracefully
    if (response.status === 204) {
      return null;
    }
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.toLowerCase().includes("application/json")) {
      return null;
    }
    return response.json().catch(() => null);
  }

  async delete(endpoint: string, includeAuth: boolean = true) {
    const response = await fetch(this.buildUrl(endpoint), {
      method: "DELETE",
      headers: includeAuth
        ? this.getAuthHeaders()
        : { "Content-Type": "application/json" },
    });

    if (response.status === 401 || response.status === 403) {
      this.handleUnauthorized();
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`,
      );
    }

    return response.json();
  }
}

export const apiService = new ApiService();
