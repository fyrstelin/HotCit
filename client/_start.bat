:: start server
start HotCit.exe

:: compile all css
:: use no-cache required for mads' pc
call sass --no-cache --watch web/css/sass:web/css 
:: pause, instead of exit if error occur
pause

:: open game in chrome browser
cd web
start chrome http://localhost:8080/web/game.html
cd ..