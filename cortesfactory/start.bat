@echo off
chcp 65001 >nul
title CortesFactory
cd /d "%~dp0"

set PY=
where python >nul 2>nul && set PY=python
if not defined PY (
  where py >nul 2>nul && set PY=py -3
)
if not defined PY (
  echo Python 3 nao foi encontrado.
  echo Instale em https://www.python.org/downloads/ e marque "Add python.exe to PATH".
  pause
  exit /b 1
)

where ffmpeg >nul 2>nul
if errorlevel 1 (
  echo AVISO: ffmpeg nao encontrado no PATH.
  echo Instale com: winget install Gyan.FFmpeg
  echo Depois feche esta janela e volte a abrir o CortesFactory.
  echo.
)

%PY% server.py
pause
