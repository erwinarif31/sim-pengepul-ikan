import type { LanguageValue } from "./language"

interface ControllerArgs {
    language: LanguageValue
    query?: string
    body?: string
}


export type { ControllerArgs }