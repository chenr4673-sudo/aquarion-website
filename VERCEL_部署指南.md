# 🚀 AQUARION - Vercel 部署完整指南

## 📋 准备工作（5分钟）

### 1️⃣ 准备账号
- ✅ GitHub 账号 - [注册地址](https://github.com/signup)
- ✅ Vercel 账号 - [注册地址](https://vercel.com/signup)（用 GitHub 登录即可）

### 2️⃣ 准备 OpenAI API Key
- 访问 [OpenAI Platform](https://platform.openai.com/api-keys)
- 创建新的 API Key
- **复制并保存好**（只显示一次）

---

## 📤 第一步：上传代码到 GitHub

### 方法 A：通过 GitHub 网页上传（最简单）

1. **创建新仓库**
   - 访问 https://github.com/new
   - 仓库名：`aquarion-training`（或你喜欢的名字）
   - 设置为 **Public**（公开）或 **Private**（私有）都可以
   - ❌ **不要**勾选 "Add a README file"
   - 点击 **Create repository**

2. **获取仓库地址**
   - 创建后会看到一个页面
   - 找到 "…or push an existing repository from the command line"
   - 复制下面的命令（类似这样）：
   ```
   git remote add origin https://github.com/你的用户名/aquarion-training.git
   git branch -M main
   git push -u origin main
   ```

3. **在终端运行**（在当前项目目录）
   ```bash
   git remote add origin https://github.com/你的用户名/aquarion-training.git
   git branch -M main
   git push -u origin main
   ```
   
4. **输入 GitHub 凭据**
   - 第一次会要求输入用户名和密码
   - ⚠️ 注意：密码不是登录密码，而是 **Personal Access Token**
   - 如何获取 Token：
     - 访问 https://github.com/settings/tokens
     - 点击 "Generate new token (classic)"
     - 勾选 `repo` 权限
     - 生成后复制 Token（只显示一次）
     - 粘贴作为密码使用

### 方法 B：通过命令行（需要 Git 基础）

如果你已经熟悉 Git，直接运行：
```bash
# 确保在项目目录 /workspaces/default/code
git remote add origin https://github.com/你的用户名/aquarion-training.git
git branch -M main
git push -u origin main
```

---

## 🌐 第二步：部署到 Vercel

### 1. 登录 Vercel
- 访问 https://vercel.com
- 点击右上角 **Sign Up**
- 选择 **Continue with GitHub**
- 授权 Vercel 访问你的 GitHub

### 2. 导入项目
- 登录后点击 **Add New...** → **Project**
- 在列表中找到 `aquarion-training`（你的仓库名）
- 点击 **Import**

### 3. 配置项目
在配置页面：

**Framework Preset（框架预设）**
- 选择：**Vite** （应该会自动检测）

**Root Directory（根目录）**
- 保持默认：`./`

**Build and Output Settings（构建设置）**
- Build Command: `pnpm build` ✅（应该自动填充）
- Output Directory: `dist` ✅（应该自动填充）
- Install Command: `pnpm install` ✅（应该自动填充）

**Environment Variables（环境变量）⚠️ 重要！**
点击 **Environment Variables**，添加：
- **Name（名称）**: `VITE_OPENAI_API_KEY`
- **Value（值）**: 粘贴你的 OpenAI API Key
- 点击 **Add**

### 4. 开始部署
- 检查所有设置无误
- 点击 **Deploy** 按钮
- 等待 2-3 分钟，Vercel 会自动构建和部署

### 5. 部署完成！🎉
- 部署成功后会看到庆祝动画
- 你会得到一个网址，类似：
  - `https://aquarion-training.vercel.app`
  - 或 `https://aquarion-training-你的用户名.vercel.app`

---

## 🔗 第三步：访问和分享

### 访问你的网站
点击 Vercel 提供的链接，就可以看到你的 AQUARION 训练系统了！

### 分享给其他人
直接把这个链接分享给任何人，他们都可以访问：
- 无需安装任何东西
- 支持手机、平板、电脑
- 全球访问速度快（CDN 加速）

### 绑定自定义域名（可选）
如果你有自己的域名（如 `aquarion.com`）：
1. 在 Vercel 项目中点击 **Settings** → **Domains**
2. 输入你的域名
3. 按提示在域名服务商处添加 DNS 记录
4. 等待生效（通常几分钟到几小时）

---

## 🔄 第四步：更新网站

当你需要修改代码并更新网站时：

```bash
# 1. 修改代码后，提交更改
git add .
git commit -m "更新说明"

# 2. 推送到 GitHub
git push

# 3. Vercel 会自动检测并重新部署（无需任何操作）
```

⏱️ **自动部署**：推送后 2-3 分钟，网站就会自动更新！

---

## ⚙️ 环境变量管理

### 查看/修改环境变量
1. 进入 Vercel 项目页面
2. 点击 **Settings** → **Environment Variables**
3. 可以添加、修改或删除环境变量
4. 修改后需要 **Redeploy**（重新部署）才能生效

### 为什么需要环境变量？
- ✅ **安全**：API Key 不会出现在代码中
- ✅ **灵活**：不同环境可以用不同的 Key
- ✅ **保密**：即使代码公开，Key 也是安全的

---

## 📊 监控和分析

### Vercel 提供的免费功能
- **实时日志**：查看访问日志和错误
- **性能分析**：网站加载速度统计
- **流量统计**：访问量、带宽使用
- **自动 HTTPS**：免费 SSL 证书

### 查看方式
在 Vercel 项目页面：
- **Deployments**：查看所有部署历史
- **Analytics**：查看访问统计（可能需要升级套餐）
- **Logs**：实时日志和错误信息

---

## 🆘 常见问题

### Q1: 部署失败怎么办？
**A**: 查看 Vercel 的构建日志：
1. 点击失败的部署
2. 查看 **Build Logs**
3. 根据错误信息修复
4. 重新推送代码

### Q2: AI 教练功能不工作？
**A**: 检查环境变量：
1. 确认在 Vercel 设置中添加了 `VITE_OPENAI_API_KEY`
2. 确认 API Key 正确且有效
3. 确认 OpenAI 账户有余额
4. 修改后记得 **Redeploy**

### Q3: 网站显示 404？
**A**: 路由配置问题：
- `vercel.json` 文件应该已经配置好了
- 如果还有问题，在 Vercel 设置中检查 **Rewrites** 配置

### Q4: 如何回滚到之前的版本？
**A**: 
1. 在 Vercel 项目页面点击 **Deployments**
2. 找到想要恢复的版本
3. 点击三个点 **...** → **Promote to Production**

### Q5: 免费套餐有限制吗？
**A**: Vercel 免费套餐限制：
- ✅ 无限制的项目数
- ✅ 100GB 带宽/月
- ✅ 自动 HTTPS
- ✅ 全球 CDN
- 对个人项目完全够用！

---

## 💰 费用说明

### Vercel
- **免费套餐**：个人项目完全免费
- **Pro 套餐**：$20/月（商业项目推荐）

### OpenAI API
- **按使用量计费**：
  - GPT-4 约 $0.03 每次对话（约 0.2 元）
  - 建议充值 $10-20 用于测试
  - 可以设置使用限额防止超支

---

## 📞 获取帮助

- **Vercel 文档**: https://vercel.com/docs
- **Vercel 社区**: https://github.com/vercel/vercel/discussions
- **OpenAI 文档**: https://platform.openai.com/docs

---

## ✅ 部署检查清单

部署前确认：
- [ ] 已创建 GitHub 账号
- [ ] 已创建 Vercel 账号
- [ ] 已获取 OpenAI API Key
- [ ] 代码已推送到 GitHub
- [ ] 在 Vercel 中正确设置环境变量
- [ ] 部署成功且网站可访问
- [ ] AI 教练功能正常工作
- [ ] 付费流程正常（模拟状态）

全部完成后，你的 AQUARION 训练系统就可以对外服务了！🎉
