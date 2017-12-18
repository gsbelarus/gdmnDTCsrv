CLS
@ECHO OFF
CALL cd /d %~dp0
Title GDMN TA Server

ECHO Stopping server...
CALL yarn run stopPM2Server && ^
CALL monitor.cmd

PAUSE