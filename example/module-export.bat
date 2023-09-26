@echo off

set "source_folder=%CD%\src\module"
if not exist "%source_folder%" (
  echo source not found: 'src'
  exit /b
)

echo source found: 'src'
echo source_folder: '%source_folder%'

cd ..

set "target_folder=%CD%\src"

if not exist "%target_folder%" (
  echo target_folder not found
  exit /b
)

echo target_folder found: 'src'
echo target_folder: '%target_folder%'

xcopy /E /Y /I %source_folder% %target_folder%
echo source folder transported to 'example\src\module'..

pause