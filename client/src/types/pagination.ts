import { z } from "astro/zod"
import type { SetStateAction } from "react"

const paginationSchema = z.object({
    total: z.number(), // Total data yang diterima
    per_page: z.number(), // Jumlah data per halaman
    current_page: z.number(), // Halaman saat ini
    last_page: z.number(), // Jumlah halaman terakhir
    prev: z.string().nullable(), // URL halaman sebelumnya
    next: z.string().nullable(), // URL halaman selanjutnya
})

type PaginationProps = z.infer<typeof paginationSchema>

type PaginationDispatchProps = (value: SetStateAction<PaginationProps>) => void

export type { PaginationProps, PaginationDispatchProps }

export { paginationSchema }
