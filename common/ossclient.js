const OSS = require('ali-oss');
const client = new OSS({
    accessKeyId: 'LTAI4GGj1jX6P4CdWWXYzjKt',  // 查看你自己的阿里云KEY
    accessKeySecret: '9yhsnE89zFvLByf6dOChV5d8EphpJZ', // 查看自己的阿里云KEYSECRET
    bucket: 'bucket-zyj001', // 你的 OSS bucket 名称
    region: 'oss-cn-wulanchabu', // bucket 所在地址，我的是 华北2 北京
});
export default client