
:: Disable stating every read command
@echo off

SET keyName=%1

scp -r -i %userprofile%\.ssh\%keyName% %~dp0dist\BrettSpiel\assets\* tispyl@tispyl.uber.space:~/html/assets/
