<template>
	<view class="uni-container">
		<view class="uni-group">
			<view class="uni-title" style="font-weight: bolder;font-size: x-large;">
				考试详情
			</view>
			<view style="color: #dd9883">总分:{{getTotalScore[0]}}</view>
			<view style="margin-left: 15px;color: #dd0e06;font-weight: bold;">得分:{{getTotalScore[1]}}</view>
		</view>
		<view class="uni-container">
			<!-- 试卷题目 -->
			<view class="hor-layout-center" style="margin-top: 50px;margin-bottom: 15px;">
				<view style="font-weight: bold;margin-right: 15px;">试卷题目</view>
				<input disabled placeholder="请输入试卷题目" style="width: 50%" :value="paperTitle" />
			</view>
			<!-- 选择角色 -->
			<view class="hor-layout-center" style="margin-bottom: 15px;">
				<view style="font-weight: bold;margin-right: 15px;">考生职称</view>
				<label v-for="(opt,ind) in selRoles">
					{{opt.role_name}}.
					<checkbox checked disabled color="#FFCC33" style="transform:scale(0.7)" />
				</label>
			</view>
			<!-- 试卷时间 -->
			<view class="hor-layout-center" style="margin-bottom: 15px;">
				<view style="font-weight: bold;margin-right: 15px;">试卷时间</view>
				<el-date-picker disabled v-model="selTime" type="datetimerange" range-separator="至" format="yyyy-MM-dd HH:mm"
				 value-format="timestamp" start-placeholder="开始日期" end-placeholder="结束日期" align="left">
				</el-date-picker>
			</view>
			<!-- 答题时间 -->
			<view class="hor-layout-center" style="margin-bottom: 15px;">
				<view style="font-weight: bold;margin-right: 15px;">答题时间</view>
				<el-date-picker disabled v-model="examInfo.create_date" type="datetime" range-separator="至" format="yyyy-MM-dd HH:mm"
				 value-format="timestamp" align="left">
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
					</view>
					<view v-if="item.options&&item.options.length>0" class="hor-layout-center" style="margin-top: 7px;margin-left: 13px;">
						<view v-for="(opt,idx) in item.options" style="margin: 0px 10px">
							<text style="color: #8e8ed3">{{opt.text}}.</text>
							<text>{{opt.content}}</text>
						</view>
					</view>
					<view class="hor-layout-center" style="margin-top: 7px;margin-left: 23px;">
						<view style="color: #0055ff;">
							<text style="color: #000000;">正确答案：</text>
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
						<view style="margin-left: 20px;color: #aa00ff;">
							<text style="color: #000000;">用户答案：</text>
							<block v-if="item.type==0">
								<text v-for="(ans,idx) in item.uAnswer">
									{{idx==0?'':'、'}}{{ans}}
								</text>
							</block>
							<block v-else>
								<text v-if="item.uDecide=='true'">正确</text>
								<text v-else>错误</text>
							</block>
						</view>
					</view>
					<view style="margin-top: 7px;margin-left: 23px;color: #dd0e06;">得分：{{item.uScore}}</view>
				</view>
			</view>
		</view>
		<view class="uni-button-group" style="position: fixed;bottom: 20px;left: 50%;">
			<button style="width: 100px;" type="default" class="uni-button" @click="backClick">返回</button>
		</view>
	</view>
</template>

<script>
	import validator from '@/js_sdk/validator/question.js';
	import UniIcons from "@/components/uni-icons/uni-icons";

	const db = uniCloud.database();
	const dbCmd = db.command;

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
				questionList: [],
				questionType: 0,
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
				selRoles: [],
				paperTitle: '',
				paperId: '',
				questionId: '',
				formDataFlag: '',
				roles: [],
				selTime: [],
				examInfo: {}
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
				let uTotalScore = 0
				questionList.forEach(que => {
					totalScore = totalScore + que.score
					uTotalScore = uTotalScore + que.uScore
				})
				return [totalScore, uTotalScore]
			}
		},
		onLoad(event) {
			this.examId = event.id
			this.getExamDetail()
		},
		methods: {
			// 获取考试详情
			getExamDetail() {
				db.collection('exam,uni-id-users,uni-id-roles').doc(this.examId).field(
					'title,userId{username},user_role{role_name},start_time,end_time,question_list,create_date,paperId,userId,uTotalScore'
				).get().then(res => {
					let result = res.result.data[0]
					console.log(result)
					this.examInfo = result
					this.questionList = result.question_list
					this.paperTitle = result.title
					this.selRoles = result.user_role
					let selTime = []
					selTime.push(result.start_time)
					selTime.push(result.end_time)
					this.selTime = selTime
				})
			},
			backClick() {
				uni.navigateBack({})
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
</style>
