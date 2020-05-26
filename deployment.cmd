
:: Disable stating every read command
@echo off

SET keyName=%1

cp .htaccess dist\BrettSpiel\.htaccess

ECHO Copying %~dp0dist\BrettSpiel in condensed form to %~dp0dist\temp_dist
xcopy %~dp0dist\BrettSpiel %~dp0dist\temp_dist  /EXCLUDE:%~dp0excludeAssets.txt /S /I

scp -r -i %userprofile%\.ssh\%keyName% %~dp0dist\temp_dist\* tispyl@tispyl.uber.space:~/html/

rd /S /Q %~dp0dist\temp_dist
