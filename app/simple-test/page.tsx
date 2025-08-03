"use client"

export default function SimpleTest() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">简单图片测试</h1>
      
      <div className="space-y-4">
        <div>
          <h2 className="font-semibold">大阪1.8-1.14 (1).jpg</h2>
          <img 
            src="/images/Japan/大阪1.8-1.14 (1).jpg" 
            alt="大阪1" 
            className="w-64 h-48 object-cover border"
            onError={(e) => {
              console.error('大阪1加载失败');
              e.currentTarget.style.border = '2px solid red';
            }}
            onLoad={() => console.log('大阪1加载成功')}
          />
        </div>
        
        <div>
          <h2 className="font-semibold">京都1.8-1.14(1).jpg</h2>
          <img 
            src="/images/Japan/京都1.8-1.14(1).jpg" 
            alt="京都1" 
            className="w-64 h-48 object-cover border"
            onError={(e) => {
              console.error('京都1加载失败');
              e.currentTarget.style.border = '2px solid red';
            }}
            onLoad={() => console.log('京都1加载成功')}
          />
        </div>
      </div>
    </div>
  )
} 