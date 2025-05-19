"use client"

import * as React from "react"
import { Moon, Sun, Palette } from "lucide-react" // Added Palette icon
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator, // Added Separator
} from "@/components/ui/dropdown-menu"

export function ModeToggle() {
  const { setTheme, theme, themes } = useTheme()

  // Helper function to capitalize theme names for display
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          {/* Optional: Show a generic palette icon if a custom theme is active and it's not light/dark */}
          {theme && !['light', 'dark', 'system'].includes(theme) && (
             <Palette className="absolute h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {/* Dynamically list other themes if provided by ThemeProvider */}
        {themes.filter(t => !['light', 'dark', 'system'].includes(t)).map(t => (
            <DropdownMenuItem key={t} onClick={() => setTheme(t)}>
                {capitalize(t.replace('-', ' '))} {/* Basic formatting for display */}
            </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
