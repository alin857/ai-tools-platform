/* ============================================
   短视频文案提取 — 粘贴链接 / 上传视频 → 提取文案
   ============================================ */
(function() {
  var module = {
    name: 'copy-extract',
    title: '短视频文案提取',

    render: function(container) {
      var h = '';
      h += '<div class="tool-header"><button class="tool-header__back" onclick="Router.navigate(\'#/\')">←</button><div class="tool-header__title">💬 短视频文案提取</div></div>';
      h += '<div class="tool-input-area">';
      h += '<div class="tool-input-area__label">🔗 粘贴视频链接</div>';
      h += '<div class="tool-url-input"><input type="text" class="url-input" placeholder="粘贴抖音/快手/B站/小红书视频链接..."><button class="btn-action btn-action--primary" id="btnFetch" style="white-space:nowrap;">📥 获取文案</button></div>';
      h += '<div style="margin-top:12px;text-align:center;color:var(--text-muted);font-size:12px;">—— 或 ——</div>';
      h += '<div style="margin-top:12px;"><div class="tool-upload" id="uploadArea" style="min-height:100px;"><div class="tool-upload__icon">🎬</div><div class="tool-upload__text">上传视频文件</div><div class="tool-upload__hint">支持 MP4/MOV，最大 200MB</div><input type="file" id="fileInput" accept="video/*"></div></div>';
      h += '</div>';
      h += '<div class="tool-progress" id="progressArea"><div class="spinner"></div><div class="tool-progress__text">AI 正在提取文案...</div><div class="tool-progress__step">解析音频 + 语音转文字</div></div>';
      h += '<div class="tool-result" id="resultArea">';
      h += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;"><div class="tool-input-area__label" style="margin-bottom:0;">📝 提取结果</div><div style="font-size:11px;color:var(--text-muted);" id="resultMeta"></div></div>';
      h += '<div class="result-text" id="resultContent" style="min-height:120px;"></div>';
      h += '<div class="result-actions"><button class="btn-action btn-action--primary" id="btnCopy">📋 复制文案</button><button class="btn-action btn-action--secondary" id="btnSave">💾 保存</button><button class="btn-action btn-action--secondary" id="btnToArticle">✍️ 转图文二创</button></div></div>';

      container.innerHTML = h;
      this._bindEvents(container);
      UI.renderHistory(container, 'copy-extract');
    },

    _bindEvents: function(container) {
      var self = this;
      var ua = container.querySelector('#uploadArea');
      var fi = container.querySelector('#fileInput');
      ua.addEventListener('click', function(e) { if (e.target !== fi) fi.click(); });
      fi.addEventListener('change', function() {
        if (this.files[0]) {
          container.querySelector('.tool-upload__text').textContent = '已选择：' + this.files[0].name;
          self._extract(container, null, this.files[0]);
        }
      });

      container.querySelector('#btnFetch').addEventListener('click', function() {
        var url = container.querySelector('.url-input').value.trim();
        if (!url) { UI.toast('请输入视频链接', 'error'); return; }
        self._extract(container, url, null);
      });

      container.querySelector('#btnCopy').addEventListener('click', function() {
        var t = container.querySelector('#resultContent').textContent;
        if (t) UI.copyText(t);
      });
      container.querySelector('#btnSave').addEventListener('click', function() {
        var t = container.querySelector('#resultContent').textContent;
        if (t) { Storage.addProduct({ content: t, toolName: 'copy-extract', type: 'text' }); UI.toast('已保存', 'success'); }
      });
      container.querySelector('#btnToArticle').addEventListener('click', function() {
        Router.navigate('#/article-rewrite');
      });
    },

    _extract: function(container, url, file) {
      var pa = container.querySelector('#progressArea');
      var ra = container.querySelector('#resultArea');
      UI.hideResult(ra); UI.showProgress(pa);
      var self = this;

      (window.API||window.MockAPI).copyExtract({ url: url }).then(function(result) {
        UI.hideProgress(pa);
        container.querySelector('#resultContent').textContent = result.text || '';
        container.querySelector('#resultMeta').textContent =
          '平台：' + (result.platform || '未知') + ' ｜ 字数：' + (result.wordCount || 0) + ' ｜ 时长：' + (result.duration || '—');
        UI.showResult(ra);
        container._lastResult = result;
        Storage.addHistory('copy-extract', { tool: 'copy-extract', prompt: prompt || promptText || '', type: 'result', timestamp: new Date().toISOString() }); UI.renderHistory(container, 'copy-extract');
      }).catch(function(err) {
        UI.hideProgress(pa);
        UI.toast(err.message || '提取失败', 'error');
      });
    },

    destroy: function() {}
  };

  window.__modules__ = window.__modules__ || {};
  window.__modules__['copy-extract'] = module;
})();
