/* ============================================
   AI绘画 — 文生图模块
   文本输入型：提示词 + 风格选择 + 结果网格
   ============================================ */
(function() {
  var module = {
    name: 'text-to-image',
    title: 'AI绘画 - 文生图',

    styles: [
      { name: '写实', icon: '📷' },
      { name: '动漫', icon: '🎌' },
      { name: '油画', icon: '🖌️' },
      { name: '3D渲染', icon: '🎮' },
      { name: '国风', icon: '🏮' },
      { name: '赛博朋克', icon: '🌆' },
      { name: '水彩', icon: '🎨' },
      { name: '素描', icon: '✏️' }
    ],
    sizes: [
      { label: '1:1 正方形', value: '1:1' },
      { label: '16:9 横屏', value: '16:9' },
      { label: '9:16 竖屏', value: '9:16' },
      { label: '4:3 标准', value: '4:3' },
      { label: '3:4 肖像', value: '3:4' }
    ],

    selectedStyle: '写实',
    selectedSize: '1:1',

    render: function(container) {
      container.innerHTML = this._buildHTML();
      this._bindEvents(container);
      UI.renderHistory(container, 'text-to-image');
    },

    _buildHTML: function() {
      var self = this;
      var h = '';

      // 顶部返回栏
      h +=
        '<div class="tool-header">' +
          '<button class="tool-header__back" onclick="Router.navigate(\'#/\')">←</button>' +
          '<div class="tool-header__title">🎨 AI绘画 · 文生图</div>' +
        '</div>';

      // 输入区
      h += '<div class="tool-input-area">';
      h += '<div class="tool-input-area__label">📝 描述你想要的画面</div>';
      h += '<textarea class="tool-textarea prompt-input" placeholder="例如：一个穿汉服的女孩站在樱花树下，柔和的自然光，宫崎骏动画风格，高细节，4K画质..." rows="4"></textarea>';
h += '<div style="margin-top:12px;"><div class="tool-input-area__label">❌ 负面提示词 <span style="font-weight:400;font-size:11px;color:var(--text-muted);">（排除不想要的内容）</span></div><textarea class="tool-textarea neg-input" placeholder="排除不想要的元素，如：blurry, low quality, watermark, ugly, deformed..." rows="2"></textarea></div>';

      // 风格选择
      h += '<div class="tool-params">';
      h += '<div class="tool-param-group" style="flex:2;min-width:300px;">';
      h += '<div class="tool-param-group__label">🎨 风格</div>';
      h += '<div class="style-pills" id="stylePills">';
      for (var i = 0; i < this.styles.length; i++) {
        var s = this.styles[i];
        h += '<button class="style-pill' + (s.name === this.selectedStyle ? ' active' : '') + '" data-style="' + s.name + '">' + s.icon + ' ' + s.name + '</button>';
      }
      h += '</div></div>';

      // 尺寸选择
      h += '<div class="tool-param-group">';
      h += '<div class="tool-param-group__label">📐 尺寸</div>';
      h += '<select class="tool-select" id="sizeSelect">';
      for (var j = 0; j < this.sizes.length; j++) {
        var z = this.sizes[j];
        h += '<option value="' + z.value + '"' + (z.value === this.selectedSize ? ' selected' : '') + '>' + z.label + '</option>';
      }
      h += '</select></div>';

      // 生成数量
      h += '<div class="tool-param-group">';
      h += '<div class="tool-param-group__label">🔢 生成数量</div>';
      h += '<select class="tool-select" id="countSelect">';
      h += '<option value="2">2 张</option><option value="4" selected>4 张</option><option value="6">6 张</option><option value="8">8 张</option>';
      h += '</select></div>';
      h += '</div>';

      // 生成按钮
      h += '<button class="btn-generate" id="btnGenerate">🚀 AI 生成</button>';
      h += '</div>';

      // 处理进度区
      h +=
        '<div class="tool-progress" id="progressArea">' +
          '<div class="spinner"></div>' +
          '<div class="tool-progress__text">AI 正在创作中...</div>' +
          '<div class="tool-progress__step" id="progressStep">正在解析提示词</div>' +
          '<div class="progress-steps">' +
            '<div class="progress-step active" data-step="1">① 解析提示词</div>' +
            '<div class="progress-step" data-step="2">② AI 生成</div>' +
            '<div class="progress-step" data-step="3">③ 优化渲染</div>' +
            '<div class="progress-step" data-step="4">④ 完成</div>' +
          '</div>' +
        '</div>';

      // 结果区
      h +=
        '<div class="tool-result" id="resultArea">' +
          '<div class="tool-input-area__label" style="margin-bottom:12px;">🖼️ 生成结果</div>' +
          '<div class="result-grid" id="resultGrid"></div>' +
          '<div class="result-actions">' +
            '<button class="btn-action btn-action--primary" id="btnSaveAll">💾 保存到我的产品</button>' +
            '<button class="btn-action btn-action--secondary" id="btnRetry">🔄 重新生成</button>' +
          '</div>' +
        '</div>';

      // 使用提示
      h +=
        '<div style="margin-top:24px;padding:16px;background:var(--accent-dim);border-radius:var(--radius-sm);border:1px solid rgba(0,212,255,0.12);">' +
          '<div style="font-size:13px;color:var(--accent);font-weight:600;margin-bottom:6px;">💡 提示词小技巧</div>' +
          '<div style="font-size:12px;color:var(--text-secondary);line-height:1.8;">' +
            '好的提示词 = <b style="color:#fff;">主体描述</b> + <b style="color:#fff;">风格</b> + <b style="color:#fff;">光线</b> + <b style="color:#fff;">画质</b><br>' +
            '试试："一个赛博朋克城市的夜景，霓虹灯闪耀，雨中街道，电影级光影，8K超精细"' +
          '</div>' +
        '</div>';

      h += '<div id="historySection"></div>';
      return h;
    },

    _bindEvents: function(container) {
      var self = this;

      // 风格选择
      var pills = container.querySelectorAll('.style-pill');
      for (var i = 0; i < pills.length; i++) {
        pills[i].addEventListener('click', function() {
          for (var j = 0; j < pills.length; j++) pills[j].classList.remove('active');
          this.classList.add('active');
          self.selectedStyle = this.getAttribute('data-style');
        });
      }

      // 生成按钮
      container.querySelector('#btnGenerate').addEventListener('click', function() {
        self._handleGenerate(container);
      });

      // 重试按钮
      container.querySelector('#btnRetry').addEventListener('click', function() {
        self._handleGenerate(container);
      });

      // 保存全部
      container.querySelector('#btnSaveAll').addEventListener('click', function() {
        self._saveAll(container);
      });

      // 回车提交
      container.querySelector('.prompt-input').addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
          self._handleGenerate(container);
        }
      });
    },

    _handleGenerate: function(container) {
      var promptInput = container.querySelector('.prompt-input');
      var prompt = promptInput.value.trim();

      if (!prompt) {
        UI.toast('请输入描述文字', 'error');
        promptInput.focus();
        return;
      }

      var btn = container.querySelector('#btnGenerate');
      var progressArea = container.querySelector('#progressArea');
      var resultArea = container.querySelector('#resultArea');

      // 隐藏旧结果
      UI.hideResult(resultArea);
      UI.showProgress(progressArea);
      btn.disabled = true;
      btn.textContent = '⏳ 生成中...';

      var self = this;

      // 模拟进度步骤
      var steps = container.querySelectorAll('.progress-step');
      var stepTexts = ['正在解析提示词...', 'AI 正在生成图像...', '正在优化渲染...', '即将完成...'];

      var stepIndex = 0;
      var stepTimer = setInterval(function() {
        if (stepIndex > 0) {
          steps[stepIndex - 1].classList.remove('active');
          steps[stepIndex - 1].classList.add('done');
        }
        if (stepIndex < steps.length) {
          steps[stepIndex].classList.add('active');
          container.querySelector('#progressStep').textContent = stepTexts[stepIndex];
        }
        stepIndex++;
      }, 700);

      var sizeSelect = container.querySelector('#sizeSelect');
      var countSelect = container.querySelector('#countSelect');

      // ★ API 预留点
      (window.API||window.MockAPI).textToImage({
        prompt: prompt,
        style: this.selectedStyle,
        size: sizeSelect ? sizeSelect.value : '1:1',
        count: parseInt(countSelect ? countSelect.value : 4)
      }).then(function(result) {
        clearInterval(stepTimer);
        // 标记所有步骤完成
        for (var i = 0; i < steps.length; i++) {
          steps[i].classList.remove('active');
          steps[i].classList.add('done');
        }
        container.querySelector('#progressStep').textContent = '✅ 生成完成！';

        setTimeout(function() {
          UI.hideProgress(progressArea);
          self._showResults(container, result);
          UI.showResult(resultArea);
          btn.disabled = false;
          btn.textContent = '🚀 AI 生成';
        }, 400);
      }).catch(function(err) {
        clearInterval(stepTimer);
        UI.hideProgress(progressArea);
        btn.disabled = false;
        btn.textContent = '🚀 AI 生成';
        UI.toast(err.message || '生成失败，请重试', 'error');
      });
    },

    _showResults: function(container, result) {
      var grid = container.querySelector('#resultGrid');
      var html = '';
      var images = result.images || [];

      for (var i = 0; i < images.length; i++) {
        var img = images[i];
        html +=
          '<div class="result-item" data-src="' + img.url + '" data-seed="' + img.seed + '">' +
            '<img src="' + img.url + '" alt="生成图 ' + (i + 1) + '" loading="lazy">' +
            '<div class="result-item__overlay">' +
              '<button class="result-item__action btn-preview">🔍 查看</button>' +
              '<button class="result-item__action btn-download-single">📥 下载</button>' +
              '<button class="result-item__action btn-save-single">💾 保存</button>' +
            '</div>' +
          '</div>';
      }

      grid.innerHTML = html;

      // 绑定单图事件
      var self = this;
      var items = grid.querySelectorAll('.result-item');
      for (var k = 0; k < items.length; k++) {
        items[k].querySelector('.btn-preview').addEventListener('click', function(e) {
          e.stopPropagation();
          UI.previewImage(this.closest('.result-item').getAttribute('data-src'));
        });
        items[k].querySelector('.btn-download-single').addEventListener('click', function(e) {
          e.stopPropagation();
          var src = this.closest('.result-item').getAttribute('data-src');
          UI.downloadFile(src, 'ai-painting-' + Date.now() + '.jpg');
        });
        items[k].querySelector('.btn-save-single').addEventListener('click', function(e) {
          e.stopPropagation();
          var item = this.closest('.result-item');
          Storage.addProduct({
            imageUrl: item.getAttribute('data-src'),
            toolName: 'text-to-image',
            type: 'image',
            seed: item.getAttribute('data-seed')
          });
          UI.toast('已保存到我的产品', 'success');
        });
        items[k].addEventListener('click', function() {
          UI.previewImage(this.getAttribute('data-src'));
        });
      }

      // 存储结果供"保存全部"使用
      container._lastResult = result;
        Storage.addHistory('text-to-image', { tool: 'text-to-image', prompt: prompt, type: 'image', imageUrl: result.images && result.images[0] ? result.images[0].url : '', timestamp: new Date().toISOString() }); UI.renderHistory(container, 'text-to-image');
    },

    _saveAll: function(container) {
      var result = container._lastResult;
      if (!result || !result.images) return;
      var self = this;
      var count = 0;
      result.images.forEach(function(img) {
        Storage.addProduct({
          imageUrl: img.url,
          toolName: 'text-to-image',
          type: 'image',
          seed: img.seed
        });
        count++;
      });
      UI.toast('已保存 ' + count + ' 张图片到我的产品', 'success');
    },

    destroy: function() {}
  };

  window.__modules__ = window.__modules__ || {};
  window.__modules__['text-to-image'] = module;
})();
