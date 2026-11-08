@echo off
chcp 65001 >nul
title CortesFactory
cd /d "%~dp0"

set PY=
python --version >nul 2>nul
if not errorlevel 1 set PY=python
if defined PY goto :py_found
py -3 --version >nul 2>nul
if not errorlevel 1 set PY=py -3
if defined PY goto :py_found

echo Python 3 nao foi encontrado.
echo Execute instalar.bat para o instalar, ou instale em https://www.python.org/downloads/
echo ^(marcar "Add python.exe to PATH"^)
pause
exit /b 1

:py_found
where ffmpeg >nul 2>nul
if not errorlevel 1 goto :ff_found
echo AVISO: ffmpeg nao encontrado no PATH.
echo Execute instalar.bat para o instalar, depois feche e volte a abrir o CortesFactory.
echo.

:ff_found
%PY% server.py
pause
