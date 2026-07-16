/* ============================================
   一键改图 — 上传图片 + 选择操作 → AI 优化
   ============================================ */
(function() {
  var module = {
    name: 'quick-edit',
    title: '一键改图',

    operations: [
      { name: '智能优化', icon: '✨', desc: 'AI 自动优化亮度、对比度、色彩' },
      { name: '背景移除', icon: '🎯', desc: '一键去除背景，输出透明PNG' },
      { name: '画质增强', icon: '🔍', desc: '提升分辨率至2K/4K' },
      { name: '人像美化', icon: '💆', desc: '美颜、磨皮、瘦脸' },
      { name: '去水印', icon: '🧹', desc: '智能识别并去除水印' },
      { name: '风格迁移', icon: '🎨', desc: '应用艺术风格滤镜' }
    ],
    selectedOp: '智能优化',

    render: function(container) {
      var self = this;
      var h = '';
      h += '<div class="tool-header"><button class="tool-header__back" onclick="Router.navigate(\'#/\')">←</button><div class="tool-header__title">⚡ 一键改图</div></div>';
      h += '<div class="tool-input-area">';
      h += '<div class="tool-input-area__label">🖼️ 上传图片</div>';
      h += '<div class="tool-upload" id="uploadArea"><div class="tool-upload__icon">🖼️</div><div class="tool-upload__text">点击上传需要处理的图片</div><div id="preview"></div><input type="file" id="fileInput" accept="image/*"></div>';

      h += '<div style="margin-top:12px;"><div class="tool-input-area__label">🔧 选择操作</div>';
      h += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:8px;" id="opGrid">';
      for (var i = 0; i < this.operations.length; i++) {
        var op = this.operations[i];
        h += '<button class="op-card' + (op.name === self.selectedOp ? ' active' : '') + '" data-op="' + op.name + '" style="padding:12px;border-radius:var(--radius-sm);background:var(--bg-card);border:1px solid ' + (op.name === self.selectedOp ? 'var(--accent-strong)' : 'var(--border-card)') + ';cursor:pointer;text-align:center;transition:all var(--transition-fast);color:' + (op.name === self.selectedOp ? 'var(--accent)' : 'var(--text-secondary)') + ';"><div style="font-size:24px;">' + op.icon + '</div><div style="font-size:12px;font-weight:600;margin-top:4px;">' + op.name + '</div><div style="font-size:10px;color:var(--text-muted);">' + op.desc + '</div></button>';
      }
      h += '</div></div>';

      h += '<button class="btn-generate" id="btnGenerate">⚡ 一键处理</button></div>';
      h += '<div class="tool-progress" id="progressArea"><div class="spinner"></div><div class="tool-progress__text">AI 正在处理...</div><div class="tool-progress__step" id="progressStep">智能分析中</div></div>';
      h += '<div class="tool-result" id="resultArea"><div class="tool-input-area__label" style="margin-bottom:12px;">✨ 处理结果</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;"><div style="text-align:center;"><div style="font-size:12px;color:var(--text-muted);margin-bottom:8px;">📦 原图</div><img id="origImg" style="width:100%;border-radius:var(--radius-sm);" alt="原图"></div><div style="text-align:center;"><div style="font-size:12px;color:var(--accent);margin-bottom:8px;">✨ 处理后</div><img id="resultImg" style="width:100%;border-radius:var(--radius-sm);cursor:pointer;" alt="处理结果"></div></div><div class="result-actions" style="margin-top:16px;"><button class="btn-action btn-action--primary" id="btnSave">💾 保存</button><button class="btn-action btn-action--secondary" id="btnDownload">📥 下载</button><button class="btn-action btn-action--secondary" id="btnRetry">🔄 重试</button></div></div>';

      container.innerHTML = h;
      this._bindEvents(container);
      UI.renderHistory(container, 'quick-edit');
    },

    _bindEvents: function(container) {
      var self = this;
      var opBtns = container.querySelectorAll('#opGrid .op-card');
      for (var i = 0; i < opBtns.length; i++) {
        opBtns[i].addEventListener('click', function() {
          for (var j = 0; j < opBtns.length; j++) { opBtns[j].style.borderColor = 'var(--border-card)'; opBtns[j].style.color = 'var(--text-secondary)'; opBtns[j].classList.remove('active'); }
          this.classList.add('active');
          this.style.borderColor = 'var(--accent-strong)';
          this.style.color = 'var(--accent)';
          self.selectedOp = this.getAttribute('data-op');
        });
      }

      var ua = container.querySelector('#uploadArea');
      var fi = container.querySelector('#fileInput');
      var origSrc = null;
      ua.addEventListener('click', function(e) { if (e.target !== fi) fi.click(); });
      fi.addEventListener('change', function() {
        if (this.files[0]) {
          var r = new FileReader();
          r.onload = function(e) {
            origSrc = e.target.result;
            container.querySelector('#preview').innerHTML = '<img src="' + e.target.result + '" class="tool-upload__preview" alt="预览">';
          };
          r.readAsDataURL(this.files[0]);
        }
      });

      container.querySelector('#btnGenerate').addEventListener('click', function() {
        if (!origSrc) { UI.toast('请先上传图片', 'error'); return; }
        self._process(container, origSrc);
      });
      container.querySelector('#btnRetry').addEventListener('click', function() { self._process(container, origSrc); });
      container.querySelector('#btnSave').addEventListener('click', function() {
        var r = container._lastResult;
        if (r && r.resultImages) { r.resultImages.forEach(function(img) { Storage.addProduct({ imageUrl: img.url, toolName: 'quick-edit', type: 'image', operation: self.selectedOp }); }); UI.toast('已保存', 'success'); }
      });
      container.querySelector('#btnDownload').addEventListener('click', function() {
        var r = container._lastResult;
        if (r && r.resultImages && r.resultImages[0]) UI.downloadFile(r.resultImages[0].url, 'edited-' + Date.now() + '.jpg');
      });
    },

    _process: function(container, origSrc) {
      var btn = container.querySelector('#btnGenerate');
      var pa = container.querySelector('#progressArea');
      var ra = container.querySelector('#resultArea');
      UI.hideResult(ra); UI.showProgress(pa);
      btn.disabled = true; btn.textContent = '⏳ 处理中...';
      var self = this;

      (window.API||window.MockAPI).quickEdit({ imageUrl: origSrc, operation: self.selectedOp }).then(function(result) {
        UI.hideProgress(pa);
        container.querySelector('#origImg').src = origSrc || result.originalImage || '';
        var ri = result.resultImages;
        container.querySelector('#resultImg').src = ri && ri[0] ? ri[0].url : '';
        container.querySelector('#resultImg').onclick = function() { if (ri && ri[0]) UI.previewImage(ri[0].url); };
        UI.showResult(ra);
        btn.disabled = false; btn.textContent = '⚡ 一键处理';
        container._lastResult = result;
        Storage.addHistory('quick-edit', { tool: 'quick-edit', prompt: prompt || promptText || '', type: 'result', timestamp: new Date().toISOString() }); UI.renderHistory(container, 'quick-edit');
      }).catch(function(err) {
        UI.hideProgress(pa); btn.disabled = false; btn.textContent = '⚡ 一键处理';
        UI.toast(err.message || '处理失败', 'error');
      });
    },

    destroy: function() {}
  };

  window.__modules__ = window.__modules__ || {};
  window.__modules__['quick-edit'] = module;
})();
