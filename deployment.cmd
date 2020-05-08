
:: Disable stating every read command
@echo off

SET keyName=%1

cp .htaccess dist\BrettSpiel\.htaccess
scp -r -i %userprofile%\.ssh\%keyName% %~dp0dist\BrettSpiel\* tispyl@tispyl.uber.space:~/html/
