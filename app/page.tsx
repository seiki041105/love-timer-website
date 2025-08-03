"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Heart, Globe, Activity, ArrowLeft, RotateCcw, X, Plus } from "lucide-react"
import { supabase } from "../lib/supabase"

// 本地存储键名
const STORAGE_KEYS = {
  LANGUAGE: "love-timer-language",
  TODO_STATES: "love-timer-todo-states",
  CANDLE_BLOWN: "love-timer-candle-blown",
  MUSIC_PLAYING: "love-timer-music-playing",
  VISITED_PAGES: "love-timer-visited-pages",
  LAST_VISIT: "love-timer-last-visit",
  ANIME_COMMENTS: "love-timer-anime-comments",
  CALENDAR_EVENTS: "love-timer-calendar-events",
  QUIZ_ANSWERED: "love-timer-quiz-answered",
  GACHA_COLLECTED: "love-timer-gacha-collected",
  COOKING_COMPLETED: "love-timer-cooking-completed",
}

// 本地存储工具函数
const storage = {
  get: (key: string, defaultValue: any = null) => {
    if (typeof window === "undefined") return defaultValue
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch {
      return defaultValue
    }
  },
  set: (key: string, value: any) => {
    if (typeof window === "undefined") return
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error("Failed to save to localStorage:", error)
    }
  },
  remove: (key: string) => {
    if (typeof window === "undefined") return
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error("Failed to remove from localStorage:", error)
    }
  },
}

// 音效播放函数
const playSound = (frequency: number, duration: number, type: "sine" | "square" | "triangle" = "sine") => {
  if (typeof window === "undefined") return

  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.frequency.value = frequency
    oscillator.type = type

    gainNode.gain.setValueAtTime(0.15, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration)

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + duration)
  } catch (error) {
    console.log("Audio not supported")
  }
}

// 真实音效模拟
const playWaterSound = () => {
  // 水流声
  for (let i = 0; i < 5; i++) {
    setTimeout(() => {
      playSound(200 + Math.random() * 100, 0.3, "sine")
    }, i * 100)
  }
}

const playChopSound = () => {
  // 切菜声
  playSound(800, 0.1, "square")
  setTimeout(() => playSound(600, 0.1, "square"), 50)
}

const playCookingSound = () => {
  // 煮的声音
  for (let i = 0; i < 8; i++) {
    setTimeout(() => {
      playSound(150 + Math.random() * 50, 0.4, "triangle")
    }, i * 200)
  }
}

const playClickSound = () => playSound(600, 0.15, "sine")
const playSuccessSound = () => {
  playSound(450, 0.25, "triangle")
  setTimeout(() => playSound(550, 0.25, "triangle"), 120)
}

// 彩带效果音效
const playConfettiSound = () => {
  // 彩带飞舞的音效
  for (let i = 0; i < 6; i++) {
    setTimeout(() => {
      playSound(800 + Math.random() * 400, 0.2, "sine")
    }, i * 100)
  }
}

const playFireworkSound = () => {
  playSound(150, 0.4, "triangle")
  setTimeout(() => {
    for (let i = 0; i < 4; i++) {
      setTimeout(() => {
        playSound(700 + Math.random() * 300, 0.3, "sine")
      }, i * 150)
    }
  }, 400)
}

// 播放完整生日歌
const playFullBirthdaySong = (onComplete?: () => void) => {
  const notes = [
    { freq: 262, duration: 0.5 },
    { freq: 262, duration: 0.5 },
    { freq: 294, duration: 1 },
    { freq: 262, duration: 1 },
    { freq: 349, duration: 1 },
    { freq: 330, duration: 2 },
    { freq: 262, duration: 0.5 },
    { freq: 262, duration: 0.5 },
    { freq: 294, duration: 1 },
    { freq: 262, duration: 1 },
    { freq: 392, duration: 1 },
    { freq: 349, duration: 2 },
    { freq: 262, duration: 0.5 },
    { freq: 262, duration: 0.5 },
    { freq: 523, duration: 1 },
    { freq: 440, duration: 1 },
    { freq: 349, duration: 1 },
    { freq: 330, duration: 1 },
    { freq: 294, duration: 2 },
    { freq: 466, duration: 0.5 },
    { freq: 466, duration: 0.5 },
    { freq: 440, duration: 1 },
    { freq: 349, duration: 1 },
    { freq: 392, duration: 1 },
    { freq: 349, duration: 2 },
  ]

  let delay = 0
  notes.forEach((note, index) => {
    setTimeout(() => {
      playSound(note.freq, note.duration, "sine")
      if (index === notes.length - 1 && onComplete) {
        setTimeout(onComplete, note.duration * 1000)
      }
    }, delay * 1000)
    delay += note.duration
  })
}

// Q弹按钮组件
const BounceButton = ({
  children,
  onClick,
  className = "",
  disabled = false,
  ...props
}: {
  children: React.ReactNode
  onClick?: () => void
  className?: string
  disabled?: boolean
  [key: string]: any
}) => {
  const [isPressed, setIsPressed] = useState(false)

  const handleClick = () => {
    if (!disabled) {
      playClickSound()
      onClick?.()
    }
  }

  return (
    <button
      onClick={handleClick}
      onMouseDown={() => !disabled && setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      disabled={disabled}
      className={`transform transition-all duration-200 hover:scale-105 hover:shadow-lg ${
        isPressed ? "scale-95" : ""
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

// 浮动动画组件
const FloatingElement = ({
  children,
  delay = 0,
  duration = 4,
}: { children: React.ReactNode; delay?: number; duration?: number }) => (
  <div
    className="animate-float"
    style={{
      animationDelay: `${delay}s`,
      animationDuration: `${duration}s`,
    }}
  >
    {children}
  </div>
)

// 光粒子组件
const LightParticle = ({ 
  delay = 0, 
  size = "small", 
  duration = 6,
  position = { left: '50%', top: '50%' }
}: { 
  delay?: number; 
  size?: "tiny" | "small" | "mediumSmall" | "medium" | "large"; 
  duration?: number;
  position?: { left: string; top: string };
}) => {
  const sizeClasses = {
    tiny: "w-0.25 h-0.25",
    small: "w-0.5 h-0.5",
    medium: "w-1 h-1", 
    large: "w-1.5 h-1.5",
    mediumSmall: "w-0.75 h-0.75"
  }
  
  return (
    <div
      className={`absolute rounded-full bg-white/80 animate-light-breathing ${sizeClasses[size]}`}
      style={{
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
        left: position.left,
        top: position.top,
        boxShadow: '0 0 4px rgba(255, 255, 255, 0.8), 0 0 8px rgba(255, 255, 255, 0.6), 0 0 12px rgba(255, 255, 255, 0.4)',
      }}
    />
  )
}

// 光粒子容器
const LightParticles = () => {
  // 预定义的位置，让粒子在固定位置循环
  const positions = [
    // 左侧和中间的大粒子位置
    { left: '8%', top: '12%' },
    { left: '22%', top: '18%' },
    { left: '38%', top: '8%' },
    { left: '12%', top: '42%' },
    { left: '32%', top: '52%' },
    { left: '18%', top: '72%' },
    { left: '15%', top: '30%' },
    { left: '45%', top: '25%' },
    { left: '25%', top: '65%' },
    // 右侧保留几个大粒子
    { left: '65%', top: '20%' },
    { left: '75%', top: '35%' },
    { left: '85%', top: '25%' },
    { left: '70%', top: '60%' },
    { left: '80%', top: '50%' },
    // 右下角新增两个大粒子
    { left: '92%', top: '88%' },
    { left: '98%', top: '92%' },
    // 新增的20个小粒子位置
    { left: '5%', top: '25%' },
    { left: '35%', top: '35%' },
    { left: '10%', top: '55%' },
    { left: '40%', top: '65%' },
    { left: '20%', top: '85%' },
    { left: '30%', top: '15%' },
    { left: '50%', top: '90%' },
    { left: '70%', top: '25%' },
    { left: '75%', top: '35%' },
    { left: '65%', top: '45%' },
    { left: '80%', top: '55%' },
    { left: '85%', top: '65%' },
    { left: '90%', top: '75%' },
    { left: '95%', top: '45%' },
    { left: '88%', top: '85%' },
    // 新增的中等大小粒子位置
    { left: '15%', top: '85%' },
    { left: '25%', top: '95%' },
    { left: '35%', top: '85%' },
    { left: '45%', top: '95%' },
    { left: '55%', top: '85%' },
    { left: '65%', top: '95%' },
    { left: '75%', top: '85%' },
    { left: '85%', top: '95%' },
    { left: '95%', top: '85%' },
    { left: '20%', top: '15%' },
    { left: '40%', top: '10%' },
    { left: '60%', top: '8%' },
    { left: '80%', top: '15%' },
    { left: '10%', top: '35%' },
    { left: '30%', top: '45%' },
    { left: '50%', top: '40%' },
    { left: '70%', top: '45%' },
    { left: '90%', top: '35%' },
  ]
  
  const particles = positions.map((pos, i) => {
    // 前12个粒子使用大尺寸，中间10个使用中等尺寸，后8个使用小尺寸
    let size: "tiny" | "small" | "mediumSmall" | "medium" | "large";
    if (i < 12) {
      size = ["small", "medium", "large"][i % 3] as "small" | "medium" | "large";
    } else if (i < 22) {
      size = "mediumSmall";
    } else {
      size = "tiny";
    }
    
    return (
      <LightParticle
        key={i}
        delay={i * 0.4} // 增加延迟，让闪烁更慢
        size={size}
        duration={4}
        position={pos}
      />
    );
  })
  
  return <>{particles}</>
}

// 彩带组件
const Confetti = ({ show }: { show: boolean }) => {
  if (!show) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      {[...Array(50)].map((_, i) => (
        <div
          key={i}
          className="absolute animate-confetti"
          style={{
            left: `${Math.random() * 100}%`,
            top: "-10px",
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${3 + Math.random() * 2}s`,
          }}
        >
          <div
            className={`w-2 h-6 ${
              ["bg-red-400", "bg-blue-400", "bg-green-400", "bg-yellow-400", "bg-pink-400", "bg-purple-400"][
                Math.floor(Math.random() * 6)
              ]
            } transform rotate-45`}
          />
        </div>
      ))}
    </div>
  )
}

// 时钟组件
const Clock = ({ timezone, label }: { timezone: string; label: string }) => {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const getTimeInTimezone = () => {
    if (timezone === "Asia/Tokyo") {
      return new Date(time.toLocaleString("en-US", { timeZone: "Asia/Tokyo" }))
    } else if (timezone === "Asia/Shanghai") {
      return new Date(time.toLocaleString("en-US", { timeZone: "Asia/Shanghai" }))
    }
    return time
  }

  const currentTime = getTimeInTimezone()
  const hours = currentTime.getHours() % 12
  const minutes = currentTime.getMinutes()
  const seconds = currentTime.getSeconds()

  const hourAngle = hours * 30 + minutes * 0.5
  const minuteAngle = minutes * 6
  const secondAngle = seconds * 6

  return (
    <FloatingElement delay={1} duration={5}>
      <div className="flex flex-col items-center">
        <div className="relative w-24 h-24 bg-white rounded-full shadow-lg border-4 border-pink-200 mb-2">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-0.5 h-3 bg-gray-400"
              style={{
                top: "4px",
                left: "50%",
                transformOrigin: "50% 44px",
                transform: `translateX(-50%) rotate(${i * 30}deg)`,
              }}
            />
          ))}
          <div
            className="absolute w-1 bg-gray-800 rounded-full origin-bottom transition-transform duration-1000"
            style={{
              height: "20px",
              bottom: "50%",
              left: "50%",
              transformOrigin: "50% 100%",
              transform: `translateX(-50%) rotate(${hourAngle}deg)`,
            }}
          />
          <div
            className="absolute w-0.5 bg-gray-600 rounded-full origin-bottom transition-transform duration-1000"
            style={{
              height: "28px",
              bottom: "50%",
              left: "50%",
              transformOrigin: "50% 100%",
              transform: `translateX(-50%) rotate(${minuteAngle}deg)`,
            }}
          />
          <div
            className="absolute w-0.5 bg-red-500 rounded-full origin-bottom transition-transform duration-75"
            style={{
              height: "32px",
              bottom: "50%",
              left: "50%",
              transformOrigin: "50% 100%",
              transform: `translateX(-50%) rotate(${secondAngle}deg)`,
            }}
          />
          <div className="absolute w-2 h-2 bg-gray-800 rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
        </div>
        <div className="text-center">
          <div className="text-sm font-semibold text-gray-700">{label}</div>
          <div className="text-xs text-gray-500">{currentTime.toLocaleTimeString()}</div>
        </div>
      </div>
    </FloatingElement>
  )
}

// 简化的亚洲地图组件
const AsiaMap = ({ cities, onCityClick }: { cities: any[]; onCityClick: (city: string) => void }) => {
  return (
    <div className="relative w-full h-80 bg-gradient-to-br from-blue-100 to-green-100 rounded-2xl overflow-hidden shadow-inner">
      {/* 简化的亚洲地图 SVG */}
      <svg viewBox="0 0 800 400" className="w-full h-full">
        {/* 中国大陆 */}
        <path
          d="M200 150 Q250 120 320 140 Q380 130 420 160 Q450 180 480 200 Q500 220 480 260 Q460 280 420 290 Q380 300 340 290 Q300 280 260 270 Q220 250 200 220 Q180 190 200 150 Z"
          fill="#fecaca"
          stroke="#f87171"
          strokeWidth="2"
          className="opacity-80"
        />

        {/* 日本列岛 */}
        <path
          d="M580 180 Q590 170 600 180 Q610 190 605 200 Q600 210 590 205 Q580 200 580 180 Z"
          fill="#bfdbfe"
          stroke="#60a5fa"
          strokeWidth="2"
          className="opacity-80"
        />
        <path
          d="M590 220 Q600 210 610 220 Q620 230 615 240 Q610 250 600 245 Q590 240 590 220 Z"
          fill="#bfdbfe"
          stroke="#60a5fa"
          strokeWidth="2"
          className="opacity-80"
        />

        {/* 其他亚洲国家轮廓 */}
        <path
          d="M100 200 Q150 180 200 200 Q180 240 150 250 Q120 240 100 220 Q90 210 100 200 Z"
          fill="#d1fae5"
          stroke="#34d399"
          strokeWidth="1"
          className="opacity-60"
        />

        {/* 海洋 */}
        <circle cx="550" cy="250" r="30" fill="#dbeafe" className="opacity-40" />
        <circle cx="650" cy="200" r="25" fill="#dbeafe" className="opacity-40" />
      </svg>

      {/* 城市标记点 */}
      {cities.map((city, index) => (
        <BounceButton
          key={index}
          onClick={() => onCityClick(city.city)}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
          style={{ left: `${city.x}%`, top: `${city.y}%` }}
        >
          <div className={`w-4 h-4 rounded-full ${city.color} border-2 border-white shadow-lg animate-pulse`} />
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap">
              {city.city}, {city.country}
            </div>
          </div>
        </BounceButton>
      ))}
    </div>
  )
}

// 增强的图片查看器组件
const EnhancedImageViewer = ({ 
  src, 
  alt, 
  onClose 
}: { 
  src: string; 
  alt: string; 
  onClose: () => void 
}) => {
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 })

  // 重置函数
  const resetView = () => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
    setLastPosition({ x: 0, y: 0 })
  }

  // 处理鼠标滚轮缩放
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    const newScale = Math.max(0.1, Math.min(5, scale * delta))
    setScale(newScale)
  }

  // 处理鼠标按下
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) { // 左键
      setIsDragging(true)
      setDragStart({ x: e.clientX, y: e.clientY })
      setLastPosition(position)
    }
  }

  // 处理鼠标移动
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const deltaX = e.clientX - dragStart.x
      const deltaY = e.clientY - dragStart.y
      setPosition({
        x: lastPosition.x + deltaX,
        y: lastPosition.y + deltaY
      })
    }
  }

  // 处理鼠标松开
  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // 处理双击重置
  const handleDoubleClick = () => {
    resetView()
  }

  // 处理键盘事件
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose()
          break
        case '0':
        case 'r':
          resetView()
          break
        case '+':
        case '=':
          setScale(prev => Math.min(5, prev * 1.2))
          break
        case '-':
          setScale(prev => Math.max(0.1, prev * 0.8))
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-60"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      onMouseLeave={handleMouseUp}
    >
      {/* 控制按钮 */}
      <div className="absolute top-4 right-4 flex gap-2 z-70">
        <BounceButton
          onClick={resetView}
          className="bg-white bg-opacity-80 p-2 rounded-full hover:bg-opacity-100 text-sm"
          title="重置视图 (R)"
        >
          🔄
        </BounceButton>
        <BounceButton
          onClick={() => setScale(prev => Math.min(5, prev * 1.2))}
          className="bg-white bg-opacity-80 p-2 rounded-full hover:bg-opacity-100 text-sm"
          title="放大 (+)"
        >
          ➕
        </BounceButton>
        <BounceButton
          onClick={() => setScale(prev => Math.max(0.1, prev * 0.8))}
          className="bg-white bg-opacity-80 p-2 rounded-full hover:bg-opacity-100 text-sm"
          title="缩小 (-)"
        >
          ➖
        </BounceButton>
        <BounceButton
          onClick={onClose}
          className="bg-white bg-opacity-80 p-2 rounded-full hover:bg-opacity-100"
          title="关闭 (ESC)"
        >
          <X className="w-6 h-6" />
        </BounceButton>
      </div>

      {/* 缩放信息 */}
      <div className="absolute top-4 left-4 bg-white bg-opacity-80 px-3 py-1 rounded-full text-sm z-70">
        {Math.round(scale * 100)}%
      </div>

      {/* 操作提示 */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-80 px-4 py-2 rounded-lg text-sm z-70">
        <div className="text-center">
          <div>🖱️ 拖拽移动 | 🔄 滚轮缩放 | 👆 双击重置</div>
          <div className="text-xs text-gray-600 mt-1">ESC关闭 | R重置 | +/-缩放</div>
        </div>
      </div>

      {/* 图片容器 */}
      <div
        className="relative overflow-hidden"
        style={{
          cursor: isDragging ? 'grabbing' : 'grab',
          userSelect: 'none'
        }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onDoubleClick={handleDoubleClick}
      >
        <img
          src={src}
          alt={alt}
          className="transition-transform duration-100"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: 'center',
            maxWidth: '90vw',
            maxHeight: '90vh',
            objectFit: 'contain'
          }}
          draggable={false}
        />
      </div>
    </div>
  )
}

// 真实风格照片墙组件
const PhotoWall = ({ city, onClose, language = "zh" }: { city: string; onClose: () => void; language?: "zh" | "ja" | "en" }) => {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)
  
  // 解析城市和时间信息
  const cityInfo = (() => {
    const parts = city.split('-')
    if (parts.length > 1) {
      return {
        cityName: parts[0],
        time: parts.slice(1).join('-') // 关键修复：合并时间段
      }
    }
    return {
      cityName: city,
      time: null
    }
  })()

  // 根据城市、时间和照片编号获取个性化留言
  const getPhotoMessage = (cityName: string, time: string | null, photoIndex: number, language: "zh" | "ja" | "en" = "zh") => {
    const messages: { [key: string]: { [key: string]: { [key: string]: string[] } } } = {
      "长沙": {
        "default": {
          "zh": [
            "见面了！我挑选了好久，准备了乌萨奇的花束给你。好开心～",
            "因为看了地球的运动，来到了地质博物馆，好漂亮啊(这个页面的背景我也特意选择了地球的运动ww)",
            "感觉是千空会喜欢的装饰ww写满了化学元素(汉字版)",
            "你说我的发型像全职猎人的某个摩托车 这个姿势像骑摩托的画面ww",
            "和Usagi一起拍了拍立得！好多张！",
            "去了你期待很久的博物馆～",
            "在miniso被Usagi偷拍了",
            "你被牛肉辣得不行www"
          ],
          "ja": [
            "会えた！すごく選んで、ウサギの花束を準備したよ。超嬉しい～",
            "地球の運動を見て、地質博物館に来たよ。すごく綺麗！(このページの背景も地球の運動を選んだww)",
            "千空が好きそうな装飾ww化学元素がいっぱい(漢字版)",
            "私の髪型がハンターのバイクみたいって言ってたね このポーズもバイクに乗ってるみたいww",
            "ウサギと一緒にプリクラ撮った！いっぱい！",
            "ずっと行きたかった博物館に行った～",
            "minisoでウサギに盗撮された",
            "牛肉が辛すぎて大変だったwww"
          ],
          "en": [
            "We met! I picked for so long and prepared a Usagi flower bouquet for you. So happy~",
            "Because I watched Earth's movement, I came to the geological museum. So beautiful! (I also specially chose Earth's movement for this page background ww)",
            "Feels like Senku would like this decoration ww full of chemical elements (Chinese version)",
            "You said my hairstyle looks like a motorcycle from Hunter x Hunter, this pose looks like riding a bike ww",
            "Took purikura with Usagi! So many!",
            "Went to the museum you've been looking forward to~",
            "Got secretly photographed by Usagi at miniso",
            "You couldn't handle the spicy beef www"
          ]
        }
      },
      "张家界": {
        "default": {
          "zh": [
            "这时候我们看起来还很轻松w",
            "小八和巍峨的山形成了强烈对比ww",
            "野生的宠物猫出现了！我不擅长和宠物玩www",
            "模仿大爷大妈的姿势和外国人帮忙互相拍照(话说你也是外国人ww)"
          ],
          "ja": [
            "この時はまだ余裕があったw",
            "はちわれと雄大な山が強烈なコントラストww",
            "野生のペット猫が現れた！ペットと遊ぶのが苦手www",
            "おじいさんおばあさんのポーズを真似して外国人と写真撮り合い(って言うかあなたも外国人ww)"
          ],
          "en": [
            "We still looked relaxed at this time w",
            "Hachiware and the majestic mountains formed a strong contrast ww",
            "A wild pet cat appeared! I'm not good at playing with pets www",
            "Imitated the poses of grandpas and grandmas and helped each other take photos with foreigners (by the way, you're also a foreigner ww)"
          ]
        }
      },
      "凤凰": {
        "default": {
          "zh": [
            "最大的收获是吃了超好吃的小笼包w"
          ],
          "ja": [
            "最大の収穫は超美味しい小籠包を食べたことw"
          ],
          "en": [
            "The biggest gain was eating super delicious xiaolongbao w"
          ]
        }
      },
      "大阪": {
        "1.8-1.14": {
          "zh": [
            "被超大份拉面震惊到的Ryoma(太可爱了！)",
            "笑得超开心，穿得超级多。散步真好啊～",
            "在摩天轮上第一次独处，有点紧张！但是景色真好～",
            "只有我们知道的秘密～❤️",
            "去机场的路上困到不行",
            "第一次合照～不敢太亲密的～",
            "大头贴太可爱了！人生必做清单完成一项！手忙脚乱的哈哈哈",
            "大阪城好大！天气真好～冬天的天也是蓝色呢"
          ],
          "ja": [
            "超大盛りラーメンに驚いたRyoma(超可愛い！)",
            "超笑顔で、たくさん着込んで。散歩最高～",
            "観覧車で初めて二人きり、ちょっと緊張！でも景色最高～",
            "私たちだけの秘密～❤️",
            "空港への道で眠くて仕方ない",
            "初めての二人写真～親密すぎない～",
            "プリクラ超可愛い！人生のやりたいことリスト一つ完成！てんやわんやのwww",
            "大阪城すごく大きい！天気最高～冬の空も青いね"
          ],
          "en": [
            "Ryoma was shocked by the super large ramen (so cute!)",
            "Laughing so happily, wearing so much. Walking is so nice~",
            "First time alone on the ferris wheel, a bit nervous! But the view is amazing~",
            "Secrets only we know~❤️",
            "So sleepy on the way to the airport",
            "First photo together~ didn't dare to be too intimate~",
            "Purikura is so cute! Completed one item on life's bucket list! Chaotic hahaha",
            "Osaka Castle is so big! Weather is great~ winter sky is blue too"
          ]
        },
        "6.24-7.2": {
          "zh": [
            "没想到拼积木这么开心！www都好可爱啊～",
            "啥来着？"
          ],
          "ja": [
            "ブロックを組み立てるのがこんなに楽しいとは！www全部可愛い～",
            "啥来着？"
          ],
          "en": [
            "Didn't expect building blocks to be so fun! www all so cute~",
            "啥来着？"
          ]
        }
      },
      "京都": {
        "1.8-1.14": {
          "zh": [
            "赶上时间了太好了！超开心www第一次去神社，好美啊",
            "我喝醉了www感觉要掉进鸭川了"
          ],
          "ja": [
            "時間に間に合って良かった！超嬉しいwww初めて神社に行った、綺麗",
            "酔っ払ったwww鴨川に落ちそう"
          ],
          "en": [
            "So glad we made it in time! Super happy www first time going to a shrine, so beautiful",
            "I got drunk www feel like I'm going to fall into the Kamogawa"
          ]
        },
        "6.24-7.2": {
          "zh": [
            "好漂亮的夕阳！这样散步就像普通的日子一样~",
            "去了你期待很久的汉字博物馆！好玩w"
          ],
          "ja": [
            "綺麗な夕日！こんな散歩は普通の日みたい～",
            "ずっと行きたかった漢字博物館に行った！楽しいw"
          ],
          "en": [
            "Beautiful sunset! Walking like this feels like an ordinary day~",
            "Went to the Chinese character museum you've been looking forward to! Fun w"
          ]
        }
      },
      "奈良": {
        "default": {
          "zh": [
            "可爱的小鹿～"
          ],
          "ja": [
            "可愛い小鹿～"
          ],
          "en": [
            "Cute little deer~"
          ]
        }
      }
    }
    
    const cityMessages = messages[cityName] || {}
    const timeMessages = cityMessages[time || "default"] || cityMessages["default"] || {}
    const languageMessages = timeMessages[language] || timeMessages["zh"] || []
    return languageMessages[photoIndex] || "美好的回忆 💕"
  }

  // 获取城市图片列表
  const getCityPhotos = () => {
    if (cityInfo.cityName === "大阪" && cityInfo.time) {
      if (cityInfo.time === "1.8-1.14") {
        return [
          "/images/Japan/大阪1.8-1.14 (1).jpg",
          "/images/Japan/大阪1.8-1.14 (2).jpg",
          "/images/Japan/大阪1.8-1.14 (3).jpg",
          "/images/Japan/大阪1.8-1.14 (4).jpg",
          "/images/Japan/大阪1.8-1.14 (5).jpg",
          "/images/Japan/大阪1.8-1.14 (6).jpg",
          "/images/Japan/大阪1.8-1.14 (7).jpg",
          "/images/Japan/大阪1.8-1.14 (8).jpg",
        ]
      } else if (cityInfo.time === "6.24-7.2") {
        return [
          "/images/Japan/大阪6.24-7.2(1).jpg",
          "/images/Japan/大阪6.24-7.2(2).jpg",
        ]
      }
    } else if (cityInfo.cityName === "京都" && cityInfo.time) {
      if (cityInfo.time === "1.8-1.14") {
        return [
          "/images/Japan/京都1.8-1.14(1).jpg",
          "/images/Japan/京都1.8-1.14(2).jpg",
        ]
      } else if (cityInfo.time === "6.24-7.2") {
        return [
          "/images/Japan/京都6.24-7.2.jpg",
          "/images/Japan/京都6.24-7.2(2).jpg",
        ]
      }
    } else if (cityInfo.cityName === "奈良") {
      return ["/images/Japan/奈良.jpg"]
    } else if (cityInfo.cityName === "长沙") {
      return [
        "/images/China/长沙 (1).JPG",
        "/images/China/长沙 (2).JPG",
        "/images/China/长沙 (3).JPG",
        "/images/China/长沙 (4).jpg",
        "/images/China/长沙 (5).JPG",
        "/images/China/长沙 (6).JPG",
        "/images/China/长沙 (7).jpg",
        "/images/China/长沙 (8).JPG",
      ]
    } else if (cityInfo.cityName === "张家界") {
      return [
        "/images/China/张家界 (1).jpg",
        "/images/China/张家界 (2).JPG",
        "/images/China/张家界 (3).jpg",
        "/images/China/张家界 (4).JPG",
      ]
    } else if (cityInfo.cityName === "凤凰") {
      return ["/images/China/凤凰.JPG"]
    }
    
    // 默认返回占位符图片
    return Array(12).fill(null).map((_, i) => `/placeholder.svg?height=200&width=300&text=${cityInfo.cityName}回忆${i + 1}`)
  }

  const cityPhotos = getCityPhotos()
  
  // 调试信息
  console.log('当前城市信息:', cityInfo);
  console.log('图片列表:', cityPhotos);
  console.log('城市参数:', city);
  console.log('解析结果:', { cityName: cityInfo.cityName, time: cityInfo.time });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-amber-50 to-yellow-100 rounded-3xl p-8 max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border-4 border-amber-200">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-red-500 rounded-full mr-4 shadow-lg"></div>
            <h2 className="text-3xl font-bold text-amber-800 font-serif">
              📸 {cityInfo.cityName} {cityInfo.time ? `(${cityInfo.time})` : ''} 的回忆相册
            </h2>
          </div>
          <BounceButton onClick={onClose} className="p-3 hover:bg-amber-200 rounded-full transition-colors">
            <X className="w-6 h-6 text-amber-700" />
          </BounceButton>
        </div>

        {/* 真实风格相册网格 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {cityPhotos.map((photo, index) => (
            <div
              key={index}
              className="relative group cursor-pointer transform hover:scale-105 transition-all duration-300"
              onClick={() => setSelectedPhoto(photo)}
            >
              {/* 拍立得相框 */}
              <div className="bg-white p-3 pb-8 rounded-lg shadow-lg transform rotate-1 hover:rotate-0 transition-transform duration-300 border border-gray-200 relative">
                <div className="aspect-[4/3] bg-gray-100 rounded overflow-hidden shadow-inner relative">
                  <img
                    src={photo}
                    alt={`${cityInfo.cityName} 回忆 ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error(`图片加载失败: ${photo}`);
                      e.currentTarget.style.display = 'none';
                    }}
                    onLoad={() => {
                      console.log(`图片加载成功: ${photo}`);
                    }}
                  />

                  {/* 背景照片模糊效果 */}
                  <div className="absolute inset-0 transition-all duration-300 opacity-0 group-hover:opacity-100" style={{filter: 'blur(12px)'}}>
                    <img
                      src={photo}
                      alt={`${cityInfo.cityName} 回忆 ${index + 1}`}
                      className="w-full h-full object-cover"
                      style={{transform: 'scale(1.1)'}}
                    />
                  </div>
                  
                  {/* 鼠标悬停时的毛玻璃留言效果 */}
                  <div className="absolute inset-0 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 z-10">
                    <div className="bg-white bg-opacity-60 rounded-lg p-3 text-black text-sm text-center max-w-[90%] border border-white border-opacity-60 shadow-xl">
                      {getPhotoMessage(cityInfo.cityName, cityInfo.time, index, language)}
                    </div>
                  </div>
                </div>

                {/* 拍立得底部白边 */}
                <div className="mt-2 text-center">
                  <div className="text-xs text-gray-500 font-handwriting">
                    {cityInfo.cityName} {index + 1}
                  </div>
                </div>
              </div>

              {/* 胶带效果 - 多种样式 */}
              <div
                className={`absolute bg-yellow-200 opacity-70 rounded-sm shadow-sm ${
                  index % 4 === 0
                    ? "-top-2 -right-2 w-8 h-4 rotate-45"
                    : index % 4 === 1
                      ? "-bottom-2 -left-2 w-6 h-6 -rotate-12"
                      : index % 4 === 2
                        ? "-top-1 left-1/2 w-6 h-3 rotate-12 transform -translate-x-1/2"
                        : "-bottom-1 -right-1 w-5 h-5 rotate-45"
                }`}
              ></div>

              {/* 额外的胶带装饰 */}
              {index % 3 === 0 && (
                <div className="absolute -top-1 -left-1 w-4 h-4 bg-yellow-300 opacity-60 transform -rotate-45 rounded-sm shadow-sm"></div>
              )}
            </div>
          ))}
        </div>

        {/* 相册装饰 */}
        <div className="mt-8 flex justify-center items-center space-x-4 text-amber-600">
          <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
          <div className="text-sm font-serif italic">珍贵的回忆时光</div>
          <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
        </div>
      </div>

      {/* 照片放大查看 */}
      {selectedPhoto && (
        <EnhancedImageViewer
          src={selectedPhoto}
          alt="放大查看"
          onClose={() => setSelectedPhoto(null)}
        />
      )}
    </div>
  )
}

// 地图页面
const MapPage = ({
  onBack,
  visitedPages,
  setVisitedPages,
  language,
}: {
  onBack: () => void
  visitedPages: string[]
  setVisitedPages: (pages: string[]) => void
  language: "zh" | "ja" | "en"
}) => {
  const [selectedCity, setSelectedCity] = useState<string | null>(null)
  const [showTimeSelector, setShowTimeSelector] = useState(false)
  const [pendingCity, setPendingCity] = useState<string | null>(null)

  const translations = {
    zh: {
      ourMap: "🗺️ 我们的地图",
      visited: "✓ 已访问",
      chinaTrip: "🇨🇳 中国之旅",
      japanTrip: "🇯🇵 日本之旅",
      visitCount: "访问次数",
      totalCities: "总共去过",
      cities: "个城市",
      selectTime: "选择时间",
      time1: "1月8日-1月14日",
      time2: "6月24日-7月2日",
      cancel: "取消",
    },
    ja: {
      ourMap: "🗺️ 私たちの地図",
      visited: "✓ 訪問済み",
      chinaTrip: "🇨🇳 中国旅行",
      japanTrip: "🇯🇵 日本旅行",
      visitCount: "訪問回数",
      totalCities: "合計",
      cities: "都市を訪問",
      selectTime: "時間を選択",
      time1: "1月8日-1月14日",
      time2: "6月24日-7月2日",
      cancel: "キャンセル",
    },
    en: {
      ourMap: "🗺️ Our Map",
      visited: "✓ Visited",
      chinaTrip: "🇨🇳 China Trip",
      japanTrip: "🇯🇵 Japan Trip",
      visitCount: "Visit count",
      totalCities: "Total visited",
      cities: "cities",
      selectTime: "Select Time",
      time1: "Jan 8-14",
      time2: "Jun 24-Jul 2",
      cancel: "Cancel",
    },
  }

  const t = translations[language]

  useEffect(() => {
    if (!visitedPages.includes("map")) {
      const newVisited = [...visitedPages, "map"]
      setVisitedPages(newVisited)
      storage.set(STORAGE_KEYS.VISITED_PAGES, newVisited)
    }
  }, [visitedPages, setVisitedPages])

  const handleCityClick = (city: string) => {
    if (city === "大阪" || city === "京都") {
      setPendingCity(city)
      setShowTimeSelector(true)
    } else {
      setSelectedCity(city)
    }
  }

  const handleTimeSelect = (time: string) => {
    if (pendingCity) {
      setSelectedCity(`${pendingCity}-${time}`)
      setShowTimeSelector(false)
      setPendingCity(null)
    }
  }

  const handleCancelTimeSelect = () => {
    setShowTimeSelector(false)
    setPendingCity(null)
  }

  const cities = [
    { x: 35, y: 55, city: "长沙", country: "中国", color: "bg-rose-300" },
    { x: 33, y: 52, city: "张家界", country: "中国", color: "bg-rose-300" },
    { x: 34, y: 58, city: "凤凰", country: "中国", color: "bg-rose-300" },
    { x: 75, y: 45, city: "大阪", country: "日本", color: "bg-emerald-300" },
    { x: 76, y: 43, city: "京都", country: "日本", color: "bg-emerald-300" },
    { x: 77, y: 46, city: "奈良", country: "日本", color: "bg-emerald-300" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-emerald-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {[...Array(15)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 bg-pink-200 rounded-full animate-pulse opacity-30"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${3 + Math.random() * 2}s`,
          }}
        />
      ))}

      <FloatingElement delay={0.5}>
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-6xl w-full backdrop-blur-sm bg-opacity-95">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <BounceButton onClick={onBack} className="mr-4 p-2 rounded-full hover:bg-gray-100">
                <ArrowLeft className="w-6 h-6" />
              </BounceButton>
              <h1 className="text-3xl font-bold text-gray-800">{t.ourMap}</h1>
            </div>
            <div className="text-sm text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full animate-pulse">
              {t.visited}
            </div>
          </div>

          <div className="mb-6">
            <AsiaMap cities={cities} onCityClick={handleCityClick} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FloatingElement delay={1}>
              <div className="bg-gradient-to-br from-pink-50 to-rose-100 rounded-xl p-4 shadow-lg border border-pink-200">
                <h3 className="text-lg font-semibold text-pink-600 mb-3 flex items-center">{t.chinaTrip}</h3>
                <div className="space-y-2">
                  {cities
                    .filter((city) => city.country === "中国")
                    .map((city, index) => (
                      <BounceButton
                        key={index}
                        onClick={() => handleCityClick(city.city)}
                        className="flex items-center text-sm text-gray-700 w-full text-left p-2 rounded-lg hover:bg-white hover:shadow-md transition-all duration-300"
                      >
                        <div className="w-3 h-3 bg-pink-500 rounded-full mr-3 animate-pulse"></div>
                        {city.city}
                      </BounceButton>
                    ))}
                </div>
              </div>
            </FloatingElement>
            <FloatingElement delay={1.5}>
              <div className="bg-gradient-to-br from-emerald-50 to-teal-100 rounded-xl p-4 shadow-lg border border-emerald-200">
                <h3 className="text-lg font-semibold text-emerald-600 mb-3 flex items-center">{t.japanTrip}</h3>
                <div className="space-y-2">
                  {cities
                    .filter((city) => city.country === "日本")
                    .map((city, index) => (
                      <BounceButton
                        key={index}
                        onClick={() => handleCityClick(city.city)}
                        className="flex items-center text-sm text-gray-700 w-full text-left p-2 rounded-lg hover:bg-white hover:shadow-md transition-all duration-300"
                      >
                        <div className="w-3 h-3 bg-emerald-500 rounded-full mr-3 animate-pulse"></div>
                        {city.city}
                      </BounceButton>
                    ))}
                </div>
              </div>
            </FloatingElement>
          </div>

          <div className="mt-6 text-center text-sm text-gray-500">
            {t.visitCount}: {visitedPages.filter((page) => page === "map").length} • {t.totalCities} {cities.length}{" "}
            {t.cities}
          </div>
        </div>
      </FloatingElement>

      {selectedCity && <PhotoWall city={selectedCity} onClose={() => setSelectedCity(null)} language={language} />}
      
      {/* 时间选择器 */}
      {showTimeSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-2">{t.selectTime}</h3>
              <p className="text-gray-600">{pendingCity}</p>
            </div>
            
            <div className="space-y-3">
              <BounceButton
                onClick={() => handleTimeSelect("1.8-1.14")}
                className="w-full p-4 bg-gradient-to-r from-pink-100 to-rose-100 hover:from-pink-200 hover:to-rose-200 rounded-xl border border-pink-200 transition-all duration-300"
              >
                <div className="text-left">
                  <div className="font-semibold text-gray-800">{t.time1}</div>
                  <div className="text-sm text-gray-600">第一次旅行</div>
                </div>
              </BounceButton>
              
              <BounceButton
                onClick={() => handleTimeSelect("6.24-7.2")}
                className="w-full p-4 bg-gradient-to-r from-emerald-100 to-teal-100 hover:from-emerald-200 hover:to-teal-200 rounded-xl border border-emerald-200 transition-all duration-300"
              >
                <div className="text-left">
                  <div className="font-semibold text-gray-800">{t.time2}</div>
                  <div className="text-sm text-gray-600">第二次旅行</div>
                </div>
              </BounceButton>
            </div>
            
            <div className="mt-6">
              <BounceButton
                onClick={handleCancelTimeSelect}
                className="w-full p-3 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700 transition-colors"
              >
                {t.cancel}
              </BounceButton>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// 未来清单页面
const TodoPage = ({
  onBack,
  visitedPages,
  setVisitedPages,
  language,
}: {
  onBack: () => void
  visitedPages: string[]
  setVisitedPages: (pages: string[]) => void
  language: "zh" | "ja" | "en"
}) => {
  const [todoStates, setTodoStates] = useState<boolean[]>([])
  const [showSaveNotification, setShowSaveNotification] = useState(false)

  const translations = {
    zh: {
      futureList: "📝 未来清单",
      completed: "完成",
      reset: "重置",
      autoSaved: "已自动保存",
      progressSaved: "进度会自动保存",
      visitCount: "访问次数",
      continued: "【未完待续...】",
    },
    ja: {
      futureList: "📝 未来のリスト",
      completed: "完了",
      reset: "リセット",
      autoSaved: "自動保存済み",
      progressSaved: "進捗は自動保存されます",
      visitCount: "訪問回数",
      continued: "【続く...】",
    },
    en: {
      futureList: "📝 Future List",
      completed: "Completed",
      reset: "Reset",
      autoSaved: "Auto saved",
      progressSaved: "Progress auto-saved",
      visitCount: "Visit count",
      continued: "【To be continued...】",
    },
  }

  const t = translations[language]

  const todos = [
    "1. Play Minecraft",
    "2. Play escape games in real life",
    "3. Play board games",
    "4. Go swimming",
    "5. Go camping",
    "6. Make 小龍包",
    "7. Talk in Chinese",
    "8. Practice musical instruments",
    "9. Go cycling in the countryside",
    "10. Travel to 安徽省",
    "11. Sketch landscapes",
    "12. Do VR painting",
    "13. Meet Kison",
    "14. Go to a cat cafe",
    "15. Study English",
    "16. Watch movies at a cinema",
    "17. Go to the beach",
    "18. Witness a beautiful sunset in Japan",
    "19. Play billiards",
    "20. Climb the mountains of 张家界 again",
    "21. Rewatch The Legend of Hei",
    "22. Make Takoyaki",
    "23. Find a four-leaf clover",
    "24. Ride a roller coaster",
    "25. Exercise",
    "26. Cook a meal and have you eat it",
    "27. Create a game and have you play it",
    "28. Relax in a private 温泉",
    "29. Walk in the park near my house",
    "30. Play 原神",
    "31. Clear that escape game with Usagi",
    '32. Explore "something" through other methods',
    "33. Go to a larger concert",
    "34. Design and build a VRC world",
    "35. Go for a drive",
    "36. Watch fireworks",
    "37. Go to a beach and swim in the sea",
    "38. Create 陶器 together → go to USJ",
    "39. Go to other country to have a trip except China and Japan",
    "40. Cook together",
    "41. Pick up clothes for each other and buy (offline)",
    "42. Bake (like cake) together",
    "43. Go for a picnic on the grass",
    "44. Eat hot pot (火锅)",
    "45. Play Nintendo Switch",
    "46. Paint together",
    "47. Read books together offline",
    "48. Cut nails for each other",
    "49. Create a song for you and sing to you",
    "50. Ride on the same bike (电动车)",
    "51. Write poems for each other",
    "52. Spend and celebrate birthday (exactly) offline",
    "53. Play 拼图 together",
    "54. Create 布偶 together",
    "55. Use toys to do something together offline",
    "56. Do something with eyemask",
    "57. Go to Disney park",
    "58. Introduce me to your friend in reality",
    "59. Get on a boat/ship",
    "60. Pat your cat",
    "61. Go diving",
    "62. Go skiing",
    "63. Watch aurora",
    "64. Make a time capsule",
    "65. Wear couple T-shirts",
    "66. Get on a hot air balloon",
    "67. Learn a new language together (Thai?)",
    "68. See stars in 天文馆",
    t.continued,
  ]

  useEffect(() => {
    const savedStates = storage.get(STORAGE_KEYS.TODO_STATES, Array(todos.length).fill(false))
    setTodoStates(savedStates)

    if (!visitedPages.includes("todo")) {
      const newVisited = [...visitedPages, "todo"]
      setVisitedPages(newVisited)
      storage.set(STORAGE_KEYS.VISITED_PAGES, newVisited)
    }
  }, [visitedPages, setVisitedPages])

  const handleTodoChange = (index: number) => {
    if (index === todos.length - 1) return

    const newStates = [...todoStates]
    newStates[index] = !newStates[index]
    setTodoStates(newStates)
    storage.set(STORAGE_KEYS.TODO_STATES, newStates)

    if (newStates[index]) {
      playSuccessSound()
    }

    setShowSaveNotification(true)
    setTimeout(() => setShowSaveNotification(false), 2000)
  }

  const resetAllTodos = () => {
    const resetStates = Array(todos.length).fill(false)
    setTodoStates(resetStates)
    storage.set(STORAGE_KEYS.TODO_STATES, resetStates)
    setShowSaveNotification(true)
    setTimeout(() => setShowSaveNotification(false), 2000)
  }

  const completedCount = todoStates.filter(Boolean).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="absolute w-3 h-3 bg-purple-200 rounded-full animate-pulse opacity-20"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 4}s`,
            animationDuration: `${4 + Math.random() * 2}s`,
          }}
        />
      ))}

      {showSaveNotification && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-30 animate-bounce">
          ✓ {t.autoSaved}
        </div>
      )}

      <FloatingElement delay={0.3}>
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-4xl w-full max-h-[80vh] overflow-hidden backdrop-blur-sm bg-opacity-95">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <BounceButton onClick={onBack} className="mr-4 p-2 rounded-full hover:bg-gray-100">
                <ArrowLeft className="w-6 h-6" />
              </BounceButton>
              <h1 className="text-3xl font-bold text-gray-800">{t.futureList}</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-purple-600 bg-purple-100 px-3 py-1 rounded-full animate-pulse">
                {t.completed}: {completedCount}/{todos.length - 1}
              </div>
              <BounceButton
                onClick={resetAllTodos}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                {t.reset}
              </BounceButton>
            </div>
          </div>
          <div className="overflow-y-auto max-h-96 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {todos.map((todo, index) => (
              <div
                key={index}
                className={`rounded-lg p-3 transition-all duration-300 hover:scale-105 ${
                  index === todos.length - 1
                    ? "bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-300"
                    : todoStates[index]
                      ? "bg-gradient-to-r from-green-100 to-green-200 border-2 border-green-300 shadow-lg"
                      : "bg-gradient-to-r from-purple-100 to-pink-100 hover:shadow-md"
                }`}
              >
                <div className="flex items-center">
                  {index !== todos.length - 1 && (
                    <input
                      type="checkbox"
                      className="mr-3 w-4 h-4"
                      checked={todoStates[index] || false}
                      onChange={() => handleTodoChange(index)}
                    />
                  )}
                  <span
                    className={`text-sm ${
                      index === todos.length - 1
                        ? "font-bold text-orange-600 text-center w-full"
                        : todoStates[index]
                          ? "line-through text-gray-500"
                          : ""
                    }`}
                  >
                    {todo}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center text-sm text-gray-500">
            {t.progressSaved} • {t.visitCount}: {visitedPages.filter((page) => page === "todo").length}
          </div>
        </div>
      </FloatingElement>
    </div>
  )
}

// 恋爱日历页面
const CalendarPage = ({
  onBack,
  visitedPages,
  setVisitedPages,
  language,
}: {
  onBack: () => void
  visitedPages: string[]
  setVisitedPages: (pages: string[]) => void
  language: "zh" | "ja" | "en"
}) => {
  const [events, setEvents] = useState<any[]>([])
  const [showAddEvent, setShowAddEvent] = useState(false)
  const [newEvent, setNewEvent] = useState({ date: "", title: "", description: "" })
  const [showSaveNotification, setShowSaveNotification] = useState(false)

  const translations = {
    zh: {
      loveCalendar: "📅 恋爱日历",
      addMemory: "添加回忆",
      saved: "已保存",
      recordMemories: "记录我们一起度过的美好时光",
      visitCount: "访问次数",
      addNewMemory: "添加新回忆",
      date: "日期",
      title: "标题",
      description: "描述",
      enterTitle: "输入回忆标题...",
      enterDescription: "描述这个特别的日子...",
      add: "添加",
      cancel: "取消",
    },
    ja: {
      loveCalendar: "📅 恋愛カレンダー",
      addMemory: "思い出を追加",
      saved: "保存済み",
      recordMemories: "一緒に過ごした美しい時間を記録",
      visitCount: "訪問回数",
      addNewMemory: "新しい思い出を追加",
      date: "日付",
      title: "タイトル",
      description: "説明",
      enterTitle: "思い出のタイトルを入力...",
      enterDescription: "この特別な日について説明...",
      add: "追加",
      cancel: "キャンセル",
    },
    en: {
      loveCalendar: "📅 Love Calendar",
      addMemory: "Add Memory",
      saved: "Saved",
      recordMemories: "Recording our beautiful moments together",
      visitCount: "Visit count",
      addNewMemory: "Add New Memory",
      date: "Date",
      title: "Title",
      description: "Description",
      enterTitle: "Enter memory title...",
      enterDescription: "Describe this special day...",
      add: "Add",
      cancel: "Cancel",
    },
  }

  const t = translations[language]

  // 多语言默认事件
  const getDefaultEvents = () => {
    const defaultEvents = {
      zh: [
        { date: "2024-08-18", title: "添加好友", description: "我们第一次相遇 💫" },
        { date: "2024-11-05", title: "Seiki的生日", description: "特别的生日 🎂" },
        { date: "2024-12-11", title: "Confession（告白）", description: "勇敢说出心意的那一天 💕" },
        { date: "2025-01-08", title: "在一起", description: "爱情的开始 💕" },
        { date: "2025-01-08", title: "第一次见面开始", description: "2025.1.8-1.14 第一次见面 ✈️" },
        { date: "2025-04-17", title: "第二次见面开始", description: "2025.4.17-4.24 第二次见面 ✈️" },
        { date: "2025-04-18", title: "恋爱一百天", description: "我们在一起100天了！🎉" },
        { date: "2025-06-25", title: "第三次见面开始", description: "2025.6.25-7.2 第三次见面 ✈️" },
        { date: "2025-07-27", title: "恋爱两百天", description: "我们在一起200天了！🎊" },
        { date: "2025-08-04", title: "生日快乐", description: "特别的日子 🎂" },
      ],
      ja: [
        { date: "2024-08-18", title: "友達追加", description: "私たちの初めての出会い 💫" },
        { date: "2024-11-05", title: "Seikiの誕生日", description: "特別な誕生日 🎂" },
        { date: "2024-12-11", title: "告白", description: "勇気を出して気持ちを伝えた日 💕" },
        { date: "2025-01-08", title: "付き合い開始", description: "愛の始まり 💕" },
        { date: "2025-01-08", title: "初めての会う開始", description: "2025.1.8-1.14 初めての会う ✈️" },
        { date: "2025-04-17", title: "二回目の会う開始", description: "2025.4.17-4.24 二回目の会う ✈️" },
        { date: "2025-04-18", title: "恋愛100日", description: "私たちが付き合って100日になりました！🎉" },
        { date: "2025-06-25", title: "三回目の会う開始", description: "2025.6.25-7.2 三回目の会う ✈️" },
        { date: "2025-07-27", title: "恋愛200日", description: "私たちが付き合って200日になりました！🎊" },
        { date: "2025-08-04", title: "誕生日おめでとう", description: "特別な日 🎂" },
      ],
      en: [
        { date: "2024-08-18", title: "Added Friend", description: "Our first encounter 💫" },
        { date: "2024-11-05", title: "Seiki's Birthday", description: "Special birthday 🎂" },
        { date: "2024-12-11", title: "Confession", description: "The day we bravely expressed our feelings 💕" },
        { date: "2025-01-08", title: "Started Dating", description: "The beginning of love 💕" },
        { date: "2025-01-08", title: "First Meeting Start", description: "2025.1.8-1.14 First meeting ✈️" },
        { date: "2025-04-17", title: "Second Meeting Start", description: "2025.4.17-4.24 Second meeting ✈️" },
        { date: "2025-04-18", title: "100 Days in Love", description: "We've been together for 100 days! 🎉" },
        { date: "2025-06-25", title: "Third Meeting Start", description: "2025.6.25-7.2 Third meeting ✈️" },
        { date: "2025-07-27", title: "200 Days in Love", description: "We've been together for 200 days! 🎊" },
        { date: "2025-08-04", title: "Happy Birthday", description: "Special day ��" },
      ],
    }
    return defaultEvents[language] || defaultEvents.zh
  }

  useEffect(() => {
    const defaultEvents = getDefaultEvents()
    const savedEvents = storage.get(STORAGE_KEYS.CALENDAR_EVENTS, defaultEvents)
    setEvents(savedEvents)

    if (!visitedPages.includes("calendar")) {
      const newVisited = [...visitedPages, "calendar"]
      setVisitedPages(newVisited)
      storage.set(STORAGE_KEYS.VISITED_PAGES, newVisited)
    }
  }, [visitedPages, setVisitedPages, language])

  const addEvent = () => {
    if (newEvent.date && newEvent.title) {
      const updatedEvents = [...events, { ...newEvent, id: Date.now() }]
      setEvents(updatedEvents)
      storage.set(STORAGE_KEYS.CALENDAR_EVENTS, updatedEvents)
      setNewEvent({ date: "", title: "", description: "" })
      setShowAddEvent(false)
      setShowSaveNotification(true)
      setTimeout(() => setShowSaveNotification(false), 2000)
      playSuccessSound()
    }
  }

  const deleteEvent = (eventId: number) => {
    const updatedEvents = events.filter((event) => event.id !== eventId)
    setEvents(updatedEvents)
    storage.set(STORAGE_KEYS.CALENDAR_EVENTS, updatedEvents)
    setShowSaveNotification(true)
    setTimeout(() => setShowSaveNotification(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 bg-purple-200 rounded-full animate-pulse opacity-30"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${3 + Math.random() * 2}s`,
          }}
        />
      ))}

      {showSaveNotification && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-30 animate-bounce">
          ✓ {t.saved}
        </div>
      )}

      <FloatingElement delay={0.3}>
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto backdrop-blur-sm bg-opacity-95">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <BounceButton onClick={onBack} className="mr-4 p-2 rounded-full hover:bg-gray-100">
                <ArrowLeft className="w-6 h-6" />
              </BounceButton>
              <h1 className="text-3xl font-bold text-gray-800">{t.loveCalendar}</h1>
            </div>
            <BounceButton
              onClick={() => setShowAddEvent(true)}
              className="flex items-center gap-2 bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t.addMemory}
            </BounceButton>
          </div>

          {/* 时间轴 */}
          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-300 to-pink-300"></div>

            {events
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .map((event, index) => (
                <div key={event.id || index} className="relative flex items-start mb-8">
                  <div className="absolute left-6 w-4 h-4 bg-purple-400 rounded-full border-4 border-white shadow-lg"></div>
                  <div className="ml-16 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 shadow-lg border border-purple-200 w-full">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-sm text-purple-600 font-semibold mb-2">
                          {new Date(event.date).toLocaleDateString(
                            language === "zh" ? "zh-CN" : language === "ja" ? "ja-JP" : "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            },
                          )}
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2">{event.title}</h3>
                        <p className="text-gray-600">{event.description}</p>
                      </div>
                      {event.id && (
                        <BounceButton
                          onClick={() => deleteEvent(event.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <X className="w-4 h-4" />
                        </BounceButton>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>

          <div className="mt-8 text-center text-sm text-gray-500">
            {t.recordMemories} • {t.visitCount}: {visitedPages.filter((page) => page === "calendar").length}
          </div>
        </div>
      </FloatingElement>

      {/* 添加事件弹窗 */}
      {showAddEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-800 mb-4">{t.addNewMemory}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.date}</label>
                <input
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.title}</label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  placeholder={t.enterTitle}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.description}</label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  placeholder={t.enterDescription}
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <BounceButton
                onClick={addEvent}
                className="flex-1 bg-purple-500 text-white py-2 px-4 rounded-lg hover:bg-purple-600 transition-colors"
              >
                {t.add}
              </BounceButton>
              <BounceButton
                onClick={() => setShowAddEvent(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
              >
                {t.cancel}
              </BounceButton>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// 动画记录页面
const AnimePage = ({
  onBack,
  visitedPages,
  setVisitedPages,
  language,
}: {
  onBack: () => void
  visitedPages: string[]
  setVisitedPages: (pages: string[]) => void
  language: "zh" | "ja" | "en"
}) => {
  const [animeComments, setAnimeComments] = useState<{ [key: string]: { seiki: string; ryoma: string } }>({})
  const [editingAnime, setEditingAnime] = useState<{ id: string; person: "seiki" | "ryoma" } | null>(null)
  const [tempComment, setTempComment] = useState("")
  const [showSaveNotification, setShowSaveNotification] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

// 从Supabase加载留言
const loadCommentsFromSupabase = async () => {
  try {
    setIsLoading(true)
    setError(null)
    
    console.log('开始从Supabase加载留言...')
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log('Supabase Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '已设置' : '未设置')
    
    const { data, error } = await supabase
      .from('anime_comments')
      .select('*')
      .order('created_at', { ascending: true })
    
    if (error) {
      console.error('Supabase错误:', error)
      throw error
    }
    
    console.log('从Supabase获取到的数据:', data)
    
    // 将数据转换为原来的格式
    const comments: { [key: string]: { seiki: string; ryoma: string } } = {}
    data?.forEach((item: any) => {
      if (!comments[item.anime_id]) {
        comments[item.anime_id] = { seiki: '', ryoma: '' }
      }
      comments[item.anime_id][item.person as "seiki" | "ryoma"] = item.comment
    })
    
    console.log('转换后的留言数据:', comments)
    setAnimeComments(comments)
  } catch (err: any) {
    console.error('加载留言失败:', err)
    setError(err.message || '加载留言失败')
  } finally {
    setIsLoading(false)
  }
}

  const translations = {
    zh: {
      animeRecord: "🎬 我们的动画记录",
      total: "总共",
      episodes: "部",
      watched: "✅ 已看完",
      watching: "📺 正在看",
      planned: "📋 计划观看",
      commentSaved: "留言已保存",
      visitCount: "访问次数",
      togetherTime: "一起追番的美好时光",
      noComment: "还没有留言...",
      editComment: "编辑留言",
      addComment: "添加留言",
      save: "保存",
      cancel: "取消",
      seikiComment: "写下Seiki的感想...",
      ryomaComment: "写下Ryoma的感想...",
      seikiWatching: "记录Seiki的观看心得...",
      ryomaWatching: "记录Ryoma的观看心得...",
      seikiPlanned: "写下Seiki期待的理由...",
      ryomaPlanned: "写下Ryoma期待的理由...",
    },
    ja: {
      animeRecord: "🎬 私たちのアニメ記録",
      total: "合計",
      episodes: "作品",
      watched: "✅ 視聴完了",
      watching: "📺 視聴中",
      planned: "📋 視聴予定",
      commentSaved: "コメント保存済み",
      visitCount: "訪問回数",
      togetherTime: "一緒にアニメを見る美しい時間",
      noComment: "まだコメントがありません...",
      editComment: "コメント編集",
      addComment: "コメント追加",
      save: "保存",
      cancel: "キャンセル",
      seikiComment: "Seikiの感想を書く...",
      ryomaComment: "Ryomaの感想を書く...",
      seikiWatching: "Seikiの視聴感想を記録...",
      ryomaWatching: "Ryomaの視聴感想を記録...",
      seikiPlanned: "Seikiの期待理由を書く...",
      ryomaPlanned: "Ryomaの期待理由を書く...",
    },
    en: {
      animeRecord: "🎬 Our Anime Record",
      total: "Total",
      episodes: "series",
      watched: "✅ Completed",
      watching: "📺 Watching",
      planned: "📋 Plan to Watch",
      commentSaved: "Comment saved",
      visitCount: "Visit count",
      togetherTime: "Beautiful time watching anime together",
      noComment: "No comments yet...",
      editComment: "Edit comment",
      addComment: "Add comment",
      save: "Save",
      cancel: "Cancel",
      seikiComment: "Write Seiki's thoughts...",
      ryomaComment: "Write Ryoma's thoughts...",
      seikiWatching: "Record Seiki's viewing experience...",
      ryomaWatching: "Record Ryoma's viewing experience...",
      seikiPlanned: "Write Seiki's expectations...",
      ryomaPlanned: "Write Ryoma's expectations...",
    },
  }

  const t = translations[language]

  const watchedAnimes = [
    {
      id: "legend-of-hei-tv",
      name: "罗小黑战记TV版",
      image: "https://raw.githubusercontent.com/seiki041105/love-timer/master/罗小黑战记TV版.jpg",
      date: "2024.12",
      status: "已看完",
    },
    {
      id: "legend-of-hei-movie",
      name: "罗小黑战记电影1",
      image: "https://raw.githubusercontent.com/seiki041105/love-timer/master/罗小黑战记电影1.jpg",
      date: "2024.12",
      status: "已看完",
    },
    {
      id: "dr-stone-s2",
      name: "石纪元第二季",
      image: "https://raw.githubusercontent.com/seiki041105/love-timer/master/石纪元第二季.jpg",
      date: "2024.11",
      status: "已看完",
    },
    {
      id: "dr-stone-s3",
      name: "石纪元第三季",
      image: "https://raw.githubusercontent.com/seiki041105/love-timer/master/石纪元第三季.jpg",
      date: "2024.12",
      status: "已看完",
    },
    {
      id: "dr-stone-s4-part1",
      name: "石纪元第四季（上半）",
      image: "https://raw.githubusercontent.com/seiki041105/love-timer/master/石纪元第四季（上半）.jpg",
      date: "2024.12",
      status: "已看完",
    },
    {
      id: "5cm-per-second",
      name: "秒速五厘米",
      image: "https://raw.githubusercontent.com/seiki041105/love-timer/master/秒速五厘米.jpg",
      date: "2024.10",
      status: "已看完",
    },
  ]

  const watchingAnimes = [
    {
      id: "steins-gate",
      name: "命运石之门",
      image: "https://raw.githubusercontent.com/seiki041105/love-timer/master/命运石之门.jpg",
      date: "进行中",
      status: "正在看",
    },
    {
      id: "hunter-x-hunter",
      name: "全职猎人",
      image: "https://raw.githubusercontent.com/seiki041105/love-timer/master/全职猎人.jpg",
      date: "进行中",
      status: "正在看",
    },
    {
      id: "chiikawa",
      name: "chiikawa",
      image: "https://raw.githubusercontent.com/seiki041105/love-timer/master/chiikawa.jpg",
      date: "进行中",
      status: "正在看",
    },
    {
      id: "dr-stone-s4-part2",
      name: "石纪元第四季（下半）",
      image: "https://raw.githubusercontent.com/seiki041105/love-timer/master/石纪元第四季（下半）.jpg",
      date: "进行中",
      status: "正在看",
    },
  ]

  const plannedAnimes = [
    {
      id: "demon-slayer",
      name: "鬼灭之刃",
      image: "https://raw.githubusercontent.com/seiki041105/love-timer/master/鬼灭之刃.jpg",
      date: "计划中",
      status: "想看",
    },
  ]

  useEffect(() => {
    // 从Supabase加载留言
    loadCommentsFromSupabase()

    // 记录访问页面
    if (!visitedPages.includes("anime")) {
      const newVisited = [...visitedPages, "anime"]
      setVisitedPages(newVisited)
      storage.set(STORAGE_KEYS.VISITED_PAGES, newVisited)
    }
  }, [visitedPages, setVisitedPages])

  const handleSaveComment = async (animeId: string, person: "seiki" | "ryoma") => {
    if (!tempComment.trim()) return
    
    try {
      setIsSaving(true)
      setError(null)
      
      // 检查是否已存在留言
      const { data: existingData, error: checkError } = await supabase
        .from('anime_comments')
        .select('*')
        .eq('anime_id', animeId)
        .eq('person', person)
        .limit(1)
      
      if (checkError) {
        console.error('检查现有留言时出错:', checkError)
        throw checkError
      }
      
      if (existingData && existingData.length > 0) {
        // 更新现有留言
        const { error } = await supabase
          .from('anime_comments')
          .update({ 
            comment: tempComment,
            updated_at: new Date().toISOString()
          })
          .eq('anime_id', animeId)
          .eq('person', person)
        
        if (error) throw error
      } else {
        // 插入新留言
        const { error } = await supabase
          .from('anime_comments')
          .insert({
            anime_id: animeId,
            person: person,
            comment: tempComment
          })
        
        if (error) throw error
      }
      
      // 更新本地状态
      const newComments = {
        ...animeComments,
        [animeId]: {
          ...animeComments[animeId],
          [person]: tempComment,
        },
      }
      setAnimeComments(newComments)
      
      setEditingAnime(null)
      setTempComment("")
      setShowSaveNotification(true)
      setTimeout(() => setShowSaveNotification(false), 2000)
      playSuccessSound()
      
    } catch (err: any) {
      setError(err.message || '保存留言失败')
      console.error('保存留言失败:', err)
    } finally {
      setIsSaving(false)
    }
  }

  const startEditing = (animeId: string, person: "seiki" | "ryoma") => {
    setEditingAnime({ id: animeId, person })
    setTempComment(animeComments[animeId]?.[person] || "")
  }

  const getPlaceholder = (anime: any, person: "seiki" | "ryoma") => {
    if (anime.status === "已看完") {
      return person === "seiki" ? t.seikiComment : t.ryomaComment
    } else if (anime.status === "正在看") {
      return person === "seiki" ? t.seikiWatching : t.ryomaWatching
    } else {
      return person === "seiki" ? t.seikiPlanned : t.ryomaPlanned
    }
  }

  const renderAnimeSection = (animes: any[], title: string, bgColor: string, textColor: string) => (
    <div className="mb-8">
      <h2 className={`text-2xl font-bold ${textColor} mb-4 flex items-center`}>
        {title} ({animes.length})
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {animes.map((anime) => (
          <FloatingElement key={anime.id} delay={Math.random()}>
            <div
              className={`${bgColor} rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-opacity-30`}
            >
              <div className="aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden mb-3 shadow-inner">
                <img src={anime.image || "/placeholder.svg"} alt={anime.name} className="w-full h-full object-cover" />
              </div>
              <h3 className="font-bold text-gray-800 mb-2">{anime.name}</h3>
              <div className="text-sm text-gray-600 mb-2">📅 {anime.date}</div>
              <div
                className={`text-xs px-2 py-1 rounded-full inline-block mb-3 ${
                  anime.status === "已看完"
                    ? "text-green-600 bg-green-100"
                    : anime.status === "正在看"
                      ? "text-blue-600 bg-blue-100"
                      : "text-purple-600 bg-purple-100"
                }`}
              >
                {anime.status}
              </div>

              {/* 留言区域 - 分为Seiki和Ryoma */}
              <div className="mt-3 space-y-3">
                {/* Seiki的留言 */}
                <div className="bg-pink-50 rounded-lg p-3 border border-pink-200">
                  <div className="text-xs font-semibold text-pink-600 mb-2">👤 Seiki</div>
                  {editingAnime?.id === anime.id && editingAnime?.person === "seiki" ? (
                    <div className="space-y-2">
                      <textarea
                        value={tempComment}
                        onChange={(e) => setTempComment(e.target.value)}
                        placeholder={getPlaceholder(anime, "seiki")}
                        className="w-full p-2 text-sm border border-gray-300 rounded-lg resize-none"
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <BounceButton
                          onClick={() => handleSaveComment(anime.id, "seiki")}
                          className="px-3 py-1 text-white text-xs rounded-lg bg-pink-500 hover:bg-pink-600"
                        >
                          {t.save}
                        </BounceButton>
                        <BounceButton
                          onClick={() => setEditingAnime(null)}
                          className="px-3 py-1 bg-gray-300 text-gray-700 text-xs rounded-lg hover:bg-gray-400"
                        >
                          {t.cancel}
                        </BounceButton>
                      </div>
                    </div>
                  ) : (
                    <div>
                      {animeComments[anime.id]?.seiki ? (
                        <div className="bg-white p-2 rounded-lg text-sm text-gray-700 mb-2 border">
                          💭 {animeComments[anime.id].seiki}
                        </div>
                      ) : (
                        <div className="text-xs text-gray-400 mb-2">{t.noComment}</div>
                      )}
                      <BounceButton
                        onClick={() => startEditing(anime.id, "seiki")}
                        className="text-xs hover:underline text-pink-600 hover:text-pink-800"
                      >
                        {animeComments[anime.id]?.seiki ? t.editComment : t.addComment}
                      </BounceButton>
                    </div>
                  )}
                </div>

                {/* Ryoma的留言 */}
                <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
                  <div className="text-xs font-semibold text-emerald-600 mb-2">👤 Ryoma</div>
                  {editingAnime?.id === anime.id && editingAnime?.person === "ryoma" ? (
                    <div className="space-y-2">
                      <textarea
                        value={tempComment}
                        onChange={(e) => setTempComment(e.target.value)}
                        placeholder={getPlaceholder(anime, "ryoma")}
                        className="w-full p-2 text-sm border border-gray-300 rounded-lg resize-none"
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <BounceButton
                          onClick={() => handleSaveComment(anime.id, "ryoma")}
                          className="px-3 py-1 text-white text-xs rounded-lg bg-emerald-500 hover:bg-emerald-600"
                        >
                          {t.save}
                        </BounceButton>
                        <BounceButton
                          onClick={() => setEditingAnime(null)}
                          className="px-3 py-1 bg-gray-300 text-gray-700 text-xs rounded-lg hover:bg-gray-400"
                        >
                          {t.cancel}
                        </BounceButton>
                      </div>
                    </div>
                  ) : (
                    <div>
                      {animeComments[anime.id]?.ryoma ? (
                        <div className="bg-white p-2 rounded-lg text-sm text-gray-700 mb-2 border">
                          💭 {animeComments[anime.id].ryoma}
                        </div>
                      ) : (
                        <div className="text-xs text-gray-400 mb-2">{t.noComment}</div>
                      )}
                      <BounceButton
                        onClick={() => startEditing(anime.id, "ryoma")}
                        className="text-xs hover:underline text-emerald-600 hover:text-emerald-800"
                      >
                        {animeComments[anime.id]?.ryoma ? t.editComment : t.addComment}
                      </BounceButton>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </FloatingElement>
        ))}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {[...Array(10)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 bg-indigo-200 rounded-full animate-pulse opacity-30"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${3 + Math.random() * 2}s`,
          }}
        />
      ))}

      {showSaveNotification && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-30 animate-bounce">
          ✓ {t.commentSaved}
        </div>
      )}

      <FloatingElement delay={0.3}>
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-6xl w-full max-h-[90vh] overflow-y-auto backdrop-blur-sm bg-opacity-95">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <BounceButton onClick={onBack} className="mr-4 p-2 rounded-full hover:bg-gray-100">
                <ArrowLeft className="w-6 h-6" />
              </BounceButton>
              <h1 className="text-3xl font-bold text-gray-800">{t.animeRecord}</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-indigo-600 bg-indigo-100 px-3 py-1 rounded-full animate-pulse">
                {t.total} {watchedAnimes.length + watchingAnimes.length + plannedAnimes.length} {t.episodes}
              </div>
            </div>
          </div>

          {/* 已看完的动画 */}
          {renderAnimeSection(
            watchedAnimes,
            t.watched,
            "bg-gradient-to-br from-teal-50 to-cyan-100",
            "text-teal-600",
          )}

          {/* 正在看的动画 */}
          {renderAnimeSection(
            watchingAnimes,
            t.watching,
            "bg-gradient-to-br from-blue-50 to-indigo-100",
            "text-blue-600",
          )}

          {/* 计划看的动画 */}
          {renderAnimeSection(
            plannedAnimes,
            t.planned,
            "bg-gradient-to-br from-purple-50 to-pink-100",
            "text-purple-600",
          )}

          <div className="mt-8 text-center text-sm text-gray-500">
            {t.visitCount}: {visitedPages.filter((page) => page === "anime").length} • {t.togetherTime}
          </div>
        </div>
      </FloatingElement>
    </div>
  )
}

// 问答游戏页面 - 多语言支持版本
const QuizPage = ({
  onBack,
  visitedPages,
  setVisitedPages,
  language,
}: {
  onBack: () => void
  visitedPages: string[]
  setVisitedPages: (pages: string[]) => void
  language: "zh" | "ja" | "en"
}) => {
  const [selectedCategory, setSelectedCategory] = useState<"daily" | "r18" | null>(null)
  const [selectedCard, setSelectedCard] = useState<number | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState<any>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [answeredQuestions, setAnsweredQuestions] = useState<string[]>([])
  const [quizData, setQuizData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  const translations = {
    zh: {
      cardQuiz: "🃏 抽卡问答",
      restart: "重新开始",
      selectCategory: "选择问答类别",
      daily: "日常类",
      dailyDesc: "轻松有趣的日常话题",
      r18: "R18类",
      r18Desc: "私密的情侣话题",
      selectCard: "选择一张卡片",
      card: "卡片",
      roastTime: "💭 吐槽时间",
      tryAgain: "再来一次",
      answeredQuestions: "已回答问题",
      visitCount: "访问次数",
      loading: "加载中...",
      error: "加载失败，请重试",
    },
    ja: {
      cardQuiz: "🃏 カード問答",
      restart: "再開始",
      selectCategory: "問答カテゴリを選択",
      daily: "日常系",
      dailyDesc: "楽しい日常の話題",
      r18: "R18系",
      r18Desc: "プライベートなカップル話題",
      selectCard: "カードを選択",
      card: "カード",
      roastTime: "💭 ツッコミタイム",
      tryAgain: "もう一度",
      answeredQuestions: "回答済み質問",
      visitCount: "訪問回数",
      loading: "読み込み中...",
      error: "読み込みに失敗しました。再試行してください。",
    },
    en: {
      cardQuiz: "🃏 Card Quiz",
      restart: "Restart",
      selectCategory: "Select Quiz Category",
      daily: "Daily",
      dailyDesc: "Fun daily topics",
      r18: "R18",
      r18Desc: "Private couple topics",
      selectCard: "Select a Card",
      card: "Card",
      roastTime: "💭 Roast Time",
      tryAgain: "Try Again",
      answeredQuestions: "Answered questions",
      visitCount: "Visit count",
      loading: "Loading...",
      error: "Failed to load, please try again.",
    },
  }

  const t = translations[language]

  // 加载问答数据
  useEffect(() => {
    const loadQuizData = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/quiz-questions.json')
        if (response.ok) {
          const data = await response.json()
          setQuizData(data)
        } else {
          console.warn('无法加载问答数据文件')
          setQuizData(null)
        }
      } catch (error) {
        console.warn('加载问答数据文件失败:', error)
        setQuizData(null)
      } finally {
        setIsLoading(false)
      }
    }

    loadQuizData()
  }, [])

  // 安全的翻译获取函数
  const getQuestionTranslation = (question: any, field: 'question' | 'options' | 'results') => {
    if (!question || !question[language]) {
      return null
    }
    
    try {
      return question[language][field]
    } catch (error) {
      console.warn('获取问题翻译失败:', error)
      return null
    }
  }

  // 处理问题数据，添加多语言支持
  const processQuestions = (rawQuestions: any[]) => {
    if (!rawQuestions || !Array.isArray(rawQuestions)) {
      return []
    }

    return rawQuestions.map(q => {
      const translatedQuestion = getQuestionTranslation(q, 'question')
      const translatedOptions = getQuestionTranslation(q, 'options')
      const translatedResults = getQuestionTranslation(q, 'results')

      return {
        id: q.id,
        question: translatedQuestion || q.question || "问题加载失败",
        options: translatedOptions || q.options || {},
        results: translatedResults || q.results || {},
      }
    })
  }

  // 构建问题数据
  const questions = quizData ? {
    daily: processQuestions(quizData.daily || []),
    r18: processQuestions(quizData.r18 || []),
  } : {
    daily: [],
    r18: [],
  }

  useEffect(() => {
    const savedAnswered = storage.get(STORAGE_KEYS.QUIZ_ANSWERED, [])
    setAnsweredQuestions(savedAnswered)

    if (!visitedPages.includes("quiz")) {
      const newVisited = [...visitedPages, "quiz"]
      setVisitedPages(newVisited)
      storage.set(STORAGE_KEYS.VISITED_PAGES, newVisited)
    }
  }, [visitedPages, setVisitedPages])

  const selectCard = (cardIndex: number) => {
    if (!selectedCategory) return

    const availableQuestions = questions[selectedCategory].filter((q) => !answeredQuestions.includes(q.id))
    if (availableQuestions.length === 0) return

    const randomQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)]
    setSelectedCard(cardIndex)
    setCurrentQuestion(randomQuestion)
    playSuccessSound()
  }

  const selectAnswer = (answer: string) => {
    setSelectedAnswer(answer)
    setShowResult(true)

    // 标记问题为已回答
    const newAnswered = [...answeredQuestions, currentQuestion.id]
    setAnsweredQuestions(newAnswered)
    storage.set(STORAGE_KEYS.QUIZ_ANSWERED, newAnswered)
  }

  const resetQuiz = () => {
    setSelectedCategory(null)
    setSelectedCard(null)
    setCurrentQuestion(null)
    setSelectedAnswer(null)
    setShowResult(false)
  }

  // 加载状态
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full text-center">
          <div className="text-4xl mb-4 animate-spin"></div>
          <p className="text-gray-600">{t.loading}</p>
        </div>
      </div>
    )
  }

  // 错误状态
  if (!quizData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full text-center">
          <div className="text-4xl mb-4">❌</div>
          <p className="text-gray-600 mb-4">{t.error}</p>
          <BounceButton
            onClick={() => window.location.reload()}
            className="bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 transition-colors"
          >
            {t.tryAgain}
          </BounceButton>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {[...Array(10)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 bg-indigo-200 rounded-full animate-pulse opacity-30"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${3 + Math.random() * 2}s`,
          }}
        />
      ))}

      <FloatingElement delay={0.3}>
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full backdrop-blur-sm bg-opacity-95">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <BounceButton onClick={onBack} className="mr-4 p-2 rounded-full hover:bg-gray-100">
                <ArrowLeft className="w-6 h-6" />
              </BounceButton>
              <h1 className="text-3xl font-bold text-gray-800">{t.cardQuiz}</h1>
            </div>
            {(selectedCategory || currentQuestion) && (
              <BounceButton
                onClick={resetQuiz}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                {t.restart}
              </BounceButton>
            )}
          </div>

          {!selectedCategory ? (
            /* 选择类别 */
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-700 mb-8">{t.selectCategory}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <BounceButton
                  onClick={() => setSelectedCategory("daily")}
                  className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-blue-200 hover:border-blue-300"
                >
                  <div className="text-6xl mb-4">💬</div>
                  <h3 className="text-xl font-bold text-blue-600 mb-2">{t.daily}</h3>
                  <p className="text-gray-600">{t.dailyDesc}</p>
                </BounceButton>
                <BounceButton
                  onClick={() => setSelectedCategory("r18")}
                  className="bg-gradient-to-br from-pink-100 to-rose-100 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-pink-200 hover:border-pink-300"
                >
                  <div className="text-6xl mb-4">💕</div>
                  <h3 className="text-xl font-bold text-pink-600 mb-2">{t.r18}</h3>
                  <p className="text-gray-600">{t.r18Desc}</p>
                </BounceButton>
              </div>
            </div>
          ) : !currentQuestion ? (
            /* 抽卡 */
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-700 mb-8">{t.selectCard}</h2>
              <div className="grid grid-cols-3 gap-6">
                {[0, 1, 2].map((cardIndex) => (
                  <BounceButton
                    key={cardIndex}
                    onClick={() => selectCard(cardIndex)}
                    className="bg-gradient-to-br from-purple-100 to-indigo-100 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-purple-200 hover:border-purple-300 aspect-[3/4] flex flex-col items-center justify-center"
                  >
                    <div className="text-6xl mb-4 animate-bounce">🃏</div>
                    <p className="text-purple-600 font-semibold">
                      {t.card} {cardIndex + 1}
                    </p>
                  </BounceButton>
                ))}
              </div>
            </div>
          ) : !showResult ? (
            /* 显示问题 */
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-700 mb-8">{currentQuestion.question}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(currentQuestion.options).map(([key, option]) => (
                  <BounceButton
                    key={key}
                    onClick={() => selectAnswer(key)}
                    className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-gray-200 hover:border-gray-300"
                  >
                    <div className="text-lg font-semibold text-gray-700">
                      {key.toUpperCase()}. {option}
                    </div>
                  </BounceButton>
                ))}
              </div>
            </div>
          ) : (
            /* 显示结果 */
            <div className="text-center">
              <h2 className="text-2xl font-bold text-purple-600 mb-8">{t.roastTime}</h2>
              <div className="bg-gradient-to-br from-purple-50 to-pink-100 rounded-2xl p-8 shadow-lg border-2 border-purple-200 relative">
                <div className="absolute -top-3 left-8 w-6 h-6 bg-purple-50 transform rotate-45 border-l-2 border-t-2 border-purple-200"></div>
                <div className="text-lg text-gray-700 italic">{currentQuestion.results[selectedAnswer]}</div>
              </div>
              <BounceButton
                onClick={resetQuiz}
                className="mt-6 bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 transition-colors"
              >
                {t.tryAgain}
              </BounceButton>
            </div>
          )}

          <div className="mt-8 text-center text-sm text-gray-500">
            {t.answeredQuestions}: {answeredQuestions.length} • {t.visitCount}:{" "}
            {visitedPages.filter((page) => page === "quiz").length}
          </div>
        </div>
      </FloatingElement>
    </div>
  )
}

// 生日蛋糕页面 - 自动播放版本
const BirthdayPage = ({
  onBack,
  visitedPages,
  setVisitedPages,
  language,
}: {
  onBack: () => void
  visitedPages: string[]
  setVisitedPages: (pages: string[]) => void
  language: "zh" | "ja" | "en"
}) => {
  const [candleBlown, setCandleBlown] = useState(false)
  const [showFireworks, setShowFireworks] = useState(false)
  const [showSaveNotification, setShowSaveNotification] = useState(false)

  const translations = {
    zh: {
      birthdayCake: "🎂 生日蛋糕",
      reset: "重置",
      stateSaved: "状态已保存",
      happyBirthday: "8.4 生日快乐！",
      makeWish: "请闭上眼睛许愿，在许愿后点击熄灭蜡烛",
      wishComeTrue: "🎉 愿望成真！生日快乐！",
      visitCount: "访问次数",
      autoPlaying: "🎵 自动播放生日歌中...",
    },
    ja: {
      birthdayCake: "🎂 バースデーケーキ",
      reset: "リセット",
      stateSaved: "状態保存済み",
      happyBirthday: "8.4 お誕生日おめでとう！",
      makeWish: "目を閉じて願い事をして、その後ろうそくを消してください",
      wishComeTrue: "🎉 願いが叶いますように！お誕生日おめでとう！",
      visitCount: "訪問回数",
      autoPlaying: "🎵 バースデーソング自動再生中...",
    },
    en: {
      birthdayCake: "🎂 Birthday Cake",
      reset: "Reset",
      stateSaved: "State saved",
      happyBirthday: "8.4 Happy Birthday!",
      makeWish: "Please close your eyes and make a wish, then click to blow out the candles",
      wishComeTrue: "🎉 Wish come true! Happy Birthday!",
      visitCount: "Visit count",
      autoPlaying: "🎵 Auto playing birthday song...",
    },
  }

  const t = translations[language]

  useEffect(() => {
    const savedCandleState = storage.get(STORAGE_KEYS.CANDLE_BLOWN, false)
    setCandleBlown(savedCandleState)

    if (!visitedPages.includes("birthday")) {
      const newVisited = [...visitedPages, "birthday"]
      setVisitedPages(newVisited)
      storage.set(STORAGE_KEYS.VISITED_PAGES, newVisited)
    }

    // 自动播放生日歌 - 只播放一遍
    playFullBirthdaySong()
  }, [visitedPages, setVisitedPages])

  const blowCandle = () => {
    if (!candleBlown) {
      setCandleBlown(true)
      setShowFireworks(true)
      storage.set(STORAGE_KEYS.CANDLE_BLOWN, true)

      playFireworkSound()

      setShowSaveNotification(true)
      setTimeout(() => setShowSaveNotification(false), 2000)
      setTimeout(() => setShowFireworks(false), 4000)
    }
  }

  const resetBirthday = () => {
    setCandleBlown(false)
    setShowFireworks(false)
    storage.set(STORAGE_KEYS.CANDLE_BLOWN, false)

    setShowSaveNotification(true)
    setTimeout(() => setShowSaveNotification(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {showSaveNotification && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-30 animate-bounce">
          ✓ {t.stateSaved}
        </div>
      )}

      {[...Array(60)].map((_, i) => (
        <div
          key={i}
          className="absolute bg-white rounded-full animate-pulse"
          style={{
            width: `${1 + Math.random() * 2}px`,
            height: `${1 + Math.random() * 2}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${2 + Math.random() * 2}s`,
          }}
        />
      ))}

      {showFireworks && (
        <>
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute"
              style={{
                left: `${Math.random() * 80 + 10}%`,
                top: `${Math.random() * 60 + 20}%`,
                animationDelay: `${i * 0.3}s`,
                animationDuration: "2s",
                animationName: "firework",
                animationIterationCount: "1",
              }}
            >
              {[...Array(8)].map((_, j) => (
                <div
                  key={j}
                  className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                  style={{
                    animationDelay: `${i * 0.3}s`,
                    animationDuration: "2s",
                    animationName: "fireworkParticle",
                    animationIterationCount: "1",
                    transform: `rotate(${j * 45}deg) translateY(-50px)`,
                  }}
                />
              ))}
            </div>
          ))}
        </>
      )}

      <FloatingElement delay={0.2}>
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full relative z-10 backdrop-blur-sm bg-opacity-95">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <BounceButton onClick={onBack} className="mr-4 p-2 rounded-full hover:bg-gray-100">
                <ArrowLeft className="w-6 h-6" />
              </BounceButton>
              <h1 className="text-3xl font-bold text-gray-800">{t.birthdayCake}</h1>
            </div>
            <BounceButton
              onClick={resetBirthday}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              {t.reset}
            </BounceButton>
          </div>

          <div className="text-center mb-8">
            <div className="text-2xl font-bold text-purple-600 mb-4 animate-pulse">{t.happyBirthday}</div>

            <div className="relative inline-block mb-6">
              <div className="text-8xl animate-float">🎂</div>
              {!candleBlown && (
                <BounceButton onClick={blowCandle} className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="text-4xl animate-bounce">🕯️2️⃣1️⃣</div>
                </BounceButton>
              )}
              {candleBlown && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="text-4xl opacity-50">💨2️⃣2️⃣</div>
                </div>
              )}
            </div>

            <div className="mb-6">
              <div className="text-6xl animate-spin" style={{ animationDuration: "3s" }}>
                💿
              </div>
              <p className="text-sm text-gray-600 mt-2">{t.autoPlaying}</p>
            </div>

            <div className="h-8 w-full flex items-center justify-center">
              <div className="w-80 mx-auto">
                {!candleBlown ? (
                  <p className="text-lg text-gray-700 animate-pulse text-center">{t.makeWish}</p>
                ) : (
                  <p className="text-lg text-green-600 font-semibold animate-bounce text-center">{t.wishComeTrue}</p>
                )}
              </div>
            </div>

            <div className="mt-4 text-sm text-gray-500">
              {t.visitCount}: {visitedPages.filter((page) => page === "birthday").length}
            </div>
          </div>
        </div>
      </FloatingElement>
    </div>
  )
}

// 做饭游戏页面 - 增强版本
const CookingGame = ({
  onBack,
  visitedPages,
  setVisitedPages,
  language,
}: {
  onBack: () => void
  visitedPages: string[]
  setVisitedPages: (pages: string[]) => void
  language: "zh" | "ja" | "en"
}) => {
  const [gameStep, setGameStep] = useState(0)
  const [ingredients, setIngredients] = useState({
    flour: 0,
    water: 0,
    meat: 0,
    seasoning: 0,
  })
  const [isCompleted, setIsCompleted] = useState(false)
  const [showSaveNotification, setShowSaveNotification] = useState(false)
  const [isCooking, setIsCooking] = useState(false)
  const [cookingProgress, setCookingProgress] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)
  const [backgroundParticles, setBackgroundParticles] = useState<Array<{
    left: string
    top: string
    animationDelay: string
    animationDuration: string
  }>>([])

  const translations = {
    zh: {
      cookingGame: "👨‍🍳 制作小笼包",
      restart: "重新开始",
      completed: "🎉 小笼包制作完成！",
      progress: "制作进度",
      step: "步骤",
      kitchenStation: "🏠 厨房操作台",
      cooking: "小笼包制作中...",
      steamingProgress: "正在蒸制小笼包...",
      steamProgress: "蒸制进度",
      waitPatiently: "请耐心等待，美味即将出炉...",
      freshSteamed: "热腾腾的小笼包新鲜出炉，快来品尝吧！",
      masterSkill: "🏆 制作成功",
      skillDesc: "你已经掌握了制作小笼包的技巧！",
      followSteps: "跟着步骤一起制作美味的小笼包吧！",
    },
    ja: {
      cookingGame: "👨‍🍳 小籠包作り",
      restart: "再開始",
      completed: "🎉 小籠包完成！",
      progress: "制作進捗",
      step: "ステップ",
      kitchenStation: "🏠 キッチン作業台",
      cooking: "小籠包制作中...",
      steamingProgress: "小籠包を蒸し中...",
      steamProgress: "蒸し進捗",
      waitPatiently: "しばらくお待ちください、美味しい料理がもうすぐ完成します...",
      freshSteamed: "熱々の小籠包が完成しました！ぜひお召し上がりください！",
      masterSkill: "🏆 制作成功",
      skillDesc: "小籠包作りのスキルをマスターしました！",
      followSteps: "ステップに従って美味しい小籠包を作りましょう！",
    },
    en: {
      cookingGame: "👨‍🍳 Making Xiaolongbao",
      restart: "Restart",
      completed: "🎉 Xiaolongbao completed!",
      progress: "Cooking progress",
      step: "Step",
      kitchenStation: "🏠 Kitchen Station",
      cooking: "Making xiaolongbao...",
      steamingProgress: "Steaming xiaolongbao...",
      steamProgress: "Steaming progress",
      waitPatiently: "Please wait patiently, delicious food is coming...",
      freshSteamed: "Hot steamed xiaolongbao is ready, come and taste it!",
      masterSkill: "🏆 Success",
      skillDesc: "You have mastered the skill of making xiaolongbao!",
      followSteps: "Follow the steps to make delicious xiaolongbao together!",
    },
  }

  const t = translations[language]

  const steps = [
    {
      id: "flour",
      name: "添加面粉",
      emoji: "🌾",
      target: 3,
      description: "点击面粉袋子3次添加面粉到碗里",
      tool: "🥣",
      sound: playClickSound,
    },
    {
      id: "water",
      name: "加水和面",
      emoji: "💧",
      target: 2,
      description: "点击水龙头2次接水",
      tool: "🚰",
      sound: playWaterSound,
    },
    {
      id: "meat",
      name: "准备肉馅",
      emoji: "🥩",
      target: 4,
      description: "用刀剁肉4次制作肉馅",
      tool: "🔪",
      sound: playChopSound,
    },
    {
      id: "seasoning",
      name: "调味",
      emoji: "🧂",
      target: 2,
      description: "点击调料瓶2次调味",
      tool: "🧂",
      sound: playClickSound,
    },
  ]

  useEffect(() => {
    if (!visitedPages.includes("cooking")) {
      const newVisited = [...visitedPages, "cooking"]
      setVisitedPages(newVisited)
      storage.set(STORAGE_KEYS.VISITED_PAGES, newVisited)
    }
  }, [visitedPages, setVisitedPages])

  const handleIngredientClick = (ingredientType: string) => {
    const currentStep = steps[gameStep]
    if (currentStep.id !== ingredientType || isCooking) return

    // 播放对应音效
    currentStep.sound()

    const newIngredients = {
      ...ingredients,
      [ingredientType]: ingredients[ingredientType as keyof typeof ingredients] + 1,
    }
    setIngredients(newIngredients)

    if (newIngredients[ingredientType as keyof typeof ingredients] >= currentStep.target) {
      if (gameStep < steps.length - 1) {
        setTimeout(() => {
          setGameStep(gameStep + 1)
          playSuccessSound()
        }, 500)
      } else {
        // 开始烹饪过程
        setTimeout(() => {
          setIsCooking(true)
          playCookingSound()

          // 烹饪进度条
          const cookingInterval = setInterval(() => {
            setCookingProgress((prev) => {
              if (prev >= 100) {
                clearInterval(cookingInterval)
                setIsCooking(false)
                setIsCompleted(true)
                setShowConfetti(true)
                playConfettiSound()
                playSuccessSound()
                setShowSaveNotification(true)
                setTimeout(() => setShowSaveNotification(false), 3000)
                setTimeout(() => setShowConfetti(false), 5000)
                return 100
              }
              return prev + 10
            })
          }, 300)
        }, 500)
      }
    }
  }

  const resetGame = () => {
    setGameStep(0)
    setIngredients({ flour: 0, water: 0, meat: 0, seasoning: 0 })
    setIsCompleted(false)
    setIsCooking(false)
    setCookingProgress(0)
    setShowConfetti(false)
  }

  const currentStep = steps[gameStep]
  const progress = isCooking
    ? 100
    : ((gameStep + ingredients[currentStep?.id as keyof typeof ingredients] / currentStep?.target) / steps.length) * 100

  // 生成背景粒子 - 只在客户端执行
  useEffect(() => {
    const particles = Array.from({ length: 8 }, () => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 3}s`,
      animationDuration: `${3 + Math.random() * 2}s`,
    }))
    setBackgroundParticles(particles)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-blue-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {backgroundParticles.map((particle, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 bg-green-200 rounded-full animate-pulse opacity-30"
          style={{
            left: particle.left,
            top: particle.top,
            animationDelay: particle.animationDelay,
            animationDuration: particle.animationDuration,
          }}
        />
      ))}

      <Confetti show={showConfetti} />

      {showSaveNotification && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-400 text-white px-4 py-2 rounded-lg shadow-lg z-30 animate-bounce">
          {t.completed}
        </div>
      )}

      <FloatingElement delay={0.3}>
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-4xl w-full backdrop-blur-sm bg-opacity-95">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <BounceButton onClick={onBack} className="mr-4 p-2 rounded-full hover:bg-gray-100">
                <ArrowLeft className="w-6 h-6" />
              </BounceButton>
              <h1 className="text-3xl font-bold text-gray-800">{t.cookingGame}</h1>
            </div>
            <BounceButton
              onClick={resetGame}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              {t.restart}
            </BounceButton>
          </div>

          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-gray-600">{t.progress}</span>
              <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-green-300 to-teal-400 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {!isCompleted ? (
            <>
              {!isCooking ? (
                <>
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-700 mb-2">
                      {t.step} {gameStep + 1}: {currentStep.name}
                    </h2>
                    <p className="text-gray-600 mb-4">{currentStep.description}</p>
                    <div className="text-sm text-teal-600 bg-teal-100 px-3 py-1 rounded-full inline-block">
                      进度: {ingredients[currentStep.id as keyof typeof ingredients]}/{currentStep.target}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-amber-50 to-yellow-100 rounded-2xl p-6 mb-8 border-2 border-amber-200">
                    <h3 className="text-lg font-semibold text-amber-700 mb-4 text-center">{t.kitchenStation}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      {steps.map((step, index) => (
                        <BounceButton
                          key={step.id}
                          onClick={() => handleIngredientClick(step.id)}
                          disabled={gameStep !== index}
                          className={`p-6 rounded-2xl transition-all duration-300 ${
                            gameStep === index
                              ? "bg-gradient-to-br from-green-200 to-teal-200 hover:from-green-300 hover:to-teal-300 shadow-lg hover:shadow-xl hover:scale-105"
                              : gameStep > index
                                ? "bg-gradient-to-br from-green-100 to-emerald-100 border-2 border-green-300"
                                : "bg-gray-100 opacity-50 cursor-not-allowed"
                          }`}
                        >
                          <div className="text-4xl mb-2">{step.tool}</div>
                          <div className="font-semibold text-gray-700">{step.name}</div>
                          {gameStep >= index && (
                            <div className="text-xs text-gray-500 mt-1">
                              {ingredients[step.id as keyof typeof ingredients]}/{step.target}
                            </div>
                          )}
                        </BounceButton>
                      ))}
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-6xl mb-4">
                      {gameStep === 0 && "🌾"} {/* 添加面粉 - 小麦 */}
                      {gameStep === 1 && "💧"} {/* 加水和面 - 水滴 */}
                      {gameStep === 2 && "🥩"} {/* 准备肉馅 - 肉 */}
                      {gameStep === 3 && "⏰"} {/* 调味 - 时钟 */}
                    </div>
                    <p className="text-gray-600">{t.cooking}</p>
                  </div>
                </>
              ) : (
                /* 烹饪过程 */
                <div className="text-center">
                  <div className="text-8xl mb-6 animate-bounce">🔥</div>
                  <h2 className="text-2xl font-bold text-orange-600 mb-4">{t.steamingProgress}</h2>

                  {/* 烹饪进度条 */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-orange-600">{t.steamProgress}</span>
                      <span className="text-sm text-orange-500">{cookingProgress}%</span>
                    </div>
                    <div className="w-full bg-orange-200 rounded-full h-4">
                      <div
                        className="bg-gradient-to-r from-orange-400 to-red-400 h-4 rounded-full transition-all duration-300 animate-pulse"
                        style={{ width: `${cookingProgress}%` }}
                      ></div>
                    </div>
                  </div>

                  <p className="text-gray-600">{t.waitPatiently}</p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center">
              <div className="mb-6">
                <img
                  src="/images/小笼包完成.png"
                  alt="完成的小笼包"
                  className="w-64 h-48 object-cover rounded-2xl mx-auto animate-pulse"
                  style={{
                    animation: "breathing 3s ease-in-out infinite",
                  }}
                />
              </div>
              <h2 className="text-3xl font-bold text-green-600 mb-4">{t.completed}</h2>
              <p className="text-lg text-gray-700 mb-6">{t.freshSteamed}</p>
              <div className="bg-gradient-to-br from-green-100 to-teal-100 rounded-2xl p-6 inline-block">
                <div className="text-2xl mb-2">{t.masterSkill}</div>
                <div className="text-sm text-gray-600">{t.skillDesc}</div>
              </div>
            </div>
          )}

          <div className="mt-8 text-center text-sm text-gray-500">{t.followSteps}</div>
        </div>
      </FloatingElement>
    </div>
  )
}

// 扭蛋游戏页面 - 增强版本
const GachaGame = ({
  onBack,
  visitedPages,
  setVisitedPages,
  language,
}: {
  onBack: () => void
  visitedPages: string[]
  setVisitedPages: (pages: string[]) => void
  language: "zh" | "ja" | "en"
}) => {
  const [isSpinning, setIsSpinning] = useState(false)
  const [currentPhoto, setCurrentPhoto] = useState<string | null>(null)
  const [collectedPhotos, setCollectedPhotos] = useState<string[]>([])
  const [showSaveNotification, setShowSaveNotification] = useState(false)
  const [spinAnimation, setSpinAnimation] = useState("")
  const [backgroundParticles, setBackgroundParticles] = useState<Array<{
    left: string
    top: string
    animationDelay: string
    animationDuration: string
  }>>([])

  const translations = {
    zh: {
      gachaGame: "🎰 美食扭蛋机",
      collection: "收集",
      reset: "重置",
      saved: "已保存收集",
      spinning: "扭蛋中...",
      spinOnce: "🎲 扭一次",
      obtained: "🎉 获得了：",
      foodCollection: "📚 美食收集册",
      chanceToGet: "每次扭蛋都有机会获得我们一起吃过的美食照片！",
      epic: "🌟 史诗",
      rare: "💎 稀有",
      common: "⭐ 普通",
      description: "描述",
    },
    ja: {
      gachaGame: "🎰 グルメガチャマシン",
      collection: "コレクション",
      reset: "リセット",
      saved: "コレクション保存済み",
      spinning: "ガチャ中...",
      spinOnce: "🎲 1回引く",
      obtained: "🎉 獲得：",
      foodCollection: "📚 グルメコレクション",
      chanceToGet: "ガチャを引くたびに一緒に食べた美食の写真を獲得するチャンス！",
      epic: "🌟 エピック",
      rare: "💎 レア",
      common: "⭐ コモン",
      description: "説明",
    },
    en: {
      gachaGame: "🎰 Food Gacha Machine",
      collection: "Collection",
      reset: "Reset",
      saved: "Collection saved",
      spinning: "Spinning...",
      spinOnce: "🎲 Spin Once",
      obtained: "🎉 Obtained:",
      foodCollection: "📚 Food Collection",
      chanceToGet: "Every spin gives you a chance to get photos of food we've eaten together!",
      epic: "🌟 Epic",
      rare: "💎 Rare",
      common: "⭐ Common",
      description: "Description",
    },
  }

  const t = translations[language]

  const foodPhotos = [
    {
      id: "cream-bacon-pasta",
      name: { zh: "奶油培根意大利面", ja: "クリームベーコンイタリアン", en: "Cream Bacon Pasta" },
      image: "/images/food/奶油培根意大利面.jpg",
      rarity: "epic",
      description: { 
        zh: "浓郁的奶油酱汁包裹着弹牙的意大利面，搭配香煎培根，每一口都是满满的幸福感。",
        ja: "濃厚なクリームソースでコシのあるイタリアンを包み、香ばしいベーコンと共に、一口ごとに満足感が溢れます。",
        en: "Al dente pasta wrapped in rich cream sauce with crispy bacon, every bite brings pure happiness."
      }
    },
    {
      id: "pudding-tiramisu",
      name: { zh: "布丁&提拉米苏组合", ja: "プリン&ティラミスセット", en: "Pudding & Tiramisu Combo" },
      image: "/images/food/布丁&提拉米苏组合.jpg",
      rarity: "epic",
      description: { 
        zh: "滑嫩的布丁与浓郁的提拉米苏完美搭配，甜而不腻，是下午茶的绝佳选择。",
        ja: "なめらかなプリンと濃厚なティラミスの完璧な組み合わせ、甘さ控えめでアフタヌーンティーに最適です。",
        en: "Smooth pudding paired with rich tiramisu, sweet but not overwhelming, perfect for afternoon tea."
      }
    },
    {
      id: "italian-bolognese",
      name: { zh: "意大利肉酱焗饭", ja: "イタリアンボロネーゼグラタン", en: "Italian Bolognese Gratin" },
      image: "/images/food/意大利肉酱焗饭.jpg",
      rarity: "rare",
      description: { 
        zh: "经典意式肉酱与芝士的完美融合，焗烤后香气四溢，让人食欲大开。",
        ja: "クラシックなイタリアンソースとチーズの完璧な融合、グラタン焼きで香り豊か、食欲をそそります。",
        en: "Classic Italian sauce perfectly blended with cheese, baked to perfection with irresistible aroma."
      }
    },
    {
      id: "hamburger-steak",
      name: { zh: "汉堡肉套餐", ja: "ハンバーグステーキセット", en: "Hamburger Steak Set" },
      image: "/images/food/汉堡肉套餐.jpg",
      rarity: "common",
      description: { 
        zh: "多汁的汉堡肉饼配以新鲜蔬菜和土豆泥，营养均衡又美味。",
        ja: "ジューシーなハンバーグステーキに新鮮な野菜とマッシュポテト、栄養バランスが良く美味しいです。",
        en: "Juicy hamburger steak with fresh vegetables and mashed potatoes, nutritious and delicious."
      }
    },
    {
      id: "corn-cream-soup",
      name: { zh: "玉米奶油浓汤", ja: "コーンクリームスープ", en: "Corn Cream Soup" },
      image: "/images/food/玉米奶油浓汤.jpg",
      rarity: "common",
      description: { 
        zh: "香甜的玉米与浓郁奶油的完美结合，温暖人心的一道汤品。",
        ja: "甘いコーンと濃厚なクリームの完璧な組み合わせ、心を温めるスープです。",
        en: "Sweet corn perfectly combined with rich cream, a heartwarming soup dish."
      }
    },
    {
      id: "curry-naan",
      name: { zh: "咖喱馕套餐", ja: "カレーナーンセット", en: "Curry Naan Set" },
      image: "/images/food/咖喱馕套餐.jpg",
      rarity: "rare",
      description: { 
        zh: "香浓的咖喱配以松软的馕饼，印度风味的完美呈现。",
        ja: "香り豊かなカレーにふわふわのナン、インド風味の完璧な表現です。",
        en: "Aromatic curry with fluffy naan bread, perfect presentation of Indian flavors."
      }
    },
    {
      id: "handmade-takoyaki",
      name: { zh: "手作love章鱼烧", ja: "手作りloveたこ焼き", en: "Handmade Love Takoyaki" },
      image: "/images/food/手作love章鱼烧.jpg",
      rarity: "epic",
      description: { 
        zh: "用心制作的章鱼烧，每一颗都充满爱意，外酥内嫩，章鱼鲜美。",
        ja: "心を込めて作ったたこ焼き、一つ一つに愛が込められ、外はサクサク、中はふわふわ、たこは新鮮です。",
        en: "Handmade takoyaki filled with love, crispy outside and tender inside with fresh octopus."
      }
    },
    {
      id: "melon-soda",
      name: { zh: "蜜瓜苏打", ja: "メロンソーダ", en: "Melon Soda" },
      image: "/images/food/蜜瓜苏打.jpg",
      rarity: "common",
      description: { 
        zh: "清爽的蜜瓜味苏打水，夏日解暑的最佳选择。",
        ja: "さわやかなメロン味のソーダ、夏の暑さを癒す最高の選択です。",
        en: "Refreshing melon-flavored soda, the best choice for cooling down in summer."
      }
    },
    {
      id: "hydrangea-parfait",
      name: { zh: "紫阳花芭菲", ja: "紫陽花パフェ", en: "Hydrangea Parfait" },
      image: "/images/food/紫阳花芭菲.jpg",
      rarity: "rare",
      description: { 
        zh: "以紫阳花为灵感的精致芭菲，色彩缤纷，口感层次丰富。",
        ja: "紫陽花をモチーフにした繊細なパフェ、色鮮やかで味わいの層が豊富です。",
        en: "Delicate parfait inspired by hydrangeas, colorful with rich layers of flavors."
      }
    },
    {
      id: "matcha-curry-udon",
      name: { zh: "抹茶咖喱乌冬", ja: "抹茶カレーうどん", en: "Matcha Curry Udon" },
      image: "/images/food/抹茶咖喱乌冬.jpg",
      rarity: "rare",
      description: { 
        zh: "创新的抹茶咖喱乌冬，抹茶的清香与咖喱的浓郁完美融合。",
        ja: "革新的な抹茶カレーうどん、抹茶の香りとカレーの濃厚さが完璧に融合しています。",
        en: "Innovative matcha curry udon, perfectly blending matcha's fragrance with curry's richness."
      }
    },
    {
      id: "matcha-soba",
      name: { zh: "抹茶荞麦素面", ja: "抹茶そば", en: "Matcha Soba" },
      image: "/images/food/抹茶荞麦素面.jpg",
      rarity: "common",
      description: { 
        zh: "清新的抹茶荞麦面，健康美味，是日式料理的经典。",
        ja: "さわやかな抹茶そば、ヘルシーで美味しい、和食の定番です。",
        en: "Fresh matcha soba noodles, healthy and delicious, a Japanese classic."
      }
    },
    {
      id: "tempura-udon",
      name: { zh: "天妇罗拌乌冬", ja: "天ぷらうどん", en: "Tempura Udon" },
      image: "/images/food/天妇罗拌乌冬.jpg",
      rarity: "common",
      description: { 
        zh: "酥脆的天妇罗配以弹牙的乌冬面，日式料理的精髓。",
        ja: "サクサクの天ぷらにコシのあるうどん、和食の真髄です。",
        en: "Crispy tempura with chewy udon noodles, the essence of Japanese cuisine."
      }
    },
    {
      id: "tempura-soup-udon",
      name: { zh: "天妇罗汤乌冬", ja: "天ぷら汁うどん", en: "Tempura Soup Udon" },
      image: "/images/food/天妇罗汤乌冬.jpg",
      rarity: "common",
      description: { 
        zh: "热腾腾的汤乌冬配以酥脆天妇罗，温暖身心的美味。",
        ja: "熱々の汁うどんにサクサクの天ぷら、心身を温める美味しさです。",
        en: "Hot soup udon with crispy tempura, a warming and delicious comfort food."
      }
    },
    {
      id: "ryoma-bento",
      name: { zh: "Ryoma特制爱心便当", ja: "Ryoma特製愛心弁当", en: "Ryoma's Special Love Bento" },
      image: "/images/food/Ryoma特制爱心便当.jpg",
      rarity: "epic",
      description: { 
        zh: "Ryoma精心制作的爱心便当，每一道菜都充满爱意，营养丰富又美味。",
        ja: "Ryomaが心を込めて作った愛心弁当、一品一品に愛が込められ、栄養豊富で美味しいです。",
        en: "Ryoma's carefully crafted love bento, each dish filled with love, nutritious and delicious."
      }
    },
    {
      id: "ice-cream-combo",
      name: { zh: "波子汽水冰淇淋&薄荷巧克力冰淇淋组合", ja: "ラムネアイス&ミントチョコアイスセット", en: "Ramune Ice Cream & Mint Chocolate Ice Cream Combo" },
      image: "/images/food/波子汽水冰淇淋&薄荷巧克力冰淇淋组合.jpg",
      rarity: "rare",
      description: { 
        zh: "清爽的波子汽水冰淇淋与浓郁的薄荷巧克力冰淇淋，冰爽双享受。",
        ja: "さわやかなラムネアイスと濃厚なミントチョコアイス、涼しい二重の楽しみです。",
        en: "Refreshing ramune ice cream with rich mint chocolate ice cream, a cool double treat."
      }
    },
    {
      id: "instant-noodles",
      name: { zh: "泡面", ja: "インスタントラーメン", en: "Instant Noodles" },
      image: "/images/food/泡面.JPG",
      rarity: "common",
      description: { 
        zh: "经典的泡面，简单快捷，是深夜食堂的必备美食。",
        ja: "クラシックなインスタントラーメン、簡単で早い、深夜食堂の必須グルメです。",
        en: "Classic instant noodles, simple and quick, essential late-night comfort food."
      }
    },
    {
      id: "braised-pork-roll",
      name: { zh: "卤肉卷", ja: "ルーローロール", en: "Braised Pork Roll" },
      image: "/images/food/卤肉卷.JPG",
      rarity: "common",
      description: { 
        zh: "香浓的卤肉卷，肉质软烂，味道浓郁，是传统小吃的代表。",
        ja: "香り豊かなルーローロール、肉は柔らかく、味わい深い、伝統的な軽食の代表です。",
        en: "Aromatic braised pork roll, tender meat with rich flavor, a traditional snack representative."
      }
    },
    {
      id: "sweet-oil-cake",
      name: { zh: "糖油粑粑", ja: "糖油粑粑", en: "Sweet Oil Cake" },
      image: "/images/food/糖油粑粑.JPG",
      rarity: "common",
      description: { 
        zh: "传统小吃糖油粑粑，外酥内软，甜而不腻，是童年的美好回忆。",
        ja: "伝統的な軽食糖油粑粑、外はサクサク、中はふわふわ、甘さ控えめで子供時代の美しい思い出です。",
        en: "Traditional snack sweet oil cake, crispy outside and soft inside, sweet but not overwhelming, childhood memories."
      }
    },
    {
      id: "grilled-skewers",
      name: { zh: "烤串", ja: "焼き鳥", en: "Grilled Skewers" },
      image: "/images/food/烤串.JPG",
      rarity: "common",
      description: { 
        zh: "香喷喷的烤串，炭火烤制，香气四溢，是夜市美食的经典。",
        ja: "香ばしい焼き鳥、炭火で焼き上げ、香り豊か、夜市グルメの定番です。",
        en: "Aromatic grilled skewers, charcoal-grilled with rich aroma, a classic night market food."
      }
    },
    {
      id: "stinky-tofu",
      name: { zh: "臭豆腐", ja: "臭豆腐", en: "Stinky Tofu" },
      image: "/images/food/臭豆腐.JPG",
      rarity: "rare",
      description: { 
        zh: "闻着臭吃着香的臭豆腐，外酥内嫩，是勇敢者的美食挑战。",
        ja: "臭いが香ばしい臭豆腐、外はサクサク、中はふわふわ、勇者のグルメチャレンジです。",
        en: "Stinky tofu that smells strong but tastes delicious, crispy outside and tender inside, a brave food challenge."
      }
    },
    {
      id: "steamed-dumplings",
      name: { zh: "蒸饺", ja: "蒸し餃子", en: "Steamed Dumplings" },
      image: "/images/food/蒸饺.JPG",
      rarity: "common",
      description: { 
        zh: "晶莹剔透的蒸饺，皮薄馅大，一口一个，美味无穷。",
        ja: "透き通った蒸し餃子、皮は薄く、具はたっぷり、一口で美味しさが溢れます。",
        en: "Crystal clear steamed dumplings, thin skin with generous filling, delicious bite by bite."
      }
    },
    {
      id: "egg-fried-rice",
      name: { zh: "蛋炒饭", ja: "卵チャーハン", en: "Egg Fried Rice" },
      image: "/images/food/蛋炒饭.JPG",
      rarity: "common",
      description: { 
        zh: "经典的蛋炒饭，粒粒分明，蛋香浓郁，是家常便饭的经典。",
        ja: "クラシックな卵チャーハン、一粒一粒がはっきり、卵の香り豊か、家庭料理の定番です。",
        en: "Classic egg fried rice, each grain distinct with rich egg aroma, a household staple."
      }
    },
    {
      id: "mixed-noodles",
      name: { zh: "拌面", ja: "混ぜ麺", en: "Mixed Noodles" },
      image: "/images/food/拌面.JPG",
      rarity: "common",
      description: { 
        zh: "清爽的拌面，面条弹牙，配料丰富，是夏日解暑的好选择。",
        ja: "さわやかな混ぜ麺、麺はコシがあり、具材は豊富、夏の暑さを癒す良い選択です。",
        en: "Refreshing mixed noodles, chewy noodles with rich toppings, great for cooling down in summer."
      }
    },
    {
      id: "roujiamo",
      name: { zh: "肉夹馍", ja: "肉夾饃", en: "Roujiamo" },
      image: "/images/food/肉夹馍.JPG",
      rarity: "common",
      description: { 
        zh: "陕西特色肉夹馍，外酥内软，肉香浓郁，是传统小吃的代表。",
        ja: "陝西特産の肉夾饃、外はサクサク、中はふわふわ、肉の香り豊か、伝統的な軽食の代表です。",
        en: "Shaanxi specialty roujiamo, crispy outside and soft inside with rich meat aroma, traditional snack representative."
      }
    },
    {
      id: "hotel-breakfast",
      name: { zh: "酒店早餐", ja: "ホテル朝食", en: "Hotel Breakfast" },
      image: "/images/food/酒店早餐.JPG",
      rarity: "common",
      description: { 
        zh: "丰盛的酒店早餐，种类繁多，营养均衡，是美好一天的开始。",
        ja: "豊富なホテル朝食、種類豊富で栄養バランスが良く、素晴らしい一日の始まりです。",
        en: "Abundant hotel breakfast with variety and balanced nutrition, the start of a wonderful day."
      }
    },
    {
      id: "beijing-duck",
      name: { zh: "北京烤鸭", ja: "北京ダック", en: "Beijing Duck" },
      image: "/images/food/北京烤鸭.JPG",
      rarity: "epic",
      description: { 
        zh: "北京名菜烤鸭，皮酥肉嫩，色泽金黄，是中华美食的瑰宝。",
        ja: "北京名菜の北京ダック、皮はサクサク、肉は柔らかく、黄金色、中華料理の宝石です。",
        en: "Beijing's famous roast duck, crispy skin and tender meat with golden color, a treasure of Chinese cuisine."
      }
    },
    {
      id: "curry-udon",
      name: { zh: "咖喱乌冬", ja: "カレーうどん", en: "Curry Udon" },
      image: "/images/food/咖喱乌冬.jpg",
      rarity: "common",
      description: { 
        zh: "浓郁的咖喱乌冬，面条弹牙，汤汁浓郁，是日式咖喱的经典。",
        ja: "濃厚なカレーうどん、麺はコシがあり、スープは濃厚、和風カレーの定番です。",
        en: "Rich curry udon with chewy noodles and thick soup, a Japanese curry classic."
      }
    },
    {
      id: "hachi-cocoa",
      name: { zh: "小八可可", ja: "ハチココア", en: "Hachi Cocoa" },
      image: "/images/food/小八可可.jpg",
      rarity: "rare",
      description: { 
        zh: "可爱的小八可可，造型独特，味道浓郁，是动漫主题的甜品。",
        ja: "可愛いハチココア、ユニークなデザインで味わい深い、アニメテーマのデザートです。",
        en: "Cute Hachi cocoa with unique design and rich flavor, an anime-themed dessert."
      }
    },
    {
      id: "usagi-cocoa",
      name: { zh: "乌萨奇可可", ja: "ウサギココア", en: "Usagi Cocoa" },
      image: "/images/food/乌萨奇可可.jpg",
      rarity: "rare",
      description: { 
        zh: "可爱的乌萨奇可可，兔子造型，香甜可口，是萌系甜品的代表。",
        ja: "可愛いウサギココア、ウサギのデザインで甘く美味しい、萌え系デザートの代表です。",
        en: "Cute Usagi cocoa with bunny design, sweet and delicious, representative of kawaii desserts."
      }
    },
    {
      id: "apple-candy",
      name: { zh: "苹果糖", ja: "りんご飴", en: "Apple Candy" },
      image: "/images/food/苹果糖.jpg",
      rarity: "common",
      description: { 
        zh: "晶莹剔透的苹果糖，酸甜可口，是传统糖果的经典。",
        ja: "透き通ったりんご飴、甘酸っぱく美味しい、伝統的な飴の定番です。",
        en: "Crystal clear apple candy, sweet and sour, a traditional candy classic."
      }
    },
    {
      id: "three-color-dango",
      name: { zh: "三色团子", ja: "三色だんご", en: "Three-Color Dango" },
      image: "/images/food/三色团子.jpg",
      rarity: "common",
      description: { 
        zh: "传统的三色团子，粉色、白色、绿色，象征着樱花、雪、新叶。",
        ja: "伝統的な三色だんご、ピンク、白、緑、桜、雪、新芽を象徴しています。",
        en: "Traditional three-color dango, pink, white, and green, symbolizing cherry blossoms, snow, and new leaves."
      }
    },
    {
      id: "tonkatsu-don",
      name: { zh: "炸猪排盖饭", ja: "とんかつ丼", en: "Tonkatsu Don" },
      image: "/images/food/炸猪排盖饭.jpg",
      rarity: "rare",
      description: { 
        zh: "香脆的炸猪排配以热腾腾的米饭，淋上特制酱汁，美味无比。",
        ja: "サクサクのとんかつに熱々のご飯、特製ソースをかけて、美味しさが際立ちます。",
        en: "Crispy tonkatsu with hot rice, topped with special sauce, incredibly delicious."
      }
    },
    {
      id: "strawberry-ice-cream",
      name: { zh: "草莓冰淇淋", ja: "いちごアイス", en: "Strawberry Ice Cream" },
      image: "/images/food/草莓冰淇淋.jpg",
      rarity: "common",
      description: { 
        zh: "香甜的草莓冰淇淋，粉嫩可爱，是夏日甜品的经典选择。",
        ja: "甘いいちごアイス、ピンクで可愛い、夏のデザートの定番選択です。",
        en: "Sweet strawberry ice cream, pink and cute, a classic summer dessert choice."
      }
    },
  ]

  useEffect(() => {
    const savedPhotos = storage.get(STORAGE_KEYS.GACHA_COLLECTED, [])
    setCollectedPhotos(savedPhotos)

    if (!visitedPages.includes("gacha")) {
      const newVisited = [...visitedPages, "gacha"]
      setVisitedPages(newVisited)
      storage.set(STORAGE_KEYS.VISITED_PAGES, newVisited)
    }
  }, [visitedPages, setVisitedPages])

  const spinGacha = () => {
    if (isSpinning) return

    setIsSpinning(true)
    setSpinAnimation("animate-shake")
    playClickSound()

    // 扭蛋动画持续2秒
    setTimeout(() => {
      const randomPhoto = foodPhotos[Math.floor(Math.random() * foodPhotos.length)]
      setCurrentPhoto(randomPhoto.id)
      setSpinAnimation("")

      // 添加到收集中
      if (!collectedPhotos.includes(randomPhoto.id)) {
        const newCollected = [...collectedPhotos, randomPhoto.id]
        setCollectedPhotos(newCollected)
        storage.set(STORAGE_KEYS.GACHA_COLLECTED, newCollected)

        // 根据稀有度播放不同音效
        if (randomPhoto.rarity === "epic") {
          playFireworkSound()
        } else if (randomPhoto.rarity === "rare") {
          playSuccessSound()
          setTimeout(() => playSuccessSound(), 200)
        } else if (randomPhoto.rarity === "common") {
          // 为普通食物添加音效
          playSuccessSound()
        }
      } else {
        // 重复获得时播放点击音效
        playClickSound()
      }

      setIsSpinning(false)
      setShowSaveNotification(true)
      setTimeout(() => setShowSaveNotification(false), 2000)
    }, 2000)
  }

  const resetCollection = () => {
    setCollectedPhotos([])
    setCurrentPhoto(null)
    storage.set(STORAGE_KEYS.GACHA_COLLECTED, [])
    setShowSaveNotification(true)
    setTimeout(() => setShowSaveNotification(false), 2000)
  }

  const getCurrentPhotoData = () => {
    return foodPhotos.find((photo) => photo.id === currentPhoto)
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "epic":
        return "from-purple-100 to-pink-100 border-purple-300"
      case "rare":
        return "from-blue-100 to-indigo-100 border-blue-300"
      default:
        return "from-green-100 to-emerald-100 border-green-300"
    }
  }

  // 生成背景粒子 - 只在客户端执行
  useEffect(() => {
    const particles = Array.from({ length: 10 }, () => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 3}s`,
      animationDuration: `${3 + Math.random() * 2}s`,
    }))
    setBackgroundParticles(particles)
  }, [])

  // 获取食物名称的辅助函数
  const getFoodName = (photo: any) => {
    if (typeof photo.name === 'string') {
      return photo.name
    }
    if (photo.name && typeof photo.name === 'object') {
      return photo.name[language] || photo.name.zh || 'Unknown'
    }
    return 'Unknown'
  }

  // 获取食物描述的辅助函数
  const getFoodDescription = (photo: any) => {
    if (photo.description && typeof photo.description === 'object') {
      return photo.description[language] || photo.description.zh || ''
    }
    return ''
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-pink-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {backgroundParticles.map((particle, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 bg-yellow-200 rounded-full animate-pulse opacity-30"
          style={{
            left: particle.left,
            top: particle.top,
            animationDelay: particle.animationDelay,
            animationDuration: particle.animationDuration,
          }}
        />
      ))}

      {showSaveNotification && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-400 text-white px-4 py-2 rounded-lg shadow-lg z-30 animate-bounce">
          ✓ {t.saved}
        </div>
      )}

      <FloatingElement delay={0.3}>
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-4xl w-full backdrop-blur-sm bg-opacity-95">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <BounceButton onClick={onBack} className="mr-4 p-2 rounded-full hover:bg-gray-100">
                <ArrowLeft className="w-6 h-6" />
              </BounceButton>
              <h1 className="text-3xl font-bold text-gray-800">{t.gachaGame}</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-orange-600 bg-orange-100 px-3 py-1 rounded-full">
                {t.collection}: {collectedPhotos.length}/{foodPhotos.length}
              </div>
              <BounceButton
                onClick={resetCollection}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                {t.reset}
              </BounceButton>
            </div>
          </div>

          <div className="text-center mb-8">
            <div className="relative inline-block">
              <div className={`text-9xl ${spinAnimation} transition-transform duration-200`}>🎰</div>
              {isSpinning && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-4xl animate-bounce">✨</div>
                </div>
              )}
            </div>

            <BounceButton
              onClick={spinGacha}
              disabled={isSpinning}
              className={`mt-6 px-8 py-4 text-xl font-bold rounded-2xl transition-all duration-300 ${
                isSpinning
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-yellow-300 to-orange-300 text-white hover:from-yellow-400 hover:to-orange-400 hover:scale-105 shadow-lg hover:shadow-xl"
              }`}
            >
              {isSpinning ? t.spinning : t.spinOnce}
            </BounceButton>
          </div>

          {currentPhoto && (
            <div className="mb-8 text-center">
              <h3 className="text-xl font-bold text-gray-700 mb-4">{t.obtained}</h3>
              <div
                className={`inline-block bg-gradient-to-br ${getRarityColor(getCurrentPhotoData()?.rarity || "common")} rounded-2xl p-4 shadow-lg border-2 mx-auto`}
              >
                <div className="flex flex-col items-center">
                  <img
                    src={getCurrentPhotoData()?.image || "/placeholder.svg"}
                    alt={getFoodName(getCurrentPhotoData())}
                    className="w-48 h-36 object-cover rounded-lg mb-2"
                  />
                  <div className="font-semibold text-gray-800 text-center">
                    {getFoodName(getCurrentPhotoData())}
                  </div>
                  <div className="text-xs text-gray-600 mt-1 text-center">
                    {getCurrentPhotoData()?.rarity === "epic"
                      ? t.epic
                      : getCurrentPhotoData()?.rarity === "rare"
                        ? t.rare
                        : t.common}
                  </div>
                  {getCurrentPhotoData()?.description && (
                    <div className="text-xs text-gray-600 mt-2 max-w-xs text-center">
                      {getFoodDescription(getCurrentPhotoData())}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div>
            <h3 className="text-xl font-bold text-gray-700 mb-4">{t.foodCollection}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {foodPhotos.map((photo) => (
                <div
                  key={photo.id}
                  className={`rounded-xl p-3 transition-all duration-300 hover:scale-105 ${
                    collectedPhotos.includes(photo.id)
                      ? `bg-gradient-to-br ${getRarityColor(photo.rarity)} shadow-lg border-2`
                      : "bg-gray-100 border-2 border-gray-200 opacity-50"
                  }`}
                >
                  <div className="aspect-[4/3] bg-gray-200 rounded-lg overflow-hidden mb-2">
                    {collectedPhotos.includes(photo.id) ? (
                      <img
                        src={photo.image || "/placeholder.svg"}
                        alt={getFoodName(photo)}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">❓</div>
                    )}
                  </div>
                  <div className="text-sm font-semibold text-center">
                    {collectedPhotos.includes(photo.id) ? getFoodName(photo) : "???"}
                  </div>
                  {collectedPhotos.includes(photo.id) && (
                    <>
                      <div className="text-xs text-center text-gray-500 mt-1">
                        {photo.rarity === "epic" ? t.epic : photo.rarity === "rare" ? t.rare : t.common}
                      </div>
                      {photo.description && (
                        <div className="text-xs text-gray-600 mt-2 text-center leading-tight">
                          {getFoodDescription(photo)}
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 text-center text-sm text-gray-500">{t.chanceToGet}</div>
        </div>
      </FloatingElement>
    </div>
  )
}

// 主应用组件
export default function LoveTimerApp() {
  const [seconds, setSeconds] = useState(0)
  const [language, setLanguage] = useState<"zh" | "ja" | "en">("zh")
  const [currentPage, setCurrentPage] = useState<
    "home" | "map" | "todo" | "birthday" | "cooking" | "gacha" | "calendar" | "anime" | "quiz"
  >("home")
  const [visitedPages, setVisitedPages] = useState<string[]>([])
  const [lastVisit, setLastVisit] = useState<string>("")
  const [backgroundParticles, setBackgroundParticles] = useState<Array<{
    left: string
    top: string
    animationDelay: string
    animationDuration: string
  }>>([])

  const translations = {
    zh: {
      loveTimer: "💕",
      inLoveFor: "相恋已经",
      seconds: "秒",
      minutes: "分钟",
      hours: "小时",
      days: "天",
      weeks: "周",
      worldClock: "世界时钟",
      chinaTime: "中国时间",
      japanTime: "日本时间",
      startTime: "开始时间：2025年1月8日",
      ourMap: "我们的地图",
      futureList: "未来清单",
      birthdayCake: "生日蛋糕",
      cookingGame: "做饭游戏",
      gachaGame: "扭蛋游戏",
      loveCalendar: "恋爱日历",
      animeRecord: "动画记录",
      quizGame: "问答游戏",
      lastVisit: "上次访问",
      clearData: "清除数据",
      totalVisits: "总访问页面",
      times: "次",
    },
    ja: {
      loveTimer: "💕",
      inLoveFor: "恋愛してから",
      seconds: "秒",
      minutes: "分",
      hours: "時間",
      days: "日",
      weeks: "週",
      worldClock: "世界時計",
      chinaTime: "中国時間",
      japanTime: "日本時間",
      startTime: "開始時間：2025年1月8日",
      ourMap: "私たちの地図",
      futureList: "未来のリスト",
      birthdayCake: "バースデーケーキ",
      cookingGame: "料理ゲーム",
      gachaGame: "ガチャゲーム",
      loveCalendar: "恋愛カレンダー",
      animeRecord: "アニメ記録",
      quizGame: "問答ゲーム",
      lastVisit: "最後の訪問",
      clearData: "データクリア",
      totalVisits: "総訪問ページ",
      times: "回",
    },
    en: {
      loveTimer: "💕",
      inLoveFor: "In love for",
      seconds: "seconds",
      minutes: "minutes",
      hours: "hours",
      days: "days",
      weeks: "weeks",
      worldClock: "World Clock",
      chinaTime: "China Time",
      japanTime: "Japan Time",
      startTime: "Start time: January 8, 2025",
      ourMap: "Our Map",
      futureList: "Future List",
      birthdayCake: "Birthday Cake",
      cookingGame: "Cooking Game",
      gachaGame: "Gacha Game",
      loveCalendar: "Love Calendar",
      animeRecord: "Anime Record",
      quizGame: "Quiz Game",
      lastVisit: "Last Visit",
      clearData: "Clear Data",
      totalVisits: "Total page visits",
      times: "times",
    },
  }

  const t = translations[language]

  useEffect(() => {
    const savedLanguage = storage.get(STORAGE_KEYS.LANGUAGE, "zh")
    const savedVisitedPages = storage.get(STORAGE_KEYS.VISITED_PAGES, [])
    const savedLastVisit = storage.get(STORAGE_KEYS.LAST_VISIT, "")

    setLanguage(savedLanguage)
    setVisitedPages(savedVisitedPages)
    setLastVisit(savedLastVisit)

    const currentTime = new Date().toLocaleString()
    setLastVisit(currentTime)
    storage.set(STORAGE_KEYS.LAST_VISIT, currentTime)
  }, [])

  useEffect(() => {
    storage.set(STORAGE_KEYS.LANGUAGE, language)
  }, [language])

  useEffect(() => {
    const startDate = new Date("2025-01-08T00:00:00")

    const updateTimer = () => {
      const now = new Date()
      const diffInMs = now.getTime() - startDate.getTime()
      const diffInSeconds = Math.floor(diffInMs / 1000)
      setSeconds(diffInSeconds)
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const particles = Array.from({ length: 20 }, () => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 3}s`,
      animationDuration: `${3 + Math.random() * 2}s`,
    }))
    setBackgroundParticles(particles)
  }, [])

  const formatNumber = (num: number) => {
    return num.toLocaleString()
  }

  const clearAllData = () => {
    if (confirm("确定要清除所有保存的数据吗？这将重置所有页面状态。")) {
      Object.values(STORAGE_KEYS).forEach((key) => {
        storage.remove(key)
      })

      setLanguage("zh")
      setVisitedPages([])
      setLastVisit("")

      playSuccessSound()
      alert("所有数据已清除！")
    }
  }

  // 页面路由
  if (currentPage === "map") {
    return (
      <MapPage
        onBack={() => setCurrentPage("home")}
        visitedPages={visitedPages}
        setVisitedPages={setVisitedPages}
        language={language}
      />
    )
  }

  if (currentPage === "todo") {
    return (
      <TodoPage
        onBack={() => setCurrentPage("home")}
        visitedPages={visitedPages}
        setVisitedPages={setVisitedPages}
        language={language}
      />
    )
  }

  if (currentPage === "birthday") {
    return (
      <BirthdayPage
        onBack={() => setCurrentPage("home")}
        visitedPages={visitedPages}
        setVisitedPages={setVisitedPages}
        language={language}
      />
    )
  }

  if (currentPage === "cooking") {
    return (
      <CookingGame
        onBack={() => setCurrentPage("home")}
        visitedPages={visitedPages}
        setVisitedPages={setVisitedPages}
        language={language}
      />
    )
  }

  if (currentPage === "gacha") {
    return (
      <GachaGame
        onBack={() => setCurrentPage("home")}
        visitedPages={visitedPages}
        setVisitedPages={setVisitedPages}
        language={language}
      />
    )
  }

  if (currentPage === "calendar") {
    return (
      <CalendarPage
        onBack={() => setCurrentPage("home")}
        visitedPages={visitedPages}
        setVisitedPages={setVisitedPages}
        language={language}
      />
    )
  }

  if (currentPage === "anime") {
    return (
      <AnimePage
        onBack={() => setCurrentPage("home")}
        visitedPages={visitedPages}
        setVisitedPages={setVisitedPages}
        language={language}
      />
    )
  }

  if (currentPage === "quiz") {
    return (
      <QuizPage
        onBack={() => setCurrentPage("home")}
        visitedPages={visitedPages}
        setVisitedPages={setVisitedPages}
        language={language}
      />
    )
  }

  // 主页
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* 淡粉色背景 */}
      <div 
        className="absolute inset-0 w-full h-full z-0"
        style={{
        background: 'linear-gradient(135deg, #fdf2f8 0%, #f3e8ff 25%, #fce7f3 50%, #f3e8ff 75%, #f9a8d4 100%)',
        backgroundSize: '400% 400%',
        animation: 'gradientShift 15s ease infinite'
       }}
     />

      {/* 光粒子效果 */}
      <LightParticles />

      <div className="absolute top-4 right-4 z-20">
        <FloatingElement delay={2}>
          <div className="bg-white rounded-lg shadow-lg p-2 flex items-center gap-2 backdrop-blur-sm bg-opacity-90 min-w-[120px]">
            <Globe className="w-4 h-4 text-gray-600" />
            <select
              value={language}
              onChange={(e) => {
                setLanguage(e.target.value as "zh" | "ja" | "en")
                playClickSound()
              }}
              className="bg-transparent text-sm font-medium text-gray-700 border-none outline-none cursor-pointer w-full text-center"
            >
              <option value="zh">中文</option>
              <option value="ja">日本語</option>
              <option value="en">English</option>
            </select>
          </div>
        </FloatingElement>
      </div>

      <div className="absolute top-4 left-4 z-20">
        <FloatingElement delay={2.5}>
          <BounceButton
            onClick={clearAllData}
            className="bg-white rounded-lg shadow-lg p-2 flex items-center gap-2 text-sm text-gray-600 hover:text-red-600 transition-colors backdrop-blur-sm bg-opacity-90 min-w-[100px] justify-center"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="text-center">{t.clearData}</span>
          </BounceButton>
        </FloatingElement>
      </div>

      <FloatingElement delay={0.5}>
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full relative z-10 backdrop-blur-sm bg-opacity-95">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 animate-pulse">{t.loveTimer}</h1>
            {lastVisit && (
              <p className="text-xs text-gray-500 mt-2">
                {t.lastVisit}: {lastVisit}
              </p>
            )}
          </div>

          <div className="flex items-center justify-center mb-8">
            <FloatingElement delay={1}>
              <div className="flex-shrink-0 flex flex-col items-center">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-red-500 rounded-full flex items-center justify-center shadow-lg animate-pulse mb-2">
                  <Heart className="w-8 h-8 text-white fill-current" />
                </div>
                <span className="text-sm font-semibold text-gray-700">Seiki</span>
              </div>
            </FloatingElement>

            <div className="flex-1 mx-6 relative">
              <div className="h-1 bg-gradient-to-r from-pink-300 to-red-300 rounded-full relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-red-400 rounded-full animate-pulse"></div>
              </div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <Activity
                  className="w-6 h-6 text-red-500"
                  style={{
                    animation: "bounce 0.8s infinite, pulse 1.5s infinite",
                  }}
                />
              </div>
            </div>

            <FloatingElement delay={1.2}>
              <div className="flex-shrink-0 flex flex-col items-center">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-red-500 rounded-full flex items-center justify-center shadow-lg animate-pulse mb-2">
                  <Heart className="w-8 h-8 text-white fill-current" />
                </div>
                <span className="text-sm font-semibold text-gray-700">Ryoma</span>
              </div>
            </FloatingElement>
          </div>

          <FloatingElement delay={0.8}>
            <div className="text-center bg-gradient-to-r from-pink-100 to-red-100 rounded-2xl p-6 mb-8 shadow-inner">
              <p className="text-lg text-gray-700 mb-2">{t.inLoveFor}</p>
              <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-red-600 mb-2 animate-pulse">
                {formatNumber(seconds)}
              </div>
              <p className="text-lg text-gray-700">{t.seconds}</p>

              <div className="mt-4 grid grid-cols-4 gap-3 text-sm text-gray-600">
                <div className="bg-white rounded-lg p-3 shadow-md hover:shadow-lg transition-shadow duration-300">
                  <div className="font-semibold text-pink-600">{formatNumber(Math.floor(seconds / 60))}</div>
                  <div>{t.minutes}</div>
                </div>
                <div className="bg-white rounded-lg p-3 shadow-md hover:shadow-lg transition-shadow duration-300">
                  <div className="font-semibold text-purple-600">{formatNumber(Math.floor(seconds / 3600))}</div>
                  <div>{t.hours}</div>
                </div>
                <div className="bg-white rounded-lg p-3 shadow-md hover:shadow-lg transition-shadow duration-300">
                  <div className="font-semibold text-red-600">{formatNumber(Math.floor(seconds / (3600 * 24)))}</div>
                  <div>{t.days}</div>
                </div>
                <div className="bg-white rounded-lg p-3 shadow-md hover:shadow-lg transition-shadow duration-300">
                  <div className="font-semibold text-indigo-600">
                    {formatNumber(Math.floor(seconds / (3600 * 24 * 7)))}
                  </div>
                  <div>{t.weeks}</div>
                </div>
              </div>

              {/* 开始时间移到这里 */}
              <div className="mt-4 text-sm text-gray-500">{t.startTime}</div>
            </div>
          </FloatingElement>

          {/* 导航按钮 - 现在是8个按钮 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <FloatingElement delay={1.5}>
              <BounceButton
                onClick={() => setCurrentPage("map")}
                className="bg-gradient-to-r from-rose-100 to-pink-100 text-gray-700 rounded-lg p-4 hover:from-rose-200 hover:to-pink-200 transition-all duration-300 flex flex-col items-center justify-center relative shadow-lg hover:shadow-xl h-28 w-[140px]"
              >
                <div className="text-2xl mb-2">🗺️</div>
                <span className="text-sm font-semibold text-center leading-tight">{t.ourMap}</span>
                {visitedPages.includes("map") && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                )}
              </BounceButton>
            </FloatingElement>
            <FloatingElement delay={1.7}>
              <BounceButton
                onClick={() => setCurrentPage("todo")}
                className="bg-gradient-to-r from-purple-100 to-indigo-100 text-gray-700 rounded-lg p-4 hover:from-purple-200 hover:to-indigo-200 transition-all duration-300 flex flex-col items-center justify-center relative shadow-lg hover:shadow-xl h-28 w-[140px]"
              >
                <div className="text-2xl mb-2">📝</div>
                <span className="text-sm font-semibold text-center leading-tight">{t.futureList}</span>
                {visitedPages.includes("todo") && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                )}
              </BounceButton>
            </FloatingElement>
            <FloatingElement delay={1.9}>
              <BounceButton
                onClick={() => setCurrentPage("birthday")}
                className="bg-gradient-to-r from-yellow-100 to-orange-100 text-gray-700 rounded-lg p-4 hover:from-yellow-200 hover:to-orange-200 transition-all duration-300 flex flex-col items-center justify-center relative shadow-lg hover:shadow-xl h-28 w-[140px]"
              >
                <div className="text-2xl mb-2">🎂</div>
                <span className="text-sm font-semibold text-center leading-tight">{t.birthdayCake}</span>
                {visitedPages.includes("birthday") && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                )}
              </BounceButton>
            </FloatingElement>
            <FloatingElement delay={2.1}>
              <BounceButton
                onClick={() => setCurrentPage("cooking")}
                className="bg-gradient-to-r from-lime-100 to-green-100 text-gray-700 rounded-lg p-4 hover:from-lime-200 hover:to-green-200 transition-all duration-300 flex flex-col items-center justify-center relative shadow-lg hover:shadow-xl h-28 w-[140px]"
              >
                <div className="text-2xl mb-2">👨‍🍳</div>
                <span className="text-sm font-semibold text-center leading-tight">{t.cookingGame}</span>
                {visitedPages.includes("cooking") && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                )}
              </BounceButton>
            </FloatingElement>
            <FloatingElement delay={2.3}>
              <BounceButton
                onClick={() => setCurrentPage("gacha")}
                className="bg-gradient-to-r from-emerald-100 to-teal-100 text-gray-700 rounded-lg p-4 hover:from-emerald-200 hover:to-teal-200 transition-all duration-300 flex flex-col items-center justify-center relative shadow-lg hover:shadow-xl h-28 w-[140px]"
              >
                <div className="text-2xl mb-2">🎰</div>
                <span className="text-sm font-semibold text-center leading-tight">{t.gachaGame}</span>
                {visitedPages.includes("gacha") && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                )}
              </BounceButton>
            </FloatingElement>
            <FloatingElement delay={2.5}>
              <BounceButton
                onClick={() => setCurrentPage("calendar")}
                className="bg-gradient-to-r from-violet-100 to-purple-100 text-gray-700 rounded-lg p-4 hover:from-violet-200 hover:to-purple-200 transition-all duration-300 flex flex-col items-center justify-center relative shadow-lg hover:shadow-xl h-28 w-[140px]"
              >
                <div className="text-2xl mb-2">📅</div>
                <span className="text-sm font-semibold text-center leading-tight">{t.loveCalendar}</span>
                {visitedPages.includes("calendar") && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                )}
              </BounceButton>
            </FloatingElement>
            <FloatingElement delay={2.7}>
              <BounceButton
                onClick={() => setCurrentPage("anime")}
                className="bg-gradient-to-r from-blue-100 to-indigo-100 text-gray-700 rounded-lg p-4 hover:from-blue-200 hover:to-indigo-200 transition-all duration-300 flex flex-col items-center justify-center relative shadow-lg hover:shadow-xl h-28 w-[140px]"
              >
                <div className="text-2xl mb-2">🎬</div>
                <span className="text-sm font-semibold text-center leading-tight">{t.animeRecord}</span>
                {visitedPages.includes("anime") && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                )}
              </BounceButton>
            </FloatingElement>
            <FloatingElement delay={2.9}>
              <BounceButton
                onClick={() => setCurrentPage("quiz")}
                className="bg-gradient-to-r from-cyan-100 to-sky-100 text-gray-700 rounded-lg p-4 hover:from-cyan-200 hover:to-sky-200 transition-all duration-300 flex flex-col items-center justify-center relative shadow-lg hover:shadow-xl h-28 w-[140px]"
              >
                <div className="text-2xl mb-2">🃏</div>
                <span className="text-sm font-semibold text-center leading-tight">{t.quizGame}</span>
                {visitedPages.includes("quiz") && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                )}
              </BounceButton>
            </FloatingElement>
          </div>

          <FloatingElement delay={2.2}>
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-6 shadow-inner">
              <h3 className="text-center text-lg font-semibold text-gray-700 mb-4">{t.worldClock}</h3>
              <div className="flex justify-around items-center">
                <Clock timezone="Asia/Shanghai" label={t.chinaTime} />
                <Clock timezone="Asia/Tokyo" label={t.japanTime} />
              </div>
            </div>
          </FloatingElement>

          <div className="text-center mt-6 text-sm text-gray-500">
            {visitedPages.length > 0 && (
              <div className="mt-2">
                {t.totalVisits}: {visitedPages.length} {t.times}
              </div>
            )}
          </div>
        </div>
      </FloatingElement>
    </div>
  )
}
