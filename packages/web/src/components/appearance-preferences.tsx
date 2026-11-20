import { useState, type SVGProps } from 'react'
import { Root as Radio, Item } from '@radix-ui/react-radio-group'
import { setLocale } from '@/i18n/index'
import { languages } from '@/i18n/languages'
import { Check, ChevronsUpDown, CircleCheck, RotateCcw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { IconDir } from '@/assets/custom/icon-dir'
import { IconLayoutCompact } from '@/assets/custom/icon-layout-compact'
import { IconLayoutDefault } from '@/assets/custom/icon-layout-default'
import { IconLayoutFull } from '@/assets/custom/icon-layout-full'
import { IconSidebarFloating } from '@/assets/custom/icon-sidebar-floating'
import { IconSidebarInset } from '@/assets/custom/icon-sidebar-inset'
import { IconSidebarSidebar } from '@/assets/custom/icon-sidebar-sidebar'
import { IconThemeDark } from '@/assets/custom/icon-theme-dark'
import { IconThemeLight } from '@/assets/custom/icon-theme-light'
import { IconThemeSystem } from '@/assets/custom/icon-theme-system'
import { cn } from '@/lib/utils'
import { useDirection } from '@/context/direction-provider'
import { type Collapsible, useLayout } from '@/context/layout-provider'
import { useTheme } from '@/context/theme-provider'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useSidebar } from '@/components/ui/sidebar'

type PreferenceItem = {
  value: string
  label: string
  icon: (props: SVGProps<SVGSVGElement>) => React.ReactElement
}

export function AppearancePreferences({
  idPrefix,
  responsive = false,
  showLanguage = false,
}: {
  idPrefix: string
  responsive?: boolean
  showLanguage?: boolean
}) {
  return (
    <div className='space-y-6'>
      {showLanguage && <LanguageConfig idPrefix={idPrefix} />}
      <ThemeConfig idPrefix={idPrefix} />
      <SidebarConfig idPrefix={idPrefix} responsive={responsive} />
      <LayoutConfig idPrefix={idPrefix} responsive={responsive} />
      <DirectionConfig idPrefix={idPrefix} />
    </div>
  )
}

function SectionTitle({
  title,
  showReset = false,
  onReset,
  resetAriaLabel,
  className,
}: {
  title: string
  showReset?: boolean
  onReset?: () => void
  resetAriaLabel?: string
  className?: string
}) {
  return (
    <div
      className={cn(
        'mb-2 flex items-center gap-2 text-sm font-semibold text-muted-foreground',
        className
      )}
    >
      {title}
      {showReset && onReset && (
        <Button
          type='button'
          size='icon'
          variant='secondary'
          className='size-4 rounded-full'
          onClick={onReset}
          aria-label={resetAriaLabel}
        >
          <RotateCcw className='size-3' />
        </Button>
      )}
    </div>
  )
}

function RadioGroupItem({
  item,
  isTheme = false,
  idPrefix,
}: {
  item: PreferenceItem
  isTheme?: boolean
  idPrefix: string
}) {
  const descriptionId = `${idPrefix}-${item.value}-description`
  return (
    <Item
      value={item.value}
      className={cn('group outline-none', 'transition duration-200 ease-in')}
      aria-label={`Select ${item.label.toLowerCase()}`}
      aria-describedby={descriptionId}
    >
      <div
        className={cn(
          'relative rounded-[6px] ring-[1px] ring-border',
          'group-data-[state=checked]:shadow-2xl group-data-[state=checked]:ring-primary',
          'group-focus-visible:ring-2'
        )}
        role='img'
        aria-hidden='false'
        aria-label={`${item.label} option preview`}
      >
        <CircleCheck
          className={cn(
            'size-6 fill-primary stroke-white',
            'group-data-[state=unchecked]:hidden',
            'absolute top-0 right-0 translate-x-1/2 -translate-y-1/2'
          )}
          aria-hidden='true'
        />
        <item.icon
          className={cn(
            !isTheme &&
              'fill-primary stroke-primary group-data-[state=unchecked]:fill-muted-foreground group-data-[state=unchecked]:stroke-muted-foreground'
          )}
          aria-hidden='true'
        />
      </div>
      <div className='mt-1 text-xs' id={descriptionId} aria-live='polite'>
        {item.label}
      </div>
    </Item>
  )
}

function LanguageConfig({ idPrefix }: { idPrefix: string }) {
  const { t, i18n } = useTranslation('platform')
  const [open, setOpen] = useState(false)
  const current = i18n.resolvedLanguage ?? i18n.language
  const selected = languages.find((language) => language.value === current)
  const label = t('appearance.language', { defaultValue: 'Language' })
  const searchLabel = t('appearance.languageSearch', {
    defaultValue: 'Search language',
  })

  return (
    <div>
      <SectionTitle title={label} />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={`${idPrefix}-language`}
            variant='outline'
            role='combobox'
            aria-expanded={open}
            aria-label={label}
            className='w-full max-w-md justify-between px-3 font-normal'
          >
            <span className='truncate'>{selected?.name ?? current}</span>
            <ChevronsUpDown className='opacity-50' />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align='start'
          className='w-(--radix-popover-trigger-width) p-0'
        >
          <Command>
            <CommandInput placeholder={searchLabel} aria-label={searchLabel} />
            <CommandList className='max-h-60'>
              <CommandEmpty>
                {t('appearance.languageEmpty', {
                  defaultValue: 'No languages found',
                })}
              </CommandEmpty>
              <CommandGroup>
                {languages.map((language) => (
                  <CommandItem
                    key={language.value}
                    value={`${language.name} ${language.value}`}
                    onSelect={() => {
                      void setLocale(language.value)
                      setOpen(false)
                    }}
                  >
                    <Check
                      className={cn(
                        language.value === current ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    {language.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <p id={`${idPrefix}-language-description`} className='sr-only'>
        {t('appearance.languageDescription', {
          defaultValue: 'Choose the display language.',
        })}
      </p>
    </div>
  )
}

function ThemeConfig({ idPrefix }: { idPrefix: string }) {
  const { defaultTheme, theme, setTheme } = useTheme()
  const { t } = useTranslation('platform')
  const items: PreferenceItem[] = [
    {
      value: 'system',
      label: t('appearance.system', { defaultValue: 'System' }),
      icon: IconThemeSystem,
    },
    {
      value: 'light',
      label: t('appearance.light', { defaultValue: 'Light' }),
      icon: IconThemeLight,
    },
    {
      value: 'dark',
      label: t('appearance.dark', { defaultValue: 'Dark' }),
      icon: IconThemeDark,
    },
  ]

  return (
    <div>
      <SectionTitle
        title={t('appearance.theme', { defaultValue: 'Theme' })}
        showReset={theme !== defaultTheme}
        onReset={() => setTheme(defaultTheme)}
        resetAriaLabel={t('appearance.resetTheme', {
          defaultValue: 'Reset theme preference to default',
        })}
      />
      <Radio
        value={theme}
        onValueChange={setTheme}
        className='grid w-full max-w-md grid-cols-3 gap-4'
        aria-label={t('appearance.selectTheme', {
          defaultValue: 'Select theme preference',
        })}
        aria-describedby={`${idPrefix}-theme-description`}
      >
        {items.map((item) => (
          <RadioGroupItem
            key={item.value}
            item={item}
            idPrefix={idPrefix}
            isTheme
          />
        ))}
      </Radio>
      <div id={`${idPrefix}-theme-description`} className='sr-only'>
        {t('appearance.themeDescription', {
          defaultValue:
            'Choose between system preference, light mode, or dark mode',
        })}
      </div>
    </div>
  )
}

function SidebarConfig({
  idPrefix,
  responsive,
}: {
  idPrefix: string
  responsive: boolean
}) {
  const { defaultVariant, variant, setVariant } = useLayout()
  const { t } = useTranslation('platform')
  const items: PreferenceItem[] = [
    {
      value: 'inset',
      label: t('appearance.inset', { defaultValue: 'Inset' }),
      icon: IconSidebarInset,
    },
    {
      value: 'floating',
      label: t('appearance.floating', { defaultValue: 'Floating' }),
      icon: IconSidebarFloating,
    },
    {
      value: 'sidebar',
      label: t('appearance.sidebarStyle', { defaultValue: 'Sidebar' }),
      icon: IconSidebarSidebar,
    },
  ]

  return (
    <div className={cn(responsive && 'max-md:hidden')}>
      <SectionTitle
        title={t('appearance.sidebar', { defaultValue: 'Sidebar' })}
        showReset={defaultVariant !== variant}
        onReset={() => setVariant(defaultVariant)}
        resetAriaLabel={t('appearance.resetSidebar', {
          defaultValue: 'Reset sidebar style to default',
        })}
      />
      <Radio
        value={variant}
        onValueChange={setVariant}
        className='grid w-full max-w-md grid-cols-3 gap-4'
        aria-label={t('appearance.selectSidebar', {
          defaultValue: 'Select sidebar style',
        })}
        aria-describedby={`${idPrefix}-sidebar-description`}
      >
        {items.map((item) => (
          <RadioGroupItem key={item.value} item={item} idPrefix={idPrefix} />
        ))}
      </Radio>
      <div id={`${idPrefix}-sidebar-description`} className='sr-only'>
        {t('appearance.sidebarDescription', {
          defaultValue:
            'Choose between inset, floating, or standard sidebar layout',
        })}
      </div>
    </div>
  )
}

function LayoutConfig({
  idPrefix,
  responsive,
}: {
  idPrefix: string
  responsive: boolean
}) {
  const { open, setOpen } = useSidebar()
  const { defaultCollapsible, collapsible, setCollapsible } = useLayout()
  const { t } = useTranslation('platform')
  const radioState = open ? 'default' : collapsible
  const items: PreferenceItem[] = [
    {
      value: 'default',
      label: t('appearance.default', { defaultValue: 'Default' }),
      icon: IconLayoutDefault,
    },
    {
      value: 'icon',
      label: t('appearance.compact', { defaultValue: 'Compact' }),
      icon: IconLayoutCompact,
    },
    {
      value: 'offcanvas',
      label: t('appearance.fullLayout', { defaultValue: 'Full layout' }),
      icon: IconLayoutFull,
    },
  ]

  return (
    <div className={cn(responsive && 'max-md:hidden')}>
      <SectionTitle
        title={t('appearance.layout', { defaultValue: 'Layout' })}
        showReset={radioState !== 'default'}
        onReset={() => {
          setOpen(true)
          setCollapsible(defaultCollapsible)
        }}
        resetAriaLabel={t('appearance.resetLayout', {
          defaultValue: 'Reset layout options to default',
        })}
      />
      <Radio
        value={radioState}
        onValueChange={(value) => {
          if (value === 'default') {
            setOpen(true)
            return
          }
          setOpen(false)
          setCollapsible(value as Collapsible)
        }}
        className='grid w-full max-w-md grid-cols-3 gap-4'
        aria-label={t('appearance.selectLayout', {
          defaultValue: 'Select layout style',
        })}
        aria-describedby={`${idPrefix}-layout-description`}
      >
        {items.map((item) => (
          <RadioGroupItem key={item.value} item={item} idPrefix={idPrefix} />
        ))}
      </Radio>
      <div id={`${idPrefix}-layout-description`} className='sr-only'>
        {t('appearance.layoutDescription', {
          defaultValue:
            'Choose between default expanded, compact icon-only, or full layout mode',
        })}
      </div>
    </div>
  )
}

function DirectionConfig({ idPrefix }: { idPrefix: string }) {
  const { defaultDir, dir, setDir } = useDirection()
  const { t } = useTranslation('platform')
  const items: PreferenceItem[] = [
    {
      value: 'ltr',
      label: t('appearance.ltr', { defaultValue: 'Left to Right' }),
      icon: (props) => <IconDir dir='ltr' {...props} />,
    },
    {
      value: 'rtl',
      label: t('appearance.rtl', { defaultValue: 'Right to Left' }),
      icon: (props) => <IconDir dir='rtl' {...props} />,
    },
  ]

  return (
    <div>
      <SectionTitle
        title={t('appearance.direction', { defaultValue: 'Direction' })}
        showReset={defaultDir !== dir}
        onReset={() => setDir(defaultDir)}
        resetAriaLabel={t('appearance.resetDirection', {
          defaultValue: 'Reset text direction to default',
        })}
      />
      <Radio
        value={dir}
        onValueChange={setDir}
        className='grid w-full max-w-md grid-cols-3 gap-4'
        aria-label={t('appearance.selectDirection', {
          defaultValue: 'Select site direction',
        })}
        aria-describedby={`${idPrefix}-direction-description`}
      >
        {items.map((item) => (
          <RadioGroupItem key={item.value} item={item} idPrefix={idPrefix} />
        ))}
      </Radio>
      <div id={`${idPrefix}-direction-description`} className='sr-only'>
        {t('appearance.directionDescription', {
          defaultValue:
            'Choose between left-to-right or right-to-left site direction',
        })}
      </div>
    </div>
  )
}
