/* ============================================
   AI视频生成 — 双模式：文生视频 + 图生视频
   支持正面提示词 + 负面提示词（中英文）
   ============================================ */
(function() {
  var module = {
    name: 'image-to-video',
    title: 'AI视频生成',

    activeMode: 'text2vid', // 'text2vid' | 'img2vid'

    durations: [
      { label: '3 秒', value: 3 },
      { label: '5 秒', value: 5 },
      { label: '8 秒', value: 8 },
      { label: '10 秒', value: 10 }
    ],
    styles: [
      { name: '写实', icon: '📷' },
      { name: '动漫', icon: '🎌' },
      { name: '电影感', icon: '🎬' },
      { name: '3D动画', icon: '🎮' },
      { name: '国风水墨', icon: '🏮' },
      { name: '赛博朋克', icon: '🌆' }
    ],
    selectedStyle: '写实',
    selectedDuration: 5,
    uploadedBase64: null,

    // 默认负面提示词
    defaultNegPrompt: 'blurry, low quality, distorted, jittery, watermark, text, logo, worst quality, bad anatomy, ugly, deformed, disfigured',

    render: function(container) {
      container.innerHTML = this._buildHTML();
      this._bindEvents(container);
      UI.renderHistory(container, 'image-to-video');
    },

    _buildHTML: function() {
      var self = this;
      var h = '';

      h +=
        '<div class="tool-header">' +
          '<button class="tool-header__back" onclick="Router.navigate(\'#/\')">←</button>' +
          '<div class="tool-header__title">🎬 AI视频生成</div>' +
        '</div>';

      // ════ 模式切换 ════
      h +=
        '<div style="display:flex;gap:12px;margin-bottom:16px;">' +
          '<button class="mode-tab' + (this.activeMode === 'text2vid' ? ' active' : '') + '" id="modeText2Vid" style="' +
            'flex:1;padding:14px 20px;border-radius:var(--radius-sm);font-size:15px;font-weight:600;cursor:pointer;' +
            'background:' + (this.activeMode === 'text2vid' ? 'var(--accent-dim)' : 'var(--bg-card)') + ';' +
            'border:1px solid ' + (this.activeMode === 'text2vid' ? 'var(--accent-strong)' : 'var(--border-card)') + ';' +
            'color:' + (this.activeMode === 'text2vid' ? 'var(--accent)' : 'var(--text-secondary)') + ';' +
            'transition:all var(--transition-fast);">' +
            '📝 文生视频' +
          '</button>' +
          '<button class="mode-tab' + (this.activeMode === 'img2vid' ? ' active' : '') + '" id="modeImg2Vid" style="' +
            'flex:1;padding:14px 20px;border-radius:var(--radius-sm);font-size:15px;font-weight:600;cursor:pointer;' +
            'background:' + (this.activeMode === 'img2vid' ? 'var(--accent-dim)' : 'var(--bg-card)') + ';' +
            'border:1px solid ' + (this.activeMode === 'img2vid' ? 'var(--accent-strong)' : 'var(--border-card)') + ';' +
            'color:' + (this.activeMode === 'img2vid' ? 'var(--accent)' : 'var(--text-secondary)') + ';' +
            'transition:all var(--transition-fast);">' +
            '🖼️ 图生视频' +
          '</button>' +
        '</div>';

      // ════ 输入区 ════
      h += '<div class="tool-input-area">';

      // 图生视频：上传区
      h += '<div id="imgUploadSection" style="display:' + (this.activeMode === 'img2vid' ? 'block' : 'none') + ';">';
      h += '<div class="tool-input-area__label">🖼️ 上传参考图片</div>';
      h +=
        '<div class="tool-upload" id="uploadArea">' +
          '<div class="tool-upload__icon">📁</div>' +
          '<div class="tool-upload__text">点击上传图片 或拖拽到此处</div>' +
          '<div class="tool-upload__hint">支持 JPG / PNG / WebP，最大 10MB</div>' +
          '<div id="uploadPreview" style="margin-top:12px;"></div>' +
          '<input type="file" id="fileInput" accept="image/*">' +
        '</div>';
      h += '</div>';

      // 正面提示词（两种模式都有）
      h += '<div style="margin-top:' + (this.activeMode === 'img2vid' ? '12px' : '0') + ';">';
      h += '<div class="tool-input-area__label">✅ 正面提示词 <span style="font-weight:400;font-size:11px;color:var(--text-muted);">（支持中英文，描述你想要的画面）</span></div>';
      h += '<textarea class="tool-textarea prompt-input" id="posPrompt" placeholder="描述视频内容，中英文均可。例如：a beautiful sunset beach, gentle waves, cinematic lighting, 4K / 美丽的夕阳海滩，温柔的波浪，电影级光影，高画质" rows="3"></textarea>';
      h += '</div>';

      // 负面提示词（仅文生视频模式显示）
      h += '<div id="negPromptSection" style="margin-top:12px;display:' + (this.activeMode === 'text2vid' ? 'block' : 'none') + ';">';
      h += '<div class="tool-input-area__label">❌ 负面提示词 <span style="font-weight:400;font-size:11px;color:var(--text-muted);">（排除不需要的元素，中英文均可）</span></div>';
      h += '<textarea class="tool-textarea neg-prompt-input" id="negPrompt" placeholder="排除不想出现的元素。默认：blurry, low quality, distorted, watermark..." rows="2">' + this.defaultNegPrompt + '</textarea>';
      h += '<div style="margin-top:6px;display:flex;gap:8px;flex-wrap:wrap;" id="negQuickTags"></div>';
      h += '</div>';

      // 参数行
      h += '<div class="tool-params" style="margin-top:12px;">';

      // 风格
      h += '<div class="tool-param-group" style="flex:2;min-width:250px;">';
      h += '<div class="tool-param-group__label">🎨 视频风格</div>';
      h += '<div class="style-pills" id="stylePills">';
      for (var i = 0; i < this.styles.length; i++) {
        var s = this.styles[i];
        h += '<button class="style-pill' + (s.name === this.selectedStyle ? ' active' : '') + '" data-style="' + s.name + '">' + s.icon + ' ' + s.name + '</button>';
      }
      h += '</div></div>';

      // 时长
      h += '<div class="tool-param-group">';
      h += '<div class="tool-param-group__label">⏱️ 视频时长</div>';
      h += '<select class="tool-select" id="durationSelect">';
      for (var j = 0; j < this.durations.length; j++) {
        var d = this.durations[j];
        h += '<option value="' + d.value + '"' + (d.value === this.selectedDuration ? ' selected' : '') + '>' + d.label + '</option>';
      }
      h += '</select></div>';

      h += '</div>';

      var btnLabel = this.activeMode === 'img2vid' ? '🎬 生成视频' : '🎬 开始生成视频';
      h += '<button class="btn-generate" id="btnGenerate">' + btnLabel + '</button>';
      h += '</div>';

      // ════ 进度区 ════
      h +=
        '<div class="tool-progress" id="progressArea">' +
          '<div class="spinner"></div>' +
          '<div class="tool-progress__text" id="progressMainText">AI 正在生成视频...</div>' +
          '<div class="tool-progress__step" id="progressStep">准备中</div>' +
          '<div class="progress-steps" id="progressSteps">' +
            '<div class="progress-step active">① 解析提示词</div>' +
            '<div class="progress-step">② 生成关键帧</div>' +
            '<div class="progress-step">③ 视频合成</div>' +
            '<div class="progress-step">④ 渲染输出</div>' +
          '</div>' +
        '</div>';

      // ════ 结果区 ════
      h +=
        '<div class="tool-result" id="resultArea">' +
          '<div class="tool-input-area__label" style="margin-bottom:12px;">🎥 生成结果</div>' +
          '<div id="videoResult"></div>' +
          '<div class="result-actions" style="margin-top:16px;">' +
            '<button class="btn-action btn-action--primary" id="btnSave">💾 保存到我的产品</button>' +
            '<button class="btn-action btn-action--secondary" id="btnDownload">📥 下载视频</button>' +
            '<button class="btn-action btn-action--secondary" id="btnRetry">🔄 重新生成</button>' +
          '</div>' +
        '</div>';

      h += '<div id="historySection"></div>';
      return h;
    },

    _bindEvents: function(container) {
      var self = this;

      // ════ 模式切换 ════
      container.querySelector('#modeText2Vid').addEventListener('click', function() {
        self._switchMode(container, 'text2vid');
      });
      container.querySelector('#modeImg2Vid').addEventListener('click', function() {
        self._switchMode(container, 'img2vid');
      });

      // 风格选择
      var pills = container.querySelectorAll('#stylePills .style-pill');
      for (var i = 0; i < pills.length; i++) {
        pills[i].addEventListener('click', function() {
          for (var j = 0; j < pills.length; j++) pills[j].classList.remove('active');
          this.classList.add('active');
          self.selectedStyle = this.getAttribute('data-style');
        });
      }

      // 文件上传
      var uploadArea = container.querySelector('#uploadArea');
      var fileInput = container.querySelector('#fileInput');
      if (uploadArea && fileInput) {
        uploadArea.addEventListener('click', function(e) {
          if (e.target !== fileInput) fileInput.click();
        });
        uploadArea.addEventListener('dragover', function(e) { e.preventDefault(); this.classList.add('drag-over'); });
        uploadArea.addEventListener('dragleave', function() { this.classList.remove('drag-over'); });
        uploadArea.addEventListener('drop', function(e) {
          e.preventDefault(); this.classList.remove('drag-over');
          var file = e.dataTransfer.files[0];
          if (file) self._handleFile(container, file);
        });
        fileInput.addEventListener('change', function() {
          if (this.files[0]) self._handleFile(container, this.files[0]);
        });
      }

      // 负面提示词快捷标签
      var negQuickTags = container.querySelector('#negQuickTags');
      if (negQuickTags) {
        var quickTags = [
          { cn: '模糊', en: 'blurry' },
          { cn: '低画质', en: 'low quality' },
          { cn: '扭曲', en: 'distorted' },
          { cn: '水印', en: 'watermark' },
          { cn: '抖动', en: 'jittery' },
          { cn: '文字', en: 'text, logo' },
          { cn: '丑陋', en: 'ugly, deformed' },
          { cn: '卡通', en: 'cartoon, anime' }
        ];
        for (var t = 0; t < quickTags.length; t++) {
          var tag = quickTags[t];
          var btn = document.createElement('button');
          btn.textContent = '− ' + tag.cn;
          btn.title = tag.en;
          btn.style.cssText = 'padding:3px 10px;border-radius:12px;font-size:11px;background:rgba(255,107,107,0.08);color:#ff8888;border:1px solid rgba(255,107,107,0.15);cursor:pointer;transition:all var(--transition-fast);';
          btn.addEventListener('click', function() {
            var negInput = container.querySelector('#negPrompt');
            var current = negInput.value.trim();
            var add = this.title;
            // 避免重复
            if (current.indexOf(add) === -1) {
              negInput.value = current + (current ? ', ' : '') + add;
            }
          });
          negQuickTags.appendChild(btn);
        }
        // 重置按钮
        var resetBtn = document.createElement('button');
        resetBtn.textContent = '↺ 默认';
        resetBtn.style.cssText = 'padding:3px 10px;border-radius:12px;font-size:11px;background:var(--bg-input);color:var(--text-secondary);border:1px solid var(--border-card);cursor:pointer;';
        resetBtn.addEventListener('click', function() {
          container.querySelector('#negPrompt').value = self.defaultNegPrompt;
        });
        negQuickTags.appendChild(resetBtn);
      }

      // 生成
      container.querySelector('#btnGenerate').addEventListener('click', function() {
        self._handleGenerate(container);
      });
      // 重试
      container.querySelector('#btnRetry').addEventListener('click', function() {
        self._handleGenerate(container);
      });
      // 保存
      container.querySelector('#btnSave').addEventListener('click', function() {
        var result = container._lastResult;
        if (result) {
          Storage.addProduct({
            videoUrl: result.videoUrl,
            thumbnailUrl: result.thumbnailUrl,
            toolName: 'image-to-video',
            type: 'video',
            duration: result.duration
          });
          UI.toast('已保存到我的产品', 'success');
        }
      });
      // 下载
      container.querySelector('#btnDownload').addEventListener('click', function() {
        var result = container._lastResult;
        if (result && result.videoUrl) {
          UI.downloadFile(result.videoUrl, 'ai-video-' + Date.now() + '.mp4');
        }
      });
    },

    _switchMode: function(container, mode) {
      this.activeMode = mode;
      var textBtn = container.querySelector('#modeText2Vid');
      var imgBtn = container.querySelector('#modeImg2Vid');
      var upSection = container.querySelector('#imgUploadSection');
      var negSection = container.querySelector('#negPromptSection');
      var genBtn = container.querySelector('#btnGenerate');

      if (mode === 'text2vid') {
        textBtn.style.background = 'var(--accent-dim)';
        textBtn.style.borderColor = 'var(--accent-strong)';
        textBtn.style.color = 'var(--accent)';
        imgBtn.style.background = 'var(--bg-card)';
        imgBtn.style.borderColor = 'var(--border-card)';
        imgBtn.style.color = 'var(--text-secondary)';
        upSection.style.display = 'none';
        negSection.style.display = 'block';
        genBtn.textContent = '🎬 开始生成视频';
      } else {
        imgBtn.style.background = 'var(--accent-dim)';
        imgBtn.style.borderColor = 'var(--accent-strong)';
        imgBtn.style.color = 'var(--accent)';
        textBtn.style.background = 'var(--bg-card)';
        textBtn.style.borderColor = 'var(--border-card)';
        textBtn.style.color = 'var(--text-secondary)';
        upSection.style.display = 'block';
        negSection.style.display = 'none';
        genBtn.textContent = '🖼️ + 🎬 图生视频';
      }

      UI.hideResult(container.querySelector('#resultArea'));
    },

    _handleFile: function(container, file) {
      if (!file.type.startsWith('image/')) {
        UI.toast('请上传图片文件', 'error');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        UI.toast('文件大小不能超过 10MB', 'error');
        return;
      }

      var self = this;
      var reader = new FileReader();
      reader.onload = function(e) {
        self.uploadedBase64 = e.target.result;
        container.querySelector('#uploadPreview').innerHTML =
          '<img src="' + e.target.result + '" class="tool-upload__preview" alt="预览">' +
          '<div style="font-size:12px;color:var(--text-secondary);margin-top:4px;">' + file.name + ' (' + (file.size / 1024).toFixed(0) + ' KB)</div>';
        container.querySelector('.tool-upload__icon').style.display = 'none';
        container.querySelector('.tool-upload__text').textContent = '点击更换图片';
      };
      reader.readAsDataURL(file);
    },

    _handleGenerate: function(container) {
      var isImgMode = this.activeMode === 'img2vid';
      var posPrompt = container.querySelector('#posPrompt').value.trim();

      if (!posPrompt && !isImgMode) {
        UI.toast('请输入正面提示词描述视频内容', 'error');
        container.querySelector('#posPrompt').focus();
        return;
      }
      if (isImgMode && !this.uploadedBase64) {
        UI.toast('请上传参考图片', 'error');
        return;
      }

      var negPrompt = '';
      if (!isImgMode) {
        negPrompt = container.querySelector('#negPrompt').value.trim();
      }

      var btn = container.querySelector('#btnGenerate');
      var progressArea = container.querySelector('#progressArea');
      var resultArea = container.querySelector('#resultArea');
      var stepEl = container.querySelector('#progressStep');
      var mainText = container.querySelector('#progressMainText');
      var steps = container.querySelectorAll('#progressSteps .progress-step');

      UI.hideResult(resultArea);
      UI.showProgress(progressArea);
      btn.disabled = true;
      btn.textContent = '⏳ 生成中...';

      for (var s = 0; s < steps.length; s++) {
        steps[s].classList.remove('active', 'done');
        if (s === 0) steps[s].classList.add('active');
      }

      var self = this;
      var duration = parseInt(container.querySelector('#durationSelect').value);

      // ★ API 调用
      (window.API||window.MockAPI).imageToVideo({
        prompt: posPrompt,
        negativePrompt: negPrompt,
        style: this.selectedStyle,
        duration: duration,
        imageData: isImgMode ? this.uploadedBase64 : null,
        onProgress: function(pct, statusText) {
          stepEl.textContent = statusText;
          if (mainText) {
            mainText.textContent = 'AI 正在生成视频... ' + pct + '% '
              + (isImgMode ? '(图生视频)' : '(文生视频)');
          }
          var allDone = 0;
          if (pct >= 100) allDone = 4;
          else if (pct >= 50) allDone = 3;
          else if (pct >= 15) allDone = 2;
          else if (pct >= 5) allDone = 1;
          for (var i = 0; i < steps.length; i++) {
            steps[i].classList.remove('active', 'done');
            if (i < allDone) steps[i].classList.add('done');
            else if (i === allDone && allDone < 4) steps[i].classList.add('active');
          }
        }
      }).then(function(result) {
        for (var i = 0; i < steps.length; i++) {
          steps[i].classList.remove('active');
          steps[i].classList.add('done');
        }
        stepEl.textContent = '✅ 视频生成完成！共 ' + duration + ' 秒';
        if (mainText) mainText.textContent = '视频生成完成';

        setTimeout(function() {
          UI.hideProgress(progressArea);
          self._showResult(container, result);
          UI.showResult(resultArea);
          btn.disabled = false;
          btn.textContent = isImgMode ? '🖼️ + 🎬 图生视频' : '🎬 开始生成视频';
        }, 400);
      }).catch(function(err) {
        for (var i = 0; i < steps.length; i++) steps[i].classList.remove('active', 'done');
        stepEl.textContent = '生成失败';
        UI.hideProgress(progressArea);
        btn.disabled = false;
        btn.textContent = isImgMode ? '🖼️ + 🎬 图生视频' : '🎬 开始生成视频';
        UI.toast(err.message || '生成失败，请重试', 'error');
      });
    },

    _showResult: function(container, result) {
      container.querySelector('#videoResult').innerHTML =
        '<video src="' + result.videoUrl + '" controls autoplay playsinline ' +
          'style="width:100%;max-width:640px;border-radius:var(--radius-sm);background:#000;" ' +
          'poster="' + (result.thumbnailUrl || '') + '">' +
        '</video>' +
        '<div style="margin-top:8px;font-size:12px;color:var(--text-muted);">' +
          '时长：' + (result.duration || '5') + '秒 ｜ 模式：' + (this.activeMode === 'img2vid' ? '图生视频' : '文生视频') + ' ｜ 消耗：' + (result.cost || '—') + ' 积分' +
        '</div>';
      container._lastResult = result;
        Storage.addHistory('image-to-video', { tool: 'image-to-video', prompt: prompt || promptText || '', type: 'result', timestamp: new Date().toISOString() }); UI.renderHistory(container, 'image-to-video');
    },

    destroy: function() {
      this.uploadedBase64 = null;
    }
  };

  window.__modules__ = window.__modules__ || {};
  window.__modules__['image-to-video'] = module;
})();
