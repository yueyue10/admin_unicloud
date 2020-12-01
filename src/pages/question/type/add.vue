<template>
  <view class="uni-container">
    <view class="uni-group">
      <view class="uni-title">新增试题</view>
    </view>
    <view class="uni-container">
      <!--所有题目-->
      <view v-for="(item,index) in questionList">
        <view style="font-weight: bolder;margin-top: 20px">{{index + 1}}、{{item.title}}</view>
        <view style="margin-top: 10px" class="hor-layout-center">
          <view v-for="(opt,idx) in item.options" style="margin: 0px 10px">
            <text style="color: #99a9bf">{{opt.text}}.</text>
            {{opt.content}}
          </view>
        </view>
        <view style="margin-top: 5px">
          答案：
          <text v-for="(ans,idx) in item.answer">
            {{ans}}
          </text>
        </view>
        <view style="margin-top: 5px;color: #dd524d">分数：{{item.score}}</view>
      </view>
    </view>
    <!--新增题目-->
    <block>
      <view class="uni-group" style="margin-top: 50px" v-if="questionType==0">
        <button type="primary" class="uni-button" @click="questionType=1">增加选择题</button>
        <button type="warn" class="uni-button" @click="questionType=2">增加判断题</button>
      </view>
      <view class="uni-group" style="width: 100%" v-else>
        <!--=========================选择题===================-->
        <block v-if="questionType==1">
          <uni-forms class="uni-forms question-content" ref="form1" v-model="questionChoose" :rules="rules"
                     validateTrigger="bind" @submit="submit">
            <uni-forms-item name="index">
              <view style="font-weight: bold">第{{questionList.length + 1}}题</view>
            </uni-forms-item>
            <uni-forms-item name="title" label="问题题目">
              <input placeholder="请输入问题题目" @input="binddata('title', $event.detail.value)" class="uni-input-border"
                     :value="questionChoose.title"/>
            </uni-forms-item>
            <uni-forms-item name="options" label="答案选项">
              <view class="hor-layout-center" v-for="(item,index) in questionChoose.options">
                <text>{{item.text}}</text>
                <input style="margin-left: 10px;width: 80%" placeholder="请输入答案项"
                       @input="item.content=$event.detail.value"
                       class="uni-input-border" :value="item.content"/>
              </view>
            </uni-forms-item>
            <uni-forms-item name="answer" label="问题答案">
              <uni-data-checklist multiple :range="questionOpts" :value="questionChoose.answer"
                                  @change="binddata('answer', $event.detail.value)"></uni-data-checklist>
            </uni-forms-item>
            <uni-forms-item name="score" label="问题分数">
              <input placeholder="请输入问题分数" @input="binddata('score', $event.detail.value)" class="uni-input-border"
                     :value="questionChoose.score"/>
            </uni-forms-item>
            <view class="uni-button-group">
              <button style="width: 100px;" type="primary" class="uni-button" @click="submitForm('form1')">提交</button>
              <button style="width: 100px;" type="warn" class="uni-button" @click="questionType=0">返回</button>
            </view>
          </uni-forms>
        </block>
        <!--=========================判断题==========================-->
        <block v-if="questionType==2">
          <uni-forms class="uni-forms question-content" ref="form1" v-model="questionDecide" :rules="rules"
                     validateTrigger="bind"
                     @submit="submit">
            <uni-forms-item name="question_index">
              <view>第{{}}题</view>
            </uni-forms-item>
            <uni-forms-item name="question_title" label="问题题目">
              <input placeholder="请输入问题题目" @input="binddata('username', $event.detail.value)" class="uni-input-border"
                     :value="formData.username"/>
            </uni-forms-item>
            <uni-forms-item name="question_answer" label="问题答案">

            </uni-forms-item>
          </uni-forms>
        </block>
      </view>
    </block>
  </view>
</template>

<script>
import validator from '@/js_sdk/validator/question.js';

const db = uniCloud.database();
const dbCmd = db.command;
const dbCollectionName = 'question';

function getValidator(fields) {
  let reuslt = {}
  for (let key in validator) {
    if (fields.includes(key)) {
      reuslt[key] = validator[key]
    }
  }
  return reuslt
}

export default {
  data() {
    return {
      questionOpts: [{"text": "A", "value": 'A'},
        {"text": "B", "value": "B"},
        {"text": "C", "value": "C"},
        {"text": "D", "value": "D"}],
      questionList: [],
      questionType: 0,
      questionChoose: {
        "index": 0,
        "title": "",
        "options": [{"text": "A", "content": ''},
          {"text": "B", "content": ""},
          {"text": "C", "content": ""},
          {"text": "D", "content": ""}],
        "answer": [],
        "score": "5"
      },
      questionDecide: {
        "username": "",
      },
      formData: {
        "username": "1",
        "password": "",
        "role": [],
        "mobile": "",
        "email": "",
        "status": true //默认启用
      },
      rules: {
        ...getValidator(["title", "options", "answer", "score"])
      },
      roles: []
    }
  },
  computed: {},
  onLoad() {
    this.getQuestionList()
  },
  methods: {
    getQuestionList() {
      db.collection(dbCollectionName).limit(100).get().then(res => {
        this.questionList = res.result.data
      }).catch(err => {
        uni.showModal({
          title: '提示',
          content: err.message,
          showCancel: false
        })
      })
    },
    submitForm(formId) {
      this.$refs[formId].submit();
    },
    submit(event) {
      const {
        value,
        errors
      } = event.detail

      // 表单校验失败页面会提示报错 ，要停止表单提交逻辑
      if (errors) {
        return
      }
      uni.showLoading({
        title: '提交中...',
        mask: true
      })
      // 使用 uni-clientDB 提交数据
      db.collection(dbCollectionName).add(value).then((res) => {
        uni.showToast({
          title: '新增成功'
        })
      }).catch((err) => {
        uni.showModal({
          content: err.message || '请求服务失败',
          showCancel: false
        })
      }).finally(() => {
        uni.hideLoading()
        this.questionType = 0
        this.getQuestionList()
      })
    }
  }
}
</script>
<style>
.question-content {
  color: white;
  width: 80%;
  background: #f0f5ff;
  max-width: 80% !important;
  border-radius: 10px;
  border: 1px silver solid;
  margin-top: 30px;
}
</style>
