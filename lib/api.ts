// Create a centralized API utility with CORS handling
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

interface ApiOptions {
  method?: string
  body?: any
  requireAuth?: boolean
}

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: Response,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

export async function apiCall(endpoint: string, options: ApiOptions = {}) {
  const { method = "GET", body, requireAuth = true } = options

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  }

  if (requireAuth) {
    const token = localStorage.getItem("token")
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
  }

  const config: RequestInit = {
    method,
    headers,
    mode: "cors",
    credentials: "omit",
  }

  if (body && method !== "GET") {
    config.body = JSON.stringify(body)
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config)

    // Handle network errors
    if (!response.ok) {
      if (response.status === 0) {
        throw new ApiError("Network error - please check your connection", 0)
      }

      if (response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        window.location.href = "/auth/login"
        throw new ApiError("Session expired. Please login again.", 401, response)
      }

      if (response.status >= 500) {
        throw new ApiError("Server error - please try again later", response.status, response)
      }

      // Try to get error message from response
      let errorMessage = `HTTP ${response.status}: Request failed`
      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorMessage
      } catch {
        // If JSON parsing fails, use default message
      }

      throw new ApiError(errorMessage, response.status, response)
    }

    // Handle successful responses
    const contentType = response.headers.get("content-type")
    if (contentType && contentType.includes("application/json")) {
      return await response.json()
    }

    return await response.text()
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }

    // Handle fetch errors (network issues, CORS, etc.)
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new ApiError("Unable to connect to server. Please check if the API is running and accessible.", 0)
    }

    throw new ApiError(error instanceof Error ? error.message : "An unexpected error occurred", 0)
  }
}

// Convenience methods
export const api = {
  get: (endpoint: string, requireAuth = true) => apiCall(endpoint, { method: "GET", requireAuth }),

  post: (endpoint: string, body: any, requireAuth = true) => apiCall(endpoint, { method: "POST", body, requireAuth }),

  put: (endpoint: string, body: any, requireAuth = true) => apiCall(endpoint, { method: "PUT", body, requireAuth }),

  delete: (endpoint: string, requireAuth = true) => apiCall(endpoint, { method: "DELETE", requireAuth }),
}

export { ApiError }
