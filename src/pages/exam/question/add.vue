<template>
	<view class="uni-container">
		<view class="uni-group">
		  <view class="uni-title" style="font-weight: bolder">新增考题</view>
		</view>
		<!--新增题目-->
		<view class="uni-group question-action hor-layout" style="width: 80%;" v-if="questionType==-1">
			<button type="primary" class="uni-button" @click="questionType=0">增加选择题</button>
			<button type="primary" class="uni-button" @click="questionType=1">增加判断题</button>
			<navigator open-type="navigateBack" style="margin-left: 15px;">
				<button style="width: 100px;" class="uni-button">返回</button>
			</navigator>
		</view>
		<!--=========================选择题逻辑===================-->
		<uni-forms v-if="questionType==0" ref="form1" v-model="questionChoose" :rules="rules" validateTrigger="bind" @submit="submit">
			<uni-forms-item name="title" label="问题题目">
				<input placeholder="请输入问题题目" @input="questionChoose.title=$event.detail.value" class="uni-input-border" :value="questionChoose.title" />
			</uni-forms-item>
			<uni-forms-item name="options" label="答案选项">
				<view class="hor-layout-center" v-for="(item,index) in questionChoose.options">
					<text>{{item.text}}</text>
					<input style="margin-left: 10px;width: 80%" placeholder="请输入答案项" @input="item.content=$event.detail.value" class="uni-input-border"
					 :value="item.content" />
				</view>
			</uni-forms-item>
			<uni-forms-item name="answer" label="问题答案">
				<uni-data-checklist multiple :range="questionOpts" :value="questionChoose.answer" @change="questionChoose.answer=$event.detail.value"></uni-data-checklist>
			</uni-forms-item>
			<uni-forms-item name="score" label="问题分数">
				<input placeholder="请输入问题分数" @input="questionChoose.score=$event.detail.value" class="uni-input-border" :value="questionChoose.score"
				 type="number" />
			</uni-forms-item>
			<view class="uni-button-group">
				<button style="width: 100px;" type="primary" class="uni-button" @click="submitForm('form1')">提交</button>
				<button style="width: 100px;" type="warn" class="uni-button" @click="questionType=-1">返回</button>
			</view>
		</uni-forms>
		<!--=========================判断题逻辑===================-->
		<uni-forms v-if="questionType==1" ref="form2" v-model="questionDecide" :rules="rules" validateTrigger="bind" @submit="submit">
			<uni-forms-item name="title" label="问题题目">
				<input placeholder="请输入问题题目" @input="binddata('title', $event.detail.value)" class="uni-input-border" :value="questionDecide.title" />
			</uni-forms-item>
			<uni-forms-item name="decide" label="问题答案">
				<uni-data-checklist :range="questionDecs" :value="getDecideAns" @change="changeDecideAns"></uni-data-checklist>
			</uni-forms-item>
			<uni-forms-item name="score" label="问题分数">
				<input placeholder="请输入问题分数" @input="binddata('score', $event.detail.value)" class="uni-input-border" :value="questionDecide.score"
				 type="number" />
			</uni-forms-item>
			<view class="uni-button-group">
				<button style="width: 100px;" type="primary" class="uni-button" @click="submitForm('form2')">提交</button>
				<button style="width: 100px;" type="warn" class="uni-button" @click="questionType=-1">返回</button>
			</view>
		</uni-forms>
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
		components: {
			UniIcons
		},
		data() {
			return {
				questionDecs: [{
						"text": "正确",
						"value": '正确',
						"decide": true
					},
					{
						"text": "错误",
						"value": '错误',
						"decide": false
					}
				],
				questionOpts: [{
						"text": "A",
						"value": 'A'
					},
					{
						"text": "B",
						"value": "B"
					},
					{
						"text": "C",
						"value": "C"
					},
					{
						"text": "D",
						"value": "D"
					}
				],
				questionType: -1,
				questionChoose: {
					"index": 0,
					"title": "",
					"options": [{
							"text": "A",
							"content": ''
						},
						{
							"text": "B",
							"content": ""
						},
						{
							"text": "C",
							"content": ""
						},
						{
							"text": "D",
							"content": ""
						}
					],
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
			}
		},
		onLoad() {},
		methods: {
			changeDecideAns(event) {
				let decide = event.detail.data.decide
				this.questionDecide.decide = decide
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
				value.type = value.answer ? 0 : 1
				value.status = 0
				// alert(JSON.stringify(value))
				uni.showLoading({
					title: '提交中...',
					mask: true
				})
				// 使用 uni-clientDB 提交数据
				db.collection(dbCollectionName).add(value).then((res) => {
					uni.showToast({
						title: '新增成功'
					})
					this.getOpenerEventChannel().emit('refreshData')
					setTimeout(() => uni.navigateBack(), 500)
				}).catch((err) => {
					uni.showModal({
						content: err.message || '请求服务失败',
						showCancel: false
					})
				}).finally(() => {
					uni.hideLoading()
				})
			}
		}
	}
</script>
<style>
	.question-action {
		margin-top: 50px;
		position: fixed;
		bottom: 50px;
		right: 20px;
	}

	.question-content {
		color: white;
		background: #f0f5ff;
		border-radius: 10px;
		border: 1px silver solid;
		margin-top: 30px;
		padding: 20px;
		width: 90%;
	}
</style>
