@echo off
REM Run the reject_reason migration
REM Make sure MySQL is in your PATH or specify full path

mysql -h 103.90.225.130 -u developer -pThoai150396 ecommerce < migrate_product_reject_reason.sql

if %errorlevel% equ 0 (
    echo Migration completed successfully!
    pause
) else (
    echo Migration failed. Make sure MySQL is installed and in your PATH.
    pause
)
