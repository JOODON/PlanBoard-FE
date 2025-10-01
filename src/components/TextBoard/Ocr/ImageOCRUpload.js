import React, { useState, useRef, useCallback } from 'react';
import { Upload, Image, X, FileText, AlertCircle } from 'lucide-react';
import './ImageOCRUpload.css';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {extractText} from "../../../api/OcrAPi";


const ImageOCRUpload = ({ onOCRComplete, onClose , editor}) => {
    const [dragActive, setDragActive] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

    // 파일 유효성 검사
    const validateFile = (file) => {
        const maxSize = 10 * 1024 * 1024; // 10MB
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

        if (!allowedTypes.includes(file.type)) {
            setError('JPG, PNG, GIF, WebP 형식의 이미지만 업로드 가능합니다.');
            return false;
        }

        if (file.size > maxSize) {
            setError('파일 크기는 10MB 이하만 가능합니다.');
            return false;
        }

        setError('');
        return true;
    };

    // 파일 처리
    const handleFile = (file) => {
        if (!validateFile(file)) return;

        setSelectedImage(file);

        // 이미지 미리보기 생성
        const reader = new FileReader();
        reader.onload = (e) => {
            setImagePreview(e.target.result);
        };
        reader.readAsDataURL(file);
    };

    // 드래그 앤 드롭 핸들러
    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    }, []);

    // 파일 선택 핸들러
    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    // OCR 처리
    const handleOCRProcess = async () => {
        if (!selectedImage) return;

        setIsProcessing(true);
        setProgress(0);

        try {
            // FormData 생성 및 파일 추가
            const formData = new FormData();
            formData.append('file', selectedImage);  // 'file'은 API에서 받는 key 이름

            // 로딩 표시
            setProgress(-1);

            // API 호출
            const result = await extractText(formData);

            // 처리 완료
            if (result && result.text) {
                onOCRComplete(result.text);
            } else {
                throw new Error('텍스트 추출 결과가 없습니다.');
            }

        } catch (err) {
            console.error('OCR 처리 실패:', err);
            setError('이미지 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
            toast.error('이미지 처리 중 오류가 발생했습니다.');
        } finally {
            setIsProcessing(false);
            setProgress(0);
        }
    };

    // 이미지 제거
    const removeImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
        setError('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="ocr-upload-overlay">
            <div className="ocr-upload-modal">
                {/* 헤더 */}
                <div className="ocr-upload-header">
                    <div className="header-content">
                        <FileText size={20} />
                        <h3>이미지에서 텍스트 추출</h3>
                    </div>
                    <button className="close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                {/* 메인 콘텐츠 */}
                <div className="ocr-upload-content">
                    {!selectedImage && !isProcessing && (
                        <div
                            className={`upload-area ${dragActive ? 'drag-active' : ''}`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                        >
                            <div className="upload-content">
                                <div className="upload-icon">
                                    <Image size={48} />
                                </div>
                                <h4>이미지를 업로드하세요</h4>
                                <p>드래그 앤 드롭하거나 클릭하여 파일을 선택하세요</p>
                                <button
                                    className="upload-btn"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <Upload size={16} />
                                    파일 선택
                                </button>
                                <p className="upload-hint">JPG, PNG, GIF, WebP (최대 10MB)</p>
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileSelect}
                                style={{ display: 'none' }}
                            />
                        </div>
                    )}

                    {selectedImage && !isProcessing && (
                        <div className="image-preview-section">
                            <div className="image-preview">
                                <img src={imagePreview} alt="업로드된 이미지" />
                                <button className="remove-image-btn" onClick={removeImage}>
                                    <X size={16} />
                                </button>
                            </div>
                            <div className="image-info">
                                <p className="image-name">{selectedImage.name}</p>
                                <p className="image-size">
                                    {(selectedImage.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                            </div>
                        </div>
                    )}

                    {isProcessing && (
                        <div className="processing-section">
                            <div className="processing-animation">
                                <div className="spinner"></div>
                            </div>
                            <h4>이미지에서 텍스트를 추출하고 있습니다...</h4>
                            <div className="progress-container">
                                <div className="progress-bar">
                                    <div
                                        className="progress-fill"
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                                <span className="progress-text">{Math.round(progress)}%</span>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="error-message">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}
                </div>

                {/* 버튼 영역 */}
                <div className="ocr-upload-actions">
                    <button className="cancel-btn" onClick={onClose}>
                        취소
                    </button>
                    <button
                        className="process-btn"
                        onClick={handleOCRProcess}
                        disabled={!selectedImage || isProcessing}
                    >
                        {isProcessing ? '처리 중...' : '텍스트 추출'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ImageOCRUpload;