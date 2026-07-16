/* ============================================
   图文二创 — AI 内容改写/二次创作
   ============================================ */
(function() {
  var module = {
    name: 'article-rewrite',
    title: '图文二创',

    platforms: [
      { name: '小红书', icon: '📱' }, { name: '公众号', icon: '📰' },
      { name: '知乎', icon: '💡' },   { name: '抖音', icon: '🎵' },
      { name: '微博', icon: '🐦' },   { name: '朋友圈', icon: '💬' }
    ],
    selectedPlatform: '小红书',

    render: function(container) {
      var self = this;
      var h = '';
      h += '<div class="tool-header"><button class="tool-header__back" onclick="Router.navigate(\'#/\')">←</button><div class="tool-header__title">📝 图文二创</div></div>';
      h += '<div class="tool-input-area">';
      h += '<div class="tool-input-area__label">📄 粘贴原文内容</div>';
      h += '<textarea class="tool-textarea prompt-input" placeholder="粘贴需要改写/二次创作的文案内容..." rows="5"></textarea>';
h += '<div style="margin-top:12px;"><div class="tool-input-area__label">❌ 负面提示词 <span style="font-weight:400;font-size:11px;color:var(--text-muted);">（排除不想要的内容）</span></div><textarea class="tool-textarea neg-input" placeholder="排除不想要的元素，如：blurry, low quality, watermark, ugly, deformed..." rows="2"></textarea></div>';
      h += '<div class="tool-params"><div class="tool-param-group"><div class="tool-param-group__label">🎯 目标平台</div><div class="style-pills" id="platformPills">';
      for (var i = 0; i < this.platforms.length; i++) {
        var p = this.platforms[i];
        h += '<button class="style-pill' + (p.name === self.selectedPlatform ? ' active' : '') + '" data-platform="' + p.name + '">' + p.icon + ' ' + p.name + '</button>';
      }
      h += '</div></div></div>';
      h += '<button class="btn-generate" id="btnGenerate">🚀 AI 改写</button></div>';
      h += '<div class="tool-progress" id="progressArea"><div class="spinner"></div><div class="tool-progress__text">AI 正在改写中...</div><div class="tool-progress__step">分析原文 + 匹配平台风格</div></div>';
      h += '<div class="tool-result" id="resultArea">';
      h += '<div style="margin-bottom:4px;font-size:20px;font-weight:700;color:#fff;" id="resultTitle"></div>';
      h += '<div style="margin-bottom:12px;font-size:11px;color:var(--text-muted);" id="resultMeta"></div>';
      h += '<div class="result-text" id="resultContent"></div>';
      h += '<div class="result-actions"><button class="btn-action btn-action--primary" id="btnCopy">📋 一键复制</button><button class="btn-action btn-action--secondary" id="btnSave">💾 保存笔记</button><button class="btn-action btn-action--secondary" id="btnRetry">🔄 再生成</button></div></div>';

      container.innerHTML = h;
      this._bindEvents(container);
      UI.renderHistory(container, 'article-rewrite');
    },

    _bindEvents: function(container) {
      var self = this;
      var pills = container.querySelectorAll('#platformPills .style-pill');
      for (var i = 0; i < pills.length; i++) {
        pills[i].addEventListener('click', function() {
          for (var j = 0; j < pills.length; j++) pills[j].classList.remove('active');
          this.classList.add('active');
          self.selectedPlatform = this.getAttribute('data-platform');
        });
      }

      container.querySelector('#btnGenerate').addEventListener('click', function() { self._generate(container); });
      container.querySelector('#btnRetry').addEventListener('click', function() { self._generate(container); });
      container.querySelector('#btnCopy').addEventListener('click', function() {
        var r = container._lastResult;
        if (r) UI.copyText(r.title + '\n\n' + r.content);
      });
      container.querySelector('#btnSave').addEventListener('click', function() {
        var r = container._lastResult;
        if (r) { Storage.addProduct({ content: r.content, title: r.title, toolName: 'article-rewrite', type: 'article', platform: self.selectedPlatform }); UI.toast('已保存', 'success'); }
      });
    },

    _generate: function(container) {
      var prompt = container.querySelector('.prompt-input').value.trim();
      if (!prompt) { UI.toast('请粘贴原文内容', 'error'); return; }
      var self = this;
      var btn = container.querySelector('#btnGenerate');
      var pa = container.querySelector('#progressArea');
      var ra = container.querySelector('#resultArea');
      UI.hideResult(ra); UI.showProgress(pa);
      btn.disabled = true; btn.textContent = '⏳ 改写中...';

      (window.API||window.MockAPI).articleRewrite({ content: prompt, style: self.selectedPlatform }).then(function(result) {
        UI.hideProgress(pa);
        container.querySelector('#resultTitle').textContent = result.title || '';
        container.querySelector('#resultMeta').textContent = '目标平台：' + self.selectedPlatform + ' ｜ 消耗：' + (result.cost || 1) + ' 积分';
        container.querySelector('#resultContent').innerHTML = (result.content || '').replace(/\n/g, '<br>');
        UI.showResult(ra);
        btn.disabled = false; btn.textContent = '🚀 AI 改写';
        container._lastResult = result;
        Storage.addHistory('article-rewrite', { tool: 'article-rewrite', prompt: prompt || promptText || '', type: 'result', timestamp: new Date().toISOString() }); UI.renderHistory(container, 'article-rewrite');
      }).catch(function(err) {
        UI.hideProgress(pa); btn.disabled = false; btn.textContent = '🚀 AI 改写';
        UI.toast(err.message || '改写失败', 'error');
      });
    },

    destroy: function() {}
  };

  window.__modules__ = window.__modules__ || {};
  window.__modules__['article-rewrite'] = module;
})();
