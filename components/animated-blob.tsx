"use client"

import { useEffect, useRef } from "react"

interface AnimatedBlobProps {
  isAnimating: boolean
  isUsingTools?: boolean
}

export default function AnimatedBlob({ isAnimating, isUsingTools = false }: AnimatedBlobProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const requestIdRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions with higher resolution for sharper rendering
    const scale = window.devicePixelRatio || 1
    canvas.width = 400 * scale
    canvas.height = 400 * scale
    ctx.scale(scale, scale)

    // Set canvas display size
    canvas.style.width = "400px"
    canvas.style.height = "400px"

    // Blob parameters
    const centerX = 200
    const centerY = 200
    const baseRadius = 90
    const points = 12 // Increased points for smoother water-like effect
    let phase = 0
    const noiseOffsets = Array.from({ length: points * 2 + 1 }, () => Math.random() * 1000)

    // For the moving bubble
    const bubblePhase = 0

    // For the volume bars
    const numBars = 4
    const barWidth = 50
    const maxBarHeight = 100
    const minBarHeight = 30
    const barSpacing = 10
    const totalWidth = numBars * barWidth + (numBars - 1) * barSpacing
    const startX = centerX - totalWidth / 2

    // For the tool usage animation
    const gearPoints = 12
    const gearInnerRadius = 60
    const gearOuterRadius = 90
    let gearRotation = 0

    // Perlin-like noise function (simplified)
    const noise = (x: number) => {
      return Math.sin(x / 10) * 0.5 + Math.sin(x / 5) * 0.25 + Math.sin(x / 2.5) * 0.125
    }

    // Animation function
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width / scale, canvas.height / scale)

      if (isUsingTools) {
        // Draw gear-like animation when using tools
        ctx.save()
        ctx.translate(centerX, centerY)
        ctx.rotate(gearRotation)

        // Draw outer gear
        ctx.beginPath()
        for (let i = 0; i < gearPoints; i++) {
          const angle = (i / gearPoints) * Math.PI * 2
          const outerRadius = gearOuterRadius + Math.sin(i * 5 + phase * 3) * 8
          const innerRadius = gearInnerRadius

          // Draw outer point
          ctx.lineTo(Math.cos(angle) * outerRadius, Math.sin(angle) * outerRadius)

          // Draw inner point
          const innerAngle = angle + Math.PI / gearPoints
          ctx.lineTo(Math.cos(innerAngle) * innerRadius, Math.sin(innerAngle) * innerRadius)
        }
        ctx.closePath()

        // Create gradient for gear
        const gearGradient = ctx.createLinearGradient(
          -gearOuterRadius,
          -gearOuterRadius,
          gearOuterRadius,
          gearOuterRadius,
        )
        gearGradient.addColorStop(0, "#ffffff")
        gearGradient.addColorStop(1, "#e0e0e0")
        ctx.fillStyle = gearGradient
        ctx.fill()

        // Draw inner circle
        ctx.beginPath()
        ctx.arc(0, 0, gearInnerRadius * 0.6, 0, Math.PI * 2)
        ctx.fillStyle = "#ffffff"
        ctx.fill()

        // Draw small rotating dot
        const dotAngle = phase * 4
        const dotRadius = gearInnerRadius * 0.3
        ctx.beginPath()
        ctx.arc(Math.cos(dotAngle) * dotRadius, Math.sin(dotAngle) * dotRadius, 8, 0, Math.PI * 2)
        ctx.fillStyle = "#f0f0f0"
        ctx.fill()

        ctx.restore()

        // Update gear rotation
        gearRotation += 0.01
      } else if (isAnimating) {
        // Draw volume bars when AI is speaking
        for (let i = 0; i < numBars; i++) {
          const x = startX + i * (barWidth + barSpacing)

          // Create dynamic height based on sine waves with different frequencies
          // This creates a more realistic audio visualization effect
          const t = Date.now() / 1000 + i * 0.3
          const heightMultiplier = 0.5 + 0.5 * Math.sin(t * 2 + i * 1.5) * Math.sin(t * 3 + i * 0.7)
          const barHeight = minBarHeight + heightMultiplier * (maxBarHeight - minBarHeight)

          // Draw rounded bar with dynamic height
          ctx.save()
          ctx.translate(x + barWidth / 2, centerY)

          // Create path for rounded bar
          const radius = barWidth / 2
          ctx.beginPath()

          // Top-left corner
          ctx.moveTo(-barWidth / 2 + radius, -barHeight / 2)
          // Top edge
          ctx.lineTo(barWidth / 2 - radius, -barHeight / 2)
          // Top-right corner
          ctx.arc(barWidth / 2 - radius, -barHeight / 2 + radius, radius, -Math.PI / 2, 0, false)
          // Right edge
          ctx.lineTo(barWidth / 2, barHeight / 2 - radius)
          // Bottom-right corner
          ctx.arc(barWidth / 2 - radius, barHeight / 2 - radius, radius, 0, Math.PI / 2, false)
          // Bottom edge
          ctx.lineTo(-barWidth / 2 + radius, barHeight / 2)
          // Bottom-left corner
          ctx.arc(-barWidth / 2 + radius, barHeight / 2 - radius, radius, Math.PI / 2, Math.PI, false)
          // Left edge
          ctx.lineTo(-barWidth / 2, -barHeight / 2 + radius)
          // Top-left corner
          ctx.arc(-barWidth / 2 + radius, -barHeight / 2 + radius, radius, Math.PI, -Math.PI / 2, false)

          ctx.closePath()

          // Create gradient for volume bar
          const gradient = ctx.createLinearGradient(0, -barHeight / 2, 0, barHeight / 2)
          gradient.addColorStop(0, "#ffffff")
          gradient.addColorStop(1, "#f0f0f0")
          ctx.fillStyle = gradient

          // Add subtle shadow for depth
          ctx.shadowColor = "rgba(0, 0, 0, 0.1)"
          ctx.shadowBlur = 10
          ctx.shadowOffsetY = 5

          ctx.fill()
          ctx.restore()
        }
      } else {
        // Draw water-like flowing bubble when idle
        const time = Date.now() / 1000

        // Create a water-like flowing effect
        ctx.save()

        // Main bubble - using a more rounded approach
        ctx.beginPath()

        // Use more control points for smoother curves
        const numPoints = 40 // Increased for ultra-smooth curves
        const angleStep = (Math.PI * 2) / numPoints

        // First, calculate all points for a smoother approach
        const points = []
        for (let i = 0; i <= numPoints; i++) {
          const angle = i * angleStep

          // Use gentler wave patterns for smoother edges
          // Multiple sine waves with different frequencies but smaller amplitudes
          const fastWave = Math.sin(angle * 3 + time * 1.2) * 3
          const mediumWave = Math.sin(angle * 2 + time * 0.7) * 5
          const slowWave = Math.sin(angle + time * 0.3) * 7
          const microWave = Math.sin(angle * 5 + time * 1.8) * 2

          // Combine waves with smaller overall variation for rounder shape
          const radiusVariation = fastWave + mediumWave + slowWave + microWave

          // Keep the vertical factor subtle
          const verticalFactor = 1.02 + 0.05 * Math.sin(time * 0.3)
          const radius = baseRadius + radiusVariation

          // Calculate point position
          const x = centerX + Math.cos(angle) * radius
          const y = centerY + Math.sin(angle) * radius * verticalFactor

          points.push({ x, y })
        }

        // Draw the shape using a cardinal spline for maximum smoothness
        ctx.moveTo(points[0].x, points[0].y)

        // Add the last point to the beginning for a closed loop
        points.push({ ...points[0] })

        // Use a tension factor for the cardinal spline (0 = straight lines, 1 = very curved)
        const tension = 0.5

        // Draw the cardinal spline
        for (let i = 0; i < points.length - 1; i++) {
          const p0 = points[Math.max(0, i - 1)]
          const p1 = points[i]
          const p2 = points[i + 1]
          const p3 = points[Math.min(points.length - 1, i + 2)]

          // Calculate control points for the cardinal spline
          const cp1x = p1.x + ((p2.x - p0.x) * tension) / 6
          const cp1y = p1.y + ((p2.y - p0.y) * tension) / 6
          const cp2x = p2.x - ((p3.x - p1.x) * tension) / 6
          const cp2y = p2.y - ((p3.y - p1.y) * tension) / 6

          // Draw the curve
          ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y)
        }

        ctx.closePath()

        // Create a water-like gradient with subtle blue tint
        const gradient = ctx.createRadialGradient(centerX - 20, centerY - 20, 0, centerX, centerY, baseRadius * 1.2)
        gradient.addColorStop(0, "#ffffff")
        gradient.addColorStop(0.7, "#f8f8ff")
        gradient.addColorStop(1, "#f0f0ff")
        ctx.fillStyle = gradient

        // Add subtle shadow for depth
        ctx.shadowColor = "rgba(0, 0, 0, 0.15)"
        ctx.shadowBlur = 15
        ctx.shadowOffsetY = 5

        ctx.fill()

        // Add subtle inner highlight to simulate water refraction
        ctx.beginPath()
        const highlightRadius = baseRadius * 0.6
        const highlightX = centerX - highlightRadius * 0.3
        const highlightY = centerY - highlightRadius * 0.3

        // Create a rounder highlight that moves slightly
        const highlightScaleX = 1 + 0.1 * Math.sin(time * 0.7)
        const highlightScaleY = 1 - 0.1 * Math.sin(time * 0.7)

        ctx.ellipse(
          highlightX,
          highlightY,
          highlightRadius * 0.7 * highlightScaleX,
          highlightRadius * 0.5 * highlightScaleY,
          Math.PI * 0.25,
          0,
          Math.PI * 2,
        )

        // Create highlight gradient
        const highlightGradient = ctx.createRadialGradient(
          highlightX,
          highlightY,
          0,
          highlightX,
          highlightY,
          highlightRadius,
        )
        highlightGradient.addColorStop(0, "rgba(255, 255, 255, 0.4)")
        highlightGradient.addColorStop(1, "rgba(255, 255, 255, 0)")
        ctx.fillStyle = highlightGradient
        ctx.fill()

        // Add small bubble-like details that float around - make these rounder too
        const numBubbles = 5
        for (let i = 0; i < numBubbles; i++) {
          // Create unique movement pattern for each bubble
          const bubbleTime = time * (0.5 + i * 0.1)
          const bubbleAngle = (i / numBubbles) * Math.PI * 2 + bubbleTime * 0.3

          // Bubbles move in circular paths with varying distances
          const orbitRadius = baseRadius * (0.4 + 0.3 * Math.sin(time * 0.2 + i))
          const bubbleX = centerX + Math.cos(bubbleAngle) * orbitRadius
          const bubbleY = centerY + Math.sin(bubbleAngle) * orbitRadius

          // Vary bubble sizes
          const bubbleSize = 3 + Math.sin(time * 2 + i * 5) * 2

          ctx.beginPath()
          ctx.arc(bubbleX, bubbleY, bubbleSize, 0, Math.PI * 2)
          ctx.fillStyle = "rgba(255, 255, 255, 0.8)"
          ctx.fill()
        }

        // Add subtle ripple effect - make these perfectly circular
        const rippleTime = time * 0.5
        const ripplePhase = rippleTime % 1
        if (ripplePhase < 0.7) {
          // Only show ripple part of the time
          const rippleRadius = baseRadius * (0.8 + ripplePhase * 0.5)
          const rippleOpacity = 0.2 * (1 - ripplePhase / 0.7)

          ctx.beginPath()
          ctx.arc(centerX, centerY, rippleRadius, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(255, 255, 255, ${rippleOpacity})`
          ctx.lineWidth = 2
          ctx.stroke()
        }

        ctx.restore()
      }

      // Update phase for animation
      phase += 0.03
      for (let i = 0; i < noiseOffsets.length; i++) {
        noiseOffsets[i] += 0.015
      }

      requestIdRef.current = requestAnimationFrame(animate)
    }

    // Start animation
    animate()

    // Cleanup
    return () => {
      cancelAnimationFrame(requestIdRef.current)
    }
  }, [isAnimating, isUsingTools])

  return (
    <div className="relative flex items-center justify-center">
      <canvas
        ref={canvasRef}
        className="transition-opacity duration-300"
        style={{ opacity: 0.95 }}
        aria-label="Kali-E animated visualization"
      />
    </div>
  )
}
