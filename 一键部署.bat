@echo off
chcp 65001 >nul
cd /d "H:\办公其他\渠道团产品汇总网站"
echo ========================================
echo   鲲鸿祥瑞 - 一键部署
echo ========================================
echo.
echo [1/3] 添加文件...
git add .
echo [2/3] 提交更新...
git commit -m "update %date:~0,4%%date:~5,2%%date:~8,2% %time:~0,2%%time:~3,2%"
echo [3/3] 推送到 GitHub...
git push origin main
echo.
echo ========================================
echo   部署完成！
echo   https://gaajhaa.github.io/kunhongxiangrui/
echo ========================================
pause