CLS
@ECHO OFF
CALL cd /d %~dp0
Title GDMN TA Server

ECHO Starting server...
CALL yarn run startPM2Server && ^
CALL monitor.cmd

PAUSE