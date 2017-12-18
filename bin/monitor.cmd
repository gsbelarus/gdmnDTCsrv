CLS
@ECHO OFF
CALL cd /d %~dp0
Title PM2 Monitor

ECHO Starting monitor...
CALL yarn run monitorPM2

PAUSE