"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // Force dark mode only
  const forcedProps = {
    ...props,
    defaultTheme: "dark",
    enableSystem: false,
    forcedTheme: "dark"
  }
  
  return <NextThemesProvider {...forcedProps}>{children}</NextThemesProvider>
}