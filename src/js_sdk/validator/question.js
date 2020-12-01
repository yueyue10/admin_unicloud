// 校验规则由 schema 生成，请不要直接修改当前文件，如果需要请在uniCloud控制台修改schema
// uniCloud: https://unicloud.dcloud.net.cn/



export default {
  "title": {
    "rules": [
      {
        "required": true,
        "errorMessage": "{label}必填"
      },
      {
        "format": "string"
      }
    ],
    "label": "问题题目"
  },
  "answer": {
    "rules": [
      {
        "required": true,
        "errorMessage": "{label}必填"
      },
      {
        "format": "array"
      }
    ],
    "label": "问题答案"
  },
  "score": {
    "rules": [
      {
        "required": true,
        "errorMessage": "{label}必填"
      },
      {
        "format": "string"
      }
    ],
    "label": "问题分数"
  }
}
