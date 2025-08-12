// 全局变量
let loadedFonts = [];
let currentFontIndex = 0;
let isAnimating = false;

// DOM 元素
const fontFileInput = document.getElementById('font-file');
const fontInfoElement = document.getElementById('font-info');
const previewTextArea = document.getElementById('preview-text');
const charCountElement = document.getElementById('char-count');
const fontSizeInput = document.getElementById('font-size');
const fontSizeValueElement = document.getElementById('font-size-value');
const lineHeightInput = document.getElementById('line-height');
const lineHeightValueElement = document.getElementById('line-height-value');
const letterSpacingInput = document.getElementById('letter-spacing');
const letterSpacingValueElement = document.getElementById('letter-spacing-value');
const previewWrapper = document.getElementById('preview-wrapper');
const prevFontButton = document.getElementById('prev-font');
const nextFontButton = document.getElementById('next-font');
const saveSvgButton = document.getElementById('save-svg');
const savePngButton = document.getElementById('save-png');
const saveLocalButton = document.getElementById('save-local');
const animationTypeSelect = document.getElementById('animation-type');
const animationSpeedInput = document.getElementById('animation-speed');
const animationSpeedValueElement = document.getElementById('animation-speed-value');
const previewAnimationButton = document.getElementById('preview-animation');

// 颜色控制元素
const colorTypeSelect = document.getElementById('color-type');
const fontColorInput = document.getElementById('font-color');
const solidColorGroup = document.getElementById('solid-color-group');
const gradientControls = document.getElementById('gradient-controls');
const gradientColor1Input = document.getElementById('gradient-color1');
const gradientColor2Input = document.getElementById('gradient-color2');
const gradientDirectionSelect = document.getElementById('gradient-direction');

// 当前动画设置
let currentAnimationType = 'slideLeft';
let currentAnimationSpeed = 0.6;

// 当前颜色设置
let currentColorType = 'solid';
let currentFontColor = '#2d3748';
let currentGradientColor1 = '#667eea';
let currentGradientColor2 = '#764ba2';
let currentGradientDirection = '135deg';

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

// 初始化应用
function initializeApp() {
    updateCharCount();
    loadDefaultFont();
    addEventListeners();
    addAnimationEffects();
    initializeAnimationControls();
    detectBrowserSupport();
}

// 检测浏览器支持
function detectBrowserSupport() {
    const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
    const isFirefox = /Firefox/.test(navigator.userAgent);
    const isSafari = /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor);
    
    if (isChrome || isFirefox || isSafari) {
        console.log('浏览器兼容性检测通过');
    } else {
        showNotification('当前浏览器可能不完全支持所有功能，建议使用Chrome、Firefox或Safari', 'warning');
    }
}

// 初始化动画控制
function initializeAnimationControls() {
    if (animationSpeedValueElement) {
        animationSpeedValueElement.textContent = `${currentAnimationSpeed}s`;
    }
}

// 加载默认字体
function loadDefaultFont() {
    const defaultFontName = '默认藏文字体';
    const defaultFontFamily = 'Tibetan Machine Uni, Microsoft Himalaya, Jomolhari, DDC Uchen, Monlam Uni Sans Serif, Qomolangma-Uchen Sarchen, Qomolangma-Uchen Sarchung, Qomolangma-Edict, Qomolangma-Dunhuang, BabelStone Tibetan, Noto Sans Tibetan, serif';
    
    loadedFonts.push({
        name: defaultFontName,
        family: defaultFontFamily,
        isDefault: true
    });
    
    updateFontNavigation();
    updatePreview();
    updateFontInfo('已加载默认藏文字体，支持标准藏文显示');
}

// 添加动画效果
function addAnimationEffects() {
    // 为控制组添加悬停效果
    const controlGroups = document.querySelectorAll('.control-group');
    controlGroups.forEach((group, index) => {
        group.style.animationDelay = `${index * 0.1}s`;
        
        group.addEventListener('mouseenter', () => {
            group.style.transform = 'translateX(10px) scale(1.02)';
        });
        
        group.addEventListener('mouseleave', () => {
            group.style.transform = 'translateX(0) scale(1)';
        });
    });

    // 为按钮添加点击动画
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', (e) => {
            if (!button.disabled) {
                createRippleEffect(e, button);
            }
        });
    });
}

// 创建波纹效果
function createRippleEffect(event, element) {
    const ripple = document.createElement('span');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: rgba(255, 255, 255, 0.5);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple 0.6s linear;
        pointer-events: none;
    `;
    
    element.style.position = 'relative';
    element.style.overflow = 'hidden';
    element.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

// 添加CSS动画
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// 添加事件监听器
function addEventListeners() {
    // 字体文件上传
    fontFileInput.addEventListener('change', handleFontUpload);
    
    // 文本输入
    previewTextArea.addEventListener('input', debounce(() => {
        updateCharCount();
        updatePreview();
    }, 300));
    
    // 排版控制
    fontSizeInput.addEventListener('input', debounce(handleFontSizeChange, 100));
    lineHeightInput.addEventListener('input', debounce(handleLineHeightChange, 100));
    letterSpacingInput.addEventListener('input', debounce(handleLetterSpacingChange, 100));
    
    // 字体导航
    prevFontButton.addEventListener('click', () => navigateFont(-1));
    nextFontButton.addEventListener('click', () => navigateFont(1));
    
    // 保存功能
    saveSvgButton.addEventListener('click', handleSaveSvg);
    savePngButton.addEventListener('click', handleSavePng);
    if (saveLocalButton) {
        saveLocalButton.addEventListener('click', handleSaveLocal);
    }
    
    // 动画控制
    if (animationTypeSelect) {
        animationTypeSelect.addEventListener('change', handleAnimationTypeChange);
    }
    if (animationSpeedInput) {
        animationSpeedInput.addEventListener('input', debounce(handleAnimationSpeedChange, 100));
    }
    if (previewAnimationButton) {
        previewAnimationButton.addEventListener('click', handlePreviewAnimation);
    }
    
    // 颜色控制
    if (colorTypeSelect) {
        colorTypeSelect.addEventListener('change', handleColorTypeChange);
    }
    if (fontColorInput) {
        fontColorInput.addEventListener('input', debounce(handleFontColorChange, 100));
    }
    if (gradientColor1Input) {
        gradientColor1Input.addEventListener('input', debounce(handleGradientColorChange, 100));
    }
    if (gradientColor2Input) {
        gradientColor2Input.addEventListener('input', debounce(handleGradientColorChange, 100));
    }
    if (gradientDirectionSelect) {
        gradientDirectionSelect.addEventListener('change', handleGradientDirectionChange);
    }
    
    // 键盘快捷键
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

// 防抖函数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 字体文件上传处理
async function handleFontUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!file.name.match(/\.(ttf|otf)$/i)) {
        showNotification('请上传.ttf或.otf格式的字体文件', 'error');
        return;
    }
    
    showLoadingState(true);
    
    try {
        const fontName = file.name.replace(/\.(ttf|otf)$/i, '');
        const fontUrl = URL.createObjectURL(file);
        const fontFace = new FontFace(fontName, `url(${fontUrl})`);
        
        // 加载字体
        await fontFace.load();
        document.fonts.add(fontFace);
        
        // 添加到已加载字体列表
        loadedFonts.push({
            name: fontName,
            family: fontName,
            url: fontUrl,
            file: file,
            isDefault: false
        });
        
        // 更新UI
        updateFontInfo(`已成功加载: ${fontName}`);
        updateFontNavigation();
        
        // 切换到新加载的字体
        currentFontIndex = loadedFonts.length - 1;
        await updatePreview();
        
        showNotification('字体加载成功！', 'success');
    } catch (error) {
        console.error('字体加载失败:', error);
        showNotification('字体加载失败，请尝试其他字体文件', 'error');
    } finally {
        showLoadingState(false);
    }
}

// 显示加载状态
function showLoadingState(isLoading) {
    if (isLoading) {
        fontInfoElement.innerHTML = '<span class="loading"></span> 正在加载字体...';
    }
}

// 更新字体信息显示
function updateFontInfo(message) {
    fontInfoElement.innerHTML = `<span class="success-indicator">✓</span> ${message}`;
}

// 显示通知
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 1000;
        animation: slideInRight 0.3s ease-out;
        max-width: 300px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    `;
    
    if (type === 'success') {
        notification.style.background = 'linear-gradient(135deg, #10b981, #059669)';
    } else if (type === 'error') {
        notification.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
    } else if (type === 'warning') {
        notification.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)';
    } else {
        notification.style.background = 'linear-gradient(135deg, #3b82f6, #2563eb)';
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// 添加通知动画CSS
const notificationStyle = document.createElement('style');
notificationStyle.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }
`;
document.head.appendChild(notificationStyle);

// 更新字符计数
function updateCharCount() {
    const count = previewTextArea.value.length;
    charCountElement.textContent = count;
    
    // 超出限制时变红
    if (count > 1000) {
        charCountElement.style.color = '#ef4444';
        charCountElement.style.animation = 'shake 0.5s ease-in-out';
    } else {
        charCountElement.style.color = '#666';
        charCountElement.style.animation = 'none';
    }
}

// 添加摇摆动画
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
`;
document.head.appendChild(shakeStyle);

// 排版控制处理函数
function handleFontSizeChange() {
    fontSizeValueElement.textContent = `${fontSizeInput.value}px`;
    updatePreview();
}

function handleLineHeightChange() {
    lineHeightValueElement.textContent = lineHeightInput.value;
    updatePreview();
}

function handleLetterSpacingChange() {
    letterSpacingValueElement.textContent = `${letterSpacingInput.value}px`;
    updatePreview();
}

// 动画控制处理函数
function handleAnimationTypeChange() {
    currentAnimationType = animationTypeSelect.value;
}

function handleAnimationSpeedChange() {
    currentAnimationSpeed = parseFloat(animationSpeedInput.value);
    animationSpeedValueElement.textContent = `${currentAnimationSpeed}s`;
}

// 颜色控制处理函数
function handleColorTypeChange() {
    currentColorType = colorTypeSelect.value;
    
    if (currentColorType === 'solid') {
        solidColorGroup.style.display = 'flex';
        gradientControls.style.display = 'none';
    } else {
        solidColorGroup.style.display = 'none';
        gradientControls.style.display = 'block';
    }
    
    updatePreview();
}

function handleFontColorChange() {
    currentFontColor = fontColorInput.value;
    updatePreview();
}

function handleGradientColorChange() {
    currentGradientColor1 = gradientColor1Input.value;
    currentGradientColor2 = gradientColor2Input.value;
    updatePreview();
}

function handleGradientDirectionChange() {
    currentGradientDirection = gradientDirectionSelect.value;
    updatePreview();
}

// 获取当前字体颜色样式
function getCurrentFontColorStyle() {
    if (currentColorType === 'solid') {
        return `color: ${currentFontColor};`;
    } else {
        return `background: linear-gradient(${currentGradientDirection}, ${currentGradientColor1}, ${currentGradientColor2}); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;`;
    }
}

function handlePreviewAnimation() {
    const previewText = document.querySelector('.preview-text');
    if (!previewText) return;
    
    // 移除之前的动画类
    previewText.className = previewText.className.replace(/font-animation-\w+/g, '');
    
    // 设置动画持续时间
    previewText.style.setProperty('--animation-duration', `${currentAnimationSpeed}s`);
    
    // 添加新的动画类
    previewText.classList.add(`font-animation-${currentAnimationType}`);
    
    // 动画结束后移除类
    setTimeout(() => {
        previewText.className = previewText.className.replace(/font-animation-\w+/g, '');
    }, currentAnimationSpeed * 1000);
    
    showNotification(`已应用${getAnimationName(currentAnimationType)}动画效果`, 'success');
}

// 获取动画名称
function getAnimationName(type) {
    const names = {
        slideLeft: '左滑入场',
        slideRight: '右滑入场',
        slideUp: '上滑入场',
        slideDown: '下滑入场',
        fadeIn: '淡入效果',
        zoomIn: '缩放入场',
        rotateIn: '旋转入场',
        bounceIn: '弹跳入场',
        typewriter: '打字机效果',
        wave: '波浪效果',
        glow: '发光效果',
        shake: '摇摆效果'
    };
    return names[type] || type;
}

// 字体导航
function navigateFont(direction) {
    if (isAnimating || loadedFonts.length <= 1) return;
    
    const newIndex = currentFontIndex + direction;
    if (newIndex < 0 || newIndex >= loadedFonts.length) return;
    
    currentFontIndex = newIndex;
    updatePreview(true);
}

// 更新字体导航按钮状态
function updateFontNavigation() {
    prevFontButton.disabled = currentFontIndex <= 0;
    nextFontButton.disabled = currentFontIndex >= loadedFonts.length - 1 || loadedFonts.length <= 1;
    
    // 添加按钮状态动画
    [prevFontButton, nextFontButton].forEach(btn => {
        if (btn.disabled) {
            btn.style.opacity = '0.5';
            btn.style.transform = 'scale(0.95)';
        } else {
            btn.style.opacity = '1';
            btn.style.transform = 'scale(1)';
        }
    });
}

// 更新预览
async function updatePreview(withAnimation = false) {
    if (loadedFonts.length === 0) return;
    
    if (withAnimation) {
        isAnimating = true;
    }
    
    // 清空预览容器
    previewWrapper.innerHTML = '';
    
    // 获取当前字体和样式设置
    const currentFont = loadedFonts[currentFontIndex];
    const fontSize = fontSizeInput.value;
    const lineHeight = lineHeightInput.value;
    const letterSpacing = letterSpacingInput.value;
    const text = previewTextArea.value || 'བོད་ཡིག་ཡིག་གཟུགས་ལྟ་ཞིབ་ཡོ་བྱད། འདི་ནི་བོད་ཡིག་ཡིག་གཟུགས་ལྟ་ཞིབ་བྱེད་པའི་ཡོ་བྱད་ཞིག་ཡིན།';
    
    // 创建预览项
    const previewItem = document.createElement('div');
    previewItem.className = 'preview-item';
    
    // 创建字体名称标题
    const fontTitle = document.createElement('h3');
    fontTitle.textContent = currentFont.name;
    
    // 创建预览文本容器
    const previewText = document.createElement('div');
    previewText.className = 'preview-text';
    previewText.textContent = text;
    previewText.style.fontFamily = currentFont.isDefault ? currentFont.family : `"${currentFont.name}", ${currentFont.family}`;
    previewText.style.fontSize = `${fontSize}px`;
    previewText.style.lineHeight = lineHeight;
    previewText.style.letterSpacing = `${letterSpacing}px`;
    
    // 应用颜色设置
    if (currentColorType === 'solid') {
        previewText.style.color = currentFontColor;
        previewText.style.background = 'none';
        previewText.style.webkitBackgroundClip = 'initial';
        previewText.style.webkitTextFillColor = 'initial';
        previewText.style.backgroundClip = 'initial';
    } else {
        previewText.style.background = `linear-gradient(${currentGradientDirection}, ${currentGradientColor1}, ${currentGradientColor2})`;
        previewText.style.webkitBackgroundClip = 'text';
        previewText.style.webkitTextFillColor = 'transparent';
        previewText.style.backgroundClip = 'text';
        previewText.style.color = 'transparent';
    }
    
    // 添加到预览项
    previewItem.appendChild(fontTitle);
    previewItem.appendChild(previewText);
    
    // 添加到预览容器
    previewWrapper.appendChild(previewItem);
    
    // 更新导航按钮状态
    updateFontNavigation();
    
    if (withAnimation) {
        // 添加滑动动画
        previewWrapper.style.transform = `translateX(-${currentFontIndex * 100}%)`;
        
        setTimeout(() => {
            isAnimating = false;
        }, 600);
    }
}

// 键盘快捷键处理
function handleKeyboardShortcuts(event) {
    if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
            case 'ArrowLeft':
                event.preventDefault();
                navigateFont(-1);
                break;
            case 'ArrowRight':
                event.preventDefault();
                navigateFont(1);
                break;
            case 's':
                event.preventDefault();
                handleSaveSvg();
                break;
            case ' ':
                event.preventDefault();
                if (previewAnimationButton) {
                    handlePreviewAnimation();
                }
                break;
        }
    }
}

// 保存为SVG（简化版本）
function handleSaveSvg() {
    if (loadedFonts.length === 0) return;
    
    const currentFont = loadedFonts[currentFontIndex];
    const fontSize = parseInt(fontSizeInput.value);
    const lineHeight = parseFloat(lineHeightInput.value);
    const letterSpacing = parseInt(letterSpacingInput.value);
    const text = previewTextArea.value || 'བོད་ཡིག་ཡིག་གཟུགས་ལྟ་ཞིབ་ཡོ་བྱད། འདི་ནི་བོད་ཡིག་ཡིག་གཟུགས་ལྟ་ཞིབ་བྱེད་པའི་ཡོ་བྱད་ཞིག་ཡིན།';
    const lines = text.split('\n').filter(line => line.trim() !== '');
    
    try {
        // 估算文本尺寸
        const maxLineLength = Math.max(...lines.map(line => line.length));
        const estimatedWidth = maxLineLength * fontSize * 0.6;
        const padding = Math.max(fontSize * 0.8, 30);
        const width = Math.ceil(estimatedWidth + padding * 2);
        const height = Math.ceil(lines.length * fontSize * lineHeight + padding * 2 + fontSize * 0.5);
        
        // 创建SVG内容
        let svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>`;
        
        // 添加渐变定义（如果需要）
        if (currentColorType === 'gradient') {
            const angle = parseInt(currentGradientDirection);
            let x1 = "0%", y1 = "0%", x2 = "100%", y2 = "100%";
            
            if (angle === 0) { x1 = "0%"; y1 = "0%"; x2 = "100%"; y2 = "0%"; }
            else if (angle === 45) { x1 = "0%"; y1 = "100%"; x2 = "100%"; y2 = "0%"; }
            else if (angle === 90) { x1 = "0%"; y1 = "100%"; x2 = "0%"; y2 = "0%"; }
            else if (angle === 180) { x1 = "100%"; y1 = "0%"; x2 = "0%"; y2 = "0%"; }
            else if (angle === 270) { x1 = "0%"; y1 = "0%"; x2 = "0%"; y2 = "100%"; }
            
            svgContent += `
    <linearGradient id="textGradient" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">
      <stop offset="0%" stop-color="${currentGradientColor1}"/>
      <stop offset="100%" stop-color="${currentGradientColor2}"/>
    </linearGradient>`;
        }
        
        svgContent += `
  </defs>
  <rect width="100%" height="100%" fill="white"/>`;
        
        // 添加文本
        const fillColor = currentColorType === 'solid' ? currentFontColor : 'url(#textGradient)';
        const fontFamily = currentFont.isDefault ? currentFont.family : currentFont.name;
        
        lines.forEach((line, index) => {
            const y = padding + fontSize + (index * fontSize * lineHeight);
            // 转义XML特殊字符
            const escapedLine = line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
            svgContent += `
  <text x="${padding}" y="${y}" font-family="${fontFamily}" font-size="${fontSize}" letter-spacing="${letterSpacing}" fill="${fillColor}" dominant-baseline="alphabetic">${escapedLine}</text>`;
        });
        
        svgContent += `
</svg>`;
        
        // 下载文件
        downloadFile(svgContent, '字体效果.svg', 'image/svg+xml');
        showNotification('SVG文件已保存', 'success');
        
    } catch (error) {
        console.error('SVG生成失败:', error);
        showNotification('SVG生成失败，请重试', 'error');
    }
}

// 保存为PNG
function handleSavePng() {
    if (loadedFonts.length === 0) return;
    
    // 直接使用备用生成方式，更可靠
    fallbackPngGeneration();
}

// 备用PNG生成方法
function fallbackPngGeneration() {
    const currentFont = loadedFonts[currentFontIndex];
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    const fontSize = parseInt(fontSizeInput.value);
    const text = previewTextArea.value || 'བོད་ཡིག་ཡིག་གཟུགས་ལྟ་ཞིབ་ཡོ་བྱད། འདི་ནི་བོད་ཡིག་ཡིག་གཟུགས་ལྟ་ཞིབ་བྱེད་པའི་ཡོ་བྱད་ཞིག་ཡིན།';
    const lineHeight = parseFloat(lineHeightInput.value);
    const letterSpacing = parseInt(letterSpacingInput.value);
    const lines = text.split('\n').filter(line => line.trim() !== '');
    
    // 设置字体以便测量
    context.font = `${fontSize}px ${currentFont.family}`;
    
    // 动态计算每行的实际宽度
    let maxWidth = 0;
    const lineWidths = [];
    
    lines.forEach(line => {
        const metrics = context.measureText(line);
        const lineWidth = metrics.width + (line.length - 1) * letterSpacing;
        lineWidths.push(lineWidth);
        maxWidth = Math.max(maxWidth, lineWidth);
    });
    
    // 动态计算画布尺寸，添加适当的边距
    const padding = Math.max(fontSize * 0.8, 30);
    canvas.width = Math.ceil(maxWidth + padding * 2);
    canvas.height = Math.ceil(lines.length * fontSize * lineHeight + padding * 2 + fontSize * 0.5);
    
    // 重新设置字体（画布尺寸改变后需要重新设置）
    context.font = `${fontSize}px ${currentFont.family}`;
    context.textBaseline = 'alphabetic'; // 改为alphabetic基线，更适合文本显示
    
    // 绘制白色背景
    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // 应用颜色设置
    if (currentColorType === 'solid') {
        context.fillStyle = currentFontColor;
    } else {
        // 根据渐变方向创建渐变
        let gradient;
        const angle = parseInt(currentGradientDirection);
        
        if (angle === 0) { // 从左到右
            gradient = context.createLinearGradient(0, 0, canvas.width, 0);
        } else if (angle === 90) { // 从下到上
            gradient = context.createLinearGradient(0, canvas.height, 0, 0);
        } else if (angle === 180) { // 从右到左
            gradient = context.createLinearGradient(canvas.width, 0, 0, 0);
        } else if (angle === 270) { // 从上到下
            gradient = context.createLinearGradient(0, 0, 0, canvas.height);
        } else if (angle === 45) { // 左下到右上
            gradient = context.createLinearGradient(0, canvas.height, canvas.width, 0);
        } else { // 默认135度，左上到右下
            gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
        }
        
        gradient.addColorStop(0, currentGradientColor1);
        gradient.addColorStop(1, currentGradientColor2);
        context.fillStyle = gradient;
    }
    
    // 绘制文本
    lines.forEach((line, index) => {
        const y = padding + fontSize + (index * fontSize * lineHeight);
        context.fillText(line, padding, y);
    });
    
    canvas.toBlob(blob => {
        downloadFile(blob, `字体效果.png`, 'image/png');
        showNotification('PNG文件已保存', 'success');
    });
}

// 本地保存功能
function handleSaveLocal() {
    const projectData = {
        fonts: loadedFonts.map(font => ({
            name: font.name,
            family: font.family,
            isDefault: font.isDefault
        })),
        currentFontIndex: currentFontIndex,
        settings: {
            fontSize: fontSizeInput.value,
            lineHeight: lineHeightInput.value,
            letterSpacing: letterSpacingInput.value,
            text: previewTextArea.value,
            animationType: currentAnimationType,
            animationSpeed: currentAnimationSpeed,
            colorType: currentColorType,
            fontColor: currentFontColor,
            gradientColor1: currentGradientColor1,
            gradientColor2: currentGradientColor2,
            gradientDirection: currentGradientDirection
        },
        timestamp: new Date().toISOString()
    };
    
    const jsonString = JSON.stringify(projectData, null, 2);
    downloadFile(jsonString, '藏文字体预览项目.json', 'application/json');
    showNotification('项目配置已保存到本地', 'success');
}

// 文件下载辅助函数
function downloadFile(content, fileName, contentType) {
    const blob = content instanceof Blob ? content : new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // 清理URL对象
    setTimeout(() => URL.revokeObjectURL(url), 100);
}

// 加载状态样式
const loadingStyle = document.createElement('style');
loadingStyle.textContent = `
    .loading {
        display: inline-block;
        width: 20px;
        height: 20px;
        border: 3px solid rgba(102, 126, 234, 0.3);
        border-radius: 50%;
        border-top-color: #667eea;
        animation: spin 1s ease-in-out infinite;
    }
    
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
    
    .success-indicator {
        color: #10b981;
        animation: successPulse 0.6s ease-out;
    }
    
    @keyframes successPulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
    }
`;
document.head.appendChild(loadingStyle);
