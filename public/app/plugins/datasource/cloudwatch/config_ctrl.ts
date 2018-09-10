export class CloudWatchConfigCtrl {
  static templateUrl = 'partials/config.html';
  current: any;

  accessKeyExist = false;
  secretKeyExist = false;

  /** @ngInject */
  constructor($scope) {
    this.current.jsonData.timeField = this.current.jsonData.timeField || '@timestamp';
    this.current.jsonData.authType = this.current.jsonData.authType || 'credentials';

    this.accessKeyExist = this.current.secureJsonFields.accessKey;
    this.secretKeyExist = this.current.secureJsonFields.secretKey;
  }

  resetAccessKey() {
    this.accessKeyExist = false;
  }

  resetSecretKey() {
    this.secretKeyExist = false;
  }

  authTypes = [
    { name: '存取密钥', value: 'keys' },
    { name: '凭证', value: 'credentials' },
    { name: 'ARN', value: 'arn' },
  ];

  indexPatternTypes = [
    { name: '无模式', value: undefined },
    { name: '每时', value: 'Hourly', example: '[logstash-]YYYY.MM.DD.HH' },
    { name: '每天', value: 'Daily', example: '[logstash-]YYYY.MM.DD' },
    { name: '每周', value: 'Weekly', example: '[logstash-]GGGG.WW' },
    { name: '每月', value: 'Monthly', example: '[logstash-]YYYY.MM' },
    { name: '每年', value: 'Yearly', example: '[logstash-]YYYY' },
  ];
}
