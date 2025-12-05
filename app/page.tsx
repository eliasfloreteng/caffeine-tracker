import { CaffeineTracker } from "@/components/caffeine-tracker"

export default function Home() {
  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground md:text-4xl">☕ Caffeine Tracker</h1>
          <p className="mt-2 text-muted-foreground">Track your caffeine intake and see how it metabolizes over time</p>
        </header>
        <CaffeineTracker />
      </div>
    </main>
  )
}
