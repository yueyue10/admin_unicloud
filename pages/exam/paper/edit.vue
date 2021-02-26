<template>
	<view class="uni-container">
		<view class="uni-group">
			<view class="uni-title" style="font-weight: bolder;font-size: x-large;">
				{{formDataFlag?'试卷详情':'修改试卷'}}
			</view>
			<view style="color: #dd524d">总分:{{getTotalScore}}</view>
		</view>
		<view class="uni-container">
			<!-- 试卷图片 -->
			<view class="hor-layout-center" style="margin-top: 50px;margin-bottom: 15px;">
				<view style="color: red;font-weight: bold;margin: 0px 3px;">*</view>
				<view style="font-weight: bold;margin-right: 15px;">试卷图片</view>
				<image v-if="paperPic" :src="paperPic" mode="heightFix" style="height:100px;margin-right:10px;" @click="showPaperImage"></image>
				<button style="margin-left: 0px;" type="primary" size="mini" @click="uploadImage">{{paperPic?'修改':'上传'}}</button>
			</view>
			<!-- 试卷题目 -->
			<view class="hor-layout-center" style="margin-top: 50px;margin-bottom: 15px;">
				<view style="color: red;font-weight: bold;margin: 0px 3px;">*</view>
				<view style="font-weight: bold;margin-right: 15px;">试卷题目</view>
				<input disabled="!formDataFlag" placeholder="请输入试卷题目" @input="paperTitle=$event.detail.value" style="width: 50%"
				 class="uni-input-border" :value="paperTitle" />
			</view>
			<!-- 选择角色 -->
			<view class="hor-layout-center" style="margin-bottom: 15px;">
				<view style="color: red;font-weight: bold;margin: 0px 3px;">*</view>
				<view style="font-weight: bold;margin-right: 15px;">考生职称</view>
				<uni-data-checklist multiple :range="roles" :value="selRoles" @change="formDataFlag?'':selRoles= $event.detail.value"></uni-data-checklist>
			</view>
			<!-- 考试时间 -->
			<view class="hor-layout-center" style="margin-bottom: 15px;">
				<view style="color: red;font-weight: bold;margin: 0px 3px;">*</view>
				<view style="font-weight: bold;margin-right: 15px;">考试时间</view>
				<el-date-picker :disabled="formDataFlag?true:false" v-model="selTime" type="datetimerange" range-separator="至"
				 format="yyyy-MM-dd HH:mm" value-format="timestamp" start-placeholder="开始日期" end-placeholder="结束日期" align="left">
				</el-date-picker>
			</view>
			<!--所有题目-->
			<view class="question-list" v-if="questionList&&questionList.length>0">
				<view v-for="(item,index) in questionList" :key="item._id">
					<view style="font-weight: bolder;margin-top: 20px">
						{{index + 1}}、{{item.title}}
						<text v-if="item.type==0">【选择题】</text>
						<text v-else>【判断题】</text>
						<text style="margin-left: 23px;color: #dd9883;font-weight: normal;">分数：{{item.score}}</text>
						<uni-icons v-if="!formDataFlag" class="uni-icons-trash" style="color: #00FF00;padding: 5px;" @click="deleteQueAlert(item)"></uni-icons>
						<uni-icons v-if="!formDataFlag" class="uni-icons-compose" style="color: #007aff;" @click="updateQuePop(item,index)"></uni-icons>
					</view>
					<view v-if="item.options&&item.options.length>0" class="hor-layout-center" style="margin-top: 7px;margin-left: 13px;">
						<view v-for="(opt,idx) in item.options" style="margin: 0px 10px">
							<text style="color: #8e8ed3">{{opt.text}}.</text>
							<text>{{opt.content}}</text>
						</view>
					</view>
					<view style="margin-top: 7px;margin-left: 23px;">
						答案：
						<block v-if="item.type==0">
							<text v-for="(ans,idx) in item.answer">
								{{idx==0?'':'、'}}{{ans}}
							</text>
						</block>
						<block v-else>
							<text v-if="item.decide">正确</text>
							<text v-if="!item.decide">错误</text>
						</block>
					</view>
					<!-- <view style="margin-top: 7px;margin-left: 23px;color: #dd524d">分数：{{item.score}}</view> -->
				</view>
			</view>
		</view>

		<!--新增题目-->
		<view class="uni-group question-action hor-layout-side" style="width: 80%;" v-if="questionType==0">
			<button v-if="!formDataFlag" type="warn" class="uni-button" @click="updatePaper">修改试卷</button>
			<view class="hor-layout">
				<button v-if="!formDataFlag" type="primary" class="uni-button" @click="addQuePop('choose_popup')">增加选择题</button>
				<button v-if="!formDataFlag" type="primary" class="uni-button" @click="addQuePop('decide_popup')">增加判断题</button>
				<navigator open-type="navigateBack" style="margin-left: 15px;">
					<button style="width: 100px;" class="uni-button">返回</button>
				</navigator>
			</view>
		</view>
		<!--=========================新增选择题弹窗===================-->
		<uni-popup ref="choose_popup" popupConWidth="90%">
			<view class="uni-group question-content">
				<uni-forms class="uni-forms" style="width: 90%;max-width: 90%;" ref="form1" v-model="questionChoose" :rules="rules"
				 validateTrigger="bind" @submit="submitQuestion">
					<uni-forms-item name="_id" v-if="questionId">
						<view style="font-weight: bold;text-align: center;">ID:{{questionId}}</view>
					</uni-forms-item>
					<uni-forms-item name="index">
						<view style="font-weight: bold">第{{questionChoose.index+1}}题</view>
					</uni-forms-item>
					<uni-forms-item name="title" label="问题题目">
						<input placeholder="请输入问题题目" @input="binddata('title', $event.detail.value)" class="uni-input-border" :value="questionChoose.title" />
					</uni-forms-item>
					<uni-forms-item name="options" label="答案选项">
						<view class="hor-layout-center" v-for="(item,index) in questionChoose.options">
							<text>{{item.text}}</text>
							<input style="margin-left: 10px;width: 80%" placeholder="请输入答案项" @input="item.content=$event.detail.value" class="uni-input-border"
							 :value="item.content" />
						</view>
					</uni-forms-item>
					<uni-forms-item name="answer" label="问题答案">
						<uni-data-checklist multiple :range="questionOpts" :value="questionChoose.answer" @change="binddata('answer', $event.detail.value)"></uni-data-checklist>
					</uni-forms-item>
					<uni-forms-item name="score" label="问题分数">
						<input placeholder="请输入问题分数" @input="binddata('score', $event.detail.value)" class="uni-input-border" :value="questionChoose.score"
						 type="number" />
					</uni-forms-item>
					<view class="uni-button-group">
						<button style="width: 100px;" type="primary" class="uni-button" @click="submitForm('form1')">提交</button>
						<button style="width: 100px;" type="warn" class="uni-button" @click="closePopup('choose_popup')">返回</button>
					</view>
				</uni-forms>
			</view>
		</uni-popup>
		<!--=========================新增判断题弹窗==========================-->
		<uni-popup ref="decide_popup" popupConWidth="90%">
			<view class="uni-group question-content">
				<uni-forms class="uni-forms" style="width: 90%;max-width: 90%;" ref="form2" v-model="questionDecide" :rules="rules"
				 validateTrigger="bind" @submit="submitQuestion">
					<uni-forms-item name="_id" v-if="questionId">
						<view style="font-weight: bold;text-align: center;">ID:{{questionId}}</view>
					</uni-forms-item>
					<uni-forms-item name="index">
						<view style="font-weight: bold">第{{questionDecide.index+1}}题</view>
					</uni-forms-item>
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
						<button style="width: 100px;" type="warn" class="uni-button" @click="closePopup('decide_popup')">返回</button>
					</view>
				</uni-forms>
			</view>
		</uni-popup>
		<!-- 试卷图片 -->
		<uni-popup ref="paperImg_popup" popupConWidth="60%">
			<view class="popup-image" @click="closeImagePopup">
				<h4 style="margin: 20px 0px;">试卷图片：</h4>
				<image :src="paperPic" mode="aspectFit" style="width:100%;height:50vh;"></image>
			</view>
		</uni-popup>
	</view>
</template>

<script>
	import addData from './add-data'
	import UniIcons from "@/components/uni-icons/uni-icons";
	import uploadFile from '@/js_sdk/ossutil/uploadFile.js'
	const db = uniCloud.database();
	const dbCmd = db.command;

	export default {
		components: {
			UniIcons
		},
		data() {
			return addData
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
		onLoad(event) {
			this.paperId = event.id
			this.formDataFlag = event.flag
			this.loadroles()
			this.getPaperDetail()
		},
		methods: { //修改判断题答案
			changeDecideAns(event) {
				let decide = event.detail.data.decide
				this.questionDecide.decide = decide
			}, //提交表单
			submitForm(formId) {
				this.$refs[formId].submit();
			}, //显示弹窗
			openPopup(popFlag) {
				this.questionType = 1
				this.$refs[popFlag].open()
			}, //添加问题弹窗
			addQuePop(popFlag) {
				this.questionChoose.index = this.questionList.length
				this.questionDecide.index = this.questionList.length
				if (popFlag === 'choose_popup') {
					this.clearQuestionChoose()
				} else {
					this.clearQuestionDecide()
				}
				this.openPopup(popFlag)
			}, //更新问题
			updateQuePop(queItem, queIndex) {
				queItem.index = queIndex
				this.questionId = queItem._id
				if (queItem.type == 0) {
					this.questionChoose = queItem
					this.openPopup('choose_popup')
				} else {
					this.questionDecide = queItem
					this.openPopup('decide_popup')
				}
			}, //关闭弹窗
			closePopup(popFlag) {
				this.questionType = 0
				this.$refs[popFlag].close()
			}, //清空选择题答案
			clearQuestionChoose() {
				this.questionId = 0
				let questionChoose = this.questionChoose
				questionChoose.title = ''
				questionChoose.score = 1
				questionChoose.answer = []
				questionChoose.options.forEach(opt => {
					opt.content = ''
				})
				this.questionChoose = questionChoose
			}, //清空判断题答案
			clearQuestionDecide() {
				this.questionId = 0
				let questionDecide = this.questionDecide
				questionDecide.title = ''
				questionDecide.score = 1
				questionDecide.decide = true
				this.questionDecide = questionDecide
			}, //删除问题提示
			deleteQueAlert(queItem) {
				uni.showModal({
					title: '提示',
					content: "确认删除？",
					showCancel: true,
					success: (res) => {
						if (res.cancel)
							return
						uni.showLoading({
							title: '提交中...',
							mask: true
						})
						this.deleteQuestion(queItem)
					}
				})
			}, //提交问题/修改问题
			submitQuestion(event) {
				const {
					value,
					errors
				} = event.detail
				// 表单校验失败页面会提示报错 ，要停止表单提交逻辑
				if (errors)
					return
				value.type = value.answer ? 0 : 1
				value.status = 1 //已经添加到试卷里面，所以状态为已发布
				uni.showLoading({
					title: '提交中...',
					mask: true
				})
				let questionId = this.questionId //操作类型
				let actionTitle = questionId ? '修改成功' : '新增成功'
				let queProcess = questionId ? this.updateQuestion(value) : this.addQuestion(value)
				queProcess.then((res) => {
					uni.showToast({
						title: actionTitle
					})
					if (!questionId) { //如果是新增问题的话，清空问题内容
						if (value.type == 0) {
							this.clearQuestionChoose()
						} else {
							this.clearQuestionDecide()
						}
					}
					//隐藏对应类型的问题弹窗
					if (value.type == 0) {
						this.closePopup('choose_popup')
					} else {
						this.closePopup('decide_popup')
					}
				}).catch((err) => {
					uni.showModal({
						content: err.message || '请求服务失败',
						showCancel: false
					})
				}).finally(() => {
					uni.hideLoading()
					this.getPaperDetail()
					this.questionAction = 0
				})
			}, //添加问题
			addQuestion(value) {
				return this.$request('exam/paper/addQuestion', {
					question: value,
					paperId: this.paperId
				}, {
					showModal: false
				})
			}, //修改问题
			updateQuestion(value) {
				return this.$request('exam/paper/updateQuestion', {
					question: value,
					questionIdex: value.index,
					paperId: this.paperId
				}, {
					showModal: false
				})
			}, //删除问题
			deleteQuestion(queItem) {
				this.$request('exam/paper/removeQuestion', {
					questionId: queItem._id,
					questionIdex: queItem.index,
					paperId: this.paperId
				}, {
					showModal: false
				}).then(res => {
					uni.showToast({
						title: "删除成功！"
					})
				}).catch((err) => {
					uni.showModal({
						content: err.message || '请求服务失败',
						showCancel: false
					})
				}).finally(() => {
					uni.hideLoading()
					this.getPaperDetail()
					this.questionAction = 0
				})
			},
			// 获取试卷详情
			getPaperDetail() {
				db.collection("paper").doc(this.paperId).get().then(res => {
					let result = res.result.data[0]
					this.questionList = result.question_list
					this.paperTitle = result.title
					this.paperPic = result.image
					this.selRoles = result.user_role
					let selTime = []
					selTime.push(result.start_time)
					selTime.push(result.end_time)
					this.selTime = selTime
				}).catch(err => {
					alert(JSON.stringify(err))
				})
			},
			// 更新试卷
			updatePaper() {
				let errorMsg = ''
				if (this.questionList.length <= 0)
					errorMsg = '请填写试题'
				if (this.selRoles.length <= 0)
					errorMsg = '请选择角色'
				if (!this.paperTitle)
					errorMsg = '请填写试卷题目'
				if (errorMsg) {
					uni.showModal({
						title: "提示",
						content: errorMsg,
						showCancel: false
					})
					return
				}
				let value = {
					title: this.paperTitle,
					image: this.paperPic,
					user_role: this.selRoles,
					start_time: this.selTime[0],
					end_time: this.selTime[1]
				}
				// 更新paper表数据
				db.collection("paper").doc(this.paperId).update(value).then(res => {
					uni.showToast({
						title: '更新成功'
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
			loadroles() {
				db.collection('uni-id-roles').limit(500).get().then(res => {
					this.roles = res.result.data.map(item => {
						return {
							value: item.role_id,
							text: item.role_name
						}
					})
					// this.roles.unshift({
					// 	value: 'admin',
					// 	text: 'admin'
					// })
				}).catch(err => {
					uni.showModal({
						title: '提示',
						content: err.message,
						showCancel: false
					})
				})
			},
			uploadImage() {
				// todo 如果之前已经存在，需要先删除图片
				uni.chooseImage({
					count: 1
				}).then(res => {
					debugger
					let path = res[1].tempFilePaths[0]
					uploadFile(path, 'work', (res) => {
						debugger
						console.log(res)
						this.paperPic = res
					}, (err) => {
						console.error(err)
					})
				})
			},
			showPaperImage() {
				this.$refs['paperImg_popup'].open()
			},
			closeImagePopup() {
				this.$refs['paperImg_popup'].close()
			}
		}
	}
</script>
<style>
	.question-list {
		border: #2C405A solid 3px;
		border-radius: 10px;
		padding: 20px;
		padding-top: 0px;
		margin: 25px;
	}

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

	.popup-image {
		padding: 10px;
		background: white;
		text-align: center;
	}
</style>
