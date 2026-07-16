/* ============================================
   视频转图文 — 视频 → AI 图文笔记
   ============================================ */
(function() {
  var module = {
    name: 'video-to-article',
    title: '视频转图文',

    render: function(container) {
      var h = '';
      h += '<div class="tool-header"><button class="tool-header__back" onclick="Router.navigate(\'#/\')">←</button><div class="tool-header__title">🔄 视频转图文</div></div>';
      h += '<div class="tool-input-area">';
      h += '<div class="tool-input-area__label">🔗 粘贴视频链接</div>';
      h += '<div class="tool-url-input"><input type="text" class="url-input" placeholder="粘贴抖音/快手/B站/小红书视频链接..."><button class="btn-action btn-action--primary" id="btnFetch" style="white-space:nowrap;">📥 转图文</button></div>';
      h += '<div style="margin-top:12px;text-align:center;color:var(--text-muted);font-size:12px;">—— 或 ——</div>';
      h += '<div style="margin-top:12px;"><div class="tool-upload" id="uploadArea" style="min-height:100px;"><div class="tool-upload__icon">🎬</div><div class="tool-upload__text">上传视频文件</div><div class="tool-upload__hint">AI 会自动截取关键帧 + 提取文案 + 排版</div><input type="file" id="fileInput" accept="video/*"></div></div>';
      h += '</div>';
      h += '<div class="tool-progress" id="progressArea"><div class="spinner"></div><div class="tool-progress__text">AI 正在转换中...</div><div class="tool-progress__step">提取关键帧 + 识别文案</div></div>';
      h += '<div class="tool-result" id="resultArea">';
      h += '<div class="tool-input-area__label" style="margin-bottom:12px;">📰 图文笔记</div>';
      h += '<div class="result-grid" id="resultImages" style="grid-template-columns:repeat(auto-fill,minmax(120px,1fr));margin-bottom:12px;"></div>';
      h += '<div style="margin-bottom:4px;font-size:18px;font-weight:700;color:#fff;" id="resultTitle"></div>';
      h += '<div style="margin-bottom:4px;font-size:11px;color:var(--text-muted);" id="resultMeta"></div>';
      h += '<div class="result-text" id="resultContent"></div>';
      h += '<div class="result-actions"><button class="btn-action btn-action--primary" id="btnCopy">📋 复制全文</button><button class="btn-action btn-action--secondary" id="btnSave">💾 保存</button><button class="btn-action btn-action--secondary" id="btnRetry">🔄 再试</button></div></div>';

      container.innerHTML = h;
      this._bindEvents(container);
      UI.renderHistory(container, 'video-to-article');
    },

    _bindEvents: function(container) {
      var self = this;
      var ua = container.querySelector('#uploadArea');
      var fi = container.querySelector('#fileInput');
      ua.addEventListener('click', function(e) { if (e.target !== fi) fi.click(); });
      fi.addEventListener('change', function() {
        if (this.files[0]) {
          container.querySelector('.tool-upload__text').textContent = '已选择：' + this.files[0].name;
          self._convert(container, null, this.files[0]);
        }
      });

      container.querySelector('#btnFetch').addEventListener('click', function() {
        var url = container.querySelector('.url-input').value.trim();
        if (!url) { UI.toast('请输入视频链接', 'error'); return; }
        self._convert(container, url, null);
      });

      container.querySelector('#btnCopy').addEventListener('click', function() {
        var r = container._lastResult;
        if (r && r.article) UI.copyText(r.article.title + '\n\n' + r.article.content);
      });
      container.querySelector('#btnSave').addEventListener('click', function() {
        var r = container._lastResult;
        if (r && r.article) {
          Storage.addProduct({ content: r.article.content, title: r.article.title, images: r.article.images, toolName: 'video-to-article', type: 'article' });
          UI.toast('已保存', 'success');
        }
      });
      container.querySelector('#btnRetry').addEventListener('click', function() {
        self._convert(container, container.querySelector('.url-input').value, null);
      });
    },

    _convert: function(container, url, file) {
      var pa = container.querySelector('#progressArea');
      var ra = container.querySelector('#resultArea');
      UI.hideResult(ra); UI.showProgress(pa);
      var self = this;

      (window.API||window.MockAPI).videoToArticle({ url: url }).then(function(result) {
        UI.hideProgress(pa);
        var a = result.article || {};
        // 图片
        var ih = '';
        if (a.images) {
          for (var i = 0; i < a.images.length; i++) {
            ih += '<div class="result-item" onclick="UI.previewImage(\'' + a.images[i].url + '\')"><img src="' + a.images[i].url + '" alt="关键帧" loading="lazy"></div>';
          }
        }
        container.querySelector('#resultImages').innerHTML = ih;
        container.querySelector('#resultTitle').textContent = a.title || '';
        container.querySelector('#resultMeta').textContent = '字数：' + (a.wordCount || 0) + ' ｜ 配图：' + (a.images ? a.images.length : 0) + ' 张';
        container.querySelector('#resultContent').innerHTML = (a.content || '').replace(/\n/g, '<br>');
        UI.showResult(ra);
        container._lastResult = result;
        Storage.addHistory('video-to-article', { tool: 'video-to-article', prompt: prompt || promptText || '', type: 'result', timestamp: new Date().toISOString() }); UI.renderHistory(container, 'video-to-article');
      }).catch(function(err) {
        UI.hideProgress(pa);
        UI.toast(err.message || '转换失败', 'error');
      });
    },

    destroy: function() {}
  };

  window.__modules__ = window.__modules__ || {};
  window.__modules__['video-to-article'] = module;
})();
