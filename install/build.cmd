CLS
@ECHO OFF
CALL cd /d %~dp0
Title GDMN TA Server

ECHO Starting building server... && ^
ECHO. && ^
CALL yarn run build && ^
ECHO. && ^
ECHO Server build successful && ^
ECHO. && ^
EXIT

PAUSE