import type { ReactNode } from "react"
import type { RouteObject } from "react-router-dom"

type PageRouteProps = RouteObject & {
    header?: ReactNode
    children?: PageRouteProps[]
}

export type { PageRouteProps }