/* ============================================
   达人探店 — AI 探店内容生成模块
   双模式：图文笔记 + 探店视频
   ============================================ */
(function() {
  var module = {
    name: 'store-visit',
    title: '达人探店',

    activeMode: 'article', // 'article' | 'video'

    shopTypes: [
      { name: '餐饮美食', icon: '🍽️' },  { name: '咖啡甜品', icon: '☕' },
      { name: '时尚服饰', icon: '👗' },  { name: '美妆护肤', icon: '💄' },
      { name: '生活家居', icon: '🏠' },  { name: '文创书店', icon: '📚' },
      { name: '酒店民宿', icon: '🏨' },  { name: '健身运动', icon: '💪' },
      { name: '亲子乐园', icon: '🎠' },  { name: '网红打卡', icon: '📸' }
    ],
    platforms: [
      { name: '小红书', icon: '📱' },
      { name: '抖音', icon: '🎵' },
      { name: '大众点评', icon: '⭐' },
      { name: '朋友圈', icon: '💬' }
    ],
    tones: [
      { name: '种草推荐', icon: '💚' }, { name: '真实测评', icon: '📊' },
      { name: '避雷指南', icon: '⚠️' }, { name: '氛围感', icon: '✨' },
      { name: '性价比', icon: '💰' },   { name: '约会圣地', icon: '💕' }
    ],
    videoStyles: [
      { name: '快节奏卡点', icon: '⚡' }, { name: '慢镜头氛围', icon: '🌙' },
      { name: 'Vlog日常', icon: '📹' },  { name: '综艺字幕风', icon: '🎯' },
      { name: '治愈系', icon: '🌸' },    { name: '炫酷转场', icon: '🔥' }
    ],
    bgmOptions: [
      { name: '轻快流行', icon: '🎶' }, { name: '爵士慵懒', icon: '🎷' },
      { name: '电子动感', icon: '🎧' }, { name: '国风古韵', icon: '🏮' },
      { name: '钢琴舒缓', icon: '🎹' }, { name: 'R&B律动', icon: '🎵' }
    ],

    selectedShopType: '餐饮美食',
    selectedPlatform: '小红书',
    selectedTone: '种草推荐',
    selectedVideoStyle: '快节奏卡点',
    selectedBGM: '轻快流行',

    render: function(container) {
      container.innerHTML = this._buildHTML();
      this._bindEvents(container);
      UI.renderHistory(container, 'store-visit');
    },

    _buildHTML: function() {
      var self = this;
      var h = '';

      h +=
        '<div class="tool-header">' +
          '<button class="tool-header__back" onclick="Router.navigate(\'#/\')">←</button>' +
          '<div class="tool-header__title">🔍 达人探店</div>' +
        '</div>';

      // ════ 模式切换 ════
      h +=
        '<div style="display:flex;gap:12px;margin-bottom:16px;">' +
          '<button class="mode-tab' + (this.activeMode === 'article' ? ' active' : '') + '" id="modeArticle" style="' +
            'flex:1;padding:14px 20px;border-radius:var(--radius-sm);font-size:15px;font-weight:600;cursor:pointer;' +
            'background:' + (this.activeMode === 'article' ? 'var(--accent-dim)' : 'var(--bg-card)') + ';' +
            'border:1px solid ' + (this.activeMode === 'article' ? 'var(--accent-strong)' : 'var(--border-card)') + ';' +
            'color:' + (this.activeMode === 'article' ? 'var(--accent)' : 'var(--text-secondary)') + ';' +
            'transition:all var(--transition-fast);">' +
            '📝 图文笔记' +
          '</button>' +
          '<button class="mode-tab' + (this.activeMode === 'video' ? ' active' : '') + '" id="modeVideo" style="' +
            'flex:1;padding:14px 20px;border-radius:var(--radius-sm);font-size:15px;font-weight:600;cursor:pointer;' +
            'background:' + (this.activeMode === 'video' ? 'var(--accent-dim)' : 'var(--bg-card)') + ';' +
            'border:1px solid ' + (this.activeMode === 'video' ? 'var(--accent-strong)' : 'var(--border-card)') + ';' +
            'color:' + (this.activeMode === 'video' ? 'var(--accent)' : 'var(--text-secondary)') + ';' +
            'transition:all var(--transition-fast);">' +
            '🎬 探店视频' +
          '</button>' +
        '</div>';

      // ════ 输入表单 ════
      h += '<div class="tool-input-area">';

      // 店铺名称 + 地址
      h += '<div class="tool-input-area__label">🏪 店铺名称</div>';
      h += '<input type="text" class="tool-textarea shop-name-input" placeholder="输入店铺名称，如：瑞光咖啡·鼓楼店" style="min-height:auto;height:42px;padding:10px 14px;">';
      h +=
        '<div style="margin-top:12px;">' +
          '<div class="tool-input-area__label">📍 店铺地址</div>' +
          '<input type="text" class="tool-textarea shop-address-input" placeholder="店铺地址" style="min-height:auto;height:42px;padding:10px 14px;">' +
        '</div>';

      // 店铺类型
      h += '<div class="tool-params">';
      h += '<div class="tool-param-group" style="flex:2;min-width:300px;">';
      h += '<div class="tool-param-group__label">🏷️ 店铺类型</div>';
      h += '<div class="style-pills" id="shopTypePills">';
      for (var i = 0; i < this.shopTypes.length; i++) {
        var t = this.shopTypes[i];
        h += '<button class="style-pill' + (t.name === this.selectedShopType ? ' active' : '') + '" data-type="' + t.name + '">' + t.icon + ' ' + t.name + '</button>';
      }
      h += '</div></div></div>';

      // 平台 + 语调
      h += '<div class="tool-params">';
      h += '<div class="tool-param-group" style="flex:1;min-width:200px;">';
      h += '<div class="tool-param-group__label">📲 发布平台</div>';
      h += '<div class="style-pills" id="platformPills">';
      for (var j = 0; j < this.platforms.length; j++) {
        var pf = this.platforms[j];
        h += '<button class="style-pill' + (pf.name === this.selectedPlatform ? ' active' : '') + '" data-platform="' + pf.name + '">' + pf.icon + ' ' + pf.name + '</button>';
      }
      h += '</div></div>';

      h += '<div class="tool-param-group" style="flex:1;min-width:250px;">';
      h += '<div class="tool-param-group__label">🎯 文案风格</div>';
      h += '<div class="style-pills" id="tonePills">';
      for (var k = 0; k < this.tones.length; k++) {
        var tn = this.tones[k];
        h += '<button class="style-pill' + (tn.name === this.selectedTone ? ' active' : '') + '" data-tone="' + tn.name + '">' + tn.icon + ' ' + tn.name + '</button>';
      }
      h += '</div></div>';
      h += '</div>';

      // 视频专属参数（默认隐藏）
      h += '<div id="videoParams" style="display:' + (this.activeMode === 'video' ? 'block' : 'none') + ';">';
      h += '<div class="tool-params">';
      h += '<div class="tool-param-group" style="flex:1;min-width:250px;">';
      h += '<div class="tool-param-group__label">🎬 视频风格</div>';
      h += '<div class="style-pills" id="videoStylePills">';
      for (var v = 0; v < this.videoStyles.length; v++) {
        var vs = this.videoStyles[v];
        h += '<button class="style-pill' + (vs.name === this.selectedVideoStyle ? ' active' : '') + '" data-vstyle="' + vs.name + '">' + vs.icon + ' ' + vs.name + '</button>';
      }
      h += '</div></div>';

      h += '<div class="tool-param-group" style="flex:1;min-width:250px;">';
      h += '<div class="tool-param-group__label">🎵 BGM 风格</div>';
      h += '<div class="style-pills" id="bgmPills">';
      for (var b = 0; b < this.bgmOptions.length; b++) {
        var bgm = this.bgmOptions[b];
        h += '<button class="style-pill' + (bgm.name === this.selectedBGM ? ' active' : '') + '" data-bgm="' + bgm.name + '">' + bgm.icon + ' ' + bgm.name + '</button>';
      }
      h += '</div></div>';
      h += '</div>';

      h +=
        '<div class="tool-params">' +
          '<div class="tool-param-group">' +
            '<div class="tool-param-group__label">⏱️ 视频时长</div>' +
            '<select class="tool-select" id="videoDuration">' +
              '<option value="5">5 秒（快拍）</option>' +
              '<option value="10" selected>10 秒（短视频）</option>' +
              '<option value="15">15 秒（完整版）</option>' +
            '</select>' +
          '</div>' +
          '<div class="tool-param-group">' +
            '<div class="tool-param-group__label">📐 画幅</div>' +
            '<select class="tool-select" id="videoAspect">' +
              '<option value="9:16" selected>9:16（竖屏）</option>' +
              '<option value="16:9">16:9（横屏）</option>' +
              '<option value="1:1">1:1（方形）</option>' +
            '</select>' +
          '</div>' +
        '</div>';
      h += '</div>';

      // 亮点描述
      h +=
        '<div style="margin-top:12px;">' +
          '<div class="tool-input-area__label">✨ 探店亮点</div>' +
          '<textarea class="tool-textarea highlight-input" placeholder="描述这家店最吸引人的地方，如：隐藏在天台上的日系咖啡店，每一杯都有可爱拉花..." rows="2"></textarea>' +
        '</div>';

      // 上传图片（两种模式都需要）
      h +=
        '<div style="margin-top:12px;">' +
          '<div class="tool-input-area__label">🖼️ 上传实拍照片（最多6张）</div>' +
          '<div class="tool-upload" id="photoUpload">' +
            '<div class="tool-upload__icon">📸</div>' +
            '<div class="tool-upload__text">上传探店照片</div>' +
            '<div class="tool-upload__hint">支持多图，视频模式会生成卡点相册</div>' +
            '<div id="photoPreview" style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px;justify-content:center;"></div>' +
            '<input type="file" id="photoInput" accept="image/*" multiple>' +
          '</div>' +
        '</div>';

      h += '<button class="btn-generate" id="btnGenerate">' + (this.activeMode === 'video' ? '🎬 生成探店视频' : '🚀 生成探店笔记') + '</button>';
      h += '</div>';

      // ════ 进度区 ════
      h +=
        '<div class="tool-progress" id="progressArea">' +
          '<div class="spinner"></div>' +
          '<div class="tool-progress__text" id="progressMainText">AI 探店助手工作中...</div>' +
          '<div class="tool-progress__step" id="progressStep">准备中</div>' +
          '<div class="progress-steps" id="progressSteps">' +
            '<div class="progress-step active">① 分析内容</div>' +
            '<div class="progress-step">② AI 生成</div>' +
            '<div class="progress-step">③ 渲染输出</div>' +
            '<div class="progress-step">④ 完成</div>' +
          '</div>' +
        '</div>';

      // ════ 结果区 ════
      h +=
        '<div class="tool-result" id="resultArea">' +
          '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;">' +
            '<div class="tool-input-area__label" style="margin-bottom:0;" id="resultLabel">📰 探店笔记</div>' +
            '<div style="font-size:11px;color:var(--text-muted);" id="resultMeta"></div>' +
          '</div>' +

          // 图片网格（图文模式）
          '<div id="resultImageArea">' +
            '<div class="result-grid" id="resultImages" style="grid-template-columns:repeat(auto-fill,minmax(140px,1fr));"></div>' +
          '</div>' +

          // 视频播放器（视频模式）
          '<div id="resultVideoArea" style="display:none;">' +
            '<video id="resultVideo" controls autoplay playsinline ' +
              'style="width:100%;max-width:480px;border-radius:var(--radius-sm);background:#000;margin:0 auto;display:block;" ' +
              'poster="">' +
            '</video>' +
          '</div>' +

          // 标题
          '<div style="margin-top:14px;font-size:20px;font-weight:700;color:#fff;" id="resultTitle"></div>' +
          // 标签
          '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px;" id="resultTags"></div>' +
          // 正文（图文模式）
          '<div class="result-text" id="resultContent" style="margin-top:12px;"></div>' +
          // 视频字幕/文案（视频模式）
          '<div class="result-text" id="resultSubtitle" style="margin-top:12px;display:none;font-size:13px;"></div>' +

          // 操作按钮
          '<div class="result-actions">' +
            '<button class="btn-action btn-action--primary" id="btnSave">💾 保存</button>' +
            '<button class="btn-action btn-action--secondary" id="btnCopy">📋 复制</button>' +
            '<button class="btn-action btn-action--secondary" id="btnDownload">📥 下载</button>' +
            '<button class="btn-action btn-action--secondary" id="btnRetry">🔄 重试</button>' +
          '</div>' +
        '</div>';

      h += '<div id="historySection"></div>';
      return h;
    },

    _bindEvents: function(container) {
      var self = this;

      // ════ 模式切换 ════
      container.querySelector('#modeArticle').addEventListener('click', function() {
        self._switchMode(container, 'article');
      });
      container.querySelector('#modeVideo').addEventListener('click', function() {
        self._switchMode(container, 'video');
      });

      // 店铺类型
      var typeBtns = container.querySelectorAll('#shopTypePills .style-pill');
      for (var i = 0; i < typeBtns.length; i++) {
        typeBtns[i].addEventListener('click', function() {
          self._toggleIn(typeBtns, this);
          self.selectedShopType = this.getAttribute('data-type');
        });
      }

      // 平台
      var pfBtns = container.querySelectorAll('#platformPills .style-pill');
      for (var j = 0; j < pfBtns.length; j++) {
        pfBtns[j].addEventListener('click', function() {
          self._toggleIn(pfBtns, this);
          self.selectedPlatform = this.getAttribute('data-platform');
        });
      }

      // 语调
      var toneBtns = container.querySelectorAll('#tonePills .style-pill');
      for (var k = 0; k < toneBtns.length; k++) {
        toneBtns[k].addEventListener('click', function() {
          self._toggleIn(toneBtns, this);
          self.selectedTone = this.getAttribute('data-tone');
        });
      }

      // 视频风格
      var vsBtns = container.querySelectorAll('#videoStylePills .style-pill');
      for (var vi = 0; vi < vsBtns.length; vi++) {
        vsBtns[vi].addEventListener('click', function() {
          self._toggleIn(vsBtns, this);
          self.selectedVideoStyle = this.getAttribute('data-vstyle');
        });
      }

      // BGM
      var bgmBtns = container.querySelectorAll('#bgmPills .style-pill');
      for (var bi = 0; bi < bgmBtns.length; bi++) {
        bgmBtns[bi].addEventListener('click', function() {
          self._toggleIn(bgmBtns, this);
          self.selectedBGM = this.getAttribute('data-bgm');
        });
      }

      // 照片上传
      var uploadArea = container.querySelector('#photoUpload');
      var fileInput = container.querySelector('#photoInput');
      container._uploadedFiles = [];

      uploadArea.addEventListener('click', function(e) {
        if (e.target !== fileInput) fileInput.click();
      });
      uploadArea.addEventListener('dragover', function(e) { e.preventDefault(); this.classList.add('drag-over'); });
      uploadArea.addEventListener('dragleave', function() { this.classList.remove('drag-over'); });
      uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        this.classList.remove('drag-over');
        self._addFiles(container, e.dataTransfer.files);
      });
      fileInput.addEventListener('change', function() {
        self._addFiles(container, this.files);
      });

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
        var r = container._lastResult;
        if (!r) return;
        if (self.activeMode === 'video') {
          Storage.addProduct({ videoUrl: r.videoUrl, thumbnailUrl: r.thumbnailUrl, toolName: 'store-visit', type: 'video', title: r.title, duration: r.duration });
        } else {
          Storage.addProduct({ content: r.content, title: r.title, toolName: 'store-visit', type: 'article', shopName: r.shopName, images: r.images });
        }
        UI.toast('已保存到我的产品', 'success');
      });

      // 复制
      container.querySelector('#btnCopy').addEventListener('click', function() {
        var r = container._lastResult;
        if (!r) return;
        if (self.activeMode === 'video' && r.subtitle) {
          UI.copyText(r.title + '\n\n' + r.subtitle);
        } else if (r.content) {
          UI.copyText(r.title + '\n\n' + r.content);
        }
      });

      // 下载
      container.querySelector('#btnDownload').addEventListener('click', function() {
        var r = container._lastResult;
        if (r && r.videoUrl) {
          UI.downloadFile(r.videoUrl, '探店视频-' + Date.now() + '.mp4');
        }
      });
    },

    _switchMode: function(container, mode) {
      this.activeMode = mode;
      var articleBtn = container.querySelector('#modeArticle');
      var videoBtn = container.querySelector('#modeVideo');
      var videoParams = container.querySelector('#videoParams');
      var genBtn = container.querySelector('#btnGenerate');

      if (mode === 'article') {
        articleBtn.style.background = 'var(--accent-dim)';
        articleBtn.style.borderColor = 'var(--accent-strong)';
        articleBtn.style.color = 'var(--accent)';
        videoBtn.style.background = 'var(--bg-card)';
        videoBtn.style.borderColor = 'var(--border-card)';
        videoBtn.style.color = 'var(--text-secondary)';
        videoParams.style.display = 'none';
        genBtn.textContent = '🚀 生成探店笔记';
      } else {
        videoBtn.style.background = 'var(--accent-dim)';
        videoBtn.style.borderColor = 'var(--accent-strong)';
        videoBtn.style.color = 'var(--accent)';
        articleBtn.style.background = 'var(--bg-card)';
        articleBtn.style.borderColor = 'var(--border-card)';
        articleBtn.style.color = 'var(--text-secondary)';
        videoParams.style.display = 'block';
        genBtn.textContent = '🎬 生成探店视频';
      }

      UI.hideResult(container.querySelector('#resultArea'));
    },

    _toggleIn: function(all, target) {
      for (var i = 0; i < all.length; i++) all[i].classList.remove('active');
      target.classList.add('active');
    },

    _addFiles: function(container, files) {
      var previewDiv = container.querySelector('#photoPreview');
      container._uploadedFiles = container._uploadedFiles || [];
      for (var i = 0; i < files.length && container._uploadedFiles.length < 6; i++) {
        var file = files[i];
        if (!file.type.startsWith('image/')) continue;
        container._uploadedFiles.push(file);
        var reader = new FileReader();
        reader.onload = function(e) {
          var img = document.createElement('img');
          img.src = e.target.result;
          img.style.cssText = 'width:60px;height:60px;border-radius:6px;object-fit:cover;border:1px solid var(--border-card);';
          previewDiv.appendChild(img);
        };
        reader.readAsDataURL(file);
      }
    },

    _handleGenerate: function(container) {
      var shopName = container.querySelector('.shop-name-input').value.trim();
      if (!shopName) {
        UI.toast('请输入店铺名称', 'error');
        container.querySelector('.shop-name-input').focus();
        return;
      }

      var btn = container.querySelector('#btnGenerate');
      var progressArea = container.querySelector('#progressArea');
      var resultArea = container.querySelector('#resultArea');
      var isVideo = this.activeMode === 'video';

      UI.hideResult(resultArea);
      UI.showProgress(progressArea);
      btn.disabled = true;

      var self = this;
      var steps = container.querySelectorAll('#progressSteps .progress-step');
      var stepTexts = isVideo
        ? ['正在分析素材...', 'AI 生成视频帧...', '合成卡点+BGM...', '渲染输出中...']
        : ['分析店铺特点...', '匹配文案模板...', '配图排版中...', '即将完成...'];

      container.querySelector('#progressMainText').textContent = isVideo ? 'AI 正在生成探店视频...' : 'AI 探店助手工作中...';
      container.querySelector('#progressStep').textContent = stepTexts[0];

      var si = 0;
      var stepTimer = setInterval(function() {
        if (si > 0 && steps[si - 1]) { steps[si - 1].classList.remove('active'); steps[si - 1].classList.add('done'); }
        if (si < steps.length) { steps[si].classList.add('active'); container.querySelector('#progressStep').textContent = stepTexts[si]; }
        si++;
      }, isVideo ? 1000 : 800);

      // ★ API 预留点 — 根据模式调用不同 API
      var promise;
      if (isVideo) {
        promise = (window.API||window.MockAPI).imageToVideo({
          prompt: '探店视频：' + shopName + '，' + (container.querySelector('.highlight-input').value || '宝藏店铺'),
          style: self.selectedVideoStyle,
          duration: parseInt(container.querySelector('#videoDuration').value),
          onProgress: function(pct, statusText) {
            var stepEl = container.querySelector('#progressStep');
            if (stepEl) stepEl.textContent = statusText;
          }
        });
      } else {
        promise = (window.API||window.MockAPI).storeVisit({
          shopName: shopName,
          address: container.querySelector('.shop-address-input').value,
          shopType: self.selectedShopType,
          platform: self.selectedPlatform,
          tone: self.selectedTone,
          highlight: container.querySelector('.highlight-input').value
        });
      }

      promise.then(function(result) {
        clearInterval(stepTimer);
        for (var i = 0; i < steps.length; i++) { steps[i].classList.remove('active'); steps[i].classList.add('done'); }
        container.querySelector('#progressStep').textContent = '✅ 生成完成！';

        setTimeout(function() {
          UI.hideProgress(progressArea);
          self._showResult(container, result, isVideo);
          UI.showResult(resultArea);
          btn.disabled = false;
          btn.textContent = isVideo ? '🎬 生成探店视频' : '🚀 生成探店笔记';
        }, 400);
      }).catch(function(err) {
        clearInterval(stepTimer);
        UI.hideProgress(progressArea);
        btn.disabled = false;
        btn.textContent = isVideo ? '🎬 生成探店视频' : '🚀 生成探店笔记';
        UI.toast(err.message || '生成失败，请重试', 'error');
      });
    },

    _showResult: function(container, result, isVideo) {
      // 图片区
      container.querySelector('#resultImageArea').style.display = isVideo ? 'none' : 'block';
      container.querySelector('#resultVideoArea').style.display = isVideo ? 'block' : 'none';
      container.querySelector('#resultContent').style.display = isVideo ? 'none' : 'block';
      container.querySelector('#resultSubtitle').style.display = isVideo ? 'block' : 'none';
      container.querySelector('#resultLabel').textContent = isVideo ? '🎬 探店视频' : '📰 探店笔记';

      if (isVideo) {
        // 视频结果
        var video = container.querySelector('#resultVideo');
        video.src = result.videoUrl || '';
        video.poster = result.thumbnailUrl || '';
        video.load();
        container.querySelector('#btnDownload').style.display = 'inline-flex';

        var shopName = container.querySelector('.shop-name-input').value || '宝藏店铺';
        container.querySelector('#resultTitle').textContent = '🎬 探店 | ' + shopName;
        container.querySelector('#resultContent').innerHTML = '';
        container.querySelector('#resultSubtitle').innerHTML =
          '<b>🎵 BGM：</b>' + this.selectedBGM + ' ｜ <b>风格：</b>' + this.selectedVideoStyle + '<br>' +
          '<b>⏱️ 时长：</b>' + (result.duration || '30') + '秒 ｜ <b>📐 画幅：</b>竖屏 9:16<br>' +
          '<b>🎞️ 视频文案：</b><br>' +
          '📍 ' + shopName + ' — 真的太绝了！<br>' +
          '✨ 每一个角落都能出片，随手一拍就是大片质感<br>' +
          '💯 强烈推荐给所有小伙伴们！';
        container.querySelector('#resultMeta').textContent = '📹 ' + (result.duration || '30') + 's ｜ 💰 ¥' + (result.cost || '—') + ' 积分';
        container.querySelector('#resultImages').innerHTML = '';

        result.title = '🎬 探店 | ' + shopName;
        result.subtitle = container.querySelector('#resultSubtitle').innerText;
      } else {
        // 图文结果
        container.querySelector('#btnDownload').style.display = 'none';
        var imgHTML = '';
        if (result.images) {
          for (var i = 0; i < result.images.length; i++) {
            imgHTML += '<div class="result-item" onclick="UI.previewImage(\'' + result.images[i].url + '\')"><img src="' + result.images[i].url + '" alt="探店图" loading="lazy"></div>';
          }
        }
        container.querySelector('#resultImages').innerHTML = imgHTML;
        container.querySelector('#resultTitle').textContent = result.title || '探店笔记';

        var tags = [result.shopType, result.shopName, '探店', '宝藏店铺', '种草'];
        var tagsHTML = '';
        for (var j = 0; j < tags.length; j++) {
          if (tags[j]) tagsHTML += '<span class="card__tag">#' + tags[j] + '</span>';
        }
        container.querySelector('#resultTags').innerHTML = tagsHTML;
        container.querySelector('#resultContent').innerHTML = (result.content || '').replace(/\n/g, '<br>');
        container.querySelector('#resultSubtitle').innerHTML = '';
        container.querySelector('#resultMeta').textContent = '⭐ ' + (result.rating || '4.5') + ' ｜ 💰 ¥' + (result.avgPrice || '88') + '/人';
      }

      container._lastResult = result;
        Storage.addHistory('store-visit', { tool: 'store-visit', prompt: prompt || promptText || '', type: 'result', timestamp: new Date().toISOString() }); UI.renderHistory(container, 'store-visit');
    },

    destroy: function() {}
  };

  window.__modules__ = window.__modules__ || {};
  window.__modules__['store-visit'] = module;
})();
