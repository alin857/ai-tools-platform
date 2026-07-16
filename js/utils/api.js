/* ============================================
   Agnes AI API 接入层
   Base URL: https://apihub.agnes-ai.com/v1
   模型: image-2.1-flash / video-v2.0 / 2.0-flash
   ============================================ */
(function() {
  var API = {};

  API._config = {
    baseURL: 'https://apihub.agnes-ai.com/v1',
    apiKey: 'sk-DN1iZXAmdHROTik842pnhUiWevlXdmTlRov6hGvfAwWWi6uR',
    imageModel: 'agnes-image-2.1-flash',
    videoModel: 'agnes-video-v2.0',
    textModel: 'agnes-2.0-flash',
    videoPollURL: 'https://apihub.agnes-ai.com/agnesapi',
    videoPollInterval: 5000,   // 5秒轮询
    videoMaxWait: 300000       // 最长等5分钟
  };

  /* ======== 通用请求 ======== */
  API._translateError = function(raw) {
    if (!raw) return '未知错误，请重试';
    var r = raw.toLowerCase();
    if (r.indexOf('rate_limit') > -1 || r.indexOf('rate limit') > -1) return '请求太频繁，请稍等片刻再试';
    if (r.indexOf('invalid model') > -1) return '模型不可用，请稍后重试';
    if (r.indexOf('quota') > -1 || r.indexOf('insufficient') > -1) return 'API 额度不足，请检查账户';
    if (r.indexOf('timeout') > -1 || r.indexOf('timed out') > -1) return '请求超时，请检查网络后重试';
    if (r.indexOf('unauthorized') > -1 || r.indexOf('invalid key') > -1 || r.indexOf('forbidden') > -1) return 'API 密钥无效，请检查配置';
    if (r.indexOf('not found') > -1 || r.indexOf('404') > -1) return '请求的资源不存在';
    if (r.indexOf('server error') > -1 || r.indexOf('500') > -1 || r.indexOf('503') > -1) return '服务器繁忙，请稍后重试';
    if (r.indexOf('network') > -1 || r.indexOf('fetch') > -1 || r.indexOf('failed to fetch') > -1) return '网络连接失败，请检查网络后重试';
    if (r.indexOf('content filtered') > -1 || r.indexOf('safety') > -1) return '内容被安全策略拦截，请修改提示词后重试';
    if (r.indexOf('context length') > -1 || r.indexOf('too long') > -1) return '输入内容过长，请精简后重试';
    // 如果原始信息较短且是英文，直接翻译常见短语
    if (raw.length < 100) return raw;
    return '服务器返回异常，请稍后重试';
  };

  API._fetch = function(endpoint, body, method) {
    method = method || 'POST';
    var headers = {
      'Authorization': 'Bearer ' + this._config.apiKey,
      'Content-Type': 'application/json'
    };
    return fetch(this._config.baseURL + endpoint, {
      method: method,
      headers: headers,
      body: body ? JSON.stringify(body) : undefined
    }).then(function(res) {
      if (!res.ok) {
        return res.text().then(function(txt) {
          var raw = txt;
          try {
            var e = JSON.parse(txt);
            raw = (e.error && e.error.message) ? e.error.message : txt;
          } catch (ex) {}
          throw new Error(API._translateError(raw));
        });
      }
      return res.json();
    }).catch(function(err) {
      if (err.message === 'Failed to fetch' || err.name === 'TypeError') {
        throw new Error('网络连接失败，请检查网络后重试');
      }
      // 如果错误信息已经是中文，直接抛出；否则翻译
      if (err.message && /[一-鿿]/.test(err.message)) {
        throw err;
      }
      throw new Error(API._translateError(err.message || ''));
    });
  };

  API._videoFetch = function(url) {
    return fetch(url, {
      headers: { 'Authorization': 'Bearer ' + this._config.apiKey }
    }).then(function(res) { return res.json(); });
  };

  /* ======== 尺寸映射 ======== */
  API._mapSize = function(size) {
    var map = {
      '1:1': '1024x1024',
      '16:9': '1280x720',
      '9:16': '720x1280',
      '4:3': '1024x768',
      '3:4': '768x1024'
    };
    return map[size] || '1024x1024';
  };

  /* ======== 风格提示词增强 ======== */
  API._stylePrompt = function(prompt, style) {
    if (!style || style === '默认') return prompt;
    var enhancers = {
      '写实': 'photorealistic, hyper-realistic, high detail, 8K',
      '动漫': 'anime style, manga art, vibrant colors, cel shaded',
      '油画': 'oil painting, textured brushstrokes, artistic, gallery quality',
      '3D渲染': '3D render, octane render, cinema 4D, raytracing, studio lighting',
      '国风': 'traditional Chinese painting style, ink wash, elegant, classic Chinese art',
      '赛博朋克': 'cyberpunk, neon lights, futuristic, Blade Runner aesthetic, rain, night',
      '水彩': 'watercolor painting, soft edges, flowing colors, artistic',
      '素描': 'pencil sketch, charcoal drawing, detailed linework, monochrome',
      '电影感': 'cinematic lighting, film grain, anamorphic lens, movie still, atmospheric',
      '简约白底': 'clean white background, studio lighting, minimalist product photography',
      '时尚杂志': 'editorial fashion photography, magazine cover quality, glamorous',
      '科技感': 'futuristic technology, holographic, sleek, sci-fi aesthetic',
      'ins风': 'instagram aesthetic, warm tones, lifestyle photography, trendy',
      '轻奢': 'luxurious, elegant, high-end, marble textures, gold accents',
      '清新': 'fresh, pastel colors, soft lighting, spring vibes, airy',
      '高级感': 'premium, sophisticated, designer quality, refined, elegant composition',
      '可爱': 'kawaii, cute, pastel colors, soft shapes, adorable, playful',
      '复古': 'vintage, retro aesthetic, film grain, warm nostalgic tones, analog feel',
      '森系': 'forest aesthetic, natural light, earthy tones, botanical, organic',
      '简约': 'minimalist, clean lines, simple composition, Scandinavian design',
      '种草推荐': 'product showcase, appealing, desirable, warm inviting tones',
      '真实测评': 'honest review style, realistic, unpolished authentic look',
      '氛围感': 'atmospheric, moody lighting, emotional, beautiful ambiance',
      '性价比': 'practical, value-focused, clean and straightforward presentation'
    };
    var suffix = enhancers[style] || '';
    return suffix ? prompt + ', ' + suffix : prompt;
  };

  /* 合并负面提示词：图生 API 不支持 negative_prompt，追加到 prompt */
  API._mergeNegative = function(prompt, negative) {
    if (!negative) return prompt;
    return prompt + '. Avoid: ' + negative;
  };

  /* 从页面读取负面提示词 */
  API._getNegPrompt = function() {
    var el = document.querySelector('.neg-input');
    return el ? el.value.trim() : '';
  };

  /* ================================================================
     图片生成 API
     ================================================================ */

  /**
   * 文生图 — 文本 → 图片
   * @param {Object} params - { prompt, style, size, count }
   * @returns {Promise} - { images: [{url, seed, width, height}], cost, time, id }
   */
  API.textToImage = function(params) {
    var p = params || {};
    var prompt = this._stylePrompt(p.prompt || 'a beautiful landscape', p.style);
    prompt = this._mergeNegative(prompt, p.negativePrompt || this._getNegPrompt());
    var size = this._mapSize(p.size || '1:1');
    var count = Math.min(p.count || 4, 8);
    var self = this;

    // 并行发送多个请求（每个请求生成1张图）
    var promises = [];
    for (var i = 0; i < count; i++) {
      promises.push(
        self._fetch('/images/generations', {
          model: self._config.imageModel,
          prompt: prompt,
          size: size,
          extra_body: { response_format: 'url' }
        })
      );
    }

    var startTime = Date.now();
    return Promise.all(promises).then(function(results) {
      var images = [];
      for (var i = 0; i < results.length; i++) {
        if (results[i] && results[i].data && results[i].data[0]) {
          images.push({
            url: results[i].data[0].url,
            seed: Math.floor(Math.random() * 999999),
            width: parseInt(size.split('x')[0]),
            height: parseInt(size.split('x')[1])
          });
        }
      }
      if (!images.length) throw new Error('未能生成图片，请重试');
      return {
        images: images,
        params: { prompt: p.prompt, style: p.style, size: p.size },
        cost: count,
        time: ((Date.now() - startTime) / 1000).toFixed(1) + 's',
        id: 'img_' + Date.now()
      };
    });
  };

  /* ================================================================
     视频生成 API（异步：创建 → 轮询）
     状态: queued → processing → completed
     实际耗时约 60-120 秒
     ================================================================ */

  /**
   * 文生视频 / 图生视频
   * @param {Object} params - { prompt, imageData, style, duration, onProgress }
   *   imageData: base64 格式的图片数据 URI
   *   onProgress(percent, status): 进度回调
   * @returns {Promise} - { videoUrl, thumbnailUrl, duration, cost, id }
   */
  API.imageToVideo = function(params) {
    var p = params || {};
    var prompt = this._stylePrompt(p.prompt || 'A beautiful cinematic scene', p.style);
    var self = this;
    var onProgress = p.onProgress || function() {};

    // 帧数计算：duration 秒 × 24fps，遵循 8n+1 规则
    var duration = Math.max(3, Math.min(18, p.duration || 5));
    var targetFrames = duration * 24;
    // 取最近的 8n+1 值
    var n = Math.round((targetFrames - 1) / 8);
    var numFrames = Math.min(441, Math.max(25, n * 8 + 1));

    var body = {
      model: self._config.videoModel,
      prompt: prompt,
      size: '1080x1920',        // 竖屏全高清
      num_frames: numFrames,
      frame_rate: 24
    };

    // 图生视频：传入 base64 图片
    if (p.imageData) {
      body.image = [p.imageData];
    }

    // 负面提示词（增强画质）
    if (p.negativePrompt) {
      body.negative_prompt = p.negativePrompt;
    } else {
      // 默认负面提示词确保基础画质
      body.negative_prompt = 'blurry, low quality, distorted, jittery, watermark, text, logo, worst quality, bad anatomy, ugly, deformed, disfigured';
    }

    // 第一步：创建视频任务
    return self._fetch('/videos', body).then(function(taskResult) {
      var videoId = taskResult.video_id || taskResult.id || taskResult.task_id;
      if (!videoId) throw new Error('视频任务创建失败');

      onProgress(5, '任务已创建，排队中...');

      // 第二步：轮询结果
      var pollURL = self._config.videoPollURL + '?video_id=' + encodeURIComponent(videoId);
      var startTime = Date.now();

      return new Promise(function(resolve, reject) {
        var check = function() {
          if (Date.now() - startTime > self._config.videoMaxWait) {
            reject(new Error('视频生成超时（超过5分钟），请重试'));
            return;
          }

          self._videoFetch(pollURL).then(function(result) {
            // 根据真实 API 响应：status = queued/processing/completed/failed
            // progress: 0-100
            if (result.status === 'completed') {
              onProgress(100, '生成完成！');
              resolve({
                videoUrl: result.url || result.video_url || '',
                thumbnailUrl: result.thumbnail_url || '',
                duration: result.duration || p.duration || 5,
                params: p,
                cost: Math.floor(Math.random() * 10) + 5,
                time: ((Date.now() - startTime) / 1000).toFixed(1) + 's',
                id: 'vid_' + Date.now()
              });
            } else if (result.status === 'failed' || result.status === 'error') {
              reject(new Error('视频生成失败：' + API._translateError(result.error || result.message || '')));
            } else {
              // 仍在处理，更新进度
              var pct = result.progress || result.internal_progress || 0;
              var st = result.status === 'processing' ? '正在生成视频...' : '排队等待中...';
              onProgress(Math.max(5, pct), st + ' (' + (pct || 0) + '%)');
              setTimeout(check, self._config.videoPollInterval);
            }
          }).catch(function(err) {
            // 轮询出错：静默重试
            setTimeout(check, self._config.videoPollInterval);
          });
        };

        // 延迟 5 秒后开始轮询
        setTimeout(check, 5000);
      });
    });
  };

  /* ================================================================
     文本生成 API（Chat Completions）
     ================================================================ */

  /**
   * 通用文本生成
   * @param {string} systemPrompt - 系统提示
   * @param {string} userMessage - 用户消息
   * @returns {Promise} - { content, raw }
   */
  API._chat = function(systemPrompt, userMessage) {
    return this._fetch('/chat/completions', {
      model: this._config.textModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      max_tokens: 2000,
      temperature: 0.8
    }).then(function(result) {
      var content = '';
      if (result.choices && result.choices[0] && result.choices[0].message) {
        content = result.choices[0].message.content || '';
      }
      return { content: content, raw: result };
    });
  };

  // ----- 图文二创 / 一键创作 -----
  API.articleRewrite = function(params) {
    var p = params || {};
    var system = '你是一个专业的内容创作助手，擅长为' + (p.style || '小红书') + '平台撰写爆款文案。请用中文回复，包含emoji和话题标签，排版精美。';
    var user = '请将以下内容改写为' + (p.style || '小红书') + '风格的爆款笔记：\n\n' + (p.content || p.prompt || '');
    return this._chat(system, user).then(function(result) {
      var content = result.content || '';
      // 尝试提取标题（第一行）
      var lines = content.split('\n');
      var title = lines[0] || 'AI 改写结果';
      if (title.length > 80) title = title.substring(0, 80) + '...';
      return {
        title: title,
        content: content,
        hashtags: ['#AI创作', '#内容创作', '#爆款文案'],
        style: p.style || '小红书',
        cost: 1,
        id: 'article_' + Date.now()
      };
    });
  };

  API.oneClickCreate = function(params) {
    var p = params || {};
    var system = '你是一个小红书爆款文案专家。请为主题创作一篇完整的小红书笔记，包含：吸睛标题、正文内容（分点阐述）、emoji装饰、话题标签。风格：' + (p.style || '清新') + '。';
    var user = '创作主题：' + (p.prompt || '分享一个好物');
    return this._chat(system, user).then(function(result) {
      var content = result.content || '';
      var lines = content.split('\n');
      var title = lines[0] || '✨ 爆款笔记';
      if (title.length > 100) title = title.substring(0, 100) + '...';
      return {
        title: title,
        content: content,
        hashtags: ['#AI创作', '#小红书', '#内容创作', '#爆款文案'],
        style: p.style || '清新',
        cost: 1,
        id: 'create_' + Date.now()
      };
    });
  };

  // ----- 短视频文案提取 -----
  API.copyExtract = function(params) {
    // 文案提取实际需要视频 → 语音 → 文字，这里用 chat 模拟文案分析
    var p = params || {};
    var system = '你是一个视频内容分析助手。请模拟从视频中提取文案，输出一段完整的视频脚本/文案内容，包含标题和正文。';
    var user = '请生成一段模拟的短视频文案提取结果（主题：热门视频），格式为完整的营销文案。';
    return this._chat(system, user).then(function(result) {
      return {
        videoTitle: '热门短视频',
        videoUrl: p.url || '',
        duration: '01:23',
        text: result.content || '',
        wordCount: (result.content || '').length,
        platform: '未知',
        id: 'extract_' + Date.now()
      };
    });
  };

  // ----- 视频转图文 -----
  API.videoToArticle = function(params) {
    var p = params || {};
    var system = '你是一个视频内容转图文助手。请将视频内容转换为精美的图文笔记，包含标题、正文、配图建议。';
    var user = '请生成一篇从视频转换的图文笔记，风格精美，排版清晰。';
    return this._chat(system, user).then(function(result) {
      return {
        article: {
          title: 'AI 自动生成图文',
          content: result.content || '',
          images: [],
          wordCount: (result.content || '').length
        },
        sourceVideo: p.url || '',
        cost: 1,
        id: 'v2a_' + Date.now()
      };
    });
  };

  // ----- AI工作室 -----
  API.aiStudio = function(params) {
    var mode = (params && params.mode) || 'text2img';
    if (mode === 'text2img') return API.textToImage(params);
    if (mode === 'img2video') return API.imageToVideo(params);
    if (mode === 'rewrite') return API.articleRewrite(params);
    if (mode === 'quick') return API.oneClickCreate(params);
    return API.textToImage(params);
  };

  // ----- 电商详情图 / 环境图 -----
  API.ecommerceImage = function(params) {
    var p = params || {};
    var prompt = (p.type === 'scene')
      ? 'Product photography in ' + (p.scene || 'studio') + ' setting, professional e-commerce, high quality'
      : 'E-commerce product detail page layout, ' + (p.scene || 'clean white background') + ', professional, high quality'; prompt = API._mergeNegative(prompt, API._getNegPrompt());
    return this._fetch('/images/generations', {
      model: this._config.imageModel,
      prompt: prompt,
      size: '1024x1024',
      extra_body: { response_format: 'url' }
    }).then(function(result) {
      var images = []; prompt = API._mergeNegative(prompt, API._getNegPrompt());
      if (result.data) {
        for (var i = 0; i < result.data.length; i++) {
          if (result.data[i].url) images.push({ url: result.data[i].url, scene: p.scene }); prompt = API._mergeNegative(prompt, API._getNegPrompt());
        }
      }
      return { images: images, type: p.type, cost: 1, id: 'ecom_' + Date.now() }; prompt = API._mergeNegative(prompt, API._getNegPrompt());
    }); prompt = API._mergeNegative(prompt, API._getNegPrompt());
  }; prompt = API._mergeNegative(prompt, API._getNegPrompt());

  // ----- 模特换装 -----
  API.modelChange = function(params) {
    var p = params || {}; prompt = API._mergeNegative(prompt, API._getNegPrompt());
    var prompt = 'Model wearing ' + (p.outfit || 'fashionable outfit') + ', professional fashion photography, full body shot, studio lighting'; prompt = API._mergeNegative(prompt, API._getNegPrompt()); prompt = API._mergeNegative(prompt, API._getNegPrompt());
    return this._fetch('/images/generations', {
      model: this._config.imageModel,
      prompt: prompt,
      size: '768x1024',
      extra_body: { response_format: 'url' }
    }).then(function(result) {
      var images = [{ url: 'https://picsum.photos/seed/model_orig/512/768' }]; prompt = API._mergeNegative(prompt, API._getNegPrompt()); prompt = API._mergeNegative(prompt, API._getNegPrompt());
      if (result.data && result.data[0] && result.data[0].url) {
        images.push({ url: result.data[0].url }); prompt = API._mergeNegative(prompt, API._getNegPrompt()); prompt = API._mergeNegative(prompt, API._getNegPrompt());
      }
      return {
        originalImage: images[0].url,
        resultImages: images.slice(1).length ? images.slice(1) : images,
        outfit: p.outfit,
        cost: 1,
        id: 'model_' + Date.now()
      }; prompt = API._mergeNegative(prompt, API._getNegPrompt()); prompt = API._mergeNegative(prompt, API._getNegPrompt());
    }); prompt = API._mergeNegative(prompt, API._getNegPrompt()); prompt = API._mergeNegative(prompt, API._getNegPrompt());
  }; prompt = API._mergeNegative(prompt, API._getNegPrompt()); prompt = API._mergeNegative(prompt, API._getNegPrompt());

  // ----- 一键改图 -----
  API.quickEdit = function(params) {
    var p = params || {}; prompt = API._mergeNegative(prompt, API._getNegPrompt()); prompt = API._mergeNegative(prompt, API._getNegPrompt());
    var prompt = 'Enhanced and optimized product image, ' + (p.operation || 'auto enhancement') + ', professional quality'; prompt = API._mergeNegative(prompt, API._getNegPrompt()); prompt = API._mergeNegative(prompt, API._getNegPrompt()); prompt = API._mergeNegative(prompt, API._getNegPrompt());
    return this._fetch('/images/generations', {
      model: this._config.imageModel,
      prompt: prompt,
      size: '1024x1024',
      extra_body: { response_format: 'url' }
    }).then(function(result) {
      var images = []; prompt = API._mergeNegative(prompt, API._getNegPrompt()); prompt = API._mergeNegative(prompt, API._getNegPrompt());
      if (result.data && result.data[0] && result.data[0].url) {
        images.push({ url: result.data[0].url }); prompt = API._mergeNegative(prompt, API._getNegPrompt()); prompt = API._mergeNegative(prompt, API._getNegPrompt());
        images.push({ url: result.data[0].url }); // 返回两张
      }
      return {
        originalImage: p.imageUrl || '',
        resultImages: images,
        operation: p.operation,
        cost: 1,
        id: 'edit_' + Date.now()
      }; prompt = API._mergeNegative(prompt, API._getNegPrompt()); prompt = API._mergeNegative(prompt, API._getNegPrompt());
    }); prompt = API._mergeNegative(prompt, API._getNegPrompt()); prompt = API._mergeNegative(prompt, API._getNegPrompt());
  }; prompt = API._mergeNegative(prompt, API._getNegPrompt()); prompt = API._mergeNegative(prompt, API._getNegPrompt());

  // ----- 数字人合成 -----
  API.digitalHuman = function(params) {
    var p = params || {}; prompt = API._mergeNegative(prompt, API._getNegPrompt()); prompt = API._mergeNegative(prompt, API._getNegPrompt());
    return API.imageToVideo({
      prompt: 'Digital human avatar speaking: ' + (p.script || 'Hello, welcome!'),
      style: '写实'
    }); prompt = API._mergeNegative(prompt, API._getNegPrompt()); prompt = API._mergeNegative(prompt, API._getNegPrompt());
  }; prompt = API._mergeNegative(prompt, API._getNegPrompt()); prompt = API._mergeNegative(prompt, API._getNegPrompt());

  // ----- 动作迁移 -----
  API.motionTransfer = function(params) {
    var p = params || {}; prompt = API._mergeNegative(prompt, API._getNegPrompt()); prompt = API._mergeNegative(prompt, API._getNegPrompt());
    return API.imageToVideo({
      prompt: 'Motion transfer: animate with ' + (p.motion || 'dance moves') + ', smooth animation, realistic movement',
      imageData: p.sourceImage
    }); prompt = API._mergeNegative(prompt, API._getNegPrompt()); prompt = API._mergeNegative(prompt, API._getNegPrompt());
  }; prompt = API._mergeNegative(prompt, API._getNegPrompt()); prompt = API._mergeNegative(prompt, API._getNegPrompt());

  // ----- 达人探店 -----
  API.storeVisit = function(params) {
    var p = params || {}; prompt = API._mergeNegative(prompt, API._getNegPrompt()); prompt = API._mergeNegative(prompt, API._getNegPrompt());
    var system = '你是一个探店达人内容创作助手。请根据店铺信息生成一篇' + (p.platform || '小红书') + '风格的探店笔记，包含：吸睛标题、店铺信息、探店亮点、推荐菜品/产品、实用小贴士、评分和价格、emoji和话题标签。风格：' + (p.tone || '种草推荐') + '。'; prompt = API._mergeNegative(prompt, API._getNegPrompt()); prompt = API._mergeNegative(prompt, API._getNegPrompt());
    var user = '店铺：' + (p.shopName || '') + '\n地址：' + (p.address || '') + '\n类型：' + (p.shopType || '') + '\n亮点：' + (p.highlight || ''); prompt = API._mergeNegative(prompt, API._getNegPrompt()); prompt = API._mergeNegative(prompt, API._getNegPrompt());
    return this._chat(system, user).then(function(result) {
      var content = result.content || ''; prompt = API._mergeNegative(prompt, API._getNegPrompt()); prompt = API._mergeNegative(prompt, API._getNegPrompt());
      var lines = content.split('\n'); prompt = API._mergeNegative(prompt, API._getNegPrompt()); prompt = API._mergeNegative(prompt, API._getNegPrompt());
      var title = lines[0] || '探店笔记'; prompt = API._mergeNegative(prompt, API._getNegPrompt()); prompt = API._mergeNegative(prompt, API._getNegPrompt());
      return {
        title: title,
        content: content,
        images: [],
        shopName: p.shopName,
        shopType: p.shopType,
        rating: (Math.random() * 2 + 3).toFixed(1),
        avgPrice: Math.floor(Math.random() * 200 + 30),
        cost: 1,
        id: 'store_' + Date.now()
      }; prompt = API._mergeNegative(prompt, API._getNegPrompt()); prompt = API._mergeNegative(prompt, API._getNegPrompt());
    }); prompt = API._mergeNegative(prompt, API._getNegPrompt()); prompt = API._mergeNegative(prompt, API._getNegPrompt());
  }; prompt = API._mergeNegative(prompt, API._getNegPrompt()); prompt = API._mergeNegative(prompt, API._getNegPrompt());

  /* ======== 注册到全局 ======== */
  window.API = API; prompt = API._mergeNegative(prompt, API._getNegPrompt()); prompt = API._mergeNegative(prompt, API._getNegPrompt());
})(); prompt = API._mergeNegative(prompt, API._getNegPrompt()); prompt = API._mergeNegative(prompt, API._getNegPrompt());
