/* ============================================
   动作迁移 — 上传图片 + 动作 → AI 动态视频
   ============================================ */
(function() {
  var module = {
    name: 'motion-transfer',
    title: '动作迁移',

    motions: [
      { name: '舞蹈', icon: '💃' },   { name: '走路', icon: '🚶' },
      { name: '跑步', icon: '🏃' },   { name: '挥手', icon: '👋' },
      { name: '比心', icon: '🫶' },   { name: '转身', icon: '🔄' },
      { name: '跳跃', icon: '🤸' },   { name: '眨眼微笑', icon: '😊' }
    ],
    selectedMotion: '舞蹈',

    render: function(container) {
      var self = this;
      var h = '';
      h += '<div class="tool-header"><button class="tool-header__back" onclick="Router.navigate(\'#/\')">←</button><div class="tool-header__title">🕺 动作迁移</div></div>';
      h += '<div class="tool-input-area">';
      h += '<div class="tool-input-area__label">🖼️ 上传源图片（人物/角色）</div>';
      h += '<div class="tool-upload" id="uploadArea"><div class="tool-upload__icon">🧑</div><div class="tool-upload__text">上传人物照片</div><div class="tool-upload__hint">清晰的人物正面或全身照效果最好</div><div id="preview"></div><input type="file" id="fileInput" accept="image/*"></div>';

      h += '<div style="margin-top:12px;"><div class="tool-input-area__label">🕺 选择动作</div>';
      h += '<div class="style-pills" id="motionPills">';
      for (var i = 0; i < this.motions.length; i++) {
        var m = this.motions[i];
        h += '<button class="style-pill' + (m.name === self.selectedMotion ? ' active' : '') + '" data-motion="' + m.name + '">' + m.icon + ' ' + m.name + '</button>';
      }
      h += '</div></div>';

      h += '<button class="btn-generate" id="btnGenerate">🎬 生成动作视频</button></div>';
      h += '<div class="tool-progress" id="progressArea"><div class="spinner"></div><div class="tool-progress__text">AI 正在迁移动作...</div><div class="tool-progress__step" id="progressStep">分析人物骨骼</div></div>';
      h += '<div class="tool-result" id="resultArea"><div class="tool-input-area__label" style="margin-bottom:12px;">🕺 动作迁移结果</div><div id="videoWrap"></div><div class="result-actions" style="margin-top:16px;"><button class="btn-action btn-action--primary" id="btnSave">💾 保存</button><button class="btn-action btn-action--secondary" id="btnDownload">📥 下载</button><button class="btn-action btn-action--secondary" id="btnRetry">🔄 重试</button></div></div>';

      container.innerHTML = h;
      this._bindEvents(container);
      UI.renderHistory(container, 'motion-transfer');
    },

    _bindEvents: function(container) {
      var self = this;
      var pills = container.querySelectorAll('#motionPills .style-pill');
      for (var i = 0; i < pills.length; i++) {
        pills[i].addEventListener('click', function() {
          for (var j = 0; j < pills.length; j++) pills[j].classList.remove('active');
          this.classList.add('active');
          self.selectedMotion = this.getAttribute('data-motion');
        });
      }

      var ua = container.querySelector('#uploadArea');
      var fi = container.querySelector('#fileInput');
      var origBase64 = null;
      ua.addEventListener('click', function(e) { if (e.target !== fi) fi.click(); });
      fi.addEventListener('change', function() {
        if (this.files[0]) {
          var r = new FileReader();
          r.onload = function(e) {
            origBase64 = e.target.result;
            container.querySelector('#preview').innerHTML = '<img src="' + e.target.result + '" class="tool-upload__preview" alt="预览">';
          };
          r.readAsDataURL(this.files[0]);
        }
      });

      container.querySelector('#btnGenerate').addEventListener('click', function() {
        if (!origBase64) { UI.toast('请上传人物图片', 'error'); return; }
        self._generate(container, origBase64);
      });
      container.querySelector('#btnRetry').addEventListener('click', function() { self._generate(container, origBase64); });
      container.querySelector('#btnSave').addEventListener('click', function() {
        var r = container._lastResult;
        if (r) { Storage.addProduct({ videoUrl: r.resultVideoUrl || r.videoUrl, toolName: 'motion-transfer', type: 'video', motion: self.selectedMotion }); UI.toast('已保存', 'success'); }
      });
      container.querySelector('#btnDownload').addEventListener('click', function() {
        var r = container._lastResult; var url = r.resultVideoUrl || r.videoUrl;
        if (url) UI.downloadFile(url, 'motion-transfer.mp4');
      });
    },

    _generate: function(container, origBase64) {
      var self = this;
      var btn = container.querySelector('#btnGenerate');
      var pa = container.querySelector('#progressArea');
      var ra = container.querySelector('#resultArea');
      UI.hideResult(ra); UI.showProgress(pa);
      btn.disabled = true; btn.textContent = '⏳ 生成中...';

      (window.API||window.MockAPI).motionTransfer({
        sourceImage: origBase64,
        motion: self.selectedMotion,
        onProgress: function(pct, st) {
          container.querySelector('#progressStep').textContent = st || ('迁移中 ' + pct + '%');
        }
      }).then(function(result) {
        UI.hideProgress(pa);
        container.querySelector('#videoWrap').innerHTML = '<video src="' + (result.resultVideoUrl || result.videoUrl || '') + '" controls autoplay playsinline style="width:100%;max-width:480px;border-radius:var(--radius-sm);background:#000;margin:0 auto;display:block;" poster="' + (result.thumbnailUrl || '') + '"></video>';
        UI.showResult(ra);
        btn.disabled = false; btn.textContent = '🎬 生成动作视频';
        container._lastResult = result;
        Storage.addHistory('motion-transfer', { tool: 'motion-transfer', prompt: prompt || promptText || '', type: 'result', timestamp: new Date().toISOString() }); UI.renderHistory(container, 'motion-transfer');
      }).catch(function(err) {
        UI.hideProgress(pa); btn.disabled = false; btn.textContent = '🎬 生成动作视频';
        UI.toast(err.message || '生成失败', 'error');
      });
    },

    destroy: function() {}
  };

  window.__modules__ = window.__modules__ || {};
  window.__modules__['motion-transfer'] = module;
})();
