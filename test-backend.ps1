# Script de PowerShell para probar el Backend de Semáforos
Write-Host "🧪 Iniciando tests del Backend de Semáforos..." -ForegroundColor Green
Write-Host ""

$baseURL = "http://localhost:3000"
$testsPassed = 0
$testsTotal = 0

# Función para hacer requests
function Test-Endpoint {
    param($url, $method = "GET", $body = $null)
    try {
        if ($method -eq "POST" -and $body) {
            $response = Invoke-RestMethod -Uri $url -Method $method -Body $body -ContentType "application/json"
        } else {
            $response = Invoke-RestMethod -Uri $url -Method $method
        }
        return @{ Success = $true; Data = $response; Status = 200 }
    }
    catch {
        return @{ Success = $false; Error = $_.Exception.Message; Status = $_.Exception.Response.StatusCode.Value__ }
    }
}

# Test 1: Health Check
Write-Host "📋 Test 1: Health Check" -ForegroundColor Yellow
$testsTotal++
$result = Test-Endpoint "$baseURL/health"
if ($result.Success -and $result.Data.status -eq "OK") {
    Write-Host "✅ PASSED: Health check funciona correctamente" -ForegroundColor Green
    Write-Host "   Status: $($result.Data.status)"
    Write-Host "   Uptime: $($result.Data.uptime) segundos"
    $testsPassed++
} else {
    Write-Host "❌ FAILED: Health check no funciona" -ForegroundColor Red
}
Write-Host ""

# Test 2: Ruta principal
Write-Host "📋 Test 2: Ruta Principal (/)" -ForegroundColor Yellow
$testsTotal++
$result = Test-Endpoint "$baseURL/"
if ($result.Success -and $result.Data.message) {
    Write-Host "✅ PASSED: Ruta principal funciona" -ForegroundColor Green
    Write-Host "   Mensaje: $($result.Data.message)"
    $testsPassed++
} else {
    Write-Host "❌ FAILED: Ruta principal no funciona" -ForegroundColor Red
}
Write-Host ""

# Test 3: Enviar datos de sensores
Write-Host "📋 Test 3: POST /api/sensors" -ForegroundColor Yellow
$testsTotal++
$sensorData = @{
    sensor1 = 25.43
    sensor2 = 30.12
    sensor3 = 15.67
    sensor4 = 42.89
    timestamp = [int][double]::Parse((Get-Date -UFormat %s))
} | ConvertTo-Json

$result = Test-Endpoint "$baseURL/api/sensors" "POST" $sensorData
if ($result.Success -and $result.Data.success) {
    Write-Host "✅ PASSED: Datos de sensores enviados correctamente" -ForegroundColor Green
    Write-Host "   ID de lectura: $($result.Data.data.id)"
    $testsPassed++
} else {
    Write-Host "❌ FAILED: Error al enviar datos de sensores" -ForegroundColor Red
    Write-Host "   Error: $($result.Error)"
}
Write-Host ""

# Test 4: Obtener última lectura
Write-Host "📋 Test 4: GET /api/sensors/latest" -ForegroundColor Yellow
$testsTotal++
$result = Test-Endpoint "$baseURL/api/sensors/latest"
if ($result.Success -and $result.Data.success) {
    Write-Host "✅ PASSED: Última lectura obtenida correctamente" -ForegroundColor Green
    Write-Host "   Sensor 1: $($result.Data.data.sensor1) cm"
    Write-Host "   Sensor 2: $($result.Data.data.sensor2) cm"
    Write-Host "   Sensor 3: $($result.Data.data.sensor3) cm"
    Write-Host "   Sensor 4: $($result.Data.data.sensor4) cm"
    $testsPassed++
} else {
    Write-Host "❌ FAILED: Error al obtener última lectura" -ForegroundColor Red
}
Write-Host ""

# Test 5: Analytics
Write-Host "📋 Test 5: GET /api/sensors/analytics" -ForegroundColor Yellow
$testsTotal++
$result = Test-Endpoint "$baseURL/api/sensors/analytics?hours=1"
if ($result.Success -and $result.Data.success) {
    Write-Host "✅ PASSED: Analytics obtenidos correctamente" -ForegroundColor Green
    Write-Host "   Total de lecturas: $($result.Data.data.totalReadings)"
    Write-Host "   Alertas detectadas: $($result.Data.data.alertsCount)"
    $testsPassed++
} else {
    Write-Host "❌ FAILED: Error al obtener analytics" -ForegroundColor Red
}
Write-Host ""

# Resultados finales
Write-Host "=" * 50
Write-Host "🏁 RESULTADOS FINALES:" -ForegroundColor Cyan
Write-Host "📊 Tests ejecutados: $testsTotal"
Write-Host "✅ Tests exitosos: $testsPassed" -ForegroundColor Green
Write-Host "❌ Tests fallidos: $($testsTotal - $testsPassed)" -ForegroundColor Red
Write-Host "📈 Éxito: $([math]::Round(($testsPassed / $testsTotal) * 100, 1))%"

if ($testsPassed -eq $testsTotal) {
    Write-Host ""
    Write-Host "🎉 ¡TODOS LOS TESTS PASARON! Tu backend está funcionando perfectamente." -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "⚠️ $($testsTotal - $testsPassed) tests fallaron. Revisa los errores anteriores." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🔗 URLs para probar manualmente:" -ForegroundColor Cyan
Write-Host "   Dashboard: $baseURL/dashboard"
Write-Host "   API Docs: $baseURL/"
Write-Host "   Health: $baseURL/health"