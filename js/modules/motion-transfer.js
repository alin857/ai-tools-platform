/* ============================================
   视频复刻 — 视频链接/文件 + 图片 → AI 复刻
   ============================================ */
(function() {
  var module = {
    name: 'motion-transfer',
    title: '视频复刻',

    styles: [
      { name: '原片风格', icon: '🎞️' },
      { name: '电影大片', icon: '🎬' },
      { name: '动漫风', icon: '🎌' },
      { name: '3D卡通', icon: '🎮' },
      { name: '水墨国风', icon: '🏮' }
    ],
    selectedStyle: '原片风格',
    imageBase64: null,

    render: function(container) {
      container.innerHTML = this._buildHTML();
      this._bindEvents(container);
      UI.renderHistory(container, 'motion-transfer');
    },

    _buildHTML: function() {
      var self = this;
      var h = '';

      h += '<div class="tool-header"><button class="tool-header__back" onclick="Router.navigate(\'#/\')">←</button><div class="tool-header__title">🎞️ 视频复刻</div></div>';

      h += '<div class="tool-input-area">';

      // ====== 双栏上传区 ======
      h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">';

      // 左栏：参考视频
      h += '<div>';
      h += '<div class="tool-input-area__label">🎬 参考视频（动作/风格来源）</div>';
      h += '<div class="tool-upload" id="videoUpload" style="min-height:140px;">';
      h += '<div class="tool-upload__icon">🎬</div>';
      h += '<div class="tool-upload__text">上传 MP4 视频</div>';
      h += '<div class="tool-upload__hint">或下方粘贴链接</div>';
      h += '<div id="videoPreview" style="margin-top:8px;"></div>';
      h += '<input type="file" id="videoInput" accept="video/*">';
      h += '</div>';
      h += '<input type="text" class="video-url-input" placeholder="或粘贴短视频链接（抖音/快手/B站）..." style="width:100%;margin-top:8px;padding:9px 12px;border-radius:10px;background:rgba(255,255,255,0.03);border:1px solid var(--border);color:#e0e0e0;font-size:12px;">';
      h += '</div>';

      // 右栏：复刻图片
      h += '<div>';
      h += '<div class="tool-input-area__label">🖼️ 复刻图片（你的照片/角色）</div>';
      h += '<div class="tool-upload" id="imageUpload" style="min-height:140px;">';
      h += '<div class="tool-upload__icon">🖼️</div>';
      h += '<div class="tool-upload__text">上传要复刻的图片</div>';
      h += '<div class="tool-upload__hint">人物/角色照片效果最佳</div>';
      h += '<div id="imagePreview" style="margin-top:8px;"></div>';
      h += '<input type="file" id="imageInput" accept="image/*">';
      h += '</div>';
      h += '</div>';

      h += '</div>';

      // 风格 + 描述
      h += '<div class="tool-params" style="margin-top:14px;">';
      h += '<div class="tool-param-group" style="flex:2;min-width:200px;">';
      h += '<div class="tool-param-group__label">🎨 输出风格</div>';
      h += '<div class="style-pills" id="stylePills">';
      for (var i = 0; i < this.styles.length; i++) {
        var s = this.styles[i];
        h += '<button class="style-pill' + (s.name === self.selectedStyle ? ' active' : '') + '" data-style="' + s.name + '">' + s.icon + ' ' + s.name + '</button>';
      }
      h += '</div></div></div>';

      h += '<div class="tool-params"><div class="tool-param-group">';
      h += '<div class="tool-param-group__label">⏱️ 视频时长</div>';
h += '<div class="tool-param-group"><div class="tool-param-group__label">📐 画幅比例</div><select class="tool-select ratio-select"><option value="9:16" selected>9:16 竖屏</option><option value="16:9">16:9 横屏</option><option value="1:1">1:1 方形</option></select></div>';
      h += '<select class="tool-select" id="durationSelect"><option value="3">3 秒</option><option value="5" selected>5 秒</option><option value="8">8 秒</option><option value="10">10 秒</option></select>';
      h += '</div></div>';

      h += '<div style="margin-top:10px;">';
      h += '<div class="tool-input-area__label">📝 复刻描述（可选）</div>';
      h += '<textarea class="tool-textarea desc-input" placeholder="描述复刻效果，如：让图片中的人物做出视频中的动作..." rows="2" style="min-height:50px;"></textarea>';
      h += '</div>';

      h += '<button class="btn-generate" id="btnGenerate">🎬 开始复刻</button>';
      h += '</div>';

      // 进度
      h += '<div class="tool-progress" id="progressArea"><div class="spinner"></div><div class="tool-progress__text">AI 正在复刻视频...</div><div class="tool-progress__step" id="progressStep">分析视频动作</div></div>';

      // 结果
      h += '<div class="tool-result" id="resultArea"><div class="tool-input-area__label" style="margin-bottom:12px;">🎞️ 复刻结果</div><div id="videoWrap"></div><div class="result-actions" style="margin-top:14px;"><button class="btn-action btn-action--primary" id="btnSave">💾 保存</button><button class="btn-action btn-action--secondary" id="btnDownload">📥 下载</button><button class="btn-action btn-action--secondary" id="btnRetry">🔄 重试</button></div></div>';

      h += '<div id="historySection"></div>';

      return h;
    },

    _bindEvents: function(container) {
      var self = this;

      // 风格
      var pills = container.querySelectorAll('#stylePills .style-pill');
      for (var i = 0; i < pills.length; i++) {
        pills[i].addEventListener('click', function() {
          for (var j = 0; j < pills.length; j++) pills[j].classList.remove('active');
          this.classList.add('active');
          self.selectedStyle = this.getAttribute('data-style');
        });
      }

      // 视频上传
      var vu = container.querySelector('#videoUpload');
      var vi = container.querySelector('#videoInput');
      vu.addEventListener('click', function(e) { if (e.target !== vi) vi.click(); });
      vi.addEventListener('change', function() {
        if (this.files[0]) {
          container.querySelector('#videoPreview').innerHTML =
            '<div style="font-size:12px;color:#4da6ff;">🎬 ' + this.files[0].name + ' (' + (this.files[0].size/1024/1024).toFixed(1) + 'MB)</div>';
          container.querySelector('.video-url-input').value = '';
          container.querySelector('#videoUpload').querySelector('.tool-upload__icon').style.display = 'none';
          container.querySelector('#videoUpload').querySelector('.tool-upload__text').textContent = '点击更换视频';
        }
      });

      // 图片上传
      var iu = container.querySelector('#imageUpload');
      var ii = container.querySelector('#imageInput');
      iu.addEventListener('click', function(e) { if (e.target !== ii) ii.click(); });
      ii.addEventListener('change', function() {
        if (this.files[0]) {
          var r = new FileReader();
          r.onload = function(e) {
            self.imageBase64 = e.target.result;
            container.querySelector('#imagePreview').innerHTML =
              '<img src="' + e.target.result + '" style="max-width:100%;max-height:90px;border-radius:8px;" alt="">';
            container.querySelector('#imageUpload').querySelector('.tool-upload__icon').style.display = 'none';
            container.querySelector('#imageUpload').querySelector('.tool-upload__text').textContent = '点击更换图片';
          };
          r.readAsDataURL(this.files[0]);
        }
      });

      container.querySelector('#btnGenerate').addEventListener('click', function() { self._generate(container); });
      container.querySelector('#btnRetry').addEventListener('click', function() { self._generate(container); });
      container.querySelector('#btnSave').addEventListener('click', function() {
        var r = container._lastResult;
        if (r) { Storage.addProduct({ videoUrl: r.videoUrl, toolName: 'motion-transfer', type: 'video' }); UI.toast('已保存', 'success'); }
      });
      container.querySelector('#btnDownload').addEventListener('click', function() {
        var r = container._lastResult;
        if (r && r.videoUrl) UI.downloadFile(r.videoUrl, 'fuke-' + Date.now() + '.mp4');
      });
    },

    _generate: function(container) {
      var videoUrl = container.querySelector('.video-url-input').value.trim();

      if (!this.imageBase64) { UI.toast('请上传要复刻的图片', 'error'); return; }
      if (!videoUrl && !container.querySelector('#videoInput').files[0]) {
        UI.toast('请上传参考视频或粘贴视频链接', 'error'); return;
      }

      var self = this;
      var btn = container.querySelector('#btnGenerate');
      var pa = container.querySelector('#progressArea');
      var ra = container.querySelector('#resultArea');
      UI.hideResult(ra); UI.showProgress(pa);
      btn.disabled = true; btn.textContent = '⏳ 复刻中...';

      var desc = container.querySelector('.desc-input').value.trim();
      var promptText = '视频复刻：' + (desc || '将图片中的人物替换到视频场景中，保持动作和风格一致') + '，风格：' + self.selectedStyle;

      (window.API||window.MockAPI).imageToVideo({
        prompt: promptText,
        style: self.selectedStyle,
        duration: parseInt(container.querySelector('#durationSelect').value || 5),
        ratio: (container.querySelector('.ratio-select') || {}).value || '9:16',
        imageData: self.imageBase64,
        onProgress: function(pct, st) {
          container.querySelector('#progressStep').textContent = st || ('复刻中 ' + pct + '%');
        }
      }).then(function(result) {
        UI.hideProgress(pa);
        container.querySelector('#videoWrap').innerHTML =
          '<video src="' + (result.videoUrl || '') + '" controls autoplay playsinline ' +
          'style="width:100%;max-width:480px;border-radius:10px;background:#000;margin:0 auto;display:block;" ' +
          'poster="' + (result.thumbnailUrl || '') + '"></video>';
        UI.showResult(ra);
        btn.disabled = false; btn.textContent = '🎬 开始复刻';
        container._lastResult = result;
        Storage.addHistory('motion-transfer', { tool: 'motion-transfer', prompt: promptText || prompt || '', type: 'result', timestamp: new Date().toISOString() }); UI.renderHistory(container, 'motion-transfer');
      }).catch(function(err) {
        UI.hideProgress(pa); btn.disabled = false; btn.textContent = '🎬 开始复刻';
        UI.toast(err.message || '复刻失败', 'error');
      });
    },

    destroy: function() {}
  };

  window.__modules__ = window.__modules__ || {};
  window.__modules__['motion-transfer'] = module;
})();
