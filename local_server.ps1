$port = 3001
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()
Write-Host "KIMI Properties full API server running on http://localhost:$port/"

$root = Get-Location

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $req = $context.Request
        $res = $context.Response

        # Enable CORS for local testing
        $res.Headers.Add("Access-Control-Allow-Origin", "*")
        $res.Headers.Add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        $res.Headers.Add("Access-Control-Allow-Headers", "Content-Type, Authorization")

        if ($req.HttpMethod -eq 'OPTIONS') {
            $res.StatusCode = 200
            $res.Close()
            continue
        }

        $rawPath = $req.Url.AbsolutePath
        $method = $req.HttpMethod
        $contentFile = Join-Path $root 'data\content.json'

        # Helper to read JSON request body
        $reqBodyStr = ""
        if ($req.HasEntityBody) {
            $reader = New-Object System.IO.StreamReader($req.InputStream, $req.ContentEncoding)
            $reqBodyStr = $reader.ReadToEnd()
            $reader.Close()
        }

        # Helper response function
        function Send-JsonResponse($obj, $code = 200) {
            $res.StatusCode = $code
            $res.ContentType = 'application/json; charset=utf-8'
            $jsonBytes = [System.Text.Encoding]::UTF8.GetBytes(($obj | ConvertTo-Json -Depth 10))
            $res.OutputStream.Write($jsonBytes, 0, $jsonBytes.Length)
        }

        if ($rawPath -eq '/api/content' -and $method -eq 'GET') {
            if (Test-Path $contentFile) {
                $bytes = [System.IO.File]::ReadAllBytes($contentFile)
                $res.ContentType = 'application/json; charset=utf-8'
                $res.OutputStream.Write($bytes, 0, $bytes.Length)
            } else {
                Send-JsonResponse @{ error = "Content file missing" } 404
            }
        }
        elseif ($rawPath -eq '/api/login' -and $method -eq 'POST') {
            Send-JsonResponse @{ success = $true; token = "local_dev_jwt_token_2026" } 200
        }
        elseif ($rawPath -eq '/api/analytics/events' -and $method -eq 'POST') {
            Send-JsonResponse @{ success = $true } 200
        }
        elseif ($rawPath -eq '/api/analytics/heatmap' -and $method -eq 'GET') {
            Send-JsonResponse @{ events = @() } 200
        }
        elseif ($rawPath -eq '/api/analytics/audit' -and $method -eq 'GET') {
            Send-JsonResponse @{ totalEvents = 120; deadClicks = 4; mobileRatio = 65; elements = @(); recommendations = @() } 200
        }
        elseif ($rawPath -eq '/api/properties' -and $method -eq 'GET') {
            if (Test-Path $contentFile) {
                $json = Get-Content $contentFile -Raw | ConvertFrom-Json
                $props = $json.properties
                Send-JsonResponse @{ properties = $props; total = $props.Count; pages = 1 } 200
            } else {
                Send-JsonResponse @{ properties = @(); total = 0; pages = 0 } 200
            }
        }
        elseif ($rawPath -match '^/api/properties/([^/]+)/media$' -and $method -eq 'GET') {
            $propId = $Matches[1]
            $images = @()
            $videos = @()
            if (Test-Path $contentFile) {
                $json = Get-Content $contentFile -Raw | ConvertFrom-Json
                if ($json.properties) {
                    $p = $json.properties | Where-Object { ($_. _id -eq $propId) -or ($_.id -eq $propId) }
                    if ($p) {
                        if ($p.images) { $images = $p.images }
                        elseif ($p.image) { $images = @($p.image) }
                        if ($p.videos) { $videos = $p.videos }
                    }
                }
            }
            Send-JsonResponse @{ images = $images; videos = $videos } 200
        }
        elseif ($rawPath -eq '/api/properties' -and $method -eq 'POST') {
            if ($reqBodyStr) {
                $newProp = $reqBodyStr | ConvertFrom-Json
                $json = Get-Content $contentFile -Raw | ConvertFrom-Json
                if (-not $json.properties) { $json.properties = @() }

                if ($newProp._id) {
                    # Update
                    for ($i = 0; $i -lt $json.properties.Count; $i++) {
                        if (($json.properties[$i]._id -eq $newProp._id) -or ($json.properties[$i].id -eq $newProp._id)) {
                            $json.properties[$i] = $newProp
                            break
                        }
                    }
                } else {
                    # Create
                    $genId = "prop-" + [DateTimeOffset]::Now.ToUnixTimeMilliseconds()
                    $newProp | Add-Member -NotePropertyName "_id" -NotePropertyValue $genId -Force
                    $newProp | Add-Member -NotePropertyName "id" -NotePropertyValue $genId -Force
                    $json.properties += $newProp
                }

                $json | ConvertTo-Json -Depth 10 | Set-Content $contentFile -Encoding UTF8
                Send-JsonResponse @{ success = $true; property = $newProp } 200
            } else {
                Send-JsonResponse @{ error = "Bad request body" } 400
            }
        }
        elseif ($rawPath -match '^/api/properties/([^/]+)$' -and $method -eq 'DELETE') {
            $delId = $Matches[1]
            if (Test-Path $contentFile) {
                $json = Get-Content $contentFile -Raw | ConvertFrom-Json
                $json.properties = @($json.properties | Where-Object { ($_. _id -ne $delId) -and ($_.id -ne $delId) })
                $json | ConvertTo-Json -Depth 10 | Set-Content $contentFile -Encoding UTF8
            }
            Send-JsonResponse @{ success = $true } 200
        }
        elseif ($rawPath -eq '/api/settings' -and $method -eq 'POST') {
            if ($reqBodyStr) {
                $settings = $reqBodyStr | ConvertFrom-Json
                $json = Get-Content $contentFile -Raw | ConvertFrom-Json
                if ($settings.hero) { $json.hero = $settings.hero }
                if ($settings.contact) { $json.contact = $settings.contact }
                $json | ConvertTo-Json -Depth 10 | Set-Content $contentFile -Encoding UTF8
            }
            Send-JsonResponse @{ success = $true } 200
        }
        elseif ($rawPath -eq '/api/upload' -and $method -eq 'POST') {
            # Mock upload endpoint returning placeholders
            Send-JsonResponse @{ success = $true; urls = @("assets/property-1.png"); count = 1 } 200
        }
        else {
            # Static File Serving
            $urlPath = $rawPath
            if ($urlPath -eq '/') { $urlPath = '/index.html' }
            
            $relPath = $urlPath.TrimStart('/').Replace('/', '\')
            $filePath = Join-Path $root $relPath

            if (-not (Test-Path $filePath) -and (Test-Path "$filePath.html")) {
                $filePath = "$filePath.html"
            }

            if (Test-Path $filePath -PathType Leaf) {
                $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
                switch ($ext) {
                    '.html' { $res.ContentType = 'text/html; charset=utf-8' }
                    '.css'  { $res.ContentType = 'text/css' }
                    '.js'   { $res.ContentType = 'application/javascript' }
                    '.json' { $res.ContentType = 'application/json' }
                    '.png'  { $res.ContentType = 'image/png' }
                    '.jpg'  { $res.ContentType = 'image/jpeg' }
                    '.jpeg' { $res.ContentType = 'image/jpeg' }
                    '.svg'  { $res.ContentType = 'image/svg+xml' }
                    '.ico'  { $res.ContentType = 'image/x-icon' }
                    default { $res.ContentType = 'application/octet-stream' }
                }
                $bytes = [System.IO.File]::ReadAllBytes($filePath)
                $res.OutputStream.Write($bytes, 0, $bytes.Length)
            } else {
                $res.StatusCode = 404
            }
        }
        $res.Close()
    }
} finally {
    $listener.Stop()
}
