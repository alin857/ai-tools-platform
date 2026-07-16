/* ============================================
   AI工作室 — 统一创作入口
   Tab 切换多种创作模式，整合核心能力
   ============================================ */
(function() {
  var module = {
    name: 'ai-studio',
    title: 'AI工作室',

    tabs: [
      { id: 'text2img', label: '文生图', icon: '🎨' },
      { id: 'img2video', label: '图生视频', icon: '🎬' },
      { id: 'rewrite', label: '图文二创', icon: '✍️' },
      { id: 'quick', label: '一键创作', icon: '📱' }
    ],
    activeTab: 'text2img',

    render: function(container) {
      container.innerHTML = this._buildHTML();
      this._bindEvents(container);
      this._switchTab(container, this.activeTab);
    },

    _buildHTML: function() {
      var self = this;
      var h = '';

      h +=
        '<div class="tool-header">' +
          '<button class="tool-header__back" onclick="Router.navigate(\'#/\')">←</button>' +
          '<div class="tool-header__title">🏭 AI工作室 · 统一创作入口</div>' +
        '</div>';

      // Tab 切换
      h += '<div class="style-pills" id="studioTabs" style="margin-bottom:20px;">';
      for (var i = 0; i < this.tabs.length; i++) {
        var t = this.tabs[i];
        h += '<button class="style-pill' + (t.id === this.activeTab ? ' active' : '') + '" data-tab="' + t.id + '">' + t.icon + ' ' + t.label + '</button>';
      }
      h += '</div>';

      // 动态输入区
      h += '<div id="studioInputArea"></div>';

      // 生成按钮
      h += '<button class="btn-generate" id="btnStudioGenerate">🚀 开始创作</button>';

      // 进度区
      h +=
        '<div class="tool-progress" id="progressArea">' +
          '<div class="spinner"></div>' +
          '<div class="tool-progress__text">AI 正在创作中...</div>' +
          '<div class="tool-progress__step" id="progressStep">准备中</div>' +
        '</div>';

      // 结果区
      h +=
        '<div class="tool-result" id="resultArea">' +
          '<div class="tool-input-area__label" style="margin-bottom:12px;">✨ 创作结果</div>' +
          '<div id="studioResult"></div>' +
          '<div class="result-actions" style="margin-top:16px;">' +
            '<button class="btn-action btn-action--primary" id="btnSave">💾 保存</button>' +
            '<button class="btn-action btn-action--secondary" id="btnRetry">🔄 重试</button>' +
          '</div>' +
        '</div>';

      // 历史记录
      h +=
        '<div style="margin-top:24px;">' +
          '<div class="tool-input-area__label" style="margin-bottom:8px;">📋 最近创作</div>' +
          '<div id="studioHistory" style="display:flex;gap:12px;overflow-x:auto;padding-bottom:8px;"></div>' +
        '</div>';

      return h;
    },

    _bindEvents: function(container) {
      var self = this;

      // Tab 切换
      var tabBtns = container.querySelectorAll('#studioTabs .style-pill');
      for (var i = 0; i < tabBtns.length; i++) {
        tabBtns[i].addEventListener('click', function() {
          var tabId = this.getAttribute('data-tab');
          for (var j = 0; j < tabBtns.length; j++) tabBtns[j].classList.remove('active');
          this.classList.add('active');
          self._switchTab(container, tabId);
        });
      }

      // 生成按钮
      container.querySelector('#btnStudioGenerate').addEventListener('click', function() {
        self._handleGenerate(container);
      });

      // 重试
      container.querySelector('#btnRetry').addEventListener('click', function() {
        self._handleGenerate(container);
      });

      // 保存
      container.querySelector('#btnSave').addEventListener('click', function() {
        var result = container._lastResult;
        if (!result) return;
        if (result.images) {
          result.images.forEach(function(img) {
            Storage.addProduct({ imageUrl: img.url, toolName: 'ai-studio', type: 'image' });
          });
        } else if (result.videoUrl) {
          Storage.addProduct({ videoUrl: result.videoUrl, thumbnailUrl: result.thumbnailUrl, toolName: 'ai-studio', type: 'video' });
        } else if (result.content) {
          Storage.addProduct({ content: result.content, toolName: 'ai-studio', type: 'text' });
        }
        UI.toast('已保存到我的产品', 'success');
        self._showHistory(container);
      });
    },

    _switchTab: function(container, tabId) {
      this.activeTab = tabId;
      var area = container.querySelector('#studioInputArea');
      var h = '';

      switch (tabId) {
        case 'text2img':
          h = this._buildText2ImgInput();
          break;
        case 'img2video':
          h = this._buildImg2VideoInput();
          break;
        case 'rewrite':
          h = this._buildRewriteInput();
          break;
        case 'quick':
          h = this._buildQuickInput();
          break;
      }

      area.innerHTML = h;
      this._bindTabEvents(container, tabId);
      this._showHistory(container);
    },

    /* ---- 各模式输入区 HTML ---- */

    _buildText2ImgInput: function() {
      return '<div class="tool-input-area">' +
        '<div class="tool-input-area__label">📝 画面描述</div>' +
        '<textarea class="tool-textarea studio-prompt" placeholder="描述你想要的画面..." rows="3"></textarea>' +
        '<div class="tool-params">' +
          '<div class="tool-param-group">' +
            '<div class="tool-param-group__label">风格</div>' +
            '<div class="style-pills studio-style-pills">' +
              '<button class="style-pill active" data-style="写实">📷 写实</button>' +
              '<button class="style-pill" data-style="动漫">🎌 动漫</button>' +
              '<button class="style-pill" data-style="油画">🖌️ 油画</button>' +
              '<button class="style-pill" data-style="3D">🎮 3D</button>' +
              '<button class="style-pill" data-style="国风">🏮 国风</button>' +
              '<button class="style-pill" data-style="赛博朋克">🌆 赛博朋克</button>' +
            '</div>' +
          '</div>' +
        '</div></div>';
    },

    _buildImg2VideoInput: function() {
      return '<div class="tool-input-area">' +
        '<div class="tool-input-area__label">🖼️ 上传图片</div>' +
        '<div class="tool-upload" id="studioUpload">' +
          '<div class="tool-upload__icon">📁</div>' +
          '<div class="tool-upload__text">点击上传图片</div>' +
          '<div id="studioUploadPreview"></div>' +
          '<input type="file" id="studioFileInput" accept="image/*">' +
        '</div>' +
        '<div style="margin-top:12px;">' +
          '<div class="tool-input-area__label">📝 动态描述</div>' +
          '<textarea class="tool-textarea studio-prompt" placeholder="描述你想要的动态效果..." rows="2"></textarea>' +
        '</div></div>';
    },

    _buildRewriteInput: function() {
      return '<div class="tool-input-area">' +
        '<div class="tool-input-area__label">📄 原始内容</div>' +
        '<textarea class="tool-textarea studio-prompt" placeholder="粘贴需要改写的文章或文案..." rows="5"></textarea>' +
        '<div class="tool-params">' +
          '<div class="tool-param-group">' +
            '<div class="tool-param-group__label">风格</div>' +
            '<div class="style-pills studio-style-pills">' +
              '<button class="style-pill active" data-style="小红书">📱 小红书</button>' +
              '<button class="style-pill" data-style="公众号">📰 公众号</button>' +
              '<button class="style-pill" data-style="知乎">💡 知乎</button>' +
              '<button class="style-pill" data-style="抖音">🎵 抖音</button>' +
              '<button class="style-pill" data-style="微博">🐦 微博</button>' +
            '</div>' +
          '</div>' +
        '</div></div>';
    },

    _buildQuickInput: function() {
      return '<div class="tool-input-area">' +
        '<div class="tool-input-area__label">💡 创作主题</div>' +
        '<textarea class="tool-textarea studio-prompt" placeholder="输入你想创作的主题，例如：周末探店、护肤心得、穿搭分享..." rows="3"></textarea>' +
        '<div class="tool-params">' +
          '<div class="tool-param-group">' +
            '<div class="tool-param-group__label">排版风格</div>' +
            '<div class="style-pills studio-style-pills">' +
              '<button class="style-pill active" data-style="清新">🌸 清新</button>' +
              '<button class="style-pill" data-style="高级感">✨ 高级感</button>' +
              '<button class="style-pill" data-style="可爱">🎀 可爱</button>' +
              '<button class="style-pill" data-style="简约">🤍 简约</button>' +
              '<button class="style-pill" data-style="复古">📻 复古</button>' +
            '</div>' +
          '</div>' +
        '</div></div>';
    },

    /* ---- Tab 内事件 ---- */
    _bindTabEvents: function(container, tabId) {
      var self = this;

      // 风格选择
      var pills = container.querySelectorAll('.studio-style-pills .style-pill');
      for (var i = 0; i < pills.length; i++) {
        pills[i].addEventListener('click', function() {
          var parent = this.parentElement;
          var siblings = parent.querySelectorAll('.style-pill');
          for (var j = 0; j < siblings.length; j++) siblings[j].classList.remove('active');
          this.classList.add('active');
        });
      }

      // 文件上传（仅图生视频模式）
      if (tabId === 'img2video') {
        var uploadArea = container.querySelector('#studioUpload');
        var fileInput = container.querySelector('#studioFileInput');
        if (uploadArea && fileInput) {
          container._studioBase64 = null;
          uploadArea.addEventListener('click', function(e) {
            if (e.target !== fileInput) fileInput.click();
          });
          fileInput.addEventListener('change', function() {
            if (this.files[0]) {
              var reader = new FileReader();
              reader.onload = function(e) {
                container._studioBase64 = e.target.result;
                container.querySelector('#studioUploadPreview').innerHTML =
                  '<img src="' + e.target.result + '" class="tool-upload__preview" alt="预览">';
              };
              reader.readAsDataURL(this.files[0]);
            }
          });
        }
      }
    },

    /* ---- 生成处理 ---- */
    _handleGenerate: function(container) {
      var prompt = container.querySelector('.studio-prompt');
      var promptText = prompt ? prompt.value.trim() : '';

      if (!promptText && this.activeTab !== 'img2video') {
        UI.toast('请输入创作内容', 'error');
        if (prompt) prompt.focus();
        return;
      }

      var btn = container.querySelector('#btnStudioGenerate');
      var progressArea = container.querySelector('#progressArea');
      var resultArea = container.querySelector('#resultArea');

      UI.hideResult(resultArea);
      UI.showProgress(progressArea);
      btn.disabled = true;
      btn.textContent = '⏳ 创作中...';

      var self = this;
      var activeStyle = '默认';
      var activePill = container.querySelector('.studio-style-pills .style-pill.active');
      if (activePill) activeStyle = activePill.getAttribute('data-style');

      var apiPromise;

      switch (this.activeTab) {
        case 'text2img':
          apiPromise = (window.API||window.MockAPI).textToImage({ prompt: promptText, style: activeStyle });
          break;
        case 'img2video':
          apiPromise = (window.API||window.MockAPI).imageToVideo({
            prompt: promptText,
            style: activeStyle,
            imageData: container._studioBase64,
            onProgress: function(pct, statusText) {
              var stepEl = container.querySelector('#progressStep');
              if (stepEl) stepEl.textContent = statusText;
            }
          });
          break;
        case 'rewrite':
          apiPromise = (window.API||window.MockAPI).articleRewrite({ content: promptText, style: activeStyle });
          break;
        case 'quick':
          apiPromise = (window.API||window.MockAPI).oneClickCreate({ prompt: promptText, style: activeStyle });
          break;
        default:
          apiPromise = (window.API||window.MockAPI).aiStudio({ prompt: promptText, mode: this.activeTab });
      }

      // ★ API 预留点
      apiPromise.then(function(result) {
        UI.hideProgress(progressArea);
        self._showResult(container, result);
        UI.showResult(resultArea);
        btn.disabled = false;
        btn.textContent = '🚀 开始创作';

        // 添加到历史
        Storage.addHistory('ai-studio', {
          mode: self.activeTab,
          prompt: promptText,
          result: result
        });
        self._showHistory(container);
      }).catch(function(err) {
        UI.hideProgress(progressArea);
        btn.disabled = false;
        btn.textContent = '🚀 开始创作';
        UI.toast(err.message || '创作失败，请重试', 'error');
      });
    },

    _showResult: function(container, result) {
      var resultDiv = container.querySelector('#studioResult');
      var h = '';

      if (result.images) {
        // 图片结果
        h += '<div class="result-grid">';
        for (var i = 0; i < result.images.length; i++) {
          var img = result.images[i];
          h +=
            '<div class="result-item" onclick="UI.previewImage(\'' + img.url + '\')">' +
              '<img src="' + img.url + '" alt="结果 ' + (i + 1) + '" loading="lazy">' +
            '</div>';
        }
        h += '</div>';
      } else if (result.videoUrl) {
        // 视频结果
        h +=
          '<video src="' + result.videoUrl + '" controls autoplay playsinline ' +
            'style="width:100%;max-width:640px;border-radius:var(--radius-sm);background:#000;" ' +
            'poster="' + (result.thumbnailUrl || '') + '">' +
          '</video>';
      } else if (result.content) {
        // 文本结果
        h +=
          '<div class="result-text">' + result.content.replace(/\n/g, '<br>') + '</div>' +
          '<div style="margin-top:8px;">' +
            '<button class="btn-action btn-action--secondary" onclick="UI.copyText(\'' +
              result.content.replace(/'/g, "\\'").replace(/\n/g, '\\n') +
            '\')">📋 复制全文</button>' +
          '</div>';
      }

      resultDiv.innerHTML = h;
      container._lastResult = result;
        Storage.addHistory('ai-studio', { tool: 'ai-studio', prompt: prompt || promptText || '', type: 'result', timestamp: new Date().toISOString() }); UI.renderHistory(container, 'ai-studio');
    },

    _showHistory: function(container) {
      var historyDiv = container.querySelector('#studioHistory');
      if (!historyDiv) return;

      var items = Storage.getToolHistory('ai-studio').slice(0, 10);
      if (!items.length) {
        historyDiv.innerHTML = '<div style="font-size:12px;color:var(--text-muted);padding:12px;">暂无创作记录，快去创作吧 ✨</div>';
        return;
      }

      var h = '';
      for (var i = 0; i < items.length; i++) {
        var item = items[i];
        var modeLabel = item.mode || '创作';
        var preview = (item.prompt || '').substring(0, 30) + '...';
        var time = item.timestamp ? new Date(item.timestamp).toLocaleString('zh-CN') : '';
        h +=
          '<div style="flex-shrink:0;width:140px;padding:10px;background:var(--bg-card);border:1px solid var(--border-card);border-radius:var(--radius-sm);font-size:11px;">' +
            '<div style="color:var(--accent);font-weight:600;margin-bottom:4px;">' + modeLabel + '</div>' +
            '<div style="color:var(--text-secondary);margin-bottom:4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + preview + '</div>' +
            '<div style="color:var(--text-muted);">' + time + '</div>' +
          '</div>';
      }
      historyDiv.innerHTML = h;
    },

    destroy: function() {}
  };

  window.__modules__ = window.__modules__ || {};
  window.__modules__['ai-studio'] = module;
})();
