#!/usr/bin/env bash
set -euo pipefail

REGISTRY="${REGISTRY:-your-registry.example.com:5000}"
IMAGE="aife"
VERSION_FILE="VERSION"

cd "$(dirname "$0")"

current=$(cat "$VERSION_FILE")
IFS='.' read -r major minor patch <<< "$current"

case "${1:-patch}" in
  major) major=$((major + 1)); minor=0; patch=0 ;;
  minor) minor=$((minor + 1)); patch=0 ;;
  patch) patch=$((patch + 1)) ;;
  *)
    echo "Usage: $0 [major|minor|patch]"
    exit 1
    ;;
esac

version="${major}.${minor}.${patch}"
echo "$version" > "$VERSION_FILE"

tag="${REGISTRY}/${IMAGE}:${version}"

echo "Building ${tag} ..."
docker build -t "$tag" .

echo "Pushing ${tag} ..."
docker push "$tag"

echo "Done — ${tag}"
