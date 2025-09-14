// scripts/apply-vant-theme.js
// Vant Weapp 1.11.7 主题配置应用脚本
// 使用 CSS 变量方式配置主题，无需覆盖文件，直接在 app.wxss 中引入即可

const fs = require('fs')
const path = require('path')

function log(info) {
  console.log(`[theme] ${info}`)
}

function main() {
  const projectRoot = path.resolve(__dirname, '..')
  const themeFile = path.join(projectRoot, 'src', 'theme', 'vant-var.less')
  const appWxssFile = path.join(projectRoot, 'app.wxss')

  // 检查主题文件是否存在
  if (!fs.existsSync(themeFile)) {
    console.error(`[theme] 主题文件不存在: ${themeFile}`)
    process.exit(1)
  }

  // 检查 app.wxss 是否存在
  if (!fs.existsSync(appWxssFile)) {
    console.error(`[theme] app.wxss 文件不存在: ${appWxssFile}`)
    process.exit(1)
  }

  // 读取 app.wxss 内容
  let appWxssContent = fs.readFileSync(appWxssFile, 'utf-8')
  
  // 检查是否已经引入了主题文件
  const themeImport = '@import "src/theme/vant-var.less";'
  
  if (appWxssContent.includes(themeImport)) {
    log('主题文件已经在 app.wxss 中引入，无需重复添加')
    return
  }

  // 在 app.wxss 开头添加主题文件引入
  const newContent = `${themeImport}\n\n${appWxssContent}`
  
  // 写入 app.wxss
  fs.writeFileSync(appWxssFile, newContent, 'utf-8')
  
  log('已在 app.wxss 中引入主题配置文件')
  log('请重新编译小程序以查看主题效果')
}

main()
