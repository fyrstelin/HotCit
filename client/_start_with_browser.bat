start /b _start_without_browser.bat

cd web
:: open game in chrome browser
start chrome http://localhost:8080/web/game.html#afk http://localhost:8080/web/game.html#rko http://localhost:8080/web/game.html#mis http://localhost:8080/web/game.html#tugend
cd ..

exit
