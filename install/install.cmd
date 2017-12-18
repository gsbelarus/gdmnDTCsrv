CLS
@ECHO OFF
CALL cd /d %~dp0
Title GDMN TA Server

ECHO Starting dependencies installation... && ^
ECHO. && ^
CALL yarn && ^
ECHO. && ^
ECHO Dependencies installed successfully && ^
ECHO. && ^
ECHO Updating PM2... && ^
ECHO. && ^
CALL yarn run updatePM2 && ^
ECHO. && ^
ECHO PM2 updated successfully && ^
ECHO. && ^
EXIT

PAUSE