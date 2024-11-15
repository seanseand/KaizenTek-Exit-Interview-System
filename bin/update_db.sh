#!/bin/bash

# Variables
DB_NAME="kaizentekmid"
DB_USER="root"
DB_PASS=""
SQL_FILE="../database/kaizentekmid.sql"

# Check if the SQL file exists
if [ ! -f "$SQL_FILE" ]; then
    echo "SQL file not found!"
    exit 1
fi

# Update the MySQL database
echo "Updating MySQL database..."
mysql -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < "$SQL_FILE"

if [ $? -eq 0 ]; then
    echo "Database updated successfully."
else
    echo "Failed to update the database."
    exit 1
fi