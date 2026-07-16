/* ============================================
   数字人合成 — 文案/语音 → AI 数字人视频
   ============================================ */
(function() {
  var module = {
    name: 'digital-human',
    title: '数字人合成',

    avatars: [
      { name: '职业女性', icon: '👩‍💼' }, { name: '职业男性', icon: '👨‍💼' },
      { name: '年轻女生', icon: '👧' },  { name: '年轻男生', icon: '👦' },
      { name: '知性姐姐', icon: '👩‍🏫' }, { name: '科技达人', icon: '🧑‍💻' }
    ],
    selectedAvatar: '职业女性',

    render: function(container) {
      var self = this;
      var h = '';
      h += '<div class="tool-header"><button class="tool-header__back" onclick="Router.navigate(\'#/\')">←</button><div class="tool-header__title">🤖 数字人合成</div></div>';
      h += '<div class="tool-input-area">';
      h += '<div class="tool-input-area__label">✍️ 输入台词/脚本</div>';
      h += '<textarea class="tool-textarea script-input" placeholder="输入你的数字人要说的台词..." rows="3"></textarea>';
h += '<div style="margin-top:12px;"><div class="tool-input-area__label">❌ 负面提示词 <span style="font-weight:400;font-size:11px;color:var(--text-muted);">（排除不想要的内容）</span></div><textarea class="tool-textarea neg-input" placeholder="排除不想要的元素，如：blurry, low quality, watermark, ugly, deformed..." rows="2"></textarea></div>';

      h += '<div class="tool-params"><div class="tool-param-group" style="flex:2;min-width:250px;"><div class="tool-param-group__label">🧍 数字人形象</div><div class="style-pills" id="avatarPills">';
      for (var i = 0; i < this.avatars.length; i++) {
        var a = this.avatars[i];
        h += '<button class="style-pill' + (a.name === self.selectedAvatar ? ' active' : '') + '" data-avatar="' + a.name + '">' + a.icon + ' ' + a.name + '</button>';
      }
      h += '</div></div>';

      h += '<div class="tool-param-group"><div class="tool-param-group__label">⏱️ 视频时长</div>';
h += '<div class="tool-param-group"><div class="tool-param-group__label">📐 画幅比例</div><select class="tool-select ratio-select"><option value="9:16" selected>9:16 竖屏</option><option value="16:9">16:9 横屏</option><option value="1:1">1:1 方形</option></select></div>';
      h += '<select class="tool-select" id="durationSelect"><option value="3">3 秒</option><option value="5" selected>5 秒</option><option value="8">8 秒</option><option value="10">10 秒</option></select>';
      h += '</div></div>';

      h += '<button class="btn-generate" id="btnGenerate">🎬 生成数字人视频</button></div>';
      h += '<div class="tool-progress" id="progressArea"><div class="spinner"></div><div class="tool-progress__text">AI 正在合成数字人...</div><div class="tool-progress__step" id="progressStep">准备中</div></div>';
      h += '<div class="tool-result" id="resultArea"><div class="tool-input-area__label" style="margin-bottom:12px;">🤖 数字人视频</div><div id="videoWrap"></div><div class="result-actions" style="margin-top:16px;"><button class="btn-action btn-action--primary" id="btnSave">💾 保存</button><button class="btn-action btn-action--secondary" id="btnDownload">📥 下载</button><button class="btn-action btn-action--secondary" id="btnRetry">🔄 重试</button></div></div>';

      container.innerHTML = h;
      this._bindEvents(container);
      UI.renderHistory(container, 'digital-human');
    },

    _bindEvents: function(container) {
      var self = this;
      var pills = container.querySelectorAll('#avatarPills .style-pill');
      for (var i = 0; i < pills.length; i++) {
        pills[i].addEventListener('click', function() {
          for (var j = 0; j < pills.length; j++) pills[j].classList.remove('active');
          this.classList.add('active');
          self.selectedAvatar = this.getAttribute('data-avatar');
        });
      }

      container.querySelector('#btnGenerate').addEventListener('click', function() { self._generate(container); });
      container.querySelector('#btnRetry').addEventListener('click', function() { self._generate(container); });
      container.querySelector('#btnSave').addEventListener('click', function() {
        var r = container._lastResult;
        if (r) { Storage.addProduct({ videoUrl: r.videoUrl, toolName: 'digital-human', type: 'video', title: '数字人视频' }); UI.toast('已保存', 'success'); }
      });
      container.querySelector('#btnDownload').addEventListener('click', function() {
        var r = container._lastResult; if (r && r.videoUrl) UI.downloadFile(r.videoUrl, 'digital-human.mp4');
      });
    },

    _generate: function(container) {
      var script = container.querySelector('.script-input').value.trim();
      if (!script) { UI.toast('请输入台词', 'error'); return; }
      var self = this;
      var btn = container.querySelector('#btnGenerate');
      var pa = container.querySelector('#progressArea');
      var ra = container.querySelector('#resultArea');
      UI.hideResult(ra); UI.showProgress(pa);
      btn.disabled = true; btn.textContent = '⏳ 合成中...';

      (window.API||window.MockAPI).digitalHuman({ script: script, avatar: self.selectedAvatar, duration: parseInt(container.querySelector('#durationSelect').value || 5), ratio: (container.querySelector('.ratio-select') || {}).value || '9:16', onProgress: function(pct, st) {
        container.querySelector('#progressStep').textContent = st || ('生成中 ' + pct + '%');
      }}).then(function(result) {
        UI.hideProgress(pa);
        container.querySelector('#videoWrap').innerHTML = '<video src="' + (result.videoUrl || '') + '" controls autoplay playsinline style="width:100%;max-width:480px;border-radius:var(--radius-sm);background:#000;margin:0 auto;display:block;" poster="' + (result.thumbnailUrl || '') + '"></video>';
        UI.showResult(ra);
        btn.disabled = false; btn.textContent = '🎬 生成数字人视频';
        container._lastResult = result;
        Storage.addHistory('digital-human', { tool: 'digital-human', prompt: prompt || promptText || '', type: 'result', timestamp: new Date().toISOString() }); UI.renderHistory(container, 'digital-human');
      }).catch(function(err) {
        UI.hideProgress(pa); btn.disabled = false; btn.textContent = '🎬 生成数字人视频';
        UI.toast(err.message || '合成失败', 'error');
      });
    },

    destroy: function() {}
  };

  window.__modules__ = window.__modules__ || {};
  window.__modules__['digital-human'] = module;
})();
