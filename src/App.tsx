import { useState, useCallback, useRef, useEffect } from 'react'
import './App.css'

function App() {
  const [binaryData, setBinaryData] = useState<boolean[][]>([])
  const [fileName, setFileName] = useState<string>('')
  const [fileSize, setFileSize] = useState<number>(0)
  const [zoom, setZoom] = useState<number>(10)
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const hexToBinary = (hexString: string): boolean[] => {
    return hexString.split('').flatMap(char => {
      const decimal = parseInt(char, 16)
      if (isNaN(decimal)) return []
      return Array.from({ length: 4 }, (_, i) => ((decimal >> (3 - i)) & 1) === 1)
    })
  }

  const processFile = useCallback(async (file: File) => {
    setIsLoading(true)
    setFileName(file.name)
    setFileSize(file.size)

    try {
      const buffer = await file.arrayBuffer()
      const bytes = new Uint8Array(buffer)
      const hexArray: boolean[][] = []

      for (let i = 0; i < bytes.length; i++) {
        const hexChar = bytes[i].toString(16).padStart(2, '0')
        const binaryBits = hexToBinary(hexChar)
        hexArray.push(binaryBits)
      }

      setBinaryData(hexArray)
    } catch (error) {
      console.error('Error processing file:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      processFile(file)
    }
  }, [processFile])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      processFile(file)
    }
  }, [processFile])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || binaryData.length === 0) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dotRadius = zoom / 2 - 1
    const spacing = zoom
    const rows = Math.ceil(Math.sqrt(binaryData.length * 8))
    const cols = Math.ceil(binaryData.length * 8 / rows)

    canvas.width = cols * spacing
    canvas.height = rows * spacing

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    let bitIndex = 0
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const byteIndex = Math.floor(bitIndex / 8)
        const bitPosition = bitIndex % 8
        
        if (byteIndex >= binaryData.length) break
        
        const isOne = binaryData[byteIndex][bitPosition]
        const x = col * spacing + spacing / 2
        const y = row * spacing + spacing / 2

        ctx.beginPath()
        ctx.arc(x, y, dotRadius, 0, Math.PI * 2)
        
        if (isOne) {
          ctx.fillStyle = '#ef4444'
        } else {
          ctx.fillStyle = '#f5f5f5'
        }
        
        ctx.fill()
        ctx.strokeStyle = '#d4d4d4'
        ctx.lineWidth = 0.5
        ctx.stroke()

        bitIndex++
      }
    }
  }, [binaryData, zoom])

  useEffect(() => {
    drawCanvas()
  }, [drawCanvas])

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleExportPng = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement('a')
    link.download = `${fileName.replace(/\.[^/.]+$/, '')}_binary.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  const handleReset = () => {
    setBinaryData([])
    setFileName('')
    setFileSize(0)
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <h1>Hex Binary Visualizer</h1>
          <p className="subtitle">Visualize hexadecimal files as binary dots</p>
        </div>
      </header>

      <main className="main">
        {binaryData.length === 0 ? (
          <div
            className={`drop-zone ${isDragging ? 'dragging' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <div className="drop-zone-content">
              <svg className="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <h2>Drop your file here</h2>
              <p>or click to browse</p>
              <label className="file-button">
                Select File
                <input
                  type="file"
                  onChange={handleFileInput}
                  accept="*/*"
                />
              </label>
              <p className="hint">Supports any file format</p>
            </div>
          </div>
        ) : (
          <>
            <div className="toolbar">
              <div className="file-info">
                <span className="file-name">{fileName}</span>
                <span className="file-size">{formatFileSize(fileSize)}</span>
                <span className="byte-count">{binaryData.length} bytes</span>
              </div>
              <div className="controls">
                <div className="zoom-control">
                  <label>Zoom:</label>
                  <input
                    type="range"
                    min="4"
                    max="30"
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                  />
                  <span>{zoom}px</span>
                </div>
                <button className="action-button" onClick={handleExportPng}>
                  Export PNG
                </button>
                <button className="action-button secondary" onClick={handleReset}>
                  New File
                </button>
              </div>
            </div>

            <div className="legend">
              <div className="legend-item">
                <span className="dot red"></span>
                <span>1 (Bit ON)</span>
              </div>
              <div className="legend-item">
                <span className="dot white"></span>
                <span>0 (Bit OFF)</span>
              </div>
            </div>

            <div className="canvas-container" ref={containerRef}>
              {isLoading ? (
                <div className="loading">
                  <div className="spinner"></div>
                  <p>Processing file...</p>
                </div>
              ) : (
                <canvas ref={canvasRef} className="binary-canvas" />
              )}
            </div>
          </>
        )}
      </main>

      <footer className="footer">
        <p>Each dot represents one bit - Red = 1, White = 0</p>
      </footer>
    </div>
  )
}

export default App
