FROM ubuntu:latest
LABEL authors="willy-watcho"

ENTRYPOINT ["top", "-b"]