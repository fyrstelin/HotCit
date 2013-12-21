:: start server
start /min "HotCit Server" HotCit.exe

:: compile all css
:: use no-cache required for mads' pc
start /min "sass watch" sass --watch web/css/sass:web/css
:: pause, instead of exit if error occur

cd web
:: watch templates
start /min "node watch" node watch_templates.js
cd ..

exit