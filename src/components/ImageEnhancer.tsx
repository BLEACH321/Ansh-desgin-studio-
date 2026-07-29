import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Check, Sliders, Image as ImageIcon, Sparkles, RefreshCw, ZoomIn } from 'lucide-react';
import './ImageEnhancer.css';

interface ImageEnhancerProps {
  imageSrc: string;
  onSave: (enhancedImage: string) => void;
  onClose: () => void;
}

type ResolutionPreset = 'standard' | 'hd' | 'fhd' | 'original';

export const ImageEnhancer: React.FC<ImageEnhancerProps> = ({ imageSrc, onSave, onClose }) => {
  const [resolution, setResolution] = useState<ResolutionPreset>('original');
  const [preset, setPreset] = useState<string>('none');
  
  // Sliders
  const [sharpenStrength, setSharpenStrength] = useState<number>(0);
  const [clarity, setClarity] = useState<number>(0);
  const [brightness, setBrightness] = useState<number>(0);
  const [contrast, setContrast] = useState<number>(0);
  const [saturation, setSaturation] = useState<number>(0);
  const [denoise, setDenoise] = useState<number>(0);

  // Split-slider UI State
  const [compareSplit, setCompareSplit] = useState<number>(50);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const enhancedCanvasRef = useRef<HTMLCanvasElement>(null);
  const [enhancedPreviewUrl, setEnhancedPreviewUrl] = useState<string>('');
  const originalImgRef = useRef<HTMLImageElement | null>(null);

  // Apply Presets
  useEffect(() => {
    switch (preset) {
      case 'none':
        setSharpenStrength(0);
        setClarity(0);
        setBrightness(0);
        setContrast(0);
        setSaturation(0);
        setDenoise(0);
        break;
      case 'auto':
        setSharpenStrength(0.25);
        setClarity(12);
        setBrightness(5);
        setContrast(8);
        setSaturation(12);
        setDenoise(5);
        break;
      case 'architectural':
        setSharpenStrength(0.4);
        setClarity(20);
        setBrightness(2);
        setContrast(12);
        setSaturation(4);
        setDenoise(0);
        break;
      case 'interior':
        setSharpenStrength(0.18);
        setClarity(8);
        setBrightness(14);
        setContrast(6);
        setSaturation(15);
        setDenoise(10);
        break;
      case 'dramatic':
        setSharpenStrength(0.3);
        setClarity(25);
        setBrightness(-5);
        setContrast(22);
        setSaturation(-8);
        setDenoise(0);
        break;
    }
  }, [preset]);

  // Load and apply pixel manipulation
  useEffect(() => {
    if (!imageSrc) return;
    
    setIsProcessing(true);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageSrc;
    
    img.onload = () => {
      originalImgRef.current = img;
      processImage(img);
    };
  }, [imageSrc, resolution, sharpenStrength, clarity, brightness, contrast, saturation, denoise]);

  const processImage = (img: HTMLImageElement) => {
    const canvas = enhancedCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Calculate dimensions based on preset
    let width = img.naturalWidth;
    let height = img.naturalHeight;
    
    let maxDim = 1920;
    if (resolution === 'standard') maxDim = 800;
    else if (resolution === 'hd') maxDim = 1280;
    else if (resolution === 'fhd') maxDim = 1920;
    else maxDim = Math.max(width, height); // original

    if (width > height) {
      if (width > maxDim) {
        height = Math.round((height * maxDim) / width);
        width = maxDim;
      }
    } else {
      if (height > maxDim) {
        width = Math.round((width * maxDim) / height);
        height = maxDim;
      }
    }

    canvas.width = width;
    canvas.height = height;

    // 1. Draw image with CSS-like quality filters
    ctx.clearRect(0, 0, width, height);
    
    // Apply contrast, brightness, saturation via context filters
    const bFactor = 1 + brightness / 100;
    const cFactor = 1 + contrast / 100;
    const sFactor = 1 + saturation / 100;
    ctx.filter = `brightness(${bFactor}) contrast(${cFactor}) saturate(${sFactor})`;
    
    ctx.drawImage(img, 0, 0, width, height);
    ctx.filter = 'none'; // reset

    // 2. Local Denoise Filter (Simple box blur blending to reduce noise in smooth regions)
    if (denoise > 0) {
      const imgData = ctx.getImageData(0, 0, width, height);
      const data = imgData.data;
      const originalData = new Uint8ClampedArray(data);
      const strength = denoise / 100;

      for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          const idx = (y * width + x) * 4;
          
          // Simple local neighborhood average
          let r = 0, g = 0, b = 0;
          for (let ky = -1; ky <= 1; ky++) {
            for (let kx = -1; kx <= 1; kx++) {
              const kIdx = ((y + ky) * width + (x + kx)) * 4;
              r += originalData[kIdx];
              g += originalData[kIdx + 1];
              b += originalData[kIdx + 2];
            }
          }
          
          // Blend average with original based on denoise strength
          data[idx] = Math.round(originalData[idx] * (1 - strength) + (r / 9) * strength);
          data[idx + 1] = Math.round(originalData[idx + 1] * (1 - strength) + (g / 9) * strength);
          data[idx + 2] = Math.round(originalData[idx + 2] * (1 - strength) + (b / 9) * strength);
        }
      }
      ctx.putImageData(imgData, 0, 0);
    }

    // 3. Smart Sharpening & Clarity Convolution
    if (sharpenStrength > 0 || clarity > 0) {
      const imgData = ctx.getImageData(0, 0, width, height);
      const data = imgData.data;
      const output = ctx.createImageData(width, height);
      const outData = output.data;

      // Initialize output with original
      for (let i = 0; i < data.length; i++) {
        outData[i] = data[i];
      }

      // Sharpen Matrix calculation (strength + clarity-based)
      const sharpVal = sharpenStrength * 0.8 + (clarity / 100) * 0.5;
      const center = 1 + 4 * sharpVal;
      const edge = -sharpVal;

      for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          const idx = (y * width + x) * 4;

          for (let c = 0; c < 3; c++) {
            const cIdx = idx + c;
            
            // Apply standard laplacian convolution
            const val = 
              data[cIdx] * center +
              data[cIdx - 4] * edge + // left
              data[cIdx + 4] * edge + // right
              data[(y - 1) * width * 4 + x * 4 + c] * edge + // top
              data[(y + 1) * width * 4 + x * 4 + c] * edge;  // bottom

            outData[cIdx] = Math.min(255, Math.max(0, val));
          }
        }
      }
      ctx.putImageData(output, 0, 0);
    }

    // Update Preview
    const quality = 0.98;
    const dataUrl = canvas.toDataURL('image/jpeg', quality);
    setEnhancedPreviewUrl(dataUrl);
    setIsProcessing(false);
  };

  const handleSave = () => {
    if (!enhancedPreviewUrl) return;
    onSave(enhancedPreviewUrl);
  };

  // Drag comparison handler
  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setCompareSplit(percentage);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      handleMove(e.touches[0].clientX);
    }
  };

  return (
    <div className="enhancer-workspace-overlay">
      <div className="enhancer-container">
        
        {/* Workspace Header */}
        <header className="enhancer-header">
          <div className="header-info">
            <div className="spark-badge">
              <Sparkles size={14} className="spark-icon" />
              <span>Smart HD Studio</span>
            </div>
            <h2>Enhance Image Quality</h2>
            <p>Upscale low-resolution images and apply high-definition architectural enhancements</p>
          </div>
          <button className="enhancer-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </header>

        {/* Workspace Body */}
        <div className="enhancer-body">
          
          {/* Left: Viewport comparison tool */}
          <div className="enhancer-viewport">
            <div 
              ref={containerRef}
              className="comparison-slider-container"
              onMouseMove={(e) => { if (e.buttons === 1 || isDragging) handleMove(e.clientX); }}
              onTouchMove={handleTouchMove}
              onMouseDown={(e) => { e.preventDefault(); setIsDragging(true); handleMove(e.clientX); }}
              onMouseUp={() => setIsDragging(false)}
              onMouseLeave={() => setIsDragging(false)}
            >
              {/* Original Image (Left / Background) */}
              <img 
                src={imageSrc} 
                alt="Original Low Quality" 
                className="comparison-img original-bg" 
              />
              <div className="label-badge original">ORIGINAL LOW-QUALITY</div>

              {/* Enhanced Image (Right / Foreground, clipped) */}
              {enhancedPreviewUrl && (
                <div 
                  className="enhanced-fg-wrap"
                  style={{ clipPath: `polygon(${compareSplit}% 0, 100% 0, 100% 100%, ${compareSplit}% 100%)` }}
                >
                  <img 
                    src={enhancedPreviewUrl} 
                    alt="HD Enhanced" 
                    className="comparison-img enhanced-fg" 
                  />
                  <div className="label-badge enhanced">HD ENHANCED</div>
                </div>
              )}

              {/* Drag Handle Bar */}
              <div 
                className="comparison-drag-bar"
                style={{ left: `${compareSplit}%` }}
              >
                <div className="drag-handle-button">
                  <RefreshCw size={14} className="drag-icon" />
                </div>
              </div>

              {/* Processing Loader overlay */}
              {isProcessing && (
                <div className="viewport-loader">
                  <div className="loader-spinner"></div>
                  <span>Reconstructing Pixels...</span>
                </div>
              )}
            </div>
          </div>

          {/* Right: Controls Dashboard */}
          <div className="enhancer-controls">
            
            {/* Target Resolution Section */}
            <div className="control-section">
              <label className="section-title"><ZoomIn size={14} /> Output Resolution</label>
              <div className="enhancer-pill-grid">
                <button 
                  className={`preset-pill ${resolution === 'original' ? 'active' : ''}`}
                  onClick={() => setResolution('original')}
                >
                  Original UHD <span>(Source size)</span>
                </button>
                <button 
                  className={`preset-pill ${resolution === 'fhd' ? 'active' : ''}`}
                  onClick={() => setResolution('fhd')}
                >
                  FHD 1080p <span>(Ultra crisp)</span>
                </button>
                <button 
                  className={`preset-pill ${resolution === 'hd' ? 'active' : ''}`}
                  onClick={() => setResolution('hd')}
                >
                  HD 720p <span>(Optimized)</span>
                </button>
                <button 
                  className={`preset-pill ${resolution === 'standard' ? 'active' : ''}`}
                  onClick={() => setResolution('standard')}
                >
                  Standard Web <span>(Compressed)</span>
                </button>
              </div>
            </div>

            {/* Smart Presets */}
            <div className="control-section">
              <label className="section-title"><Sparkles size={14} /> Auto-Enhancement Presets</label>
              <div className="preset-tabs">
                {[
                  { id: 'none', label: 'None' },
                  { id: 'auto', label: 'Auto HD Boost' },
                  { id: 'architectural', label: 'Arch Clarity' },
                  { id: 'interior', label: 'Luminous Room' },
                  { id: 'dramatic', label: 'Dramatic' }
                ].map(p => (
                  <button 
                    key={p.id}
                    className={`preset-tab-btn ${preset === p.id ? 'active' : ''}`}
                    onClick={() => setPreset(p.id)}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Fine Tuning Sliders */}
            <div className="control-section">
              <label className="section-title"><Sliders size={14} /> Professional Fine-Tuning</label>
              
              <div className="sliders-list">
                
                {/* Detail Sharpening */}
                <div className="slider-group">
                  <div className="slider-label">
                    <span>Edge Reconstruction (Sharpen)</span>
                    <span className="slider-val">{Math.round(sharpenStrength * 100)}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.05"
                    value={sharpenStrength} 
                    onChange={(e) => {
                      setSharpenStrength(parseFloat(e.target.value));
                      setPreset('custom');
                    }}
                  />
                </div>

                {/* Clarity */}
                <div className="slider-group">
                  <div className="slider-label">
                    <span>Structural Clarity</span>
                    <span className="slider-val">+{clarity}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="50" 
                    value={clarity} 
                    onChange={(e) => {
                      setClarity(parseInt(e.target.value));
                      setPreset('custom');
                    }}
                  />
                </div>

                {/* Brightness */}
                <div className="slider-group">
                  <div className="slider-label">
                    <span>Luminous Exposure</span>
                    <span className="slider-val">{brightness > 0 ? `+${brightness}` : brightness}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="-25" 
                    max="25" 
                    value={brightness} 
                    onChange={(e) => {
                      setBrightness(parseInt(e.target.value));
                      setPreset('custom');
                    }}
                  />
                </div>

                {/* Contrast */}
                <div className="slider-group">
                  <div className="slider-label">
                    <span>Contrast Depth</span>
                    <span className="slider-val">+{contrast}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="-10" 
                    max="30" 
                    value={contrast} 
                    onChange={(e) => {
                      setContrast(parseInt(e.target.value));
                      setPreset('custom');
                    }}
                  />
                </div>

                {/* Saturation */}
                <div className="slider-group">
                  <div className="slider-label">
                    <span>Color Vibrancy</span>
                    <span className="slider-val">+{saturation}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="-20" 
                    max="40" 
                    value={saturation} 
                    onChange={(e) => {
                      setSaturation(parseInt(e.target.value));
                      setPreset('custom');
                    }}
                  />
                </div>

                {/* Noise Reduction */}
                <div className="slider-group">
                  <div className="slider-label">
                    <span>Compression Denoise</span>
                    <span className="slider-val">{denoise}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="40" 
                    value={denoise} 
                    onChange={(e) => {
                      setDenoise(parseInt(e.target.value));
                      setPreset('custom');
                    }}
                  />
                </div>

              </div>
            </div>

          </div>
        </div>

        {/* Hidden processing canvas */}
        <canvas ref={enhancedCanvasRef} style={{ display: 'none' }} />

        {/* Workspace Footer */}
        <footer className="enhancer-footer">
          <button className="footer-btn secondary" onClick={onClose}>
            Discard Enhancements
          </button>
          <button className="footer-btn primary" onClick={handleSave} disabled={isProcessing}>
            <Check size={16} /> Save HD Enhanced Image
          </button>
        </footer>

      </div>
    </div>
  );
};
