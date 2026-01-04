import type { ChangeEvent, CSSProperties, FocusEvent, ReactNode } from "react"

type BaseInputClassesProps = {
    root?: string
    label?: string
    input?: string
    description?: string
    leftSection?: string
    rightSection?: string
    error?: string
}

interface SectionWidthProps {
    leftSectionWidth: number
    rightSectionWidth: number
}

interface StyleProps {
    inputClass: string
    borderRadius: string
}

interface HandlerProps {
    onBlur: (event: React.FocusEvent) => void
    onFocus: (event: React.FocusEvent) => void
}

interface BaseInputWrapperProps {
    label?: ReactNode
    leftSection?: ReactNode
    rightSection?: ReactNode
    error?: string
    description?: ReactNode
    classNames?: BaseInputClassesProps
    size?: 'xs' | 'sm' | 'md' | 'lg'
    radius?: number | 'xs' | 'sm' | 'md' | 'lg' | 'xl'
    children: (props: SectionWidthProps & StyleProps & HandlerProps) => ReactNode
    required?: boolean
}


type BaseInputProps<T> = Omit<React.InputHTMLAttributes<T>, 'size' | 'required'> & {
    label?: ReactNode
    leftSection?: ReactNode
    rightSection?: ReactNode
    description?: ReactNode
    error?: string
    required?: boolean
    onBlur?: (event: FocusEvent<T>) => void
    onFocus?: (event: FocusEvent<T>) => void
    onChange?: (changeEvent: ChangeEvent<T>) => void
    disabled?: boolean
    size?: 'xs' | 'sm' | 'md' | 'lg'
    radius?: number | 'xs' | 'sm' | 'md' | 'lg' | 'xl'
    className?: string
    classNames?: BaseInputClassesProps
    placeholder?: string
    value?: string | number | readonly string[]
    style?: CSSProperties
}

export type { BaseInputProps, BaseInputClassesProps, BaseInputWrapperProps }