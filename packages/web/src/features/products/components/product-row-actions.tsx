import { useState } from 'react'
import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { productMutations, productQueries } from '../api'
import { type Product } from '../types'

export function ProductRowActions({ product }: { product: Product }) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const deleteMutation = useMutation({
    ...productMutations.delete(),
    onSuccess: () => {
      toast.success('Product deleted')
      setOpen(false)
    },
    onError: () => toast.error('Failed to delete product'),
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: productQueries.all() }),
  })

  return (
    <>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title='Delete product'
        desc={`This will remove ${product.name}.`}
        destructive
        isLoading={deleteMutation.isPending}
        confirmText='Delete'
        handleConfirm={() => deleteMutation.mutate(product.id)}
      />
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='size-8 p-0'>
            <span className='sr-only'>Open menu</span>
            <DotsHorizontalIcon className='size-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuItem
            onClick={() =>
              void navigate({
                to: '/products/$productId',
                params: { productId: String(product.id) },
              })
            }
          >
            Update
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpen(true)}>
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
