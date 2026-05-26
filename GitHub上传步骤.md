# 📤 GitHub 网页上传步骤

## ✅ 你现在的页面是正确的！

你已经在 `aquarion-website` 仓库的上传页面了。

---

## 📁 需要上传的文件和文件夹

**重要：不要上传这些文件夹！**
- ❌ `node_modules/` （太大，会自动生成）
- ❌ `.git/` （隐藏文件夹）
- ❌ `dist/` （构建输出）
- ❌ 任何 `.log` 文件

**需要上传的文件和文件夹：**
- ✅ `src/` 文件夹（所有源代码）
- ✅ `guidelines/` 文件夹
- ✅ `package.json`
- ✅ `pnpm-lock.yaml`
- ✅ `vite.config.ts`
- ✅ `.npmrc`
- ✅ `.gitignore`
- ✅ `.env.example`
- ✅ `vercel.json`
- ✅ `postcss.config.mjs`
- ✅ 所有 `.md` 文件（README.md 等）
- ✅ 所有其他配置文件

---

## 🎯 上传步骤

### 方法 1：直接拖拽（推荐）

1. **在你的文件管理器中打开项目文件夹**
   - 找到所有需要的文件和文件夹
   - 按住 Ctrl (Windows) 或 Command (Mac) 多选

2. **拖拽到浏览器**
   - 把选中的文件直接拖到页面的 "Drag files here" 区域

3. **等待文件上传**
   - GitHub 会显示上传进度

### 方法 2：点击选择文件

1. **点击 "choose your files" 链接**

2. **选择文件**
   - 可以多选（Ctrl+点击 或 Shift+点击）
   - ⚠️ 注意：可能无法一次选择文件夹

3. **分批上传**（如果需要）
   - 先上传文件
   - 然后再上传文件夹

---

## ✍️ 填写提交信息

在 "Commit changes" 区域：

1. **标题（必填）**
   ```
   Initial commit: AQUARION AI 手臂摔跤训练系统
   ```

2. **描述（可选）**
   ```
   - 完整的训练计划系统
   - AI 教练功能
   - 可口可乐红 + 爱马仕橙配色
   - 克莱因蓝受伤模式
   ```

---

## 🚀 提交

1. **点击绿色的 "Commit changes" 按钮**

2. **等待上传完成**（可能需要几分钟）

3. **上传成功后**
   - 你会看到所有文件列表
   - 可以继续下一步：部署到 Vercel

---

## ⚠️ 如果文件太多无法一次上传

**使用 Git 命令行**（更简单）：

在你的终端运行：
```bash
git clone https://github.com/chenr4673-sudo/aquarion-website.git
cd aquarion-website
# 复制所有项目文件到这个文件夹（除了 node_modules）
git add .
git commit -m "Initial commit: AQUARION AI 手臂摔跤训练系统"
git push
```

需要输入 GitHub 用户名和 Personal Access Token
