# AQUARION 部署指南

## 环境要求
- Node.js 18+ 
- pnpm 8+

## 本地构建

1. 安装依赖：
```bash
pnpm install
```

2. 创建 `.env` 文件并添加：
```
VITE_OPENAI_API_KEY=你的OpenAI_API密钥
```

3. 构建生产版本：
```bash
pnpm build
```

4. 构建完成后，`dist` 目录包含所有静态文件

## 部署到生产环境

### 选项1：Vercel（推荐）
1. 将代码推送到GitHub
2. 在 vercel.com 导入项目
3. 设置环境变量：`VITE_OPENAI_API_KEY`
4. 自动部署完成

### 选项2：Netlify
1. 将代码推送到GitHub
2. 在 netlify.com 导入项目
3. Build command: `pnpm build`
4. Publish directory: `dist`
5. 设置环境变量：`VITE_OPENAI_API_KEY`

### 选项3：自托管服务器
将 `dist` 目录上传到任何静态文件服务器（Nginx, Apache等）

#### Nginx 配置示例：
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/aquarion/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## 重要注意事项

⚠️ **环境变量安全**
- 不要将 `.env` 文件提交到 Git
- 在部署平台的设置中配置环境变量
- OpenAI API 密钥应该保密

⚠️ **路由配置**
- 这是一个单页应用(SPA)
- 所有路由都应该重定向到 `index.html`
- Vercel 和 Netlify 会自动处理

⚠️ **付费功能**
- 当前使用 localStorage 模拟付费
- 生产环境建议接入真实支付系统（微信支付/支付宝）

## 域名配置

部署后，你可以：
1. 使用平台提供的免费域名（如 `your-app.vercel.app`）
2. 绑定自己的域名（在平台设置中配置）

## 性能优化

- 所有资源已经过 Vite 优化
- 图片使用懒加载
- CSS 已压缩
- 建议启用 CDN 加速（Vercel/Netlify 自带）

## 监控和分析

建议添加：
- Google Analytics 或其他分析工具
- 错误监控（Sentry）
- 性能监控

## 更新部署

推送新代码到 GitHub 后，Vercel/Netlify 会自动重新部署。
