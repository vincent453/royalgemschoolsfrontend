import { useState, useRef, useEffect, useCallback } from 'react'
import ReviewCard from '../ui/ReviewCard'

const AUTO_INTERVAL = 4000 // 4 seconds

const ReviewSlider = ({ reviews, className = "py-4" }) => {
  const [current, setCurrent]   = useState(0)
  const startX                  = useRef(0)
  const isDragging              = useRef(false)
  const timerRef                = useRef(null)
  const threshold               = 50

  const goTo = useCallback((index) => {
    let next = index
    if (next < 0)              next = reviews.length - 1
    if (next >= reviews.length) next = 0
    setCurrent(next)
  }, [reviews.length])

  // ── Auto-slide ──────────────────────────────────────────────
  const startTimer = useCallback(() => {
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setCurrent(prev => (prev + 1) % reviews.length)
    }, AUTO_INTERVAL)
  }, [reviews.length])

  useEffect(() => {
    startTimer()
    return () => clearInterval(timerRef.current)
  }, [startTimer])

  // Pause on hover / touch, restart after
  const pause  = () => clearInterval(timerRef.current)
  const resume = () => startTimer()

  // ── Drag / swipe ────────────────────────────────────────────
  const onDragStart = (e) => {
    isDragging.current = true
    startX.current = e.type === 'touchstart'
      ? e.touches[0].clientX
      : e.clientX
    pause()
  }

  const onDragEnd = (e) => {
    if (!isDragging.current) return
    isDragging.current = false
    const endX = e.type === 'touchend'
      ? e.changedTouches[0].clientX
      : e.clientX
    const diff = startX.current - endX
    if (diff > threshold)       goTo(current + 1)
    else if (diff < -threshold) goTo(current - 1)
    resume()
  }

  const handleDotClick = (i) => {
    goTo(i)
    startTimer() // reset timer on manual nav
  }

  return (
    <div className={`w-full select-none ${className}`}>
      <div
        className="relative overflow-hidden cursor-grab active:cursor-grabbing"
        onMouseDown={onDragStart}
        onMouseUp={onDragEnd}
        onMouseEnter={pause}
        onMouseLeave={resume}
        onTouchStart={onDragStart}
        onTouchEnd={onDragEnd}
      >
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {reviews.map((review, index) => (
            <div key={index} className="min-w-full px-1 sm:px-2">
              <ReviewCard {...review} />
            </div>
          ))}
        </div>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-4 sm:mt-6 flex-wrap">
        {reviews.map((_, i) => (
          <button
            key={i}
            onClick={() => handleDotClick(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-2 rounded-full transition-all duration-300
                        ${current === i
                          ? 'w-6 bg-[#A033A0]'
                          : 'w-2 bg-gray-300 hover:bg-gray-400'}`}
          />
        ))}
      </div>
    </div>
  )
}

export default ReviewSlider