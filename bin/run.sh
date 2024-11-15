#!/bin/bash

if ! ps aux | grep mysql > /dev/null; then
  /usr/local/mysql/bin/mysqld_safe &
fi

cd ../

php -S localhost:8000
wait