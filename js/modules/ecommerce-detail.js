/* ============================================
   电商详情图 — 产品图 → 电商详情页排版
   ============================================ */
(function() {
  var module = {
    name: 'ecommerce-detail',
    title: '电商详情图',

    styles: [
      { name: '简约白底', icon: '🤍' }, { name: '时尚杂志', icon: '📰' },
      { name: '科技感', icon: '🔬' },    { name: 'ins风', icon: '📷' },
      { name: '国潮', icon: '🏮' },      { name: '轻奢', icon: '💎' }
    ],
    selectedStyle: '简约白底',

    render: function(container) {
      var self = this;
      var h = '';
      h += '<div class="tool-header"><button class="tool-header__back" onclick="Router.navigate(\'#/\')">←</button><div class="tool-header__title">📋 电商详情图</div></div>';
      h += '<div class="tool-input-area">';
      h += '<div class="tool-input-area__label">📦 上传产品图</div>';
      h += '<div class="tool-upload" id="uploadArea"><div class="tool-upload__icon">📦</div><div class="tool-upload__text">点击上传产品照片</div><div class="tool-upload__hint">支持 JPG/PNG/WebP</div><div id="uploadPreview"></div><input type="file" id="fileInput" accept="image/*"></div>';
      h += '<div style="margin-top:12px;"><div class="tool-input-area__label">📝 产品卖点（可选）</div>';
      h += '<textarea class="tool-textarea prompt-input" placeholder="描述产品核心卖点，如：超轻材质仅重180g、IPX7级防水..." rows="2"></textarea></div>';
h += '<div style="margin-top:12px;"><div class="tool-input-area__label">❌ 负面提示词 <span style="font-weight:400;font-size:11px;color:var(--text-muted);">（排除不想要的内容）</span></div><textarea class="tool-textarea neg-input" placeholder="排除不想要的元素，如：blurry, low quality, watermark, ugly, deformed..." rows="2"></textarea></div>';
      h += '<div class="tool-params">';
      h += '<div class="tool-param-group" style="flex:2;min-width:250px;"><div class="tool-param-group__label">🎨 排版风格</div><div class="style-pills" id="stylePills">';
      for (var i = 0; i < this.styles.length; i++) {
        var s = this.styles[i];
        h += '<button class="style-pill' + (s.name === self.selectedStyle ? ' active' : '') + '" data-style="' + s.name + '">' + s.icon + ' ' + s.name + '</button>';
      }
      h += '</div></div><div class="tool-param-group"><div class="tool-param-group__label">📐 尺寸</div><select class="tool-select" id="sizeSelect"><option value="750x1000">750×1000（淘宝详情）</option><option value="800x800" selected>800×800（主图）</option><option value="1080x1920">1080×1920（抖音橱窗）</option></select></div>';
      h += '</div>';
      h += '<button class="btn-generate" id="btnGenerate">🚀 生成详情图</button></div>';
      h += '<div class="tool-progress" id="progressArea"><div class="spinner"></div><div class="tool-progress__text">AI 正在设计详情页...</div><div class="tool-progress__step">分析产品特征</div></div>';
      h += '<div class="tool-result" id="resultArea"><div class="tool-input-area__label" style="margin-bottom:12px;">🖼️ 生成结果</div><div class="result-grid" id="resultGrid"></div><div class="result-actions"><button class="btn-action btn-action--primary" id="btnSave">💾 保存</button><button class="btn-action btn-action--secondary" id="btnRetry">🔄 重试</button></div></div>';

      container.innerHTML = h;
      this._bindEvents(container);
      UI.renderHistory(container, 'ecommerce-detail');
    },

    _bindEvents: function(container) {
      var self = this;
      var pills = container.querySelectorAll('#stylePills .style-pill');
      for (var i = 0; i < pills.length; i++) {
        pills[i].addEventListener('click', function() {
          for (var j = 0; j < pills.length; j++) pills[j].classList.remove('active');
          this.classList.add('active');
          self.selectedStyle = this.getAttribute('data-style');
        });
      }

      var uploadArea = container.querySelector('#uploadArea');
      var fileInput = container.querySelector('#fileInput');
      uploadArea.addEventListener('click', function(e) { if (e.target !== fileInput) fileInput.click(); });
      fileInput.addEventListener('change', function() {
        if (this.files[0]) {
          var r = new FileReader();
          r.onload = function(e) { container.querySelector('#uploadPreview').innerHTML = '<img src="' + e.target.result + '" class="tool-upload__preview" alt="预览">'; };
          r.readAsDataURL(this.files[0]);
        }
      });

      container.querySelector('#btnGenerate').addEventListener('click', function() { self._generate(container); });
      container.querySelector('#btnRetry').addEventListener('click', function() { self._generate(container); });
      container.querySelector('#btnSave').addEventListener('click', function() {
        var r = container._lastResult;
        if (r && r.images) { r.images.forEach(function(img) { Storage.addProduct({ imageUrl: img.url, toolName: 'ecommerce-detail', type: 'image' }); }); UI.toast('已保存', 'success'); }
      });
    },

    _generate: function(container) {
      var btn = container.querySelector('#btnGenerate');
      var pa = container.querySelector('#progressArea');
      var ra = container.querySelector('#resultArea');
      UI.hideResult(ra); UI.showProgress(pa);
      btn.disabled = true; btn.textContent = '⏳ 生成中...';
      var self = this;

      (window.API||window.MockAPI).ecommerceImage({ type: 'detail', scene: self.selectedStyle }).then(function(result) {
        UI.hideProgress(pa);
        var h = '';
        if (result.images) for (var i = 0; i < result.images.length; i++) {
          h += '<div class="result-item" onclick="UI.previewImage(\'' + result.images[i].url + '\')"><img src="' + result.images[i].url + '" alt="详情图" loading="lazy"></div>';
        }
        container.querySelector('#resultGrid').innerHTML = h;
        UI.showResult(ra);
        btn.disabled = false; btn.textContent = '🚀 生成详情图';
        container._lastResult = result;
        Storage.addHistory('ecommerce-detail', { tool: 'ecommerce-detail', prompt: prompt || promptText || '', type: 'result', timestamp: new Date().toISOString() }); UI.renderHistory(container, 'ecommerce-detail');
      }).catch(function(err) {
        UI.hideProgress(pa); btn.disabled = false; btn.textContent = '🚀 生成详情图';
        UI.toast(err.message || '生成失败', 'error');
      });
    },

    destroy: function() {}
  };

  window.__modules__ = window.__modules__ || {};
  window.__modules__['ecommerce-detail'] = module;
})();
