import { usePair } from '@/bridge'
import { HintLayer } from '@/components/HintLayer'
import { CelebrationLayer } from '@/components/CelebrationLayer'
import { TabBar } from '@/components/TabBar'
import { DECKS, findDeck } from '@/lib/deck'
import { useRoute } from '@/lib/router'
import { isCelebration, isDesktop, isOverlay } from '@/bridge/desktop'
import { Achievements } from '@/screens/Achievements'
import { Home } from '@/screens/Home'
import { Saved } from '@/screens/Saved'
import { Settings } from '@/screens/Settings'

export function App() {
  const pair = usePair()
  const route = useRoute()
  const deck = findDeck(pair) ?? DECKS[0]

  // Only the macOS event tap handles shortcut interception. A web page cannot
  // intercept a shortcut in another application.
  if (isCelebration) return <CelebrationLayer />
  if (isDesktop && isOverlay) return <HintLayer key={deck.to} deck={deck} />

  return (
    <>
      <main className="min-h-dvh">
        {route === 'saved' ? (
          <Saved deck={deck} />
        ) : route === 'achievements' ? (
          <Achievements deck={deck} />
        ) : route === 'settings' ? (
          <Settings deck={deck} />
        ) : (
          <Home deck={deck} />
        )}
      </main>
      <TabBar active={route} />
      {!isDesktop && <HintLayer key={deck.to} deck={deck} />}
      {!isDesktop && <CelebrationLayer />}
    </>
  )
}
