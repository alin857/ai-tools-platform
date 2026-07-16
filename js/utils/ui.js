/* ============================================
   UI 辅助函数 — Toast、Loading、Modal
   ============================================ */
(function() {
  const UI = {};

  /* ======== Toast ======== */
  let toastContainer = null;

  function getToastContainer() {
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.className = 'toast-container';
      document.body.appendChild(toastContainer);
    }
    return toastContainer;
  }

  /**
   * 显示 Toast 提示
   * @param {string} message - 提示文字
   * @param {'success'|'error'|''} type - 类型
   * @param {number} duration - 显示时长(ms)
   */
  UI.toast = function(message, type, duration) {
    type = type || '';
    duration = duration || 2800;

    var el = document.createElement('div');
    el.className = 'toast' + (type ? ' toast--' + type : '');
    el.textContent = message;
    getToastContainer().appendChild(el);

    setTimeout(function() {
      if (el.parentNode) {
        el.parentNode.removeChild(el);
      }
    }, duration + 400);
  };

  /* ======== Loading ======== */
  /**
   * 显示进度区（切换 visible 类）
   * @param {HTMLElement} el - .tool-progress 元素
   */
  UI.showProgress = function(el) {
    if (el) el.classList.add('visible');
  };

  /**
   * 隐藏进度区
   * @param {HTMLElement} el - .tool-progress 元素
   */
  UI.hideProgress = function(el) {
    if (el) el.classList.remove('visible');
  };

  /* ======== 结果区 ======== */
  /**
   * 显示结果区
   * @param {HTMLElement} el - .tool-result 元素
   */
  UI.showResult = function(el) {
    if (el) el.classList.add('visible');
  };

  /**
   * 隐藏结果区
   * @param {HTMLElement} el - .tool-result 元素
   */
  UI.hideResult = function(el) {
    if (el) el.classList.remove('visible');
  };

  /* ======== 图片预览弹窗 ======== */
  let modalOverlay = null;

  function getModal() {
    if (!modalOverlay) {
      modalOverlay = document.createElement('div');
      modalOverlay.className = 'modal-overlay';
      modalOverlay.innerHTML =
        '<div class="modal-content">' +
          '<button class="modal-close">&times;</button>' +
          '<img src="" alt="预览">' +
        '</div>';
      document.body.appendChild(modalOverlay);

      // 关闭事件
      modalOverlay.addEventListener('click', function(e) {
        if (e.target === modalOverlay || e.target.classList.contains('modal-close')) {
          UI.closePreview();
        }
      });
      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') UI.closePreview();
      });
    }
    return modalOverlay;
  }

  /**
   * 图片全屏预览
   * @param {string} src - 图片 URL
   */
  UI.previewImage = function(src) {
    var modal = getModal();
    modal.querySelector('img').src = src;
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  };

  /** 关闭预览 */
  UI.closePreview = function() {
    var modal = getModal();
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
  };

  /* ======== 按钮防抖 ======== */
  /**
   * 防抖处理，避免重复点击
   * @param {Function} fn
   * @param {number} delay
   * @returns {Function}
   */
  UI.debounce = function(fn, delay) {
    delay = delay || 300;
    var timer;
    return function() {
      var context = this;
      var args = arguments;
      clearTimeout(timer);
      timer = setTimeout(function() {
        fn.apply(context, args);
      }, delay);
    };
  };

  /* ======== 复制到剪贴板 ======== */
  UI.copyText = function(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function() {
        UI.toast('已复制到剪贴板', 'success');
      }).catch(function() {
        UI.toast('复制失败，请手动复制', 'error');
      });
    } else {
      // 降级方案
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
        UI.toast('已复制到剪贴板', 'success');
      } catch (e) {
        UI.toast('复制失败，请手动复制', 'error');
      }
      document.body.removeChild(ta);
    }
  };

  /* ======== 下载文件 ======== */
  UI.downloadFile = function(url, filename) {
    // 使用 iframe 触发下载（最兼容跨域）
    var isImage = /\.(jpg|jpeg|png|gif|webp|bmp)(\?|$)/i.test(url);
    if (isImage) {
      // 图片：在新窗口打开，用户右键保存
      window.open(url, '_blank');
      UI.toast('图片已打开，右键 → 另存为即可保存', 'success');
    } else {
      // 视频/其他：iframe 触发下载
      var iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = url;
      document.body.appendChild(iframe);
      setTimeout(function() { document.body.removeChild(iframe); }, 3000);
      UI.toast('正在下载，请查看浏览器下载列表', 'success');
    }
  };

  /* ======== 随机数辅助 ======== */
  UI.random = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  UI.randomFloat = function(min, max) {
    return Math.random() * (max - min) + min;
  };

  /* ======== 网络检测 ======== */
  UI.isOnline = function() {
    return navigator.onLine !== false;
  };

  /* ======== 共享历史记录组件 ======== */
  /**
   * 渲染历史记录到指定容器
   * @param {HTMLElement} container - 页面容器
   * @param {string} toolName - 工具名称（对应 Storage 中的 key）
   * @param {Function} onItemClick - 点击历史项的回调 (item)
   */
  UI.renderHistory = function(container, toolName, onItemClick) {
    var section = container.querySelector('#historySection');
    if (!section) {
      // 自动创建容器
      section = document.createElement('div');
      section.id = 'historySection';
      container.appendChild(section);
    }

    var items = Storage.getToolHistory(toolName).slice(0, 12);
    if (!items.length) {
      section.innerHTML =
        '<div style="margin-top:24px;">' +
          '<div class="tool-input-area__label" style="margin-bottom:8px;">📋 历史记录</div>' +
          '<div style="font-size:12px;color:var(--text-muted);padding:12px 0;">暂无记录，生成后会自动保存</div>' +
        '</div>';
      return;
    }

    var h = '';
    h += '<div style="margin-top:24px;">';
    h += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">';
    h += '<div class="tool-input-area__label" style="margin-bottom:0;">📋 历史记录</div>';
    h += '<button style="font-size:11px;color:var(--text-muted);background:none;border:none;cursor:pointer;" id="btnClearHistory">清空</button>';
    h += '</div>';
    h += '<div style="display:flex;gap:10px;overflow-x:auto;padding-bottom:8px;">';

    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      var preview = item.prompt || item.title || item.tool || toolName || '生成记录';
      if (preview.length > 30) preview = preview.substring(0, 30) + '...';
      var time = item.timestamp ? UI.formatDate(item.timestamp) : '';
      var thumb = item.thumbnailUrl || item.imageUrl || '';
      var itemType = item.type || 'image';
      var iconMap = { video: '🎬', article: '📝', image: '🖼️', text: '📄' };

      h += '<div class="history-item" data-idx="' + i + '" style="flex-shrink:0;width:130px;border-radius:var(--radius-sm);overflow:hidden;background:var(--bg-card);border:1px solid var(--border-card);cursor:pointer;transition:all var(--transition-fast);">';

      if (thumb) {
        h += '<div style="height:80px;overflow:hidden;background:var(--bg-input);">';
        h += '<img src="' + thumb + '" alt="" style="width:100%;height:100%;object-fit:cover;" loading="lazy">';
        h += '</div>';
      } else {
        h += '<div style="height:80px;display:flex;align-items:center;justify-content:center;background:var(--bg-input);font-size:28px;">' + (iconMap[itemType] || '🖼️') + '</div>';
      }

      h += '<div style="padding:8px 10px;">';
      h += '<div style="font-size:11px;color:var(--text-body);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + (preview || '生成记录') + '</div>';
      h += '<div style="font-size:10px;color:var(--text-muted);margin-top:2px;">' + time + '</div>';
      h += '</div>';

      h += '</div>';
    }

    h += '</div></div>';
    section.innerHTML = h;

    // 清空按钮
    var clearBtn = section.querySelector('#btnClearHistory');
    if (clearBtn) {
      clearBtn.addEventListener('click', function() {
        Storage.clearToolHistory(toolName);
        var s = document.getElementById('historySection');
        if (s) s.innerHTML = '<div style="margin-top:24px;"><div class="tool-input-area__label" style="margin-bottom:8px;">📋 历史记录</div><div style="font-size:12px;color:var(--text-muted);padding:12px 0;">已清空</div></div>';
      });
    }

    // 默认点击事件：打开详情弹窗
    var cards = section.querySelectorAll('.history-item');
    for (var c = 0; c < cards.length; c++) {
      cards[c].addEventListener('click', function() {
        var idx = parseInt(this.getAttribute('data-idx'));
        var entry = items[idx];
        if (!entry) return;
        if (onItemClick) { onItemClick(entry); return; }
        UI._showHistoryDetail(entry);
      });
    }
  };

  /* 历史记录详情弹窗 */
  UI._showHistoryDetail = function(item) {
    var overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.9);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:20px;';
    overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });

    var type = item.type || 'image';
    var content = '';

    if (type === 'video' && (item.videoUrl || item.url)) {
      content = '<video src="' + (item.videoUrl || item.url) + '" controls autoplay style="max-width:100%;max-height:60vh;border-radius:10px;"></video>';
    } else if (type === 'image' && (item.imageUrl || item.url)) {
      content = '<img src="' + (item.imageUrl || item.url) + '" style="max-width:100%;max-height:60vh;border-radius:10px;cursor:pointer;" onclick="UI.previewImage(\'' + (item.imageUrl || item.url) + '\')">';
    } else if (type === 'article' || type === 'text') {
      content = '<div style="max-height:60vh;overflow-y:auto;padding:14px;background:rgba(255,255,255,0.03);border-radius:10px;font-size:13px;line-height:1.8;color:#ccc;white-space:pre-wrap;">' + (item.content || item.prompt || '无内容') + '</div>';
    } else {
      content = '<div style="text-align:center;color:#999;padding:20px;">📄 ' + (item.prompt || item.tool || '历史记录') + '</div>';
    }

    var promptPreview = (item.prompt || '').substring(0, 100);
    var time = item.timestamp ? new Date(item.timestamp).toLocaleString('zh-CN') : '';

    overlay.innerHTML =
      '<div style="background:#1a1a1e;border-radius:16px;padding:20px;max-width:480px;width:100%;border:1px solid rgba(255,255,255,0.08);position:relative;">' +
        '<button id="closeHistDetail" style="position:absolute;top:12px;right:16px;background:none;border:none;color:#666;font-size:20px;cursor:pointer;">&times;</button>' +
        '<div style="font-size:11px;color:#666;margin-bottom:8px;">' + time + '</div>' +
        '<div style="margin-bottom:12px;">' + content + '</div>' +
        (promptPreview ? '<div style="font-size:12px;color:#999;margin-bottom:12px;line-height:1.5;">📝 ' + promptPreview + '</div>' : '') +
        '<div style="display:flex;gap:8px;flex-wrap:wrap;">' +
          ((item.imageUrl || item.videoUrl || item.url) ? '<button class="btn-save-hist btn-action btn-action--primary">💾 保存</button>' : '') +
          ((item.imageUrl || item.videoUrl || item.url) ? '<button class="btn-dl-hist btn-action btn-action--secondary">📥 下载</button>' : '') +
          ((item.content) ? '<button class="btn-copy-hist btn-action btn-action--secondary">📋 复制</button>' : '') +
          '<button class="btn-action btn-action--secondary" onclick="this.closest(\'div\').parentElement.remove()">关闭</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(overlay);

    // 关闭
    overlay.querySelector('#closeHistDetail').addEventListener('click', function() { overlay.remove(); });

    // 保存
    var saveBtn = overlay.querySelector('.btn-save-hist');
    if (saveBtn) saveBtn.addEventListener('click', function() {
      Storage.addProduct({
        imageUrl: item.imageUrl || item.url || '',
        videoUrl: item.videoUrl || '',
        content: item.content || item.prompt || '',
        toolName: item.tool || '',
        type: type,
        title: (item.prompt || '').substring(0, 50)
      });
      UI.toast('已保存', 'success');
    });

    // 下载
    var dlBtn = overlay.querySelector('.btn-dl-hist');
    if (dlBtn) dlBtn.addEventListener('click', function() {
      var url = item.imageUrl || item.videoUrl || item.url;
      if (url) UI.downloadFile(url, 'history-' + Date.now());
    });

    // 复制
    var copyBtn = overlay.querySelector('.btn-copy-hist');
    if (copyBtn) copyBtn.addEventListener('click', function() {
      if (item.content) UI.copyText(item.content);
      else if (item.prompt) UI.copyText(item.prompt);
    });
  };

  // 监听网络状态变化
  UI.onNetworkChange = function(callback) {
    window.addEventListener('online', function() { callback(true); });
    window.addEventListener('offline', function() { callback(false); });
  };

  /* ======== API 安全包装（自动重试 + 错误处理） ======== */
  /**
   * 安全调用 API，自动处理网络错误和重试
   * @param {Function} apiCall - 返回 Promise 的 API 调用函数
   * @param {Object} opts - { maxRetries, onRetry }
   * @returns {Promise}
   */
  UI.safeApiCall = function(apiCall, opts) {
    opts = opts || {};
    var maxRetries = opts.maxRetries || 2;
    var retryDelay = opts.retryDelay || 1500;
    var attempt = 0;

    return new Promise(function(resolve, reject) {
      var tryCall = function() {
        attempt++;
        apiCall().then(resolve).catch(function(err) {
          if (!UI.isOnline()) {
            reject(new Error('网络已断开，请检查网络连接后重试'));
            return;
          }
          if (attempt < maxRetries && (err.message.indexOf('网络') > -1 || err.message.indexOf('超时') > -1 || err.message.indexOf('fetch') > -1)) {
            if (opts.onRetry) opts.onRetry(attempt, maxRetries);
            setTimeout(tryCall, retryDelay * attempt);
          } else {
            reject(err);
          }
        });
      };
      tryCall();
    });
  };

  /* ======== 输入校验 ======== */
  UI.validateNotEmpty = function(value, fieldName) {
    if (!value || !value.trim()) {
      UI.toast('请输入' + (fieldName || '内容'), 'error');
      return false;
    }
    return true;
  };

  /* ======== 格式化工具 ======== */
  UI.formatDate = function(dateStr) {
    try {
      var d = new Date(dateStr);
      var now = new Date();
      var diff = now - d;
      if (diff < 60000) return '刚刚';
      if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前';
      if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前';
      return d.toLocaleDateString('zh-CN');
    } catch (e) { return dateStr; }
  };

  UI.truncate = function(str, maxLen) {
    maxLen = maxLen || 60;
    if (!str) return '';
    return str.length > maxLen ? str.substring(0, maxLen) + '...' : str;
  };

  /* ======== 全局错误边界 ======== */
  UI._initErrorBoundary = function() {
    // 全局未捕获错误
    window.addEventListener('error', function(e) {
      if (e.target && e.target.tagName === 'SCRIPT') {
        console.warn('脚本加载失败:', e.target.src);
        UI.toast('资源加载失败，请刷新页面重试', 'error');
      }
    });

    // 未处理的 Promise 拒绝
    window.addEventListener('unhandledrejection', function(e) {
      console.warn('未处理的异步错误:', e.reason);
      // 静默处理，避免控制台噪音
    });

    // 网络状态变化
    UI.onNetworkChange(function(online) {
      if (!online) {
        UI.toast('网络已断开', 'error');
      }
    });
  };

  // 自启动
  UI._initErrorBoundary();


  /* ======== 注册到全局 ======== */
  window.UI = UI;
})();
