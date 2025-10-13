#!/bin/bash

# Quick Dropbox Sync Test Script
# Tests sync functionality with temporary access token

echo "🧪 Testing Dropbox Sync with Access Token"
echo "=========================================="
echo ""

# Your access token
ACCESS_TOKEN="sl.u.AGDUB1sk4T6iKarsPIaOvbF8xJw24ULN-dSqdejxpDaHnckcbzgeBcF4awGdJZwu5wr7syAIQOArvQ-BTdxmwtk5at-Ez09vXIh1LgKN21A7e2W_b3bEgs4WWVx12hO4wzowIBx8Y9Kbryc2OVqI8RfQKGcaWc2jBthWbvpmoGDSyXF-Dz0B2DMQbFTHzggPfjc1EwP622DiimB4PdrzzEfgTwflI4IFBYI6OoKlVphpvKuL9jFTy-OIvsWTHsrNhjrKknbhMqlzwvfrzJqL5FucPYjxP9ybWZbUkSpu_l3aALzZjbwhw8YgO8tClY9LnMtHzgivUX0ovBNNKP3iPD0dff_WnbwDeyXeVIaNIRodyb4WCIu3bzBdO1MY_GuBS2T8-Q679SpDJ3FYKV4jDaxk8yjKX-b0ZG9GIwW7mo-dg7q1IUAO36caZjoZQHgKhIXgSsWWbbDZtoPCXN999IuQi5R7t7rqhBAHsVCJTI6WfX8xYxHjJllAP2PqA9fp09MJlx2HTCXxiqZoG9qqpMWIdR7DbkB_mrNUHGTea4k8cq2LaioQX3vWZaYs_eweJpn5L-zKK6oHfHzBt364LYX2yzWjcUlcisJEKDgGWJxv12WaHbR79c7D4ne_EHZVam61Oak2sJgdloSg3CKnxeK02kUrN9GClVrGYcfnIuAPisNnJh8FQw4aW4Q-9G5qX2FkRvTvhuUri3KnzKRJFUP81x2-Qv81riyX5iHBQQUlJuNDxeZBk8usbA5CkexfSJgtRV7LKdH5HGDBwOrfDT0uqbhSAiV-E4npkEhSY6UXTKq2piclwKqbSLZXs2VKT-BMXcvKD92j_4OV-YNwiMBKmR0YGRAJFs-NaS4GLVn_FeYlkUhdISILOgJczD54yxsy9eaprZPoALcI-UWPUSnMzp5wB_hRDkIrgzdVqf0VKwNPqiuK1YDAPUkMLhtmaa0CKSd2MNk505O8fw4spnRGQ1VyWP--TP3ypwllkajPkUqkioqXiH53MVlZgOuMIqau3N2_tn06_Go5a705htuMy94w-cvYvun2Azz3c4J4xK4ejI0W_J8PoxWdTq1y676zGYYQ36gCmC1qqk3dL5oJ8AVIkl9XHyGs8eq-BdHnn5uB4OGyB0gbw3t5IRGDd3Gs4IX5YMeL-w7JJ-Y9RmV6b7Y0Q3Ks0TY6ja98-Vgdx0NCmBtAzkH8gZ6kHX3DUudGuxWZXuTkxuU3wh_3XDnPjyBd-GZdTz9SaniD1gUNlGdB2obq-fUchyskqz7rSIP1m7huqljFN2I2ri53_cGt"

# Test 1: Get user info
echo "1️⃣  Testing: Get user account info"
USER_INFO=$(curl -s -X POST https://api.dropboxapi.com/2/users/get_current_account \
    -H "Authorization: Bearer $ACCESS_TOKEN")

if echo "$USER_INFO" | grep -q "email"; then
    EMAIL=$(echo "$USER_INFO" | grep -o '"email":"[^"]*"' | cut -d'"' -f4)
    echo "✅ Success! Connected to: $EMAIL"
else
    echo "❌ Failed to get user info"
    echo "$USER_INFO"
    exit 1
fi
echo ""

# Test 2: Create test file
echo "2️⃣  Testing: Upload test file"
TEST_CONTENT="# Test Document\n\nThis is a test file from Docura!\n\nCreated: $(date)"
echo -e "$TEST_CONTENT" > /tmp/docura-test.md

UPLOAD_RESULT=$(curl -s -X POST https://content.dropboxapi.com/2/files/upload \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -H "Dropbox-API-Arg: {\"path\":\"/test-file.md\",\"mode\":\"overwrite\"}" \
    -H "Content-Type: application/octet-stream" \
    --data-binary @/tmp/docura-test.md)

if echo "$UPLOAD_RESULT" | grep -q "test-file.md"; then
    echo "✅ Success! File uploaded to /Apps/Docura Sync/test-file.md"
else
    echo "❌ Failed to upload file"
    echo "$UPLOAD_RESULT"
fi
echo ""

# Test 3: List files
echo "3️⃣  Testing: List files in app folder"
LIST_RESULT=$(curl -s -X POST https://api.dropboxapi.com/2/files/list_folder \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"path":""}')

if echo "$LIST_RESULT" | grep -q "test-file.md"; then
    echo "✅ Success! Files found in app folder:"
    echo "$LIST_RESULT" | grep -o '"name":"[^"]*"' | cut -d'"' -f4 | sed 's/^/  - /'
else
    echo "ℹ️  No files yet (that's okay for first test)"
fi
echo ""

# Test 4: Download file
echo "4️⃣  Testing: Download file from Dropbox"
DOWNLOAD_RESULT=$(curl -s -X POST https://content.dropboxapi.com/2/files/download \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -H "Dropbox-API-Arg: {\"path\":\"/test-file.md\"}" \
    -o /tmp/docura-download.md)

if [ -f /tmp/docura-download.md ]; then
    echo "✅ Success! File downloaded:"
    cat /tmp/docura-download.md | head -n 3
else
    echo "❌ Failed to download file"
fi
echo ""

# Summary
echo "=========================================="
echo "✨ Dropbox Sync Test Complete!"
echo ""
echo "📁 Your files are in: /Apps/Docura Sync/"
echo "🌐 Check Dropbox: https://www.dropbox.com/home/Apps/Docura%20Sync"
echo ""
echo "🎯 Next: Test in Docura app with this token!"
echo ""

# Cleanup
rm -f /tmp/docura-test.md /tmp/docura-download.md

