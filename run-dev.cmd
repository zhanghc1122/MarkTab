@echo off
:: Set up VS 2022 Community environment
set "VSBASE=C:\Program Files\Microsoft Visual Studio\2022\Community"
set "MSVC=%VSBASE%\VC\Tools\MSVC\14.44.35207"
set "WINSDK=C:\Program Files (x86)\Windows Kits\10"
set "SDKVER=10.0.22621.0"

set "LIB=%MSVC%\lib\x64;%WINSDK%\Lib\%SDKVER%\ucrt\x64;%WINSDK%\Lib\%SDKVER%\um\x64"
set "INCLUDE=%MSVC%\include;%WINSDK%\Include\%SDKVER%\ucrt;%WINSDK%\Include\%SDKVER%\um;%WINSDK%\Include\%SDKVER%\shared"
set "PATH=%USERPROFILE%\.cargo\bin;%MSVC%\bin\HostX64\x64;%PATH%"

cd /d F:\git\MarkTab
npx tauri dev
