import React, { FC } from 'react'
import classNames from 'classnames'
import { flexRender, Table } from '@tanstack/react-table'

import Tr from '~/components/atoms/Tr'
import TableSkeleton from './../SkeletonTable'
import AnimatedTable from '~/components/atoms/Table'
import { LeaveTable } from '~/utils/types/leaveTypes'

type Props = {
  table: Table<LeaveTable>
  query: {
    isLoading: boolean
    isError: boolean
  }
}

const LeaveManagementTable: FC<Props> = (props) => {
  const {
    table,
    query: { isLoading = false, isError = false }
  } = props

  return (
    <AnimatedTable>
      <thead className="border-b border-slate-200 bg-slate-50">
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <th
                key={header.id}
                colSpan={header.colSpan}
                className="px-4 py-2.5 text-left text-sm"
              >
                {header.isPlaceholder ? null : (
                  <div
                    {...{
                      className: header.column.getCanSort() ? 'cursor-pointer select-none' : '',
                      onClick: header.column.getToggleSortingHandler()
                    }}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </div>
                )}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody
        className={classNames(
          'relative h-full min-h-[80vh] w-full divide-y divide-slate-100 border-b border-slate-200',
          table.getPageCount() === 0 || isError ? 'h-[20vh]' : ''
        )}
      >
        <>
          {!isError ? (
            isLoading ? (
              <TableSkeleton rows={4} column={4} />
            ) : table.getPageCount() === 0 ? (
              <TableMesagge message="No Data Available" />
            ) : (
              <>
                {table.getRowModel().rows.map((row) => (
                  <Tr
                    key={row.id}
                    className={classNames(
                      'group hover:bg-slate-50 hover:shadow-md hover:shadow-slate-200'
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="z-20 flex-wrap px-4 py-2 text-xs capitalize text-slate-500"
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </Tr>
                ))}
              </>
            )
          ) : (
            <TableError message="Something went wrong" />
          )}
        </>
      </tbody>
    </AnimatedTable>
  )
}

const TableMesagge = ({ message }: { message: string }): JSX.Element => {
  return (
    <tr className="absolute inset-x-0 left-0 right-0 w-full flex-1">
      <td className="py-2"></td>
      <td className="w-full py-2 text-center text-xs font-medium text-slate-500">{message}</td>
      <td className="py-2"></td>
    </tr>
  )
}
const TableError = ({ message }: { message: string }): JSX.Element => {
  return (
    <tr className="absolute inset-x-0 left-0 right-0 w-full flex-1 bg-rose-50">
      <td className="py-2"></td>
      <td className="w-full py-2 text-center font-medium  text-rose-500">{message}</td>
      <td className="py-2"></td>
    </tr>
  )
}

export default LeaveManagementTable
