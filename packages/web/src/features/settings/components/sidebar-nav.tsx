import { useState, type JSX } from 'react'
import { useLocation, useNavigate, Link } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export type NavItem = {
  href: string
  title: string
  icon: JSX.Element
}

export type NavGroup = {
  title?: string
  items: NavItem[]
}

type SidebarNavProps = React.HTMLAttributes<HTMLElement> & {
  groups: NavGroup[]
}

export function SidebarNav({ className, groups, ...props }: SidebarNavProps) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [val, setVal] = useState(pathname ?? '/settings')

  const handleSelect = (e: string) => {
    setVal(e)
    navigate({ to: e })
  }

  return (
    <>
      <div className='p-1 md:hidden'>
        <Select value={val} onValueChange={handleSelect}>
          <SelectTrigger className='h-12 sm:w-48'>
            <SelectValue placeholder='Select page' />
          </SelectTrigger>
          <SelectContent>
            {groups.map((group, groupIdx) => (
              <SelectGroup key={group.title ?? groupIdx}>
                {group.title && (
                  <SelectLabel className='text-xs font-semibold tracking-wider text-muted-foreground uppercase'>
                    {group.title}
                  </SelectLabel>
                )}
                {group.items.map((item) => (
                  <SelectItem key={item.href} value={item.href}>
                    <div className='flex items-center gap-x-3 px-1 py-1'>
                      <span>{item.icon}</span>
                      <span className='text-sm'>{item.title}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tablet: Horizontal scroll bar */}
      <div className='hidden w-full min-w-44 md:block lg:hidden'>
        <ScrollArea
          orientation='horizontal'
          type='always'
          className='w-full bg-background px-1 py-2'
        >
          <nav
            className={cn('flex space-x-2 py-1', className)}
            {...props}
          >
            {groups.map((group, groupIdx) => (
              <div key={group.title ?? groupIdx} className='flex items-center space-x-1'>
                {group.items.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      buttonVariants({ variant: 'ghost' }),
                      pathname === item.href
                        ? 'bg-muted font-medium hover:bg-accent'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                      'justify-start whitespace-nowrap'
                    )}
                  >
                    <span className='me-2'>{item.icon}</span>
                    {item.title}
                  </Link>
                ))}
              </div>
            ))}
          </nav>
        </ScrollArea>
      </div>

      {/* Desktop: Vertical navigation that scrolls with aside */}
      <nav
        className={cn('hidden lg:flex flex-col space-y-4 py-1 pb-12', className)}
        {...props}
      >
        {groups.map((group, groupIdx) => (
          <div key={group.title ?? groupIdx} className='space-y-1'>
            {group.title && (
              <div className='px-3 py-1.5 text-xs font-semibold tracking-wider text-muted-foreground uppercase'>
                {group.title}
              </div>
            )}
            <div className='flex flex-col space-y-1'>
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    buttonVariants({ variant: 'ghost' }),
                    pathname === item.href
                      ? 'bg-muted font-medium hover:bg-accent'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                    'justify-start'
                  )}
                >
                  <span className='me-2'>{item.icon}</span>
                  {item.title}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </>
  )
}
