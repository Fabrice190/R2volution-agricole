# Serveur Web Local Léger Natif Windows (PowerShell / .NET)
$port = 3000
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()
Write-Host "Serveur local Révolution Agricole démarré sur http://localhost:$port/"

$root = $PSScriptRoot

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $relPath = $request.Url.LocalPath.TrimStart('/')
        if ([string]::IsNullOrWhiteSpace($relPath) -or $relPath -eq '/') {
            $relPath = "index.html"
        }

        # Sécurisation contre path traversal
        $fullPath = [System.IO.Path]::GetFullPath((Join-Path $root $relPath))
        if (-not $fullPath.StartsWith($root, [System.StringComparison]::OrdinalIgnoreCase)) {
            $response.StatusCode = 403
            $response.Close()
            continue
        }

        try {
            if (Test-Path $fullPath -PathType Leaf) {
                $bytes = [System.IO.File]::ReadAllBytes($fullPath)
                $ext = [System.IO.Path]::GetExtension($fullPath).ToLowerInvariant()
                $mime = switch ($ext) {
                    ".html" { "text/html; charset=utf-8" }
                    ".css"  { "text/css; charset=utf-8" }
                    ".js"   { "application/javascript; charset=utf-8" }
                    ".json" { "application/json; charset=utf-8" }
                    ".svg"  { "image/svg+xml" }
                    ".png"  { "image/png" }
                    ".jpg"  { "image/jpeg" }
                    ".jpeg" { "image/jpeg" }
                    ".webp" { "image/webp" }
                    ".gif"  { "image/gif" }
                    ".woff2"{ "font/woff2" }
                    Default { "application/octet-stream" }
                }

                $response.ContentType = $mime
                $response.Headers.Add("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
                $response.Headers.Add("Pragma", "no-cache")
                $response.ContentLength64 = $bytes.Length
                $response.StatusCode = 200
                $response.OutputStream.Write($bytes, 0, $bytes.Length)
            } else {
                $response.StatusCode = 404
                $err = [System.Text.Encoding]::UTF8.GetBytes("Fichier non trouvé (404)")
                $response.ContentLength64 = $err.Length
                $response.OutputStream.Write($err, 0, $err.Length)
            }
        } catch {
            # Ignorer les coupures intempestives de socket client
        } finally {
            try { $response.Close() } catch {}
        }
    }
} finally {
    $listener.Stop()
}
