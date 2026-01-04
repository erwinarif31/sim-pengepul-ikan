import type UserPermission from '@/features/user/constants/userPermissions'
import type { IconType } from 'react-icons/lib'

interface SubMenuProps {
    label: string
    to: string
    isActive?: boolean
    onClick?: () => void
}

interface SideMenuProps {
    permissionKey?: UserPermission
    label: string
    to?: string
    isActive?: boolean
    isSidebarCollapsed?: boolean
    submenus?: SubMenuProps[]
    icon: IconType
    selectedIcon?: IconType
    onClick?: () => void
}

export type { SubMenuProps, SideMenuProps }