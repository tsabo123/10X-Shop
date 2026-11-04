export class ApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}
export class ApiClient {
  constructor(private readonly baseUrl: string) {}
  private async request<Result>(path: string, init: RequestInit = {}): Promise<Result> {
    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}${path}`, {
        ...init,
        headers: {
          'Content-Type': 'application/json',
          ...init.headers
        }
      });
    } catch (error: unknown) {
      if (error instanceof DOMException && error.name === 'AbortError') throw error;
      throw new ApiError(0, 'The product service is unavailable. Check your internet connection.');
    }
    if (!response.ok) throw new ApiError(response.status, (await response.text()) || `Request failed (${response.status}).`);
    return (await response.json()) as Result;
  }
  get<Result>(path: string, signal?: AbortSignal): Promise<Result> {
    return this.request<Result>(path, {
      signal
    });
  }
}
