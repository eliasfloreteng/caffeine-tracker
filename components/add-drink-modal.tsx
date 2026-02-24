"use client"

import { useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Plus, X } from "lucide-react"
import { DrinkSelector } from "@/components/drink-selector"

interface AddDrinkModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddDrink: (name: string, caffeine: number, icon: string) => void
}

export function AddDrinkModal({ open, onOpenChange, onAddDrink }: AddDrinkModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false)
    }
    if (open) {
      window.addEventListener("keydown", handleEscape)
      return () => window.removeEventListener("keydown", handleEscape)
    }
  }, [open, onOpenChange])

  if (!open) return null

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={(e) => {
        if (e.target === overlayRef.current) onOpenChange(false)
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />

      {/* Modal content */}
      <div className="relative w-full max-w-md mx-4 bg-card border rounded-t-xl sm:rounded-xl shadow-lg max-h-[85vh] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-200">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add Drink
          </h2>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>
        <div className="p-4 overflow-y-auto">
          <DrinkSelector
            onAddDrink={onAddDrink}
            onClose={() => onOpenChange(false)}
          />
        </div>
      </div>
    </div>
  )
}
