#!/bin/sh
set -e

# Laravel serves public disk files from public/storage → storage/app/public.
# This symlink is gitignored and must exist on every deploy/server.
ln -sfn ../storage/app/public /var/www/public/storage

exec nginx -g 'daemon off;'
