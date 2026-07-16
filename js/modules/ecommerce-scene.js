/* ============================================
   电商环境图 — 产品图 + 智能场景背景
   ============================================ */
(function() {
  var module = {
    name: 'ecommerce-scene',
    title: '电商环境图',

    scenes: [
      { name: '简约工作室', icon: '📸' }, { name: '自然户外', icon: '🌿' },
      { name: '客厅家居', icon: '🛋️' },   { name: '咖啡店', icon: '☕' },
      { name: '大理石台面', icon: '🪨' }, { name: '海滩度假', icon: '🏖️' },
      { name: '都市街头', icon: '🏙️' },   { name: '花园庭院', icon: '🌺' }
    ],
    selectedScene: '简约工作室',

    render: function(container) {
      var self = this;
      var h = '';
      h += '<div class="tool-header"><button class="tool-header__back" onclick="Router.navigate(\'#/\')">←</button><div class="tool-header__title">🏞️ 电商环境图</div></div>';
      h += '<div class="tool-input-area">';
      h += '<div class="tool-input-area__label">📦 上传产品图</div>';
      h += '<div class="tool-upload" id="uploadArea"><div class="tool-upload__icon">📦</div><div class="tool-upload__text">点击上传产品照片</div><div class="tool-upload__hint">建议使用白底或透明背景产品图，效果更好</div><div id="uploadPreview"></div><input type="file" id="fileInput" accept="image/*"></div>';
      h += '<div class="tool-params"><div class="tool-param-group" style="flex:2;min-width:300px;"><div class="tool-param-group__label">🏞️ 场景选择</div><div class="style-pills" id="scenePills">';
      for (var i = 0; i < this.scenes.length; i++) {
        var s = this.scenes[i];
        h += '<button class="style-pill' + (s.name === self.selectedScene ? ' active' : '') + '" data-scene="' + s.name + '">' + s.icon + ' ' + s.name + '</button>';
      }
      h += '</div></div></div>';
      h += '<button class="btn-generate" id="btnGenerate">🚀 生成场景图</button></div>';
      h += '<div class="tool-progress" id="progressArea"><div class="spinner"></div><div class="tool-progress__text">AI 正在合成场景...</div><div class="tool-progress__step">分析产品 + 匹配场景</div></div>';
      h += '<div class="tool-result" id="resultArea"><div class="tool-input-area__label" style="margin-bottom:12px;">🖼️ 场景效果</div><div class="result-grid" id="resultGrid"></div><div class="result-actions"><button class="btn-action btn-action--primary" id="btnSave">💾 保存</button><button class="btn-action btn-action--secondary" id="btnRetry">🔄 换场景重试</button></div></div>';

      container.innerHTML = h;
      this._bindEvents(container);
      UI.renderHistory(container, 'ecommerce-scene');
    },

    _bindEvents: function(container) {
      var self = this;
      var pills = container.querySelectorAll('#scenePills .style-pill');
      for (var i = 0; i < pills.length; i++) {
        pills[i].addEventListener('click', function() {
          for (var j = 0; j < pills.length; j++) pills[j].classList.remove('active');
          this.classList.add('active');
          self.selectedScene = this.getAttribute('data-scene');
        });
      }

      var ua = container.querySelector('#uploadArea');
      var fi = container.querySelector('#fileInput');
      ua.addEventListener('click', function(e) { if (e.target !== fi) fi.click(); });
      fi.addEventListener('change', function() {
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
        if (r && r.images) { r.images.forEach(function(img) { Storage.addProduct({ imageUrl: img.url, toolName: 'ecommerce-scene', type: 'image', scene: self.selectedScene }); }); UI.toast('已保存', 'success'); }
      });
    },

    _generate: function(container) {
      var btn = container.querySelector('#btnGenerate');
      var pa = container.querySelector('#progressArea');
      var ra = container.querySelector('#resultArea');
      UI.hideResult(ra); UI.showProgress(pa);
      btn.disabled = true; btn.textContent = '⏳ 生成中...';
      var self = this;

      (window.API||window.MockAPI).ecommerceImage({ type: 'scene', scene: self.selectedScene }).then(function(result) {
        UI.hideProgress(pa);
        var h = '';
        if (result.images) for (var i = 0; i < result.images.length; i++) {
          h += '<div class="result-item" onclick="UI.previewImage(\'' + result.images[i].url + '\')"><img src="' + result.images[i].url + '" alt="场景图" loading="lazy"></div>';
        }
        container.querySelector('#resultGrid').innerHTML = h;
        UI.showResult(ra);
        btn.disabled = false; btn.textContent = '🚀 生成场景图';
        container._lastResult = result;
        Storage.addHistory('ecommerce-scene', { tool: 'ecommerce-scene', prompt: prompt || promptText || '', type: 'result', timestamp: new Date().toISOString() }); UI.renderHistory(container, 'ecommerce-scene');
      }).catch(function(err) {
        UI.hideProgress(pa); btn.disabled = false; btn.textContent = '🚀 生成场景图';
        UI.toast(err.message || '生成失败', 'error');
      });
    },

    destroy: function() {}
  };

  window.__modules__ = window.__modules__ || {};
  window.__modules__['ecommerce-scene'] = module;
})();
