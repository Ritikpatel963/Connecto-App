$env:JAVA_HOME = "C:\Program Files\Java\jdk-17"
$env:PATH = "C:\Program Files\Java\jdk-17\bin;" + $env:PATH
Write-Host "✅ Using Java:" (java -version 2>&1 | Select-Object -First 1)
npx react-native run-android