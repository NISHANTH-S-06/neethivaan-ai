import * as React from "react"
import { motion } from "framer-motion"
import { ChevronRight } from "lucide-react"

export interface ColumnDef<T> {
  key: keyof T | string
  header: string
  align?: "left" | "center" | "right"
  render?: (item: T) => React.ReactNode
}

interface DataTableProps<T> {
  columns: ColumnDef<T>[]
  data: T[]
  onRowClick?: (item: T) => void
  keyExtractor: (item: T) => string
}

export function DataTable<T>({ columns, data, onRowClick, keyExtractor }: DataTableProps<T>) {
  return (
    <div className="w-full overflow-x-auto pb-4">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-white/5">
            {columns.map((col, i) => (
              <th 
                key={String(col.key)} 
                className={`py-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-widest whitespace-nowrap ${
                  col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'
                }`}
              >
                {col.header}
              </th>
            ))}
            {onRowClick && <th className="py-4 px-6"></th>}
          </tr>
        </thead>
        <motion.tbody 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.05 }}
          className="divide-y divide-white/5"
        >
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (onRowClick ? 1 : 0)} className="py-12 text-center text-muted-foreground">
                No records found.
              </td>
            </tr>
          ) : (
            data.map((item, idx) => (
              <motion.tr 
                key={keyExtractor(item)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => onRowClick?.(item)}
                className={`group transition-colors ${onRowClick ? 'cursor-pointer hover:bg-white/5' : ''}`}
              >
                {columns.map((col) => (
                  <td 
                    key={String(col.key)} 
                    className={`py-4 px-6 text-sm text-foreground/90 whitespace-nowrap ${
                      col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'
                    }`}
                  >
                    {col.render ? col.render(item) : String(item[col.key as keyof T])}
                  </td>
                ))}
                {onRowClick && (
                  <td className="py-4 px-6 text-right">
                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity inline-block" />
                  </td>
                )}
              </motion.tr>
            ))
          )}
        </motion.tbody>
      </table>
    </div>
  )
}
