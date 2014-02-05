#!/bin/sh
/usr/bin/clear
echo 'Starting GTM as administrator..'
nohup sudo -b "$1"  >/dev/null 2>&1;
echo '\nYou may now close the terminal.\n'
