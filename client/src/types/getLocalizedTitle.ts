import localizedRoutes from "@/constants/localizedRoutes"

const getLocalizedTitle = (key: keyof typeof localizedRoutes) => {
    const capitalizedKey = (str: string) => {
        const spaced = str.split('-')

        const capitalized = spaced.map(word => {
            return word.charAt(0).toUpperCase() + word.slice(1)
        }).join(' ')

        return capitalized
    }

    return {
        id: capitalizedKey(localizedRoutes[key].id),
        en: capitalizedKey(localizedRoutes[key].en)
    }
}

export default getLocalizedTitle