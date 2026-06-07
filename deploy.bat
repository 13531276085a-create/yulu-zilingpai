@echo off
echo === 雨露紫灵牌 - 部署到 yuluzilingpai.fun ===
cd /d "C:\Users\111\ZiWeiPurpleCards"
echo.
echo [1/3] 检查 Cloudflare 登录状态...
call npx wrangler whoami >nul 2>&1
if %errorlevel% neq 0 (
    echo 需要登录 Cloudflare，浏览器将打开...
    call npx wrangler login
)
echo.
echo [2/3] 构建 Web 版本...
call npx expo export --platform web
echo.
echo [3/3] 部署到 Cloudflare Pages...
call npx wrangler pages deploy dist --project-name=yulu-zilingpai
echo.
echo === 部署完成！===
echo 访问 https://yuluzilingpai.fun 查看更新
echo.
pause
