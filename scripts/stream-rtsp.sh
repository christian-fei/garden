#!/bin/bash

raspivid -o - -t 0 -w 1920 -h 1080 -fps 30 -b 500000 | cvlc -vvv stream:///dev/stdin --sout '#rtp{access=udp,sdp=rtsp://:8554}' :demux=h264
