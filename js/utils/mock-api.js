/* ============================================
   MockAPI — 模拟后端 API 服务
   所有方法签名与真实 API 保持一致，方便切换
   每个 API 调用位置标注 ★ API 预留点
   ============================================ */
(function() {
  var MockAPI = {};

  /* ======== 配置 ======== */
  MockAPI._config = {
    delay: { min: 1500, max: 4000 },
    errorRate: 0.05  // 5% 概率模拟失败
  };

  // 模拟网络延迟
  MockAPI._latency = function() {
    var ms = Math.floor(Math.random() * (this._config.delay.max - this._config.delay.min)) + this._config.delay.min;
    return new Promise(function(resolve) {
      setTimeout(resolve, ms);
    });
  };

  // 随机失败
  MockAPI._maybeError = function() {
    if (Math.random() < this._config.errorRate) {
      throw new Error('模拟网络请求失败，请重试');
    }
  };

  // 随机图片占位
  MockAPI._placeholderImg = function(seed, w, h, text) {
    w = w || 512;
    h = h || 512;
    text = text || seed;
    return 'https://picsum.photos/seed/' + encodeURIComponent(seed || Date.now()) + '/' + w + '/' + h;
  };

  // 生成多张占位图
  MockAPI._imageSet = function(count, seed) {
    var images = [];
    for (var i = 0; i < count; i++) {
      images.push({
        url: 'https://picsum.photos/seed/' + encodeURIComponent(seed + '_' + i + '_' + Date.now()) + '/512/512',
        seed: Math.floor(Math.random() * 999999),
        width: 512,
        height: 512
      });
    }
    return images;
  };

  // 预设返回文案（短视频文案提取等用）
  MockAPI._sampleTexts = [
    '今天给大家分享一个超实用的 AI 绘画技巧！\n\n很多人用 Stable Diffusion 出图总觉得不够精致，其实问题往往出在提示词上。一个好的提示词应该包含三个要素：\n\n1. 主体描述（谁/什么在画面中）\n2. 风格描述（画风、光线、色调）\n3. 技术参数（分辨率、渲染器）\n\n举个例子，不要只写"一个女孩"，试试写"一个穿汉服的女孩站在樱花树下，柔和的自然光，宫崎骏动画风格，高细节，4K"。这样出来的效果会好 10 倍！\n\n#AI绘画 #提示词技巧 #AIGC教程',
    '最近试用了几款 AI 视频生成工具，给大家做个横评：\n\n🎬 Runway Gen-3：综合实力最强，画面质量高，但价格偏贵\n🎬 Pika 2.0：操作简单，适合新手，唇形同步功能很强\n🎬 可灵 AI：国产之光，支持中文提示词，对亚洲面孔识别很好\n🎬 Sora：画质天花板，但等待时间太长\n\n个人建议：日常创作用 Runway 或可灵，追求极致画质等 Sora 全面开放。\n\n你们最喜欢用哪款？评论区聊聊 👇\n\n#AI视频生成 #AIGC工具 #创作必备',
    '今天是给新手朋友的 ComfyUI 入门教程！\n\n很多人觉得 ComfyUI 节点式界面很复杂，其实掌握了基础逻辑就会发现它无比强大。我总结了 3 个核心概念：\n\n✅ 节点 = 功能模块（每个节点做一件事）\n✅ 连线 = 数据流（图片信息沿着线传递）\n✅ 工作流 = 节点+连线的组合\n\n最基础的文生图只需要 4 个节点：\nCheckpoint加载 → CLIP文本编码 → K采样器 → VAE解码\n\n把这个流程跑通，后面的换模型、加ControlNet、加LoRA都是在此基础上加节点。\n\n#ComfyUI #AI教程 #工作流入门'
  ];

  /* ======== API 方法 ======== */

  // ----- AI绘画 · 文生图 -----
  MockAPI.textToImage = function(params) {
    var self = this;
    return self._latency().then(function() {
      self._maybeError();
      var p = params || {};
      var seed = p.prompt || 'ai_image';
      return {
        images: self._imageSet(4, seed),
        params: {
          prompt: p.prompt || '',
          style: p.style || '写实',
          size: p.size || '1:1',
          steps: p.steps || 20
        },
        cost: Math.floor(Math.random() * 5) + 1,
        time: (Math.random() * 10 + 3).toFixed(1) + 's',
        id: 'img_' + Date.now()
      };
    });
  };

  // ----- AI视频生成 -----
  MockAPI.imageToVideo = function(params) {
    var self = this;
    return self._latency().then(function() {
      self._maybeError();
      return {
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        thumbnailUrl: self._placeholderImg('video_thumb_' + Date.now(), 512, 288),
        duration: params.duration || 5,
        params: params || {},
        cost: Math.floor(Math.random() * 10) + 5,
        time: (Math.random() * 30 + 15).toFixed(1) + 's',
        id: 'vid_' + Date.now()
      };
    });
  };

  // ----- AI工作室（批量生成） -----
  MockAPI.aiStudio = function(params) {
    var self = this;
    return self._latency().then(function() {
      self._maybeError();
      return {
        results: self._imageSet(params.count || 2, 'studio_' + Date.now()),
        mode: params.mode || 'text-to-image',
        cost: Math.floor(Math.random() * 8) + 2,
        id: 'studio_' + Date.now()
      };
    });
  };

  // ----- 电商详情图 / 电商环境图 -----
  MockAPI.ecommerceImage = function(params) {
    var self = this;
    return self._latency().then(function() {
      self._maybeError();
      var images = self._imageSet(params.count || 2, 'ecom_' + Date.now());
      images.forEach(function(img) {
        img.scene = params.scene || '白色背景';
      });
      return {
        images: images,
        type: params.type || 'detail',
        cost: Math.floor(Math.random() * 3) + 1,
        id: 'ecom_' + Date.now()
      };
    });
  };

  // ----- 模特换装 -----
  MockAPI.modelChange = function(params) {
    var self = this;
    return self._latency().then(function() {
      self._maybeError();
      return {
        originalImage: params.modelImage || self._placeholderImg('model_orig'),
        resultImages: self._imageSet(2, 'model_change_' + Date.now()),
        outfit: params.outfit || '休闲装',
        cost: Math.floor(Math.random() * 5) + 3,
        id: 'model_' + Date.now()
      };
    });
  };

  // ----- 图文二创 / 一键创作（小红书风格） -----
  MockAPI.articleRewrite = function(params) {
    var self = this;
    return self._latency().then(function() {
      self._maybeError();
      var p = params || {};
      var original = p.content || p.prompt || '';
      return {
        title: '✨ ' + (p.title || '爆款标题自动生成中...'),
        content: original
          ? original + '\n\n---\n✨ AI 优化版：\n\n' + self._sampleTexts[Math.floor(Math.random() * self._sampleTexts.length)]
          : self._sampleTexts[Math.floor(Math.random() * self._sampleTexts.length)],
        hashtags: ['#AI创作', '#小红书', '#内容创作', '#爆款文案'],
        style: p.style || '小红书',
        cost: Math.floor(Math.random() * 2) + 1,
        id: 'article_' + Date.now()
      };
    });
  };

  // ----- 一键创作（小红书） -----
  MockAPI.oneClickCreate = function(params) {
    return MockAPI.articleRewrite(params);
  };

  // ----- 短视频文案提取 -----
  MockAPI.copyExtract = function(params) {
    var self = this;
    return self._latency().then(function() {
      self._maybeError();
      return {
        videoTitle: '热门短视频 - ' + new Date().toLocaleDateString('zh-CN'),
        videoUrl: params.url || '',
        duration: '01:23',
        text: self._sampleTexts[Math.floor(Math.random() * self._sampleTexts.length)],
        wordCount: Math.floor(Math.random() * 500) + 200,
        platform: params.url ? (params.url.indexOf('douyin') > -1 ? '抖音' : params.url.indexOf('bilibili') > -1 ? 'B站' : '其他') : '未知',
        id: 'extract_' + Date.now()
      };
    });
  };

  // ----- 视频转图文 -----
  MockAPI.videoToArticle = function(params) {
    var self = this;
    return self._latency().then(function() {
      self._maybeError();
      return {
        article: {
          title: 'AI 自动生成图文 — ' + new Date().toLocaleDateString('zh-CN'),
          content: self._sampleTexts[Math.floor(Math.random() * self._sampleTexts.length)],
          images: self._imageSet(3, 'v2a_' + Date.now()),
          wordCount: Math.floor(Math.random() * 1000) + 300
        },
        sourceVideo: params.url || '',
        cost: Math.floor(Math.random() * 3) + 2,
        id: 'v2a_' + Date.now()
      };
    });
  };

  // ----- 达人探店 -----
  MockAPI.storeVisit = function(params) {
    var self = this;
    return self._latency().then(function() {
      self._maybeError();
      var p = params || {};
      var shopName = p.shopName || '未知店铺';
      var shopType = p.shopType || '餐饮';
      return {
        title: '🔥 探店 | ' + shopName + ' — ' + (p.highlight || '宝藏店铺大公开！'),
        content:
          '📌 店铺：' + shopName + '\n' +
          '📍 地址：' + (p.address || '点击查看地图定位') + '\n' +
          '🏷️ 类型：' + shopType + '\n\n' +
          '✨ 探店亮点：\n' +
          (p.highlight || '环境超棒，拍照超出片！服务态度好，性价比高！') + '\n\n' +
          '🍽️ 推荐菜品/产品：\n' +
          '1. 招牌必点 — 颜值与口味并存\n' +
          '2. 隐藏菜单 — 老板才知道的私房款\n' +
          '3. 季节限定 — 错过等一年\n\n' +
          '💡 小贴士：\n' +
          '· 建议工作日前往，周末排队较长\n' +
          '· 最佳拍照位置在靠窗第三桌\n' +
          '· 停车可以停在对面的商场地下\n\n' +
          '🌟 综合评分：⭐⭐⭐⭐⭐（' + (Math.random() * 2 + 3).toFixed(1) + '分）\n' +
          '💰 人均：¥' + Math.floor(Math.random() * 200 + 30) + '\n\n' +
          '#探店 #' + shopType + ' #' + shopName + ' #宝藏店铺 #周末去哪儿',
        images: self._imageSet(4, 'store_' + Date.now()),
        shopName: shopName,
        shopType: shopType,
        rating: (Math.random() * 2 + 3).toFixed(1),
        avgPrice: Math.floor(Math.random() * 200 + 30),
        cost: Math.floor(Math.random() * 3) + 2,
        id: 'store_' + Date.now()
      };
    });
  };

  // ----- 一键改图 -----
  MockAPI.quickEdit = function(params) {
    var self = this;
    return self._latency().then(function() {
      self._maybeError();
      return {
        originalImage: params.imageUrl || self._placeholderImg('edit_orig'),
        resultImages: self._imageSet(2, 'edit_' + Date.now()),
        operation: params.operation || '智能优化',
        cost: Math.floor(Math.random() * 2) + 1,
        id: 'edit_' + Date.now()
      };
    });
  };

  // ----- 数字人合成 -----
  MockAPI.digitalHuman = function(params) {
    var self = this;
    return self._latency().then(function() {
      self._maybeError();
      return {
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        thumbnailUrl: self._placeholderImg('dh_' + Date.now(), 512, 288),
        audioUrl: '',
        script: params.script || '你好，我是 AI 数字人，欢迎使用我们的平台！',
        duration: Math.floor(Math.random() * 30) + 10,
        cost: Math.floor(Math.random() * 15) + 5,
        id: 'dh_' + Date.now()
      };
    });
  };

  // ----- 动作迁移 -----
  MockAPI.motionTransfer = function(params) {
    var self = this;
    return self._latency().then(function() {
      self._maybeError();
      return {
        resultVideoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        sourceImage: params.sourceImage || self._placeholderImg('motion_src'),
        motionVideo: params.motionVideo || '',
        thumbnailUrl: self._placeholderImg('mt_' + Date.now(), 512, 288),
        cost: Math.floor(Math.random() * 10) + 5,
        id: 'mt_' + Date.now()
      };
    });
  };

  /* ======== 注册到全局 ======== */
  window.MockAPI = MockAPI;
})();
