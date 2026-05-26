# 📤 通过 GitHub 网页上传代码（最简单）

## 第 1 步：下载源代码压缩包

已为你创建好压缩包：`aquarion-source.tar.gz`

**下载这个文件到你的电脑**

## 第 2 步：解压文件

- **Windows**: 右键点击 `.tar.gz` 文件 → 使用 7-Zip 或 WinRAR 解压
- **Mac**: 双击文件自动解压

## 第 3 步：上传到 GitHub

1. **访问你的仓库**
   ```
   https://github.com/chenr4673-sudo/aquarion-training
   ```

2. **点击 "Add file" → "Upload files"**

3. **拖拽所有解压后的文件到网页**
   - 可以全选所有文件和文件夹
   - 直接拖到浏览器窗口

4. **填写提交信息**
   - Commit message: `Initial commit: AQUARION AI 手臂摔跤训练系统`

5. **点击 "Commit changes"**

6. **等待上传完成**（可能需要几分钟）

完成！代码就上传到 GitHub 了！

---

# 🚀 下一步：部署到 Vercel

代码上传后，继续：

1. 访问 https://vercel.com
2. 用 GitHub 登录
3. 点击 "Add New..." → "Project"
4. 选择 `aquarion-training`
5. 配置：
   - Framework: **Vite**
   - Build Command: `pnpm build`
   - Output Directory: `dist`
   - **环境变量**: 
     - Name: `VITE_OPENAI_API_KEY`
     - Value: 你的 OpenAI API Key
6. 点击 **Deploy**

几分钟后你的网站就上线了！🎉
