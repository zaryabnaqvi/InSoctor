# IRIS API Test using PowerShell
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "IRIS API Connection Test" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

$IRIS_URL = "https://20.51.235.43:8443"
$IRIS_API_KEY = "OB_2LNjipsfPJaa38M_mFgbFI6puHhYn3nWh6ODMyr33o1CXwaFw2vNW8E-EobZW9NTEwReS9Czn-UCASCPdpg"

Write-Host "IRIS URL: $IRIS_URL" -ForegroundColor Yellow
Write-Host "API Key: ***${IRIS_API_KEY.Substring($IRIS_API_KEY.Length - 10)}" -ForegroundColor Yellow
Write-Host ""

# Bypass SSL certificate validation for self-signed certs
add-type @"
    using System.Net;
    using System.Security.Cryptography.X509Certificates;
    public class TrustAllCertsPolicy : ICertificatePolicy {
        public bool CheckValidationResult(
            ServicePoint srvPoint, X509Certificate certificate,
            WebRequest request, int certificateProblem) {
            return true;
        }
    }
"@
[System.Net.ServicePointManager]::CertificatePolicy = New-Object TrustAllCertsPolicy
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12

$headers = @{
    "Authorization" = "Bearer $IRIS_API_KEY"
    "Content-Type" = "application/json"
}

try {
    Write-Host "Test 1: Fetching cases from IRIS..." -ForegroundColor Cyan
    Write-Host "Request URL: $IRIS_URL/api/v2/cases?per_page=5" -ForegroundColor Gray
    Write-Host ""
    
    $response = Invoke-WebRequest -Uri "$IRIS_URL/api/v2/cases?per_page=5" -Headers $headers -Method Get -UseBasicParsing
    
    Write-Host "Response Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host ""
    
    if ($response.StatusCode -eq 200) {
        $data = $response.Content | ConvertFrom-Json
        
        Write-Host "✅ SUCCESS: IRIS API is working!" -ForegroundColor Green
        Write-Host ""
        
        if ($data.data) {
            $caseCount = ($data.data | Measure-Object).Count
            Write-Host "Found $caseCount case(s)" -ForegroundColor Green
            
            if ($caseCount -gt 0) {
                Write-Host ""
                Write-Host "Sample case:" -ForegroundColor Yellow
                $data.data[0] | ConvertTo-Json -Depth 3
            }
        }
        
        Write-Host ""
        Write-Host "==========================================" -ForegroundColor Cyan
        Write-Host "✅ IRIS API Connection Test PASSED" -ForegroundColor Green
        Write-Host "==========================================" -ForegroundColor Cyan
        exit 0
    }
} catch {
    Write-Host "❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Error Details:" -ForegroundColor Yellow
    Write-Host $_.Exception.ToString() -ForegroundColor Gray
    Write-Host ""
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host "Troubleshooting Tips:" -ForegroundColor Yellow
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host "1. Verify IRIS server is running on 20.51.235.43:443"
    Write-Host "2. Check if port 443 is accessible from your network"
    Write-Host "3. Verify the API key is correct and has proper permissions"
    Write-Host "4. Check if IRIS is configured to accept connections from your IP"
    Write-Host "5. Try accessing https://20.51.235.43:443 in your browser"
    Write-Host ""
    exit 1
}
