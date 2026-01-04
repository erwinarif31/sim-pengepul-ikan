import type { QueryKeyType } from "./queryKey"

interface RequestArgs<T = unknown> {
    headers?: Record<string, string>
    body?: T
    params?: Record<string, string | undefined>
    timeout?: number
    responseType?: 'json' | 'text' | 'blob'
    signal?: AbortSignal
    suspense?: boolean
    queryKeys?: QueryKeyType
}

export type { RequestArgs }