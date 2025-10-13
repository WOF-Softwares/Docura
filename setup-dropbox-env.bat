@echo off
REM Dropbox Environment Setup Script for Docura (Windows)

echo.
echo ====================================
echo Dropbox Credentials Setup for Docura
echo ====================================
echo.

REM Your app credentials
set CLIENT_ID=oni7s2m0zhzjqb1
set REDIRECT_URI=https://wof-softwares.github.io/Docura/oauth-redirect.html

echo ✅ App Key (Client ID): %CLIENT_ID%
echo ✅ Redirect URI: %REDIRECT_URI%
echo.

REM Prompt for app secret
echo Please enter your Dropbox App Secret:
echo (Find it at: https://www.dropbox.com/developers/apps - Click 'Show')
set /p CLIENT_SECRET="App Secret: "
echo.

REM Set environment variables for current session
set DROPBOX_CLIENT_ID=%CLIENT_ID%
set DROPBOX_CLIENT_SECRET=%CLIENT_SECRET%
set DROPBOX_REDIRECT_URI=%REDIRECT_URI%

echo ✅ Variables set for current session
echo.

REM Set permanently (user environment variables)
echo Setting permanent environment variables...
setx DROPBOX_CLIENT_ID "%CLIENT_ID%"
setx DROPBOX_CLIENT_SECRET "%CLIENT_SECRET%"
setx DROPBOX_REDIRECT_URI "%REDIRECT_URI%"
echo.

echo ✅ Environment variables saved permanently
echo.

REM Verify
echo Verifying setup...
if defined DROPBOX_CLIENT_ID (
    if defined DROPBOX_CLIENT_SECRET (
        if defined DROPBOX_REDIRECT_URI (
            echo ✅ All variables are set correctly!
            echo.
            echo Current values:
            echo    DROPBOX_CLIENT_ID: %DROPBOX_CLIENT_ID%
            echo    DROPBOX_CLIENT_SECRET: ****
            echo    DROPBOX_REDIRECT_URI: %DROPBOX_REDIRECT_URI%
            echo.
        )
    )
) else (
    echo ❌ Error: Some variables are missing
    pause
    exit /b 1
)

echo Next Steps:
echo 1. Restart your terminal (or open a new Command Prompt)
echo 2. Build Docura: npm run tauri dev
echo 3. Test OAuth: Settings - Cloud Sync - Connect Dropbox
echo.
echo Documentation: DROPBOX_CREDENTIALS_SETUP.md
echo.
echo ✨ Setup complete!
echo.
pause

