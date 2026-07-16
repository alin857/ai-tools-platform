/* ============================================
   批量生成视频 — 多提示词/多图 → 批量出视频
   ============================================ */
(function() {
  var module = {
    name: 'batch-video',
    title: '批量生成视频',

    durations: [
      { label: '3 秒', value: 3 },
      { label: '5 秒', value: 5 },
      { label: '8 秒', value: 8 },
      { label: '10 秒', value: 10 }
    ],
    styles: [
      { name: '写实', icon: '📷' }, { name: '动漫', icon: '🎌' },
      { name: '电影感', icon: '🎬' }, { name: '3D动画', icon: '🎮' },
      { name: '国风水墨', icon: '🏮' }, { name: '赛博朋克', icon: '🌆' }
    ],
    selectedStyle: '写实',
    selectedDuration: 5,
    batchCount: 3,
    imageBase64: null,

    render: function(container) {
      container.innerHTML = this._buildHTML();
      this._bindEvents(container);
      UI.renderHistory(container, 'batch-video');
    },

    _buildHTML: function() {
      var self = this;
      var h = '';

      h += '<div class="tool-header"><button class="tool-header__back" onclick="Router.navigate(\'#/\')">←</button><div class="tool-header__title">📦 批量生成视频</div></div>';

      h += '<div class="tool-input-area">';

      // 模式说明
      h += '<div style="font-size:12px;color:#999;margin-bottom:14px;padding:10px;background:rgba(77,166,255,0.05);border-radius:8px;">⚡ 输入一个主题，AI 自动拆解为多个分镜并批量生成视频</div>';

      // 主题
      h += '<div class="tool-input-area__label">📝 创作主题</div>';
      h += '<textarea class="tool-textarea prompt-input" placeholder="描述你想批量生成的视频主题，如：海边度假的5个最美瞬间..." rows="3"></textarea>';

      // 上传参考图
      h += '<div style="margin-top:12px;">';
      h += '<div class="tool-input-area__label">🖼️ 上传参考图片（可选）</div>';
      h += '<div class="tool-upload" id="uploadArea" style="min-height:80px;">';
      h += '<div class="tool-upload__icon">📁</div>';
      h += '<div class="tool-upload__text">上传参考图片</div>';
      h += '<div id="uploadPreview" style="margin-top:8px;"></div>';
      h += '<input type="file" id="fileInput" accept="image/*">';
      h += '</div></div>';

      // 参数行
      h += '<div class="tool-params" style="margin-top:14px;">';

      // 批量数量
      h += '<div class="tool-param-group">';
      h += '<div class="tool-param-group__label">📦 生成数量</div>';
      h += '<select class="tool-select" id="countSelect">';
      h += '<option value="2">2 个</option><option value="3" selected>3 个</option><option value="5">5 个</option><option value="8">8 个</option>';
      h += '</select></div>';

      // 时长
      h += '<div class="tool-param-group">';
      h += '<div class="tool-param-group__label">⏱️ 每个时长</div>';
      h += '<select class="tool-select" id="durationSelect">';
      for (var j = 0; j < this.durations.length; j++) {
        var d = this.durations[j];
        h += '<option value="' + d.value + '"' + (d.value === this.selectedDuration ? ' selected' : '') + '>' + d.label + '</option>';
      }
      h += '</select></div>';

      // 画幅
      h += '<div class="tool-param-group">';
      h += '<div class="tool-param-group__label">📐 画幅比例</div>';
      h += '<select class="tool-select ratio-select">';
      h += '<option value="9:16" selected>9:16 竖屏</option><option value="16:9">16:9 横屏</option><option value="1:1">1:1 方形</option>';
      h += '</select></div>';

      h += '</div>';

      // 风格
      h += '<div class="tool-params">';
      h += '<div class="tool-param-group" style="flex:2;min-width:250px;">';
      h += '<div class="tool-param-group__label">🎨 视频风格</div>';
      h += '<div class="style-pills" id="stylePills">';
      for (var i = 0; i < this.styles.length; i++) {
        var s = this.styles[i];
        h += '<button class="style-pill' + (s.name === self.selectedStyle ? ' active' : '') + '" data-style="' + s.name + '">' + s.icon + ' ' + s.name + '</button>';
      }
      h += '</div></div></div>';

      h += '<button class="btn-generate" id="btnGenerate">📦 批量生成视频</button>';
      h += '</div>';

      // 进度
      h += '<div class="tool-progress" id="progressArea"><div class="spinner"></div><div class="tool-progress__text" id="progressMain">AI 正在批量生成视频...</div><div class="tool-progress__step" id="progressStep">准备中</div></div>';

      // 结果
      h += '<div class="tool-result" id="resultArea"><div class="tool-input-area__label" style="margin-bottom:12px;">📦 批量生成结果</div><div class="result-grid" id="resultGrid"></div><div class="result-actions"><button class="btn-action btn-action--primary" id="btnSaveAll">💾 全部保存</button><button class="btn-action btn-action--secondary" id="btnRetry">🔄 重试</button></div></div>';

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

      // 图片上传
      var ua = container.querySelector('#uploadArea');
      var fi = container.querySelector('#fileInput');
      ua.addEventListener('click', function(e) { if (e.target !== fi) fi.click(); });
      fi.addEventListener('change', function() {
        if (this.files[0]) {
          var r = new FileReader();
          r.onload = function(e) {
            self.imageBase64 = e.target.result;
            container.querySelector('#uploadPreview').innerHTML = '<img src="' + e.target.result + '" style="max-width:100%;max-height:70px;border-radius:8px;" alt="">';
            container.querySelector('#uploadArea').querySelector('.tool-upload__icon').style.display = 'none';
          };
          r.readAsDataURL(this.files[0]);
        }
      });

      container.querySelector('#btnGenerate').addEventListener('click', function() { self._generate(container); });
      container.querySelector('#btnRetry').addEventListener('click', function() { self._generate(container); });
      container.querySelector('#btnSaveAll').addEventListener('click', function() {
        var results = container._lastResults;
        if (results) {
          results.forEach(function(r) {
            Storage.addProduct({ videoUrl: r.videoUrl, thumbnailUrl: r.thumbnailUrl, toolName: 'batch-video', type: 'video' });
          });
          UI.toast('已全部保存', 'success');
        }
      });
    },

    _generate: function(container) {
      var prompt = container.querySelector('.prompt-input').value.trim();
      if (!prompt) { UI.toast('请输入创作主题', 'error'); return; }

      var self = this;
      var btn = container.querySelector('#btnGenerate');
      var pa = container.querySelector('#progressArea');
      var ra = container.querySelector('#resultArea');
      var stepEl = container.querySelector('#progressStep');
      var mainText = container.querySelector('#progressMain');

      UI.hideResult(ra); UI.showProgress(pa);
      btn.disabled = true; btn.textContent = '⏳ 批量生成中...';

      var count = parseInt(container.querySelector('#countSelect').value || 3);
      var duration = parseInt(container.querySelector('#durationSelect').value || 5);
      var ratio = (container.querySelector('.ratio-select') || {}).value || '9:16';

      // 生成多个变体提示词
      var prompts = [];
      var variations = ['第一部分', '第二部分', '第三部分', '第四部分', '第五部分', '第六部分', '第七部分', '第八部分'];
      for (var i = 0; i < count; i++) {
        prompts.push(prompt + ' — ' + (variations[i] || '第' + (i + 1) + '部分'));
      }

      var completed = 0;
      var results = [];
      var failed = 0;

      stepEl.textContent = '0/' + count + ' 完成';

      function runNext(index) {
        if (index >= prompts.length) {
          // 全部完成
          UI.hideProgress(pa);
          btn.disabled = false; btn.textContent = '📦 批量生成视频';
          self._showResults(container, results, failed);
          UI.showResult(ra);
          container._lastResults = results;
          Storage.addHistory('batch-video', { tool: 'batch-video', prompt: prompt || promptText || '', type: 'result', timestamp: new Date().toISOString() }); UI.renderHistory(container, 'batch-video');
          return;
        }

        mainText.textContent = '生成中 ' + (index + 1) + '/' + count;
        stepEl.textContent = completed + '/' + count + ' 完成';

        (window.API||window.MockAPI).imageToVideo({
          prompt: prompts[index],
          style: self.selectedStyle,
          duration: duration,
          ratio: ratio,
          imageData: self.imageBase64,
          onProgress: function(pct, st) {
            stepEl.textContent = completed + '/' + count + ' 完成 | 当前: ' + (st || (pct + '%'));
          }
        }).then(function(result) {
          completed++;
          results.push(result);
          // 先显示已完成的结果
          self._showResults(container, results, failed);
          UI.showResult(ra);
          // 继续下一个
          setTimeout(function() { runNext(index + 1); }, 500);
        }).catch(function(err) {
          failed++;
          setTimeout(function() { runNext(index + 1); }, 500);
        });
      }

      runNext(0);
    },

    _showResults: function(container, results, failed) {
      var grid = container.querySelector('#resultGrid');
      var h = '';
      for (var i = 0; i < results.length; i++) {
        var r = results[i];
        h +=
          '<div class="result-item" style="aspect-ratio:9/16;">' +
            '<video src="' + (r.videoUrl || '') + '" controls playsinline muted style="width:100%;height:100%;object-fit:cover;background:#000;" poster="' + (r.thumbnailUrl || '') + '"></video>' +
          '</div>';
      }
      if (failed > 0) {
        h += '<div style="font-size:12px;color:#ff6b6b;padding:8px;">' + failed + ' 个失败</div>';
      }
      grid.innerHTML = h;
    },

    destroy: function() {}
  };

  window.__modules__ = window.__modules__ || {};
  window.__modules__['batch-video'] = module;
})();
