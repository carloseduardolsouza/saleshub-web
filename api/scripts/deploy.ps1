param(
  [string]$DockerUser = "carlossouzadev",
  [string]$ImageName = "saleshub",
  [string]$Dockerfile = "docker/Dockerfile",
  [string]$Context = ".",
  [switch]$PushLatest,
  [switch]$SkipPush
)

$ErrorActionPreference = "Stop"

function Assert-CommandExists {
  param([string]$CommandName)

  if (-not (Get-Command $CommandName -ErrorAction SilentlyContinue)) {
    throw "Comando '$CommandName' nao encontrado no PATH."
  }
}

Assert-CommandExists -CommandName "docker"

if (-not (Test-Path "package.json")) {
  throw "Arquivo package.json nao encontrado."
}

$packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json

if (-not $packageJson.version) {
  throw "Campo 'version' nao encontrado no package.json."
}

$Tag = $packageJson.version

$repository = "$DockerUser/$ImageName"
$imageWithTag = "${repository}:$Tag"

Write-Host "Repositorio Docker Hub: $repository"
Write-Host "Tag principal: $Tag"
Write-Host "Imagem final: $imageWithTag"

Write-Host ""
Write-Host "1. Buildando imagem..."
docker build -f $Dockerfile -t $imageWithTag $Context

if ($LASTEXITCODE -ne 0) {
  throw "Falha ao buildar a imagem $imageWithTag."
}

if ($PushLatest -and $Tag -ne "latest") {
  Write-Host ""
  Write-Host "2. Marcando tambem como latest..."
  docker tag $imageWithTag "${repository}:latest"

  if ($LASTEXITCODE -ne 0) {
    throw "Falha ao criar a tag latest."
  }
}

if ($SkipPush) {
  Write-Host ""
  Write-Host "Push ignorado por -SkipPush."
  Write-Host "APP_IMAGE=$imageWithTag"
  exit 0
}

Write-Host ""
Write-Host "2. Enviando imagem para o Docker Hub..."
docker push $imageWithTag

if ($LASTEXITCODE -ne 0) {
  throw "Falha ao enviar a imagem $imageWithTag para o Docker Hub."
}

if ($PushLatest -and $Tag -ne "latest") {
  Write-Host ""
  Write-Host "3. Enviando tag latest..."
  docker push "${repository}:latest"

  if ($LASTEXITCODE -ne 0) {
    throw "Falha ao enviar a tag latest."
  }
}

Write-Host ""
Write-Host "Deploy concluido com sucesso."
Write-Host "APP_IMAGE=$imageWithTag"
