import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { DashboardPage } from '@/components/layout/dashboard-page'
import { productMutations, productQueries } from '../api'
import { PRODUCT_CATEGORIES, type Product } from '../types'

const productSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters.'),
  category: z.string().min(1, 'Please select a category'),
  price: z.number().positive('Price is required'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters.'),
  photo_url: z.string().optional(),
})

type ProductFormValues = z.infer<typeof productSchema>

export function ProductFormPage({ product }: { product: Product | null }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isEdit = product !== null

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name ?? '',
      category: product?.category ?? '',
      price: product?.price ?? 0,
      description: product?.description ?? '',
      photo_url: product?.photo_url ?? '',
    },
  })

  const createMutation = useMutation({
    ...productMutations.create(),
    onSuccess: () => {
      toast.success('Product created')
      void navigate({ to: '/products' })
    },
    onError: () => toast.error("Couldn't create product. Try again."),
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: productQueries.all() }),
  })

  const updateMutation = useMutation({
    ...productMutations.update(),
    onSuccess: () => {
      toast.success('Product updated')
      void navigate({ to: '/products' })
    },
    onError: () => toast.error("Couldn't update product. Try again."),
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: productQueries.all() }),
  })

  const isPending = createMutation.isPending || updateMutation.isPending

  function onSubmit(values: ProductFormValues) {
    const payload = {
      name: values.name,
      category: values.category,
      price: values.price,
      description: values.description,
      photo_url: values.photo_url,
    }
    if (isEdit) {
      updateMutation.mutate({ id: product.id, values: payload })
      return
    }
    createMutation.mutate(payload)
  }

  return (
    <DashboardPage
      title={isEdit ? 'Edit Product' : 'Create New Product'}
      description='Name, category, price, and description.'
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='max-w-xl space-y-6'
        >
          <FormField
            control={form.control}
            name='name'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder='Product name' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='category'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className='w-full'>
                      <SelectValue placeholder='Select a category' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {PRODUCT_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='price'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    min={0}
                    step='0.01'
                    name={field.name}
                    ref={field.ref}
                    onBlur={field.onBlur}
                    value={Number.isFinite(field.value) ? field.value : ''}
                    onChange={(event) =>
                      field.onChange(event.target.valueAsNumber)
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='photo_url'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Image URL</FormLabel>
                <FormControl>
                  <Input placeholder='https://' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='description'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea rows={4} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className='flex gap-2'>
            <Button type='submit' disabled={isPending}>
              {isEdit ? 'Save changes' : 'Create product'}
            </Button>
            <Button
              type='button'
              variant='outline'
              onClick={() => void navigate({ to: '/products' })}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </DashboardPage>
  )
}
