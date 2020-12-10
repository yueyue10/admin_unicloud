<template>
	<view class="uni-container">
		<!--=========================选择题逻辑===================-->
		<uni-forms v-if="questionType==0" ref="form1" v-model="questionChoose" :rules="rules" validateTrigger="bind" @submit="submit" >
			<uni-forms-item name="title" label="问题题目">
				<input :disabled="formDataFlag?true:false" placeholder="请输入问题题目" @input="questionChoose.title=$event.detail.value" class="uni-input-border" :value="questionChoose.title" />
			</uni-forms-item>
			<uni-forms-item name="options" label="答案选项">
				<view class="hor-layout-center" v-for="(item,index) in questionChoose.options">
					<text>{{item.text}}</text>
					<input :disabled="formDataFlag?true:false" style="margin-left: 10px;width: 80%" placeholder="请输入答案项" @input="item.content=$event.detail.value" class="uni-input-border"
					 :value="item.content" />
				</view>
			</uni-forms-item>
			<uni-forms-item name="answer" label="问题答案">
				<uni-data-checklist multiple :range="questionOpts" :value="questionChoose.answer" @change="formDataFlag?'':questionChoose.answer=$event.detail.value"></uni-data-checklist>
			</uni-forms-item>
			<uni-forms-item name="score" label="问题分数">
				<input :disabled="formDataFlag?true:false" placeholder="请输入问题分数" @input="questionChoose.score=$event.detail.value" class="uni-input-border" :value="questionChoose.score"
				 type="number" />
			</uni-forms-item>
			<view class="uni-button-group">
				<button v-if="!formDataFlag" style="width: 100px;" type="primary" class="uni-button" @click="submitForm('form1')">提交</button>
				<navigator open-type="navigateBack" style="margin-left: 15px;"><button style="width: 100px;" class="uni-button">返回</button></navigator>
			</view>
		</uni-forms>
		<!--=========================判断题逻辑===================-->
		<uni-forms v-if="questionType==1" ref="form2" v-model="questionDecide" :rules="rules" validateTrigger="bind" @submit="submit">
			<uni-forms-item name="title" label="问题题目">
				<input :disabled="formDataFlag?true:false" placeholder="请输入问题题目" @input="binddata('title', $event.detail.value)" class="uni-input-border" :value="questionDecide.title" />
			</uni-forms-item>
			<uni-forms-item name="decide" label="问题答案">
				<uni-data-checklist :range="questionDecs" :value="getDecideAns" @change="formDataFlag?'':changeDecideAns"></uni-data-checklist>
			</uni-forms-item>
			<uni-forms-item name="score" label="问题分数">
				<input :disabled="formDataFlag?true:false" placeholder="请输入问题分数" @input="binddata('score', $event.detail.value)" class="uni-input-border" :value="questionDecide.score"
				 type="number" />
			</uni-forms-item>
			<view class="uni-button-group">
				<button v-if="!formDataFlag" style="width: 100px;" type="primary" class="uni-button" @click="submitForm('form2')">提交</button>
				<navigator open-type="navigateBack" style="margin-left: 15px;"><button style="width: 100px;" class="uni-button">返回</button></navigator>
			</view>
		</uni-forms>
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
				questionChoose: {
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
					"title": "",
					"decide": true,
					"score": 1
				},
				questionType: -1,
				formDataId: '',
				formDataFlag: '',
				rules: {
					...getValidator(["title", "options", "answer", "score"])
				}
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
		},
		onLoad(e) {
			const id = e.id
			this.formDataId = id
			this.formDataFlag = e.flag || ''
			this.getDetail(id)
		},
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
				// alert(JSON.stringify(value))
				// 表单校验失败页面会提示报错 ，要停止表单提交逻辑
				if (errors)
					return
				uni.showLoading({
					title: '修改中...',
					mask: true
				})

				// 使用 uni-clientDB 提交数据
				db.collection(dbCollectionName).where({
					_id: this.formDataId
				}).update(value).then((res) => {
					uni.showToast({
						title: '修改成功'
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
			},
			getDetail(id) {
				uni.showLoading({
					mask: true
				})
				db.collection(dbCollectionName).where({
					_id: id
				}).get().then((res) => {
					const data = res.result.data[0]
					console.log("data============", data)
					this.questionType = data.type
					if (data.type == 0) {
						this.questionChoose = data
					} else {
						this.questionDecide = data
					}
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
