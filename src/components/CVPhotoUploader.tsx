import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Upload,
  Camera,
  Trash2,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  Move,
  Check,
  X,
  Eye,
  EyeOff,
  Square,
  Circle,
  AlertCircle,
  Sliders,
  Sparkles
} from 'lucide-react';
import { CVPhoto } from '../types';
import { savePhotoToStorage, deletePhotoFromStorage } from '../utils/photoStorage';

interface CVPhotoUploaderProps {
  photo?: CVPhoto;
  onPhotoChange: (photo: CVPhoto | undefined) => void;
}

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export const CVPhotoUploader: React.FC<CVPhotoUploaderProps> = ({
  photo,
  onPhotoChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragContainerRef = useRef<HTMLDivElement>(null);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [tempOriginalUrl, setTempOriginalUrl] = useState<string | null>(photo?.originalUrl || photo?.dataUrl || null);
  const [zoom, setZoom] = useState<number>(photo?.zoom || 1.15);
  const [panX, setPanX] = useState<number>(photo?.cropX || 0);
  const [panY, setPanY] = useState<number>(photo?.cropY || 0);
  const [shape, setShape] = useState<'circle' | 'rounded' | 'square'>(photo?.shape || 'circle');
  const [visible, setVisible] = useState<boolean>(photo?.visible ?? true);

  // Dragging state
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Sync internal state if prop updates from outside
  useEffect(() => {
    if (photo) {
      setTempOriginalUrl(photo.originalUrl || photo.dataUrl);
      setShape(photo.shape || 'circle');
      setVisible(photo.visible ?? true);
      if (photo.zoom !== undefined) setZoom(photo.zoom);
      if (photo.cropX !== undefined) setPanX(photo.cropX);
      if (photo.cropY !== undefined) setPanY(photo.cropY);
    }
  }, [photo]);

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return `Định dạng tệp không được hỗ trợ (${file.type || 'không xác định'}). Vui lòng chọn tệp ảnh JPG, JPEG, PNG hoặc WebP.`;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      return `Dung lượng ảnh vượt quá 5MB (${sizeMB}MB). Vui lòng chọn ảnh nhỏ hơn để bảo đảm tốc độ xử lý và in ấn tốt nhất.`;
    }
    return null;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    const error = validateFile(file);
    if (error) {
      setErrorMessage(error);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setTempOriginalUrl(result);
        setZoom(1.15);
        setPanX(0);
        setPanY(0);
        setIsEditing(true);
      }
    };
    reader.onerror = () => {
      setErrorMessage('Không thể đọc tệp ảnh. Vui lòng kiểm tra lại quyền truy cập hoặc thử lại ảnh khác.');
    };
    reader.readAsDataURL(file);

    // reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Render cropped image onto canvas and export high quality dataUrl
  const renderCroppedDataUrl = useCallback((): Promise<string> => {
    return new Promise((resolve, reject) => {
      const imgSource = tempOriginalUrl || photo?.originalUrl || photo?.dataUrl;
      if (!imgSource) {
        reject(new Error('No image'));
        return;
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const outputSize = 400; // High resolution square canvas
        const canvas = document.createElement('canvas');
        canvas.width = outputSize;
        canvas.height = outputSize;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Canvas context unavailable'));
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Background fill for safety
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, outputSize, outputSize);

        // Aspect ratio handling
        const imgAspect = img.width / img.height;
        let drawWidth = outputSize;
        let drawHeight = outputSize;

        if (imgAspect > 1) {
          drawHeight = outputSize;
          drawWidth = outputSize * imgAspect;
        } else {
          drawWidth = outputSize;
          drawHeight = outputSize / imgAspect;
        }

        // Apply zoom and pan
        drawWidth *= zoom;
        drawHeight *= zoom;

        // Base center offsets
        const baseOffsetX = (outputSize - drawWidth) / 2;
        const baseOffsetY = (outputSize - drawHeight) / 2;

        // Scaled pan (pan is normalized in pixels based on preview frame ~160px -> 400px = 2.5x)
        const scaleFactor = outputSize / 160;
        const finalX = baseOffsetX + panX * scaleFactor;
        const finalY = baseOffsetY + panY * scaleFactor;

        ctx.drawImage(img, finalX, finalY, drawWidth, drawHeight);
        resolve(canvas.toDataURL('image/jpeg', 0.92));
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = imgSource;
    });
  }, [tempOriginalUrl, photo, zoom, panX, panY]);

  const handleConfirmSave = async () => {
    try {
      const croppedUrl = await renderCroppedDataUrl();
      const updatedPhoto: CVPhoto = {
        dataUrl: croppedUrl,
        originalUrl: tempOriginalUrl || photo?.originalUrl,
        shape,
        visible,
        zoom,
        cropX: panX,
        cropY: panY,
      };

      onPhotoChange(updatedPhoto);
      await savePhotoToStorage({
        ...updatedPhoto,
        zoom,
        cropX: panX,
        cropY: panY,
        updatedAt: Date.now(),
      });
      setIsEditing(false);
      setErrorMessage(null);
    } catch (err) {
      setErrorMessage('Không thể lưu ảnh đã chỉnh sửa. Vui lòng thử lại.');
      console.error(err);
    }
  };

  const handleDeletePhoto = async () => {
    onPhotoChange(undefined);
    setTempOriginalUrl(null);
    setIsEditing(false);
    setErrorMessage(null);
    await deletePhotoFromStorage();
  };

  const handleToggleVisible = async (newVal: boolean) => {
    setVisible(newVal);
    if (photo) {
      const updated = { ...photo, visible: newVal };
      onPhotoChange(updated);
      await savePhotoToStorage({
        ...updated,
        zoom: updated.zoom ?? 1.15,
        cropX: updated.cropX ?? 0,
        cropY: updated.cropY ?? 0,
        updatedAt: Date.now(),
      });
    }
  };

  const handleShapeChange = async (newShape: 'circle' | 'rounded') => {
    setShape(newShape);
    if (photo && !isEditing) {
      const updated = { ...photo, shape: newShape };
      onPhotoChange(updated);
      await savePhotoToStorage({
        ...updated,
        zoom: updated.zoom ?? 1.15,
        cropX: updated.cropX ?? 0,
        cropY: updated.cropY ?? 0,
        updatedAt: Date.now(),
      });
    }
  };

  // Mouse / Touch Drag Handlers for pan
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - panX, y: e.clientY - panY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanX(e.clientX - dragStart.x);
    setPanY(e.clientY - dragStart.y);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - panX,
        y: e.touches[0].clientY - panY,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPanX(e.touches[0].clientX - dragStart.x);
    setPanY(e.touches[0].clientY - dragStart.y);
  };

  const handleResetAlignment = () => {
    setPanX(0);
    setPanY(0);
    setZoom(1.15);
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-4">
      {/* Header with Title and Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4 text-blue-600" />
          <span className="font-bold text-xs text-slate-900 tracking-wide uppercase">
            Ảnh Chân Dung CV
          </span>
        </div>

        {/* Visibility switch */}
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <span className="text-[11px] font-semibold text-slate-600">
            Hiển thị ảnh trên CV
          </span>
          <input
            type="checkbox"
            checked={visible}
            onChange={(e) => handleToggleVisible(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer accent-blue-600"
          />
        </label>
      </div>

      {/* Error Alert Banner */}
      {errorMessage && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-[11px] leading-relaxed font-medium">
            {errorMessage}
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-rose-500 hover:text-rose-800 cursor-pointer text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Container: Preview / Editor View */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
        {/* Frame Preview Area */}
        <div className="flex flex-col items-center gap-2">
          <div
            ref={dragContainerRef}
            onMouseDown={isEditing ? handleMouseDown : undefined}
            onMouseMove={isEditing ? handleMouseMove : undefined}
            onMouseUp={isEditing ? handleMouseUp : undefined}
            onMouseLeave={isEditing ? handleMouseUp : undefined}
            onTouchStart={isEditing ? handleTouchStart : undefined}
            onTouchMove={isEditing ? handleTouchMove : undefined}
            onTouchEnd={isEditing ? handleMouseUp : undefined}
            className={`relative w-36 h-36 border-2 overflow-hidden bg-slate-100 flex items-center justify-center transition-all select-none shadow-xs ${
              shape === 'circle' ? 'rounded-full' : 'rounded-2xl'
            } ${
              isEditing
                ? 'border-blue-500 cursor-grab active:cursor-grabbing ring-4 ring-blue-500/15'
                : 'border-slate-300'
            }`}
            title={isEditing ? 'Kéo chuột để di chuyển căn chỉnh khuôn mặt' : 'Ảnh chân dung CV'}
          >
            {tempOriginalUrl || photo?.dataUrl ? (
              <img
                src={tempOriginalUrl || photo?.dataUrl}
                alt="Chân dung ứng viên"
                style={{
                  transform: `scale(${zoom}) translate(${panX / zoom}px, ${panY / zoom}px)`,
                  transformOrigin: 'center center',
                  transition: isDragging ? 'none' : 'transform 0.15s ease-out',
                }}
                className="w-full h-full object-cover pointer-events-none select-none max-w-none"
                draggable={false}
              />
            ) : (
              <div className="text-center p-3 text-slate-400 flex flex-col items-center justify-center gap-1.5">
                <Camera className="w-8 h-8 stroke-1 text-slate-400" />
                <span className="text-[10px] font-semibold text-slate-500">Chưa có ảnh</span>
              </div>
            )}

            {/* Editing grid guides overlay */}
            {isEditing && (
              <div className="absolute inset-0 pointer-events-none border border-blue-400/30 grid grid-cols-3 grid-rows-3">
                <div className="border-r border-b border-blue-300/30" />
                <div className="border-r border-b border-blue-300/30" />
                <div className="border-b border-blue-300/30" />
                <div className="border-r border-b border-blue-300/30" />
                <div className="border-r border-b border-blue-300/30" />
                <div className="border-b border-blue-300/30" />
                <div className="border-r border-blue-300/30" />
                <div className="border-r border-blue-300/30" />
                <div />
              </div>
            )}

            {/* Visual tag if photo is set to hidden */}
            {!visible && (photo?.dataUrl || tempOriginalUrl) && !isEditing && (
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-2xs flex flex-col items-center justify-center text-white p-2 text-center">
                <EyeOff className="w-5 h-5 mb-1 text-slate-300" />
                <span className="text-[10px] font-bold">Đang ẩn trên CV</span>
              </div>
            )}
          </div>

          <span className="text-[10px] font-medium text-slate-400">
            {shape === 'circle' ? 'Khung tròn' : 'Khung vuông bo góc'} • {visible ? 'Hiển thị' : 'Tạm ẩn'}
          </span>
        </div>

        {/* Action Controls & Options */}
        <div className="flex-1 w-full space-y-3">
          {/* Main Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/jpeg,image/png,image/webp,image/jpg"
              className="hidden"
            />

            {!photo?.dataUrl && !tempOriginalUrl ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Tải ảnh lên</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold border border-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
                  <span>Thay ảnh</span>
                </button>

                {!isEditing ? (
                  <button
                    type="button"
                    onClick={() => {
                      setTempOriginalUrl(photo?.originalUrl || photo?.dataUrl || null);
                      setIsEditing(true);
                    }}
                    className="text-xs px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold border border-blue-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Chỉnh sửa góc / Cắt</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleConfirmSave}
                    className="text-xs px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Xác nhận lưu</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleDeletePhoto}
                  className="text-xs px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold border border-rose-200 flex items-center gap-1 transition-colors cursor-pointer"
                  title="Xóa ảnh chân dung"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa ảnh</span>
                </button>
              </>
            )}
          </div>

          {/* Shape selection buttons */}
          <div className="flex items-center gap-2 pt-1 border-t border-slate-200/80">
            <span className="text-[11px] font-semibold text-slate-600">Kiểu khung:</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleShapeChange('circle')}
                className={`text-[11px] px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 cursor-pointer transition-all ${
                  shape === 'circle'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Circle className="w-3 h-3" />
                <span>Tròn</span>
              </button>
              <button
                type="button"
                onClick={() => handleShapeChange('rounded')}
                className={`text-[11px] px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 cursor-pointer transition-all ${
                  shape === 'rounded'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Square className="w-3 h-3" />
                <span>Vuông bo góc</span>
              </button>
            </div>
          </div>

          {/* Editing Toolbar Panel (Active when in editing mode) */}
          {isEditing && (
            <div className="bg-white border border-blue-200 rounded-xl p-3 space-y-2.5 animate-slide-up">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-blue-800 flex items-center gap-1">
                  <Move className="w-3 h-3" />
                  Kéo rê ảnh để căn giữa khuôn mặt
                </span>
                <button
                  type="button"
                  onClick={handleResetAlignment}
                  className="text-slate-500 hover:text-slate-800 font-semibold cursor-pointer underline"
                >
                  Đặt lại góc
                </button>
              </div>

              {/* Zoom Slider */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px] text-slate-600 font-semibold">
                  <span className="flex items-center gap-1">
                    <ZoomOut className="w-3 h-3 text-slate-400" />
                    Phóng to / Thu nhỏ
                  </span>
                  <span>{Math.round(zoom * 100)}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setZoom((prev) => Math.max(0.8, prev - 0.1))}
                    className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs cursor-pointer"
                  >
                    -
                  </button>
                  <input
                    type="range"
                    min="0.8"
                    max="2.5"
                    step="0.05"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <button
                    type="button"
                    onClick={() => setZoom((prev) => Math.min(2.5, prev + 0.1))}
                    className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Nudge Pan Arrows for precise adjustment */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px]">
                <span className="text-slate-500">Căn chỉnh tinh gọn:</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setPanX((p) => p + 6)}
                    className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                    title="Sang trái"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={() => setPanY((p) => p + 6)}
                    className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                    title="Lên trên"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => setPanY((p) => p - 6)}
                    className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                    title="Xuống dưới"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => setPanX((p) => p - 6)}
                    className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                    title="Sang phải"
                  >
                    →
                  </button>
                </div>
              </div>

              {/* Save & Cancel buttons */}
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="text-[11px] px-3 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSave}
                  className="text-[11px] px-3.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-1 cursor-pointer shadow-xs"
                >
                  <Check className="w-3 h-3" />
                  <span>Xác nhận lưu ảnh</span>
                </button>
              </div>
            </div>
          )}

          {/* Formats, Size and Storage guidance hint */}
          <div className="text-[10px] text-slate-500 leading-normal space-y-1">
            <p>• Hỗ trợ định dạng: JPG, JPEG, PNG, WebP (Tối đa 5 MB).</p>
            <p>• Chuẩn ảnh công sở / học đường: Ánh sáng rõ, trang phục lịch sự, nhìn thẳng.</p>
            <p className="text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-1.5 font-medium leading-relaxed">
              💡 <strong>Lưu ý:</strong> Ảnh chân dung được lưu trữ trong IndexedDB của thiết bị này theo phương án miễn phí. Ảnh chưa tự động đồng bộ khi chuyển sang thiết bị khác.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
