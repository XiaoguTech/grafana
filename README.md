# locale
## 创建日期
20180730

## 说明
grafana前端汉化文件

## 使用说明
将grafana源代码根目录下的`public/`替换成该仓库中的内容

## 相关链接
[汉化教程](https://gitlab.com/XGTech/doc/blob/master/grafana_trans_into_chinese.md)

[原Github仓库：WangHL0927/grafana-chinese](https://github.com/WangHL0927/grafana-chinese)

# Origin-Master
## Run from master
If you want to build a package yourself, or contribute - Here is a guide for how to do that.

### Dependencies

- Go 1.10
- NodeJS LTS

### Building the backend
```bash
go get github.com/grafana/grafana
cd $GOPATH/src/github.com/grafana/grafana
go run build.go setup
go run build.go build
```

### Building frontend assets

For this you need nodejs (v.6+).

To build the assets, rebuild on file change, and serve them by Grafana's webserver (http://localhost:3000):
```bash
npm install -g yarn
yarn install --pure-lockfile
npm run watch
```

Build the assets, rebuild on file change with Hot Module Replacement (HMR), and serve them by webpack-dev-server (http://localhost:3333):
```bash
yarn start
# OR set a theme
env GRAFANA_THEME=light yarn start
```
Note: HMR for Angular is not supported. If you edit files in the Angular part of the app, the whole page will reload.

Run tests
```bash
npm run jest
```

Run karma tests
```bash
npm run karma
```

### Recompile backend on source change

To rebuild on source change.
```bash
go get github.com/Unknwon/bra
bra run
```

Open grafana in your browser (default: `http://localhost:3000`) and login with admin user (default: `user/pass = admin/admin`).

### Building a docker image (on linux/amd64)

This builds a docker image from your local sources:

1. Build the frontend `go run build.go build-frontend`
2. Build the docker image `make build-docker-dev`

The resulting image will be tagged as `grafana/grafana:dev`

### Dev config

Create a custom.ini in the conf directory to override default configuration options.
You only need to add the options you want to override. Config files are applied in the order of:

1. grafana.ini
1. custom.ini

In your custom.ini uncomment (remove the leading `;`) sign. And set `app_mode = development`.

### Running tests

#### Frontend
Execute all frontend tests
```bash
npm run test
```

Writing & watching frontend tests (we have two test runners)

- jest for all new tests that do not require browser context (React+more)
   - Start watcher: `npm run jest`
   - Jest will run all test files that end with the name ".jest.ts"
- karma + mocha is used for testing angularjs components. We do want to migrate these test to jest over time (if possible).
  - Start watcher: `npm run karma`
  - Karma+Mocha runs all files that end with the name "_specs.ts".


#### Backend
```bash
# Run Golang tests using sqlite3 as database (default)
go test ./pkg/...

# Run Golang tests using mysql as database - convenient to use /docker/blocks/mysql_tests
GRAFANA_TEST_DB=mysql go test ./pkg/...

# Run Golang tests using postgres as database - convenient to use /docker/blocks/postgres_tests
GRAFANA_TEST_DB=postgres go test ./pkg/...
```

## Plugin development

Checkout the [Plugin Development Guide](http://docs.grafana.org/plugins/developing/development/) and checkout the [PLUGIN_DEV.md](https://github.com/grafana/grafana/blob/master/PLUGIN_DEV.md) file for changes in Grafana that relate to
plugin development.


