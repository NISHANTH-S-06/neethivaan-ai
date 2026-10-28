"use client"

import * as React from "react"
import { LucideIcon, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export interface DashboardCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  change?: string
  trend?: "up" | "down" | "neutral"
  colorTheme?: "primary" | "secondary" | "success" | "destructive" | "warning"
  className?: string
}

export function DashboardCard({
  title,
  value,
  icon: Icon,
  change,
  trend = "neutral",
  colorTheme = "primary",
  className
}: DashboardCardProps) {
  
  const themeStyles = {
    primary: "text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-900/10",
    secondary: "text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-900 bg-purple-50/50 dark:bg-purple-900/10",
    success: "text-green-600 dark:text-green-400 border-green-200 dark:border-green-900 bg-green-50/50 dark:bg-green-900/10",
    destructive: "text-red-600 dark:text-red-400 border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-900/10",
    warning: "text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-900/10"
  }

  const TrendIcon = trend === "up" ? ArrowUpRight : trend === "down" ? ArrowDownRight : Minus
  const trendColor = trend === "up" ? "text-green-500" : trend === "down" ? "text-red-500" : "text-amber-500"

  return (
    <Card className={cn("overflow-hidden transition-all hover:shadow-md", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={cn("p-2 rounded-lg border", themeStyles[colorTheme])}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tight mb-1">{value}</div>
        {change && (
          <p className="flex items-center text-xs text-muted-foreground">
            <span className={cn("flex items-center font-medium mr-1", trendColor)}>
              <TrendIcon className="h-3 w-3 mr-1" />
              {change}
            </span>
            <span>vs previous period</span>
          </p>
        )}
      </CardContent>
    </Card>
  )
}
