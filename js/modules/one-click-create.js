/* ============================================
   一键创作 — 小红书/社交媒体风格爆款笔记
   ============================================ */
(function() {
  var module = {
    name: 'one-click-create',
    title: '一键创作',

    styles: [
      { name: '清新', icon: '🌸' }, { name: '高级感', icon: '✨' },
      { name: '可爱', icon: '🎀' },  { name: '简约', icon: '🤍' },
      { name: '复古', icon: '📻' },  { name: '森系', icon: '🌲' },
      { name: '暗黑', icon: '🖤' },  { name: '甜酷', icon: '🍬' }
    ],
    types: [
      { name: '好物分享', icon: '🎁' }, { name: '教程攻略', icon: '📖' },
      { name: '穿搭推荐', icon: '👗' }, { name: '美食探店', icon: '🍜' },
      { name: '旅行攻略', icon: '✈️' }, { name: '日常vlog', icon: '📹' }
    ],
    selectedStyle: '清新',
    selectedType: '好物分享',

    render: function(container) {
      var self = this;
      var h = '';
      h += '<div class="tool-header"><button class="tool-header__back" onclick="Router.navigate(\'#/\')">←</button><div class="tool-header__title">📱 一键创作 · 爆款笔记</div></div>';
      h += '<div class="tool-input-area">';
      h += '<div class="tool-input-area__label">💡 创作主题</div>';
      h += '<textarea class="tool-textarea prompt-input" placeholder="输入你想创作的主题，如：夏日防晒霜推荐、周末北京Citywalk路线..." rows="3"></textarea>';
h += '<div style="margin-top:12px;"><div class="tool-input-area__label">❌ 负面提示词 <span style="font-weight:400;font-size:11px;color:var(--text-muted);">（排除不想要的内容）</span></div><textarea class="tool-textarea neg-input" placeholder="排除不想要的元素，如：blurry, low quality, watermark, ugly, deformed..." rows="2"></textarea></div>';

      h += '<div class="tool-params">';
      h += '<div class="tool-param-group" style="flex:1;min-width:200px;"><div class="tool-param-group__label">📂 内容类型</div><div class="style-pills" id="typePills">';
      for (var i = 0; i < this.types.length; i++) {
        var t = this.types[i];
        h += '<button class="style-pill' + (t.name === self.selectedType ? ' active' : '') + '" data-type="' + t.name + '">' + t.icon + ' ' + t.name + '</button>';
      }
      h += '</div></div>';
      h += '<div class="tool-param-group" style="flex:1;min-width:200px;"><div class="tool-param-group__label">🎨 排版风格</div><div class="style-pills" id="stylePills">';
      for (var j = 0; j < this.styles.length; j++) {
        var s = this.styles[j];
        h += '<button class="style-pill' + (s.name === self.selectedStyle ? ' active' : '') + '" data-style="' + s.name + '">' + s.icon + ' ' + s.name + '</button>';
      }
      h += '</div></div></div>';

      h += '<button class="btn-generate" id="btnGenerate">✨ 一键生成笔记</button></div>';
      h += '<div class="tool-progress" id="progressArea"><div class="spinner"></div><div class="tool-progress__text">AI 正在创作爆款笔记...</div><div class="tool-progress__step">分析主题 + 匹配排版</div></div>';
      h += '<div class="tool-result" id="resultArea">';
      h += '<div style="margin-bottom:4px;font-size:20px;font-weight:700;color:#fff;" id="resultTitle"></div>';
      h += '<div style="margin-bottom:8px;font-size:11px;color:var(--text-muted);" id="resultMeta"></div>';
      h += '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px;" id="resultTags"></div>';
      h += '<div class="result-text" id="resultContent"></div>';
      h += '<div class="result-actions"><button class="btn-action btn-action--primary" id="btnCopy">📋 复制全文</button><button class="btn-action btn-action--secondary" id="btnSave">💾 保存</button><button class="btn-action btn-action--secondary" id="btnRetry">🔄 换一篇</button></div></div>';

      container.innerHTML = h;
      this._bindEvents(container);
      UI.renderHistory(container, 'one-click-create');
    },

    _bindEvents: function(container) {
      var self = this;
      var _bp = function(sel, prop, attr) {
        var btns = container.querySelectorAll(sel + ' .style-pill');
        for (var i = 0; i < btns.length; i++) {
          btns[i].addEventListener('click', function() {
            for (var j = 0; j < btns.length; j++) btns[j].classList.remove('active');
            this.classList.add('active');
            self[prop] = this.getAttribute('data-' + attr);
          });
        }
      };
      _bp('#typePills', 'selectedType', 'type');
      _bp('#stylePills', 'selectedStyle', 'style');

      container.querySelector('#btnGenerate').addEventListener('click', function() { self._generate(container); });
      container.querySelector('#btnRetry').addEventListener('click', function() { self._generate(container); });
      container.querySelector('#btnCopy').addEventListener('click', function() {
        var r = container._lastResult; if (r) UI.copyText(r.title + '\n\n' + r.content);
      });
      container.querySelector('#btnSave').addEventListener('click', function() {
        var r = container._lastResult; if (r) { Storage.addProduct({ content: r.content, title: r.title, toolName: 'one-click-create', type: 'article' }); UI.toast('已保存', 'success'); }
      });
    },

    _generate: function(container) {
      var prompt = container.querySelector('.prompt-input').value.trim();
      if (!prompt) { UI.toast('请输入创作主题', 'error'); return; }
      var self = this;
      var btn = container.querySelector('#btnGenerate');
      var pa = container.querySelector('#progressArea');
      var ra = container.querySelector('#resultArea');
      UI.hideResult(ra); UI.showProgress(pa);
      btn.disabled = true; btn.textContent = '⏳ 创作中...';

      (window.API||window.MockAPI).oneClickCreate({ prompt: prompt, style: self.selectedStyle }).then(function(result) {
        UI.hideProgress(pa);
        container.querySelector('#resultTitle').textContent = result.title || '';
        container.querySelector('#resultMeta').textContent = '类型：' + self.selectedType + ' ｜ 风格：' + self.selectedStyle + ' ｜ 消耗：' + (result.cost || 1) + ' 积分';
        var tags = (result.hashtags || ['#AI创作', '#小红书', '#内容创作', '#爆款文案']);
        var th = '';
        for (var i = 0; i < tags.length; i++) th += '<span class="card__tag">' + tags[i] + '</span>';
        container.querySelector('#resultTags').innerHTML = th;
        container.querySelector('#resultContent').innerHTML = (result.content || '').replace(/\n/g, '<br>');
        UI.showResult(ra);
        btn.disabled = false; btn.textContent = '✨ 一键生成笔记';
        container._lastResult = result;
        Storage.addHistory('one-click-create', { tool: 'one-click-create', prompt: prompt || promptText || '', type: 'result', timestamp: new Date().toISOString() }); UI.renderHistory(container, 'one-click-create');
      }).catch(function(err) {
        UI.hideProgress(pa); btn.disabled = false; btn.textContent = '✨ 一键生成笔记';
        UI.toast(err.message || '生成失败', 'error');
      });
    },

    destroy: function() {}
  };

  window.__modules__ = window.__modules__ || {};
  window.__modules__['one-click-create'] = module;
})();
