@echo off
chcp 65001 >nul
title CortesFactory - verificar e instalar
cd /d "%~dp0"

echo A verificar o que falta para o CortesFactory...
echo.

set INSTALA_PY=
set INSTALA_FF=

REM --- Python 3 (o atalho da Microsoft Store nao conta: falha no --version) ---
python --version >nul 2>nul
if not errorlevel 1 goto :py_ok
py -3 --version >nul 2>nul
if not errorlevel 1 goto :py_ok
echo [FALTA] Python 3
set INSTALA_PY=1
goto :check_ff

:py_ok
echo [OK] Python 3

:check_ff
where ffmpeg >nul 2>nul
if not errorlevel 1 goto :ff_ok
echo [FALTA] ffmpeg
set INSTALA_FF=1
goto :decide

:ff_ok
echo [OK] ffmpeg

:decide
echo.
if not defined INSTALA_PY if not defined INSTALA_FF (
  echo Tudo instalado. Pode abrir o start.bat.
  goto :fim
)

where winget >nul 2>nul
if not errorlevel 1 goto :instalar
echo O winget nao esta disponivel neste Windows.
echo Instale manualmente:
echo   - Python 3: https://www.python.org/downloads/  ^(marcar "Add python.exe to PATH"^)
echo   - ffmpeg: https://www.gyan.dev/ffmpeg/builds/  ^(ou winget install Gyan.FFmpeg^)
goto :fim

:instalar
if defined INSTALA_PY (
  echo A instalar Python 3.12...
  winget install -e --id Python.Python.3.12 --accept-package-agreements --accept-source-agreements
  echo.
)
if defined INSTALA_FF (
  echo A instalar ffmpeg...
  winget install -e --id Gyan.FFmpeg --accept-package-agreements --accept-source-agreements
  echo.
)
echo Instalacao terminada.
echo IMPORTANTE: feche esta janela e execute instalar.bat outra vez para confirmar
echo que o Python e o ffmpeg ficaram no PATH.

:fim
echo.
pause
