"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Coffee, Zap, GlassWater, Leaf } from "lucide-react"

interface DrinkOption {
  name: string
  caffeine: number
  icon: string
  iconComponent: React.ReactNode
}

const DRINKS: DrinkOption[] = [
  { name: "Espresso", caffeine: 63, icon: "☕", iconComponent: <Coffee className="h-5 w-5" /> },
  { name: "Cappuccino", caffeine: 80, icon: "☕", iconComponent: <Coffee className="h-5 w-5" /> },
  { name: "Drip Coffee", caffeine: 95, icon: "☕", iconComponent: <Coffee className="h-5 w-5" /> },
  { name: "Instant Coffee", caffeine: 62, icon: "☕", iconComponent: <Coffee className="h-5 w-5" /> },
  { name: "Latte", caffeine: 75, icon: "☕", iconComponent: <Coffee className="h-5 w-5" /> },
  { name: "Cold Brew", caffeine: 200, icon: "🧊", iconComponent: <GlassWater className="h-5 w-5" /> },
  { name: "Green Tea", caffeine: 30, icon: "🍵", iconComponent: <Leaf className="h-5 w-5" /> },
  { name: "Black Tea", caffeine: 47, icon: "🍵", iconComponent: <Leaf className="h-5 w-5" /> },
  { name: "Coca-Cola", caffeine: 34, icon: "🥤", iconComponent: <GlassWater className="h-5 w-5" /> },
  { name: "Red Bull", caffeine: 80, icon: "⚡", iconComponent: <Zap className="h-5 w-5" /> },
  { name: "Monster", caffeine: 160, icon: "⚡", iconComponent: <Zap className="h-5 w-5" /> },
]

interface DrinkSelectorProps {
  onAddDrink: (name: string, caffeine: number, icon: string) => void
}

export function DrinkSelector({ onAddDrink }: DrinkSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {DRINKS.map((drink) => (
        <Button
          key={drink.name}
          variant="outline"
          className="h-auto flex-col gap-1 py-3 hover:bg-primary/10 hover:border-primary bg-transparent"
          onClick={() => onAddDrink(drink.name, drink.caffeine, drink.icon)}
        >
          <span className="flex items-center gap-2">
            {drink.iconComponent}
            <span className="font-medium">{drink.name}</span>
          </span>
          <span className="text-xs text-muted-foreground">{drink.caffeine}mg</span>
        </Button>
      ))}
    </div>
  )
}
