FROM golang
MAINTAINER zhongqin0820@163.com
COPY . /go/src/github.com/grafana/grafana
WORKDIR /go/src/github.com/grafana/grafana
# build commands according to official README.md
RUN go run build.go setup
RUN go run build.go build
EXPOSE 3000
