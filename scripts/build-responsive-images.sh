#!/usr/bin/env bash

set -euo pipefail

readonly source_dir="public"
readonly output_dir="public/images"
readonly widths=(960 1600)
readonly images=(
  "prayer.jpg"
  "wide-strip5.jpg"
  "online giving2.jpg"
  "sandton-skyline-grayscale.jpg"
  "founders-grayscale.jpg"
  "youth.jpg"
  "institute.jpg"
  "relief-center.jpg"
  "faith-and-work.jpg"
  "what-kids.jpg"
  "what-kids4.jpg"
  "what-kids5.jpg"
  "what-kids6.jpg"
  "what-kids8.jpg"
  "what-kids10.jpg"
  "what-kids11.jpg"
  "what-kids12.jpg"
  "what-kids13.jpg"
  "what-kids14.jpg"
  "what-kids15.jpg"
  "premarital-counseling4.jpg"
  "join-us.jpg"
  "father-child3.jpg"
)

mkdir -p "$output_dir"

for image in "${images[@]}"; do
  source_path="$source_dir/$image"
  image_name="${image%.*}"

  for width in "${widths[@]}"; do
    cwebp -quiet -q 82 -resize "$width" 0 "$source_path" -o "$output_dir/$image_name-$width.webp"
  done
done
