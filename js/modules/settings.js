/* ============================================
   设置 — API 配置管理
   ============================================ */
(function() {
  var module = {
    name: 'settings',
    title: '设置',

    fields: [
      { key: 'apiKey',     label: '🔑 API 密钥',       type: 'password', placeholder: 'sk-...' },
      { key: 'baseURL',    label: '🌐 API 地址',        type: 'text',     placeholder: 'https://api.xxx.com/v1' },
      { key: 'imageModel', label: '🎨 图片模型',        type: 'text',     placeholder: 'agnes-image-2.1-flash' },
      { key: 'videoModel', label: '🎬 视频模型',        type: 'text',     placeholder: 'agnes-video-v2.0' },
      { key: 'textModel',  label: '📝 文本模型',        type: 'text',     placeholder: 'agnes-1.5-flash' },
      { key: 'videoPollURL', label: '📡 视频轮询地址',  type: 'text',     placeholder: 'https://apihub.agnes-ai.com/agnesapi' }
    ],

    render: function(container) {
      container.innerHTML = this._buildHTML();
      this._bindEvents(container);
    },

    _buildHTML: function() {
      var cfg = API._config;
      var h = '';

      h += '<div class="tool-header"><button class="tool-header__back" onclick="Router.navigate(\'#/\')">←</button><div class="tool-header__title">⚙️ API 配置</div></div>';

      h += '<div class="tool-input-area">';
      h += '<div style="font-size:12px;color:#999;margin-bottom:14px;padding:10px;background:rgba(77,166,255,0.05);border-radius:8px;">💡 修改后自动保存，所有模块将使用新配置调用 AI</div>';

      for (var i = 0; i < this.fields.length; i++) {
        var f = this.fields[i];
        var val = cfg[f.key] || '';
        h += '<div style="margin-bottom:14px;">';
        h += '<div class="tool-input-area__label">' + f.label + '</div>';
        if (f.key === 'apiKey') {
          h += '<div style="display:flex;gap:8px;">';
          h += '<input type="' + f.type + '" class="cfg-input" data-key="' + f.key + '" value="' + val.replace(/"/g,'&quot;') + '" placeholder="' + f.placeholder + '" style="flex:1;padding:10px 14px;border-radius:10px;background:rgba(255,255,255,0.03);border:1px solid var(--border);color:#e0e0e0;font-size:13px;">';
          h += '<button class="btn-action btn-action--secondary" id="btnToggleKey" style="white-space:nowrap;">👁️</button>';
          h += '</div>';
        } else {
          h += '<input type="' + f.type + '" class="cfg-input" data-key="' + f.key + '" value="' + val.replace(/"/g,'&quot;') + '" placeholder="' + f.placeholder + '" style="width:100%;padding:10px 14px;border-radius:10px;background:rgba(255,255,255,0.03);border:1px solid var(--border);color:#e0e0e0;font-size:13px;">';
        }
        h += '</div>';
      }

      // 按钮组
      h += '<div style="display:flex;gap:10px;margin-top:16px;">';
      h += '<button class="btn-generate" id="btnSave" style="flex:1;">💾 保存配置</button>';
      h += '<button class="btn-action btn-action--secondary" id="btnReset" style="flex:1;">🔄 恢复默认</button>';
      h += '</div>';

      h += '<button class="btn-action btn-action--secondary" id="btnTest" style="width:100%;margin-top:10px;">🧪 测试连接</button>';

      h += '</div>';

      // 测试结果区
      h += '<div id="testResult" style="margin-top:14px;"></div>';

      // 当前状态
      h += '<div style="margin-top:20px;padding:12px;background:#1a1a1e;border-radius:10px;border:1px solid var(--border);">';
      h += '<div style="font-size:12px;color:#999;margin-bottom:6px;">📊 当前配置状态</div>';
      h += '<div style="font-size:11px;color:#666;" id="configStatus"></div>';
      h += '</div>';

      h += '<div id="historySection"></div>';

      return h;
    },

    _bindEvents: function(container) {
      var self = this;

      // 显示状态
      this._showStatus(container);

      // 密钥显隐切换
      var keyInput = container.querySelector('[data-key="apiKey"]');
      container.querySelector('#btnToggleKey').addEventListener('click', function() {
        if (keyInput.type === 'password') {
          keyInput.type = 'text';
          this.textContent = '🙈';
        } else {
          keyInput.type = 'password';
          this.textContent = '👁️';
        }
      });

      // 保存
      container.querySelector('#btnSave').addEventListener('click', function() {
        var config = {};
        var inputs = container.querySelectorAll('.cfg-input');
        for (var i = 0; i < inputs.length; i++) {
          config[inputs[i].getAttribute('data-key')] = inputs[i].value.trim();
        }
        if (!config.apiKey) { UI.toast('API 密钥不能为空', 'error'); return; }
        API.saveConfig(config);
        UI.toast('配置已保存 ✅', 'success');
        self._showStatus(container);
      });

      // 恢复默认
      container.querySelector('#btnReset').addEventListener('click', function() {
        localStorage.removeItem('aigp_api_config');
        API._loadConfig();
        // 重新渲染
        self.render(container);
        UI.toast('已恢复默认配置', 'success');
      });

      // 测试连接
      container.querySelector('#btnTest').addEventListener('click', function() {
        self._testConnection(container);
      });
    },

    _showStatus: function(container) {
      var cfg = API._config;
      var saved = localStorage.getItem('aigp_api_config');
      var s = '';
      s += 'API: ' + cfg.baseURL + '<br>';
      s += '密钥: ' + (cfg.apiKey ? cfg.apiKey.substring(0, 12) + '...' : '未设置') + '<br>';
      s += '图片模型: ' + cfg.imageModel + '<br>';
      s += '视频模型: ' + cfg.videoModel + '<br>';
      s += '文本模型: ' + cfg.textModel + '<br>';
      s += '配置来源: ' + (saved ? '自定义' : '默认');
      container.querySelector('#configStatus').innerHTML = s;
    },

    _testConnection: function(container) {
      var resultDiv = container.querySelector('#testResult');
      resultDiv.innerHTML = '<div style="padding:12px;background:#1a1a1e;border-radius:10px;text-align:center;"><div class="spinner" style="margin:0 auto;"></div><div style="font-size:12px;color:#999;margin-top:8px;">测试中...</div></div>';

      // 读取当前页面输入的值
      var testURL = container.querySelector('[data-key="baseURL"]').value.trim() || API._config.baseURL;
      var testKey = container.querySelector('[data-key="apiKey"]').value.trim() || API._config.apiKey;

      fetch(testURL + '/models', {
        headers: { 'Authorization': 'Bearer ' + testKey }
      }).then(function(res) {
        return res.json().then(function(data) {
          if (data && data.data) {
            var models = data.data.map(function(m) { return m.id; }).join(', ');
            resultDiv.innerHTML =
              '<div style="padding:14px;background:rgba(0,200,150,0.08);border-radius:10px;border:1px solid rgba(0,200,150,0.2);">' +
                '<div style="font-size:14px;color:#5eeeca;font-weight:600;">✅ 连接成功</div>' +
                '<div style="font-size:11px;color:#999;margin-top:4px;">可用模型：' + models + '</div>' +
              '</div>';
          } else {
            throw new Error('Invalid response');
          }
        });
      }).catch(function(err) {
        resultDiv.innerHTML =
          '<div style="padding:14px;background:rgba(255,107,107,0.08);border-radius:10px;border:1px solid rgba(255,107,107,0.2);">' +
            '<div style="font-size:14px;color:#ff6b6b;font-weight:600;">❌ 连接失败</div>' +
            '<div style="font-size:11px;color:#999;margin-top:4px;">请检查 API 地址和密钥是否正确</div>' +
          '</div>';
      });
    },

    destroy: function() {}
  };

  window.__modules__ = window.__modules__ || {};
  window.__modules__['settings'] = module;
})();
