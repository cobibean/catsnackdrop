import React, { useCallback, useEffect, useRef, useState } from 'react'
import './App.css'

const GAME_WIDTH = 400
const GAME_HEIGHT = 600
const CAT_WIDTH = 60
const CAT_HEIGHT = 60
const ITEM_SIZE = 48
const FALL_SPEED = 4 // pixels per tick
const TICK_MS = 16 // movement interval
const SPAWN_MS = 900 // spawn interval
const START_LIVES = 10

type ItemType = 'good' | 'bad'

interface Item {
  id: number
  x: number // center x in px
  y: number // top y in px
  type: ItemType
}

const GOOD_EMOJIS = ['🐟', '🥩', '🧀', '🍣']
const BAD_EMOJIS = ['🥦', '🥾', '💣', '🧹']

function getGoodEmoji(id: number): string {
  return GOOD_EMOJIS[id % GOOD_EMOJIS.length]
}

function getBadEmoji(id: number): string {
  return BAD_EMOJIS[id % BAD_EMOJIS.length]
}

// Sound effects using Web Audio API
function playGoodSound() {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    oscillator.frequency.setValueAtTime(440, audioContext.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(880, audioContext.currentTime + 0.1)
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)
    
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.1)
  } catch (e) {
    // Silently fail if audio context is not available
  }
}

function playBadSound() {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    oscillator.type = 'sawtooth'
    oscillator.frequency.setValueAtTime(150, audioContext.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(80, audioContext.currentTime + 0.15)
    
    gainNode.gain.setValueAtTime(0.4, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15)
    
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.15)
  } catch (e) {
    // Silently fail if audio context is not available
  }
}

const App: React.FC = () => {
  const [catX, setCatX] = useState(GAME_WIDTH / 2)
  const [items, setItems] = useState<Item[]>([])
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(START_LIVES)
  const [isGameOver, setIsGameOver] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const nextIdRef = useRef(1)

  const handleReset = useCallback(() => {
    setScore(0)
    setLives(START_LIVES)
    setItems([])
    setIsGameOver(false)
    setIsPaused(false)
    setCatX(GAME_WIDTH / 2)
  }, [])

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Pause/unpause with Space or P
      if (event.key === ' ' || event.key === 'p' || event.key === 'P') {
        if (!isGameOver) {
          event.preventDefault()
          setIsPaused(prev => !prev)
        }
        return
      }
      
      // Restart with R
      if (event.key === 'r' || event.key === 'R') {
        handleReset()
        return
      }
      
      // Movement controls (only when not paused and not game over)
      if (isPaused || isGameOver) return
      
      setCatX(prev => {
        let next = prev
        const step = 40
        if (event.key === 'ArrowLeft' || event.key === 'a' || event.key === 'A') {
          next = prev - step
        } else if (event.key === 'ArrowRight' || event.key === 'd' || event.key === 'D') {
          next = prev + step
        } else {
          return prev
        }
        const min = CAT_WIDTH / 2
        const max = GAME_WIDTH - CAT_WIDTH / 2
        if (next < min) next = min
        if (next > max) next = max
        return next
      })
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isPaused, isGameOver, handleReset])

  // Spawn items
  useEffect(() => {
    if (isGameOver || isPaused) return
    const spawnInterval = window.setInterval(() => {
      setItems(prev => {
        const id = nextIdRef.current++
        const x =
          Math.random() * (GAME_WIDTH - ITEM_SIZE) + ITEM_SIZE / 2
        const type: ItemType = Math.random() < 0.75 ? 'good' : 'bad'
        return [
          ...prev,
          {
            id,
            x,
            y: -ITEM_SIZE,
            type,
          },
        ]
      })
    }, SPAWN_MS)
    return () => window.clearInterval(spawnInterval)
  }, [isGameOver, isPaused])

  // Move items and handle collisions
  useEffect(() => {
    if (isGameOver || isPaused) return
    const moveInterval = window.setInterval(() => {
      setItems(prevItems => {
        const catLeft = catX - CAT_WIDTH / 2
        const catRight = catX + CAT_WIDTH / 2
        const catTopY = GAME_HEIGHT - (CAT_HEIGHT + 20) // cat is 20px from bottom
        let scoreDelta = 0
        let livesDelta = 0
        const updated: Item[] = []

        for (const item of prevItems) {
          const newY = item.y + FALL_SPEED

          // Remove if below screen
          if (newY > GAME_HEIGHT) {
            continue
          }

          const itemBottom = newY + ITEM_SIZE
          const itemCenterX = item.x
          const overlapsX =
            itemCenterX > catLeft && itemCenterX < catRight
          const overlapsY = itemBottom >= catTopY

          if (overlapsX && overlapsY) {
            if (item.type === 'good') {
              scoreDelta += 1
              playGoodSound()
            } else {
              livesDelta -= 1
              playBadSound()
            }
            continue // consumed; do not keep
          }

          updated.push({ ...item, y: newY })
        }

        if (scoreDelta !== 0) {
          setScore(prev => prev + scoreDelta)
        }
        if (livesDelta !== 0) {
          setLives(prev => {
            const next = prev + livesDelta
            if (next <= 0) {
              setIsGameOver(true)
              return 0
            }
            return next
          })
        }

        return updated
      })
    }, TICK_MS)
    return () => window.clearInterval(moveInterval)
  }, [catX, isGameOver, isPaused])

  const livesDisplay = lives > 0 ? '❤️'.repeat(lives) : '💀'

  return (
    <div className="app-root">
      <h1 className="title">Cat Snack Drop</h1>
      <p className="subtitle">
        Move with <span>← →</span> or <span>A / D</span>. <span>Space/P</span> to pause. <span>R</span> to restart.
      </p>
      <div className="hud">
        <span className="hud-item">Score: {score}</span>
        <span className="hud-item">Lives: {livesDisplay}</span>
      </div>
      <div className="game-wrapper">
        <div
          className="game-area"
          style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
        >
          {/* Cat */}
          <div
            className="cat"
            style={{
              left: catX - CAT_WIDTH / 2,
              bottom: 20,
              width: CAT_WIDTH,
              height: CAT_HEIGHT,
            }}
          >
            <span className="cat-emoji" role="img" aria-label="Cat">
              🐱
            </span>
          </div>

          {/* Falling items */}
          {items.map(item => (
            <div
              key={item.id}
              className={`item item-${item.type}`}
              style={{
                left: item.x - ITEM_SIZE / 2,
                top: item.y,
                width: ITEM_SIZE,
                height: ITEM_SIZE,
              }}
            >
              <span
                role="img"
                aria-label={item.type === 'good' ? 'Snack' : 'Bad item'}
              >
                {item.type === 'good'
                  ? getGoodEmoji(item.id)
                  : getBadEmoji(item.id)}
              </span>
            </div>
          ))}

          {/* Pause overlay */}
          {isPaused && !isGameOver && (
            <div className="overlay">
              <div className="overlay-card">
                <h2>Paused</h2>
                <p>Press <span style={{ fontFamily: 'monospace', background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>Space</span> or <span style={{ fontFamily: 'monospace', background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>P</span> to resume</p>
                <button className="play-again-button" onClick={handleReset} style={{ marginTop: '0.5rem' }}>
                  Restart Game
                </button>
              </div>
            </div>
          )}

          {/* Game over overlay */}
          {isGameOver && (
            <div className="overlay">
              <div className="overlay-card">
                <h2>Game Over</h2>
                <p>Your score: {score}</p>
                <button className="play-again-button" onClick={handleReset}>
                  Play again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <p className="footer">
        Tiny browser game. No APIs, no assets — just vibes 🐾
      </p>
    </div>
  )
}

export default App

