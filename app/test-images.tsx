"use client"

import { useState } from "react"

export default function TestImages() {
  const [testResults, setTestResults] = useState<string[]>([])

  const testImages = [
    "/images/Japan/大阪1.8-1.14 (1).jpg",
    "/images/Japan/大阪1.8-1.14 (2).jpg",
    "/images/Japan/京都1.8-1.14(1).jpg",
    "/images/Japan/京都1.8-1.14(2).jpg",
    "/images/Japan/大阪6.24-7.2(1).jpg",
    "/images/Japan/大阪6.24-7.2(2).jpg",
    "/images/Japan/京都6.24-7.2.jpg",
    "/images/Japan/京都6.24-7.2(2).jpg",
  ]

  const testImage = (src: string) => {
    const img = new Image()
    img.onload = () => {
      setTestResults(prev => [...prev, `✅ ${src} - 加载成功`])
    }
    img.onerror = () => {
      setTestResults(prev => [...prev, `❌ ${src} - 加载失败`])
    }
    img.src = src
  }

  const runAllTests = () => {
    setTestResults([])
    testImages.forEach(testImage)
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">图片加载测试</h1>
        
        <button 
          onClick={runAllTests}
          className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
        >
          开始测试所有图片
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {testImages.map((src, index) => (
            <div key={index} className="bg-white p-4 rounded shadow">
              <h3 className="font-semibold mb-2">测试图片 {index + 1}</h3>
              <p className="text-sm text-gray-600 mb-2">{src}</p>
              <img 
                src={src} 
                alt={`测试图片 ${index + 1}`}
                className="w-full h-32 object-cover rounded"
                onError={(e) => {
                  e.currentTarget.style.border = '2px solid red'
                }}
                onLoad={(e) => {
                  e.currentTarget.style.border = '2px solid green'
                }}
              />
            </div>
          ))}
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">测试结果</h2>
          <div className="bg-white p-4 rounded shadow">
            {testResults.map((result, index) => (
              <div key={index} className="mb-2">
                {result}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 