import localizedRoutes from "@/constants/localizedRoutes"
import type { PageKeyType } from "@/controllers"
import type { LanguageValue } from "./language"

const getLocalizedPage = (key: PageKeyType, lang: LanguageValue): string => {
    return localizedRoutes[key][lang]
}

export default getLocalizedPage