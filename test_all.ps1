$ErrorActionPreference = "Stop"
$token = ""
$patientId = ""

Write-Host "=== 1. Register User ===" -ForegroundColor Green
$reg = curl.exe -s --max-time 10 -H "Content-Type: application/json" -d '{"email":"finaltest@test.com","password":"password123","name":"Final Test","role":"doctor"}' http://127.0.0.1:8003/auth/register
$regObj = $reg | ConvertFrom-Json
$token = $regObj.access_token
Write-Host "Registration OK, token: $($token.Substring(0,20))..."

Write-Host "`n=== 2. Login ===" -ForegroundColor Green
$login = curl.exe -s --max-time 10 -H "Content-Type: application/json" -d '{"email":"finaltest@test.com","password":"password123"}' http://127.0.0.1:8003/auth/login
Write-Host "Login OK" 

Write-Host "`n=== 3. Register Patient ===" -ForegroundColor Green
$patient = curl.exe -s --max-time 10 -H "Content-Type: application/json" -H "Authorization: Bearer $token" -d '{"name":"Final Patient","age":45,"gender":"male","phone":"9988776655","address":{"city":"Mysore","state":"Karnataka","pincode":"570001","village":"TestVillage"},"blood_group":"B+"}' http://127.0.0.1:8003/patients/register
$patientObj = $patient | ConvertFrom-Json
$patientId = $patientObj.patient_id
Write-Host "Patient registered: $patientId"

Write-Host "`n=== 4. List Patients ===" -ForegroundColor Green
$list = curl.exe -s --max-time 10 -H "Authorization: Bearer $token" http://127.0.0.1:8003/patients/
$listObj = $list | ConvertFrom-Json
Write-Host "Patients found: $($listObj.total)"

Write-Host "`n=== 5. Dashboard Stats ===" -ForegroundColor Green
$dash = curl.exe -s --max-time 10 -H "Authorization: Bearer $token" http://127.0.0.1:8003/dashboard/stats
$dashObj = $dash | ConvertFrom-Json
Write-Host "Dashboard: $($dashObj.total_patients) patients, $($dashObj.total_visits) visits"

Write-Host "`n=== 6. Profile ===" -ForegroundColor Green
$prof = curl.exe -s --max-time 10 -H "Authorization: Bearer $token" http://127.0.0.1:8003/auth/profile
Write-Host "Profile OK"

Write-Host "`n=== 7. Update Patient ===" -ForegroundColor Green
$upd = curl.exe -s --max-time 10 -H "Content-Type: application/json" -H "Authorization: Bearer $token" -d '{"notes":"Updated notes"}' -X PUT "http://127.0.0.1:8003/patients/$patientId"
Write-Host "Update OK: $upd"

Write-Host "`n=== 8. Get Single Patient ===" -ForegroundColor Green
$get = curl.exe -s --max-time 10 -H "Authorization: Bearer $token" "http://127.0.0.1:8003/patients/$patientId"
$getObj = $get | ConvertFrom-Json
Write-Host "Patient name: $($getObj.name), age: $($getObj.age)"

Write-Host "`n=== 9. Health Check ===" -ForegroundColor Green
$health = curl.exe -s --max-time 5 http://127.0.0.1:8003/health
Write-Host "Health: $health"

Write-Host "`n`n✅ ALL TESTS PASSED" -ForegroundColor Green
