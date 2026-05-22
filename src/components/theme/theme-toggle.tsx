'use client'

import { Monitor, Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTheme } from './theme-provider'

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // `resolvedTheme` is only known on the client (localStorage / matchMedia).
  // Until mounted we render a fixed icon so the server HTML and the first
  // client render agree — otherwise the icon swap triggers a hydration
  // mismatch that forces React to regenerate the whole subtree (which in turn
  // breaks server-action form wiring elsewhere on the page).
  useEffect(() => {
    setMounted(true)
  }, [])

  const TriggerIcon = mounted && resolvedTheme === 'dark' ? Moon : Sun

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Toggle theme">
          <TriggerIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => setTheme('light')} data-active={theme === 'light'}>
          <Sun className="h-4 w-4" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setTheme('dark')} data-active={theme === 'dark'}>
          <Moon className="h-4 w-4" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setTheme('system')} data-active={theme === 'system'}>
          <Monitor className="h-4 w-4" />
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
