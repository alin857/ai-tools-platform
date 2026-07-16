/* ============================================
   模特换装 — 产品图 + 模特图 → AI 换装效果
   ============================================ */
(function() {
  var module = {
    name: 'model-change',
    title: '模特换装',

    outfits: [
      { name: '休闲日常', icon: '👕' }, { name: '通勤OL', icon: '👔' },
      { name: '运动风', icon: '🏃' },   { name: '晚礼服', icon: '👗' },
      { name: '街头潮流', icon: '🧥' }, { name: '度假风', icon: '🏝️' },
      { name: '学院风', icon: '🎒' },   { name: '复古', icon: '📻' }
    ],
    selectedOutfit: '休闲日常',
    productBase64: null,
    modelBase64: null,

    render: function(container) {
      var self = this;
      var h = '';

      h += '<div class="tool-header"><button class="tool-header__back" onclick="Router.navigate(\'#/\')">←</button><div class="tool-header__title">👗 模特换装</div></div>';
      h += '<div class="tool-input-area">';

      // === 产品图上传 ===
      h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">';
      h += '<div>';
      h += '<div class="tool-input-area__label">👗 上传产品图（服装）</div>';
      h += '<div class="tool-upload" id="productUpload" style="min-height:130px;"><div class="tool-upload__icon">👗</div><div class="tool-upload__text">上传服装图片</div><div id="productPreview"></div><input type="file" id="productInput" accept="image/*"></div>';
      h += '</div>';

      // === 模特图上传 ===
      h += '<div>';
      h += '<div class="tool-input-area__label">🧍 上传模特图（可选）</div>';
      h += '<div class="tool-upload" id="modelUpload" style="min-height:130px;"><div class="tool-upload__icon">🧍</div><div class="tool-upload__text">上传模特照片</div><div class="tool-upload__hint">不上传则 AI 自动匹配模特</div><div id="modelPreview"></div><input type="file" id="modelInput" accept="image/*"></div>';
      h += '</div>';
      h += '</div>';

      // 穿搭风格
      h += '<div class="tool-params" style="margin-top:12px;">';
      h += '<div class="tool-param-group" style="flex:2;min-width:250px;"><div class="tool-param-group__label">👗 穿搭风格</div><div class="style-pills" id="outfitPills">';
      for (var i = 0; i < this.outfits.length; i++) {
        var o = this.outfits[i];
        h += '<button class="style-pill' + (o.name === self.selectedOutfit ? ' active' : '') + '" data-outfit="' + o.name + '">' + o.icon + ' ' + o.name + '</button>';
      }
      h += '</div></div></div>';

      h += '<button class="btn-generate" id="btnGenerate">🚀 开始换装</button></div>';

      // 进度
      h += '<div class="tool-progress" id="progressArea"><div class="spinner"></div><div class="tool-progress__text">AI 正在换装中...</div><div class="tool-progress__step">分析服装特征 + 匹配模特</div></div>';

      // 结果
      h += '<div class="tool-result" id="resultArea"><div class="tool-input-area__label" style="margin-bottom:12px;">✨ 换装效果</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;"><div style="text-align:center;"><div style="font-size:12px;color:var(--text-muted);margin-bottom:8px;">👗 产品图</div><img id="origImg" style="width:100%;border-radius:var(--radius-sm);" alt="原图"></div><div style="text-align:center;"><div style="font-size:12px;color:var(--accent);margin-bottom:8px;">✨ 换装效果</div><img id="resultImg" style="width:100%;border-radius:var(--radius-sm);cursor:pointer;" alt="效果"></div></div><div class="result-actions" style="margin-top:16px;"><button class="btn-action btn-action--primary" id="btnSave">💾 保存</button><button class="btn-action btn-action--secondary" id="btnRetry">🔄 重试</button></div></div>';

      // 历史记录
      h += '<div id="historySection"></div>';

      container.innerHTML = h;
      this._bindEvents(container);
      UI.renderHistory(container, 'model-change');
    },

    _bindEvents: function(container) {
      var self = this;

      // 穿搭风格
      var pills = container.querySelectorAll('#outfitPills .style-pill');
      for (var i = 0; i < pills.length; i++) {
        pills[i].addEventListener('click', function() {
          for (var j = 0; j < pills.length; j++) pills[j].classList.remove('active');
          this.classList.add('active');
          self.selectedOutfit = this.getAttribute('data-outfit');
        });
      }

      // 产品图上传
      var pu = container.querySelector('#productUpload');
      var pi = container.querySelector('#productInput');
      pu.addEventListener('click', function(e) { if (e.target !== pi) pi.click(); });
      pi.addEventListener('change', function() { self._readFile(this.files[0], 'productBase64', container.querySelector('#productPreview'), '产品图'); });

      // 模特图上传
      var mu = container.querySelector('#modelUpload');
      var mi = container.querySelector('#modelInput');
      mu.addEventListener('click', function(e) { if (e.target !== mi) mi.click(); });
      mi.addEventListener('change', function() { self._readFile(this.files[0], 'modelBase64', container.querySelector('#modelPreview'), '模特图'); });

      container.querySelector('#btnGenerate').addEventListener('click', function() { self._generate(container); });
      container.querySelector('#btnRetry').addEventListener('click', function() { self._generate(container); });
      container.querySelector('#btnSave').addEventListener('click', function() {
        var r = container._lastResult;
        if (r && r.resultImages) {
          r.resultImages.forEach(function(img) { Storage.addProduct({ imageUrl: img.url, toolName: 'model-change', type: 'image', outfit: self.selectedOutfit }); });
          UI.toast('已保存', 'success');
        }
      });
    },

    _readFile: function(file, prop, previewDiv, label) {
      if (!file || !file.type.startsWith('image/')) { UI.toast('请上传图片', 'error'); return; }
      var self = this;
      var reader = new FileReader();
      reader.onload = function(e) {
        self[prop] = e.target.result;
        previewDiv.innerHTML = '<img src="' + e.target.result + '" style="max-width:100%;max-height:100px;border-radius:6px;margin-top:4px;" alt=""><div style="font-size:10px;color:var(--text-muted);">' + label + '已上传</div>';
      };
      reader.readAsDataURL(file);
    },

    _generate: function(container) {
      if (!this.productBase64) { UI.toast('请上传产品图（服装）', 'error'); return; }
      var btn = container.querySelector('#btnGenerate');
      var pa = container.querySelector('#progressArea');
      var ra = container.querySelector('#resultArea');
      UI.hideResult(ra); UI.showProgress(pa);
      btn.disabled = true; btn.textContent = '⏳ 换装中...';
      var self = this;

      (window.API||window.MockAPI).modelChange({ outfit: self.selectedOutfit, productImage: self.productBase64, modelImage: self.modelBase64 }).then(function(result) {
        UI.hideProgress(pa);
        container.querySelector('#origImg').src = self.productBase64;
        var ri = result.resultImages;
        container.querySelector('#resultImg').src = ri && ri[0] ? ri[0].url : '';
        container.querySelector('#resultImg').onclick = function() { if (ri && ri[0]) UI.previewImage(ri[0].url); };
        UI.showResult(ra);
        btn.disabled = false; btn.textContent = '🚀 开始换装';
        container._lastResult = result;
        Storage.addHistory('model-change', { tool: 'model-change', prompt: prompt || promptText || '', type: 'result', timestamp: new Date().toISOString() }); UI.renderHistory(container, 'model-change');

        // 保存历史
        Storage.addHistory('model-change', {
          prompt: '穿搭：' + self.selectedOutfit,
          type: 'image',
          imageUrl: ri && ri[0] ? ri[0].url : '',
          timestamp: new Date().toISOString()
        });
        UI.renderHistory(container, 'model-change');
      }).catch(function(err) {
        UI.hideProgress(pa); btn.disabled = false; btn.textContent = '🚀 开始换装';
        UI.toast(err.message || '换装失败', 'error');
      });
    },

    destroy: function() {}
  };

  window.__modules__ = window.__modules__ || {};
  window.__modules__['model-change'] = module;
})();
