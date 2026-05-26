Add-Type -AssemblyName System.Drawing
Get-ChildItem -Path "c:\Users\sunny gupta\OneDrive\Desktop\ads\public" -Include *.jpg,*.jpeg,*.png -Recurse | ForEach-Object {
    $img = [System.Drawing.Image]::FromFile($_.FullName)
    [PSCustomObject]@{
        Name = $_.Name
        Width = $img.Width
        Height = $img.Height
    }
    $img.Dispose()
} | Format-Table -AutoSize
