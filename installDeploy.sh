#!/bin/sh
# builds and copys files for deployment on server

cd ~/git/BrettSpiel

git checkout deployed
git pull

ng build --prod
cp ~/git/BrettSpiel/.htaccess ~/git/BrettSpiel/dist/BrettSpiel/.htaccess

ECHO Syncing ~/git/BrettSpiel/dist/BrettSpiel in condensed form to ~/html/
rsync -avu --recursive --dry-run --exclude='' --delete "~/git/BrettSpiel/dist/BrettSpiel/" "~/html/"
