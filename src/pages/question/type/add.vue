<template>
  <view class="uni-container">
    <view class="uni-group">
      <view class="uni-title" style="font-weight: bolder">新增试题</view>
      <view style="color: #dd524d">总分:{{getTotalScore}}</view>
    </view>
    <view class="uni-container">
      <!--所有题目-->
      <view v-for="(item,index) in questionList">
        <view style="font-weight: bolder;margin-top: 20px">
          {{index + 1}}、{{item.title}}
          <text v-if="item.answer&&item.answer.length>0">【选择题】</text>
          <text v-else>【判断题】</text>
          <uni-icons class="uni-icons-trash" @click="deleteQuestion(item._id)"></uni-icons>
        </view>
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
          <text v-if="item.decide">正确</text>
          <text v-if="!item.decide">错误</text>
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
                     :value="questionChoose.score" type="number"/>
            </uni-forms-item>
            <view class="uni-button-group">
              <button style="width: 100px;" type="primary" class="uni-button" @click="submitForm('form1')">提交</button>
              <button style="width: 100px;" type="warn" class="uni-button" @click="questionType=0">返回</button>
            </view>
          </uni-forms>
        </block>
        <!--=========================判断题==========================-->
        <block v-if="questionType==2">
          <uni-forms class="uni-forms question-content" ref="form2" v-model="questionDecide" :rules="rules"
                     validateTrigger="bind" @submit="submit">
            <uni-forms-item name="index">
              <view style="font-weight: bold">第{{questionList.length + 1}}题</view>
            </uni-forms-item>
            <uni-forms-item name="title" label="问题题目">
              <input placeholder="请输入问题题目" @input="binddata('title', $event.detail.value)" class="uni-input-border"
                     :value="questionDecide.title"/>
            </uni-forms-item>
            <uni-forms-item name="decide" label="问题答案">
              <uni-data-checklist :range="questionDecs" :value="getDecideAns"
                                  @change="changeDecideAns"></uni-data-checklist>
            </uni-forms-item>
            <uni-forms-item name="score" label="问题分数">
              <input placeholder="请输入问题分数" @input="binddata('score', $event.detail.value)" class="uni-input-border"
                     :value="questionDecide.score" type="number"/>
            </uni-forms-item>
            <view class="uni-button-group">
              <button style="width: 100px;" type="primary" class="uni-button" @click="submitForm('form2')">提交</button>
              <button style="width: 100px;" type="warn" class="uni-button" @click="questionType=0">返回</button>
            </view>
          </uni-forms>
        </block>
      </view>
    </block>
  </view>
</template>

<script>
import validator from '@/js_sdk/validator/question.js';
import UniIcons from "@/components/uni-icons/uni-icons";

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
  components: {UniIcons},
  data() {
    return {
      questionDecs: [{"text": "正确", "value": '正确', "decide": true},
        {"text": "错误", "value": '错误', "decide": false}],
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
        "score": 1
      },
      questionDecide: {
        "index": 0,
        "title": "",
        "decide": true,
        "score": 1
      },
      rules: {
        ...getValidator(["title", "options", "answer", "score"])
      },
      roles: []
    }
  },
  computed: {
    getDecideAns() {
      let decide = this.questionDecide.decide
      let questionDecs = this.questionDecs
      let queDesValue = ''
      questionDecs.forEach(que => {
        if (que.decide == decide)
          queDesValue = que.value
      })
      return queDesValue
    },
    getTotalScore() {
      let questionList = this.questionList
      let totalScore = 0
      questionList.forEach(que => {
        totalScore = totalScore + que.score
      })
      return totalScore
    }
  },
  onLoad() {
    this.getQuestionList()
  },
  methods: {
    changeDecideAns(event) {
      let decide = event.detail.data.decide
      this.questionDecide.decide = decide
    },
    submitForm(formId) {
      this.$refs[formId].submit();
    },
    clearQuestionChoose() {
      let questionChoose = this.questionChoose
      questionChoose.title = ''
      questionChoose.score = 1
      questionChoose.answer = []
      questionChoose.options.forEach(opt => {
        opt.content = ''
      })
      this.questionChoose = questionChoose
    },
    clearQuestionDecide() {
      let questionDecide = this.questionDecide
      questionDecide.title = ''
      questionDecide.score = 1
      questionDecide.decide = true
      this.questionDecide = questionDecide
    },
    getQuestionList() {
      db.collection(dbCollectionName).limit(100).get().then(res => {
        console.log("res.result.data", res.result.data)
        this.questionList = res.result.data
      }).catch(err => {
        uni.showModal({
          title: '提示',
          content: err.message,
          showCancel: false
        })
      })
    },
    deleteQuestion(queId) {
      uni.showModal({
        title: '提示',
        content: "确认删除？",
        showCancel: true,
        success: (res) => {
          if(res.cancel)
            return
          uni.showLoading({
            title: '提交中...',
            mask: true
          })
          db.collection(dbCollectionName).doc(queId).remove().then(res => {
            uni.showToast({
              title: '删除成功'
            })
          }).catch(err => {
            uni.showModal({
              title: '提示',
              content: err.message,
              showCancel: false
            })
          }).finally(() => {
            uni.hideLoading()
            this.getQuestionList()
          })
        }
      })
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
        if (value.answer && value.answer.length > 0) {
          this.clearQuestionChoose()
        }else {
          this.clearQuestionDecide()
        }
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
