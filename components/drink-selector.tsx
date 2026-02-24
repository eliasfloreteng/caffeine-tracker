"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Coffee, Zap, GlassWater, Leaf, ChevronLeft } from "lucide-react"

interface DrinkSize {
  label: string
  caffeine: number
}

interface DrinkOption {
  name: string
  caffeine: number
  icon: string
  iconComponent: React.ReactNode
  sizes?: DrinkSize[]
}

const DRINKS: DrinkOption[] = [
  { name: "Espresso", caffeine: 63, icon: "☕", iconComponent: <Coffee className="h-5 w-5" /> },
  { name: "Cappuccino", caffeine: 80, icon: "☕", iconComponent: <Coffee className="h-5 w-5" /> },
  { name: "Filter Coffee", caffeine: 140, icon: "☕", iconComponent: <Coffee className="h-5 w-5" />, sizes: [
    { label: "Small (150ml)", caffeine: 100 },
    { label: "Medium (250ml)", caffeine: 140 },
    { label: "Large (350ml)", caffeine: 195 },
  ]},
  { name: "Drip Coffee", caffeine: 95, icon: "☕", iconComponent: <Coffee className="h-5 w-5" /> },
  { name: "Instant Coffee", caffeine: 62, icon: "☕", iconComponent: <Coffee className="h-5 w-5" /> },
  { name: "Latte", caffeine: 75, icon: "☕", iconComponent: <Coffee className="h-5 w-5" /> },
  { name: "Cold Brew", caffeine: 200, icon: "🧊", iconComponent: <GlassWater className="h-5 w-5" /> },
  { name: "Green Tea", caffeine: 30, icon: "🍵", iconComponent: <Leaf className="h-5 w-5" />, sizes: [
    { label: "Cup (200ml)", caffeine: 30 },
    { label: "Mug (350ml)", caffeine: 50 },
  ]},
  { name: "Black Tea", caffeine: 47, icon: "🍵", iconComponent: <Leaf className="h-5 w-5" />, sizes: [
    { label: "Cup (200ml)", caffeine: 47 },
    { label: "Mug (350ml)", caffeine: 80 },
  ]},
  { name: "Coca-Cola", caffeine: 34, icon: "🥤", iconComponent: <GlassWater className="h-5 w-5" />, sizes: [
    { label: "Can (33cl)", caffeine: 34 },
    { label: "Bottle (50cl)", caffeine: 52 },
    { label: "Large (1L)", caffeine: 96 },
  ]},
  { name: "Red Bull", caffeine: 80, icon: "⚡", iconComponent: <Zap className="h-5 w-5" />, sizes: [
    { label: "Small (250ml)", caffeine: 80 },
    { label: "Large (355ml)", caffeine: 114 },
    { label: "Extra (473ml)", caffeine: 151 },
  ]},
  { name: "Monster", caffeine: 160, icon: "⚡", iconComponent: <Zap className="h-5 w-5" />, sizes: [
    { label: "Regular (500ml)", caffeine: 160 },
    { label: "Large (568ml)", caffeine: 179 },
  ]},
]

interface DrinkSelectorProps {
  onAddDrink: (name: string, caffeine: number, icon: string) => void
  onClose?: () => void
}

export function DrinkSelector({ onAddDrink, onClose }: DrinkSelectorProps) {
  const [selectedDrink, setSelectedDrink] = useState<DrinkOption | null>(null)

  const handleDrinkClick = (drink: DrinkOption) => {
    if (drink.sizes) {
      setSelectedDrink(drink)
    } else {
      onAddDrink(drink.name, drink.caffeine, drink.icon)
      onClose?.()
    }
  }

  const handleSizeClick = (drink: DrinkOption, size: DrinkSize) => {
    onAddDrink(`${drink.name} (${size.label})`, size.caffeine, drink.icon)
    setSelectedDrink(null)
    onClose?.()
  }

  if (selectedDrink) {
    return (
      <div className="space-y-3">
        <button
          onClick={() => setSelectedDrink(null)}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to drinks
        </button>
        <p className="text-sm font-medium flex items-center gap-2">
          {selectedDrink.iconComponent}
          {selectedDrink.name} — choose size
        </p>
        <div className="grid gap-2">
          {selectedDrink.sizes!.map((size) => (
            <Button
              key={size.label}
              variant="outline"
              className="h-auto justify-between py-3 px-4 hover:bg-primary/10 hover:border-primary bg-transparent"
              onClick={() => handleSizeClick(selectedDrink, size)}
            >
              <span className="font-medium">{size.label}</span>
              <span className="text-xs text-muted-foreground">{size.caffeine}mg</span>
            </Button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {DRINKS.map((drink) => (
        <Button
          key={drink.name}
          variant="outline"
          className="h-auto flex-col gap-1 py-3 hover:bg-primary/10 hover:border-primary bg-transparent"
          onClick={() => handleDrinkClick(drink)}
        >
          <span className="flex items-center gap-2">
            {drink.iconComponent}
            <span className="font-medium">{drink.name}</span>
          </span>
          <span className="text-xs text-muted-foreground">
            {drink.sizes ? `${drink.sizes[0].caffeine}–${drink.sizes[drink.sizes.length - 1].caffeine}mg` : `${drink.caffeine}mg`}
          </span>
        </Button>
      ))}
    </div>
  )
}
