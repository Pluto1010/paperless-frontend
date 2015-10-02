#!/bin/bash
INPUT_FILE_NAME=`basename $1`
convert -verbose +dither -posterize 16 -alpha remove -colorspace sRGB -density 200 -trim $1 -quality 75 -sharpen 0x1.0 preview/${INPUT_FILE_NAME%.*}.jpg

