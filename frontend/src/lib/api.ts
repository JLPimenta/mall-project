/** Espelha ResponseError do backend. */
export type ApiErrorBody = {
  status: number
  message: string
  errors?: { field: string; message: string }[]
}

export class ApiError extends Error {
  readonly status: number
  readonly fieldErrors: ApiErrorBody['errors']

  constructor(body: ApiErrorBody) {
    super(body.message)
    this.status = body.status
    this.fieldErrors = body.errors
  }
}

/** Espelha Page serializado via DTO (Spring Data). */
export type Page<T> = {
  content: T[]
  page: { size: number; number: number; totalElements: number; totalPages: number }
}

type QueryParams = Record<string, string | number | boolean | undefined>

function buildUrl(path: string, params?: QueryParams) {
  const url = new URL(`/api${path}`, window.location.origin)
  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined) url.searchParams.set(key, String(value))
  })
  return url
}

async function request<T>(method: string, path: string, body?: unknown, params?: QueryParams): Promise<T> {
  let response: Response
  try {
    response = await fetch(buildUrl(path, params), {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError({ status: 0, message: 'Servidor indisponível.' })
  }

  if (!response.ok) {
    const data = await response.json().catch(() => null)
    throw new ApiError(data ?? { status: response.status, message: 'Falha na requisição.' })
  }

  return response.status === 204 ? (undefined as T) : response.json()
}

export const api = {
  get: <T>(path: string, params?: QueryParams) => request<T>('GET', path, undefined, params),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body),
  put: <T>(path: string, body: unknown) => request<T>('PUT', path, body),
  delete: (path: string) => request<void>('DELETE', path),
}
