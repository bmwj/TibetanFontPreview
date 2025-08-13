/**
 * 藏文字体预览工具
 * 支持字体上传、预览、动画效果和导出功能
 */

// 全局状态管理
const AppState = {
  // 字体管理
  fonts: {
    loaded: [],
    currentIndex: 0,
    isAnimating: false
  },
  
  // 动画设置
  animation: {
    type: 'slideLeft',
    speed: 0.6,
    names: {
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
    }
  },
  
  // 颜色设置
  color: {
    type: 'solid',
    solid: '#2d3748',
    gradient: {
      color1: '#667eea',
      color2: '#764ba2',
      direction: '135deg'
    }
  }
};

// DOM 元素引用
const UI = {
  // 字体控制
  font: {
    fileInput: document.getElementById('font-file'),
    infoElement: document.getElementById('font-info'),
    prevButton: document.getElementById('prev-font'),
    nextButton: document.getElementById('next-font')
  },
  
  // 文本控制
  text: {
    area: document.getElementById('preview-text'),
    charCount: document.getElementById('char-count'),
    previewWrapper: document.getElementById('preview-wrapper')
  },
  
  // 排版控制
  typography: {
    fontSize: {
      input: document.getElementById('font-size'),
      value: document.getElementById('font-size-value')
    },
    lineHeight: {
      input: document.getElementById('line-height'),
      value: document.getElementById('line-height-value')
    },
    letterSpacing: {
      input: document.getElementById('letter-spacing'),
      value: document.getElementById('letter-spacing-value')
    }
  },
  
  // 保存控制
  save: {
    svg: document.getElementById('save-svg'),
    png: document.getElementById('save-png'),
    local: document.getElementById('save-local')
  },
  
  // 动画控制
  animation: {
    type: document.getElementById('animation-type'),
    speed: {
      input: document.getElementById('animation-speed'),
      value: document.getElementById('animation-speed-value')
    },
    previewButton: document.getElementById('preview-animation')
  },
  
  // 颜色控制
  color: {
    type: document.getElementById('color-type'),
    solid: {
      input: document.getElementById('font-color'),
      group: document.getElementById('solid-color-group')
    },
    gradient: {
      controls: document.getElementById('gradient-controls'),
      color1: document.getElementById('gradient-color1'),
      color2: document.getElementById('gradient-color2'),
      direction: document.getElementById('gradient-direction')
    }
  }
};

/**
 * 工具类 - 通用辅助函数
 */
const Utils = {
  // 防抖函数
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },
  
  // 文件下载辅助函数
  downloadFile(content, fileName, contentType) {
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
  },
  
  // 将字体文件转换为Base64
  async fontToBase64(fontFile) {
    if (!fontFile) return '';
    
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.readAsDataURL(fontFile);
    });
  }
};

/**
 * 通知管理器 - 处理用户通知
 */
const NotificationManager = {
  // 显示通知
  show(message, type = 'info') {
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
};

/**
 * 样式管理器 - 处理动态样式注入
 */
const StyleManager = {
  // 注入所有需要的样式
  injectStyles() {
    this.injectRippleStyle();
    this.injectShakeStyle();
    this.injectNotificationStyle();
    this.injectLoadingStyle();
  },
  
  // 波纹效果样式
  injectRippleStyle() {
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
  },
  
  // 摇晃效果样式
  injectShakeStyle() {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
      }
    `;
    document.head.appendChild(style);
  },
  
  // 通知样式
  injectNotificationStyle() {
    const style = document.createElement('style');
    style.textContent = `
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
    document.head.appendChild(style);
  },
  
  // 加载状态样式
  injectLoadingStyle() {
    const style = document.createElement('style');
    style.textContent = `
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
    document.head.appendChild(style);
  }
};

/**
 * UI管理器 - 处理界面交互和效果
 */
const UIManager = {
  // 检测浏览器支持
  detectBrowserSupport() {
    const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
    const isFirefox = /Firefox/.test(navigator.userAgent);
    const isSafari = /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor);
    
    if (isChrome || isFirefox || isSafari) {
      console.log('浏览器兼容性检测通过');
    } else {
      NotificationManager.show('当前浏览器可能不完全支持所有功能，建议使用Chrome、Firefox或Safari', 'warning');
    }
  },

  // 初始化动画控制
  initializeAnimationControls() {
    if (UI.animation.speed.value) {
      UI.animation.speed.value.textContent = `${AppState.animation.speed}s`;
    }
  },
  
  // 添加动画效果
  addAnimationEffects() {
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
          this.createRippleEffect(e, button);
        }
      });
    });
  },
  
  // 创建波纹效果
  createRippleEffect(event, element) {
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
  },
  
  // 显示加载状态
  showLoadingState(isLoading) {
    if (isLoading) {
      UI.font.infoElement.innerHTML = '<span class="loading"></span> 正在加载字体...';
    }
  },

  // 更新字体信息显示
  updateFontInfo(message) {
    UI.font.infoElement.innerHTML = `<span class="success-indicator">✓</span> ${message}`;
  }
};

/**
 * 文本管理器 - 处理文本相关功能
 */
const TextManager = {
  // 更新字符计数
  updateCharCount() {
    const count = UI.text.area.value.length;
    UI.text.charCount.textContent = count;
    
    // 超出限制时变红
    if (count > 1000) {
      UI.text.charCount.style.color = '#ef4444';
      UI.text.charCount.style.animation = 'shake 0.5s ease-in-out';
    } else {
      UI.text.charCount.style.color = '#666';
      UI.text.charCount.style.animation = 'none';
    }
  },
  
  // 获取当前预览文本
  getPreviewText() {
    return UI.text.area.value || 'བོད་ཡིག་ཡིག་གཟུགས་ལྟ་ཞིབ་ཡོ་བྱད། འདི་ནི་བོད་ཡིག་ཡིག་གཟུགས་ལྟ་ཞིབ་བྱེད་པའི་ཡོ་བྱད་ཞིག་ཡིན།';
  },
  
  // 获取文本行
  getTextLines() {
    return this.getPreviewText().split('\n').filter(line => line.trim() !== '');
  }
};

/**
 * 字体管理器 - 处理字体相关功能
 */
const FontManager = {
  // 加载默认字体
  loadDefaultFont() {
    const defaultFontName = '默认藏文字体';
    const defaultFontFamily = 'Tibetan Machine Uni, Microsoft Himalaya, Jomolhari, DDC Uchen, Monlam Uni Sans Serif, Qomolangma-Uchen Sarchen, Qomolangma-Uchen Sarchung, Qomolangma-Edict, Qomolangma-Dunhuang, BabelStone Tibetan, Noto Sans Tibetan, serif';
    
    AppState.fonts.loaded.push({
      name: defaultFontName,
      family: defaultFontFamily,
      isDefault: true
    });
    
    this.updateNavigation();
    PreviewManager.updatePreview();
    UIManager.updateFontInfo('已加载默认藏文字体，支持标准藏文显示');
  },
  
  // 字体文件上传处理
  async handleFontUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!file.name.match(/\.(ttf|otf)$/i)) {
      NotificationManager.show('请上传.ttf或.otf格式的字体文件', 'error');
      return;
    }
    
    UIManager.showLoadingState(true);
    
    try {
      const fontName = file.name.replace(/\.(ttf|otf)$/i, '');
      const fontUrl = URL.createObjectURL(file);
      const fontFace = new FontFace(fontName, `url(${fontUrl})`);
      
      // 加载字体
      await fontFace.load();
      document.fonts.add(fontFace);
      
      // 添加到已加载字体列表
      AppState.fonts.loaded.push({
        name: fontName,
        family: fontName,
        url: fontUrl,
        file: file,
        isDefault: false
      });
      
      // 更新UI
      UIManager.updateFontInfo(`已成功加载: ${fontName}`);
      FontManager.updateNavigation();
      
      // 切换到新加载的字体
      AppState.fonts.currentIndex = AppState.fonts.loaded.length - 1;
      await PreviewManager.updatePreview();
      
      NotificationManager.show('字体加载成功！', 'success');
    } catch (error) {
      console.error('字体加载失败:', error);
      NotificationManager.show('字体加载失败，请尝试其他字体文件', 'error');
    } finally {
      UIManager.showLoadingState(false);
    }
  },
  
  // 字体导航
  navigateFont(direction) {
    if (AppState.fonts.isAnimating || AppState.fonts.loaded.length <= 1) return;
    
    const newIndex = AppState.fonts.currentIndex + direction;
    if (newIndex < 0 || newIndex >= AppState.fonts.loaded.length) return;
    
    AppState.fonts.currentIndex = newIndex;
    PreviewManager.updatePreview(true);
  },
  
  // 更新字体导航按钮状态
  updateNavigation() {
    const { currentIndex, loaded } = AppState.fonts;
    UI.font.prevButton.disabled = currentIndex <= 0;
    UI.font.nextButton.disabled = currentIndex >= loaded.length - 1 || loaded.length <= 1;
    
    // 添加按钮状态动画
    [UI.font.prevButton, UI.font.nextButton].forEach(btn => {
      if (btn.disabled) {
        btn.style.opacity = '0.5';
        btn.style.transform = 'scale(0.95)';
      } else {
        btn.style.opacity = '1';
        btn.style.transform = 'scale(1)';
      }
    });
  },
  
  // 获取当前字体
  getCurrentFont() {
    return AppState.fonts.loaded[AppState.fonts.currentIndex];
  }
};

/**
 * 排版管理器 - 处理排版相关功能
 */
const TypographyManager = {
  // 字体大小变化处理
  handleFontSizeChange() {
    UI.typography.fontSize.value.textContent = `${UI.typography.fontSize.input.value}px`;
    PreviewManager.updatePreview();
  },
  
  // 行高变化处理
  handleLineHeightChange() {
    UI.typography.lineHeight.value.textContent = UI.typography.lineHeight.input.value;
    PreviewManager.updatePreview();
  },
  
  // 字间距变化处理
  handleLetterSpacingChange() {
    UI.typography.letterSpacing.value.textContent = `${UI.typography.letterSpacing.input.value}px`;
    PreviewManager.updatePreview();
  },
  
  // 获取当前排版设置
  getSettings() {
    return {
      fontSize: parseInt(UI.typography.fontSize.input.value),
      lineHeight: parseFloat(UI.typography.lineHeight.input.value),
      letterSpacing: parseInt(UI.typography.letterSpacing.input.value)
    };
  }
};

/**
 * 颜色管理器 - 处理颜色相关功能
 */
const ColorManager = {
  // 颜色类型变化处理
  handleColorTypeChange() {
    AppState.color.type = UI.color.type.value;
    
    if (AppState.color.type === 'solid') {
      UI.color.solid.group.style.display = 'flex';
      UI.color.gradient.controls.style.display = 'none';
    } else {
      UI.color.solid.group.style.display = 'none';
      UI.color.gradient.controls.style.display = 'block';
    }
    
    PreviewManager.updatePreview();
  },
  
  // 字体颜色变化处理
  handleFontColorChange() {
    AppState.color.solid = UI.color.solid.input.value;
    PreviewManager.updatePreview();
  },
  
  // 渐变颜色变化处理
  handleGradientColorChange() {
    AppState.color.gradient.color1 = UI.color.gradient.color1.value;
    AppState.color.gradient.color2 = UI.color.gradient.color2.value;
    PreviewManager.updatePreview();
  },
  
  // 渐变方向变化处理
  handleGradientDirectionChange() {
    AppState.color.gradient.direction = UI.color.gradient.direction.value;
    PreviewManager.updatePreview();
  },
  
  // 应用颜色样式到元素
  applyColorStyle(element) {
    if (AppState.color.type === 'solid') {
      element.style.color = AppState.color.solid;
      element.style.background = 'none';
      element.style.webkitBackgroundClip = 'initial';
      element.style.webkitTextFillColor = 'initial';
      element.style.backgroundClip = 'initial';
    } else {
      const { color1, color2, direction } = AppState.color.gradient;
      element.style.background = `linear-gradient(${direction}, ${color1}, ${color2})`;
      element.style.webkitBackgroundClip = 'text';
      element.style.webkitTextFillColor = 'transparent';
      element.style.backgroundClip = 'text';
      element.style.color = 'transparent';
    }
  },
  
  // 获取当前颜色设置
  getColorStyle() {
    if (AppState.color.type === 'solid') {
      return AppState.color.solid;
    } else {
      return {
        type: 'gradient',
        color1: AppState.color.gradient.color1,
        color2: AppState.color.gradient.color2,
        direction: AppState.color.gradient.direction
      };
    }
  }
};

/**
 * 动画管理器 - 处理动画相关功能
 */
const AnimationManager = {
  // 动画类型变化处理
  handleAnimationTypeChange() {
    AppState.animation.type = UI.animation.type.value;
  },
  
  // 动画速度变化处理
  handleAnimationSpeedChange() {
    AppState.animation.speed = parseFloat(UI.animation.speed.input.value);
    UI.animation.speed.value.textContent = `${AppState.animation.speed}s`;
  },
  
  // 预览动画
  handlePreviewAnimation() {
    const previewText = document.querySelector('.preview-text');
    if (!previewText) return;
    
    // 移除之前的动画类
    previewText.className = previewText.className.replace(/font-animation-\w+/g, '');
    
    // 清除之前的内容
    const originalText = previewText.textContent;
    previewText.innerHTML = '';
    
    // 设置动画持续时间
    previewText.style.setProperty('--animation-duration', `${AppState.animation.speed}s`);
    
    if (AppState.animation.type === 'typewriter') {
      this.applyTypewriterAnimation(previewText, originalText);
    } else if (['wave', 'glow', 'shake'].includes(AppState.animation.type)) {
      this.applyWholeTextAnimation(previewText, originalText);
    } else {
      this.applyCharacterAnimation(previewText, originalText);
    }
    
    NotificationManager.show(`已应用${this.getAnimationName()}动画效果`, 'success');
  },
  
  // 应用打字机动画
  applyTypewriterAnimation(element, text) {
    element.textContent = text;
    element.classList.add(`font-animation-${AppState.animation.type}`);
    
    setTimeout(() => {
      element.className = element.className.replace(/font-animation-\w+/g, '');
    }, AppState.animation.speed * 1000);
  },
  
  // 应用整体文本动画
  applyWholeTextAnimation(element, text) {
    element.textContent = text;
    element.classList.add(`font-animation-${AppState.animation.type}`);
    
    // 这些是循环动画，设置一个较长的时间后停止
    setTimeout(() => {
      element.className = element.className.replace(/font-animation-\w+/g, '');
    }, AppState.animation.speed * 3000);
  },
  
  // 应用字符级动画
  applyCharacterAnimation(element, text) {
    const chars = text.split('');
    
    // 创建字符级动画
    chars.forEach((char, index) => {
      const charSpan = document.createElement('span');
      charSpan.className = 'char';
      charSpan.textContent = char;
      charSpan.style.animationDelay = `${index * (AppState.animation.speed / 20)}s`;
      charSpan.style.animationDuration = `${AppState.animation.speed}s`;
      
      // 根据动画类型设置不同的动画
      switch(AppState.animation.type) {
        case 'slideLeft':
          charSpan.style.animation = `slideLeft ${AppState.animation.speed}s forwards`;
          break;
        case 'slideRight':
          charSpan.style.animation = `slideRight ${AppState.animation.speed}s forwards`;
          break;
        case 'slideUp':
          charSpan.style.animation = `slideUp ${AppState.animation.speed}s forwards`;
          break;
        case 'slideDown':
          charSpan.style.animation = `slideDown ${AppState.animation.speed}s forwards`;
          break;
        case 'fadeIn':
          charSpan.style.animation = `charFadeIn ${AppState.animation.speed}s forwards`;
          break;
        case 'zoomIn':
          charSpan.style.animation = `zoomIn ${AppState.animation.speed}s forwards`;
          break;
        case 'rotateIn':
          charSpan.style.animation = `charRotate ${AppState.animation.speed}s forwards`;
          break;
        case 'bounceIn':
          charSpan.style.animation = `charPop ${AppState.animation.speed}s forwards`;
          break;
        default:
          charSpan.style.animation = `charFadeIn ${AppState.animation.speed}s forwards`;
      }
      
      element.appendChild(charSpan);
    });
    
    // 动画结束后恢复原始文本
    setTimeout(() => {
      element.innerHTML = text;
    }, AppState.animation.speed * 1000 + 500);
  },
  
  // 获取动画名称
  getAnimationName() {
    return AppState.animation.names[AppState.animation.type] || AppState.animation.type;
  }
};

/**
 * 预览管理器 - 处理预览相关功能
 */
const PreviewManager = {
  // 更新预览
  async updatePreview(withAnimation = false) {
    if (AppState.fonts.loaded.length === 0) return;
    
    if (withAnimation) {
      AppState.fonts.isAnimating = true;
    }
    
    // 清空预览容器
    UI.text.previewWrapper.innerHTML = '';
    
    // 获取当前字体和样式设置
    const currentFont = FontManager.getCurrentFont();
    const { fontSize, lineHeight, letterSpacing } = TypographyManager.getSettings();
    const text = TextManager.getPreviewText();
    
  // 创建预览项
  const previewItem = document.createElement('div');
  previewItem.className = 'preview-item';
  
  // 创建预览文本容器
  const previewText = document.createElement('div');
  previewText.className = 'preview-text';
  previewText.textContent = text;
  previewText.style.fontFamily = currentFont.isDefault ? currentFont.family : `"${currentFont.name}", ${currentFont.family}`;
  previewText.style.fontSize = `${fontSize}px`;
  previewText.style.lineHeight = lineHeight;
  previewText.style.letterSpacing = `${letterSpacing}px`;
  
  // 应用颜色设置
  ColorManager.applyColorStyle(previewText);
  
  // 添加到预览项
  previewItem.appendChild(previewText);
    
    // 添加到预览容器
    UI.text.previewWrapper.appendChild(previewItem);
    
    // 更新导航按钮状态
    FontManager.updateNavigation();
    
    if (withAnimation) {
      // 添加滑动动画
      UI.text.previewWrapper.style.transform = `translateX(-${AppState.fonts.currentIndex * 100}%)`;
      
      setTimeout(() => {
        AppState.fonts.isAnimating = false;
      }, 600);
    }
  }
};

/**
 * 导出管理器 - 处理导出相关功能
 */
const ExportManager = {
  // 保存为SVG
  async handleSaveSvg() {
    if (AppState.fonts.loaded.length === 0) {
      NotificationManager.show('请先加载字体', 'warning');
      return;
    }
    
    try {
      NotificationManager.show('正在生成SVG...', 'info');
      
      const currentFont = FontManager.getCurrentFont();
      const { fontSize, lineHeight, letterSpacing } = TypographyManager.getSettings();
      const text = TextManager.getPreviewText();
      const lines = TextManager.getTextLines();
      
      // 创建临时canvas来精确测量文本尺寸
      const tempCanvas = document.createElement('canvas');
      const tempContext = tempCanvas.getContext('2d');
      tempContext.font = `${fontSize}px ${currentFont.isDefault ? currentFont.family : currentFont.name}`;
      
      // 精确计算每行的实际宽度
      let maxWidth = 0;
      lines.forEach(line => {
        const metrics = tempContext.measureText(line);
        const lineWidth = metrics.width + (line.length - 1) * letterSpacing;
        maxWidth = Math.max(maxWidth, lineWidth);
      });
      
      // 设置适当的边距和尺寸
      const padding = Math.max(fontSize * 0.8, 30);
      const width = Math.ceil(maxWidth + padding * 2);
      const height = Math.ceil(lines.length * fontSize * lineHeight + padding * 2 + fontSize * 0.5);
      
      // 创建SVG内容
      let svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>`;

      // 添加字体定义
      if (!currentFont.isDefault && currentFont.file) {
        const fontBase64 = await Utils.fontToBase64(currentFont.file);
        svgContent += `
    <style type="text/css">
      @font-face {
        font-family: '${currentFont.name.replace(/'/g, "\\'")}';
        src: url(data:font/ttf;base64,${fontBase64});
        font-weight: normal;
        font-style: normal;
      }
    </style>`;
      }
      
      // 添加渐变定义（如果需要）
      if (AppState.color.type === 'gradient') {
        const { color1, color2, direction } = AppState.color.gradient;
        const angle = parseInt(direction);
        let x1 = "0%", y1 = "0%", x2 = "100%", y2 = "100%";
        
        if (angle === 0) { x1 = "0%"; y1 = "0%"; x2 = "100%"; y2 = "0%"; }
        else if (angle === 45) { x1 = "0%"; y1 = "100%"; x2 = "100%"; y2 = "0%"; }
        else if (angle === 90) { x1 = "0%"; y1 = "100%"; x2 = "0%"; y2 = "0%"; }
        else if (angle === 180) { x1 = "100%"; y1 = "0%"; x2 = "0%"; y2 = "0%"; }
        else if (angle === 270) { x1 = "0%"; y1 = "0%"; x2 = "0%"; y2 = "100%"; }
        
        svgContent += `
    <linearGradient id="textGradient" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">
      <stop offset="0%" stop-color="${color1}"/>
      <stop offset="100%" stop-color="${color2}"/>
    </linearGradient>`;
      }
      
      svgContent += `
  </defs>
  <rect width="100%" height="100%" fill="white"/>`;
      
      // 添加文本
      const fillColor = AppState.color.type === 'solid' ? AppState.color.solid : 'url(#textGradient)';
      const fontFamily = currentFont.isDefault ? 
        currentFont.family.replace(/"/g, "'") : 
        `'${currentFont.name.replace(/'/g, "\\'")}'`;
      
      // 计算实际文本宽度，避免SVG留下空白
      let actualWidth = 0;
      
      lines.forEach((line, index) => {
        const y = padding + fontSize + (index * fontSize * lineHeight);
        
        // 转义XML特殊字符
        const escapedLine = line
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
        
        // 测量这行文本的宽度
        const metrics = tempContext.measureText(line);
        const lineWidth = metrics.width + (line.length - 1) * letterSpacing;
        actualWidth = Math.max(actualWidth, lineWidth);
        
        svgContent += `
  <text x="${padding}" y="${y}" font-family="${fontFamily}" font-size="${fontSize}px" letter-spacing="${letterSpacing}px" fill="${fillColor}" dominant-baseline="alphabetic">${escapedLine}</text>`;
      });
      
      svgContent += `
</svg>`;
      
      // 下载文件
      Utils.downloadFile(svgContent, '字体效果.svg', 'image/svg+xml');
      NotificationManager.show('SVG文件已保存', 'success');
      
    } catch (error) {
      console.error('SVG生成失败:', error);
      NotificationManager.show('SVG生成失败，请重试', 'error');
    }
  },
  
  // 保存为PNG - 使用Canvas API直接绘制
  handleSavePng() {
    // 检查是否有加载字体
    if (AppState.fonts.loaded.length === 0) {
      NotificationManager.show('请先加载字体', 'warning');
      return;
    }
    
    // 显示正在处理的通知
    NotificationManager.show('正在生成PNG...', 'info');
    
    try {
      const currentFont = FontManager.getCurrentFont();
      const { fontSize, lineHeight, letterSpacing } = TypographyManager.getSettings();
      const text = TextManager.getPreviewText();
      const lines = TextManager.getTextLines();
      
      // 创建Canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // 设置字体
      const fontFamily = currentFont.isDefault ? 
        currentFont.family : 
        `"${currentFont.name}", ${currentFont.family}`;
      
      ctx.font = `${fontSize}px ${fontFamily}`;
      
      // 计算尺寸
      let maxWidth = 0;
      lines.forEach(line => {
        const metrics = ctx.measureText(line);
        const lineWidth = metrics.width + (line.length - 1) * letterSpacing;
        maxWidth = Math.max(maxWidth, lineWidth);
      });
      
      // 设置Canvas尺寸
      const padding = Math.max(fontSize * 0.8, 30);
      canvas.width = Math.ceil(maxWidth + padding * 2);
      canvas.height = Math.ceil(lines.length * fontSize * lineHeight + padding * 2);
      
      // 重新设置字体（Canvas尺寸改变后需要重新设置）
      ctx.font = `${fontSize}px ${fontFamily}`;
      ctx.textBaseline = 'alphabetic';
      
      // 绘制白色背景
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // 设置颜色
      if (AppState.color.type === 'solid') {
        ctx.fillStyle = AppState.color.solid;
      } else {
        // 创建渐变
        const { color1, color2, direction } = AppState.color.gradient;
        const angle = parseInt(direction);
        let gradient;
        
        if (angle === 0) { // 从左到右
          gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
        } else if (angle === 90) { // 从下到上
          gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
        } else if (angle === 180) { // 从右到左
          gradient = ctx.createLinearGradient(canvas.width, 0, 0, 0);
        } else if (angle === 270) { // 从上到下
          gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        } else if (angle === 45) { // 左下到右上
          gradient = ctx.createLinearGradient(0, canvas.height, canvas.width, 0);
        } else { // 默认135度，左上到右下
          gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        }
        
        gradient.addColorStop(0, color1);
        gradient.addColorStop(1, color2);
        ctx.fillStyle = gradient;
      }
      
      // 绘制文本
      lines.forEach((line, index) => {
        const y = padding + fontSize + (index * fontSize * lineHeight);
        
        // 如果有字间距，需要逐字绘制
        if (letterSpacing !== 0) {
          let x = padding;
          for (let i = 0; i < line.length; i++) {
            ctx.fillText(line[i], x, y);
            // 使用measureText获取字符宽度，加上字间距
            x += ctx.measureText(line[i]).width + letterSpacing;
          }
        } else {
          // 没有字间距，直接绘制整行
          ctx.fillText(line, padding, y);
        }
      });
      
      // 转换为PNG并下载
      canvas.toBlob(blob => {
        if (blob) {
          Utils.downloadFile(blob, '字体效果.png', 'image/png');
          NotificationManager.show('PNG文件已保存', 'success');
        } else {
          throw new Error('无法创建图像数据');
        }
      }, 'image/png');
      
    } catch (error) {
      console.error('PNG生成失败:', error);
      NotificationManager.show('PNG生成失败，请重试', 'error');
    }
  },
  
  // 本地保存功能
  handleSaveLocal() {
    const projectData = {
      fonts: AppState.fonts.loaded.map(font => ({
        name: font.name,
        family: font.family,
        isDefault: font.isDefault
      })),
      currentFontIndex: AppState.fonts.currentIndex,
      settings: {
        fontSize: UI.typography.fontSize.input.value,
        lineHeight: UI.typography.lineHeight.input.value,
        letterSpacing: UI.typography.letterSpacing.input.value,
        text: UI.text.area.value,
        animationType: AppState.animation.type,
        animationSpeed: AppState.animation.speed,
        colorType: AppState.color.type,
        fontColor: AppState.color.solid,
        gradientColor1: AppState.color.gradient.color1,
        gradientColor2: AppState.color.gradient.color2,
        gradientDirection: AppState.color.gradient.direction
      },
      timestamp: new Date().toISOString()
    };
    
    const jsonString = JSON.stringify(projectData, null, 2);
    Utils.downloadFile(jsonString, '藏文字体预览项目.json', 'application/json');
    NotificationManager.show('项目配置已保存到本地', 'success');
  }
};

/**
 * 键盘管理器 - 处理键盘快捷键
 */
const KeyboardManager = {
  // 处理键盘快捷键
  handleKeyboardShortcuts(event) {
    // Ctrl/Cmd + S: 保存SVG
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
      event.preventDefault();
      ExportManager.handleSaveSvg();
    }
    
    // Ctrl/Cmd + P: 保存PNG
    if ((event.ctrlKey || event.metaKey) && event.key === 'p') {
      event.preventDefault();
      ExportManager.handleSavePng();
    }
    
    // 左右箭头: 导航字体
    if (event.key === 'ArrowLeft' && !UI.font.prevButton.disabled) {
      event.preventDefault();
      FontManager.navigateFont(-1);
    }
    
    if (event.key === 'ArrowRight' && !UI.font.nextButton.disabled) {
      event.preventDefault();
      FontManager.navigateFont(1);
    }
    
    // Ctrl/Cmd + Shift + A: 预览动画
    if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'a') {
      event.preventDefault();
      AnimationManager.handlePreviewAnimation();
    }
  }
};

/**
 * 事件管理器 - 处理所有事件监听
 */
const EventManager = {
  // 添加所有事件监听器
  addEventListeners() {
    this.addFontEvents();
    this.addTextEvents();
    this.addTypographyEvents();
    this.addNavigationEvents();
    this.addSaveEvents();
    this.addAnimationEvents();
    this.addColorEvents();
    this.addKeyboardEvents();
  },
  
  // 字体相关事件
  addFontEvents() {
    UI.font.fileInput.addEventListener('change', (event) => FontManager.handleFontUpload(event));
  },
  
  // 文本相关事件
  addTextEvents() {
    UI.text.area.addEventListener('input', Utils.debounce(() => {
      TextManager.updateCharCount();
      PreviewManager.updatePreview();
    }, 300));
  },
  
  // 排版控制事件
  addTypographyEvents() {
    UI.typography.fontSize.input.addEventListener('input', 
      Utils.debounce(() => TypographyManager.handleFontSizeChange(), 100));
    
    UI.typography.lineHeight.input.addEventListener('input', 
      Utils.debounce(() => TypographyManager.handleLineHeightChange(), 100));
    
    UI.typography.letterSpacing.input.addEventListener('input', 
      Utils.debounce(() => TypographyManager.handleLetterSpacingChange(), 100));
  },
  
  // 导航事件
  addNavigationEvents() {
    UI.font.prevButton.addEventListener('click', () => FontManager.navigateFont(-1));
    UI.font.nextButton.addEventListener('click', () => FontManager.navigateFont(1));
  },
  
  // 保存功能事件
  addSaveEvents() {
    // 使用箭头函数确保this绑定正确
    UI.save.svg.addEventListener('click', () => {
      ExportManager.handleSaveSvg();
    });
    
    // 直接绑定PNG保存函数，不使用this引用
    UI.save.png.addEventListener('click', function() {
      // 确保html2canvas已加载
      if (typeof html2canvas !== 'function') {
        NotificationManager.show('html2canvas库未加载，请刷新页面重试', 'error');
        return;
      }
      
      try {
        // 直接调用ExportManager的方法
        ExportManager.handleSavePng();
      } catch (error) {
        console.error('保存PNG时出错:', error);
        NotificationManager.show('保存PNG失败，请重试', 'error');
      }
    });
    
    if (UI.save.local) {
      UI.save.local.addEventListener('click', () => {
        ExportManager.handleSaveLocal();
      });
    }
  },
  
  // 动画控制事件
  addAnimationEvents() {
    if (UI.animation.type) {
      UI.animation.type.addEventListener('change', () => AnimationManager.handleAnimationTypeChange());
    }
    
    if (UI.animation.speed.input) {
      UI.animation.speed.input.addEventListener('input', 
        Utils.debounce(() => AnimationManager.handleAnimationSpeedChange(), 100));
    }
    
    if (UI.animation.previewButton) {
      UI.animation.previewButton.addEventListener('click', () => AnimationManager.handlePreviewAnimation());
    }
  },
  
  // 颜色控制事件
  addColorEvents() {
    if (UI.color.type) {
      UI.color.type.addEventListener('change', () => ColorManager.handleColorTypeChange());
    }
    
    if (UI.color.solid.input) {
      UI.color.solid.input.addEventListener('input', 
        Utils.debounce(() => ColorManager.handleFontColorChange(), 100));
    }
    
    if (UI.color.gradient.color1) {
      UI.color.gradient.color1.addEventListener('input', 
        Utils.debounce(() => ColorManager.handleGradientColorChange(), 100));
    }
    
    if (UI.color.gradient.color2) {
      UI.color.gradient.color2.addEventListener('input', 
        Utils.debounce(() => ColorManager.handleGradientColorChange(), 100));
    }
    
    if (UI.color.gradient.direction) {
      UI.color.gradient.direction.addEventListener('change', 
        () => ColorManager.handleGradientDirectionChange());
    }
  },
  
  // 键盘快捷键事件
  addKeyboardEvents() {
    document.addEventListener('keydown', KeyboardManager.handleKeyboardShortcuts);
  },
  
};


/**
 * 应用初始化
 */
document.addEventListener('DOMContentLoaded', () => {
  // 初始化应用
  StyleManager.injectStyles();
  TextManager.updateCharCount();
  FontManager.loadDefaultFont();
  EventManager.addEventListeners();
  UIManager.addAnimationEffects();
  UIManager.initializeAnimationControls();
  UIManager.detectBrowserSupport();
});

