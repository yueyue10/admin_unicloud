<template>
	<view style="padding: 15px;">
		<view class="grid-view">
			<view style="text-align: center;font-weight: bold;">考试排名</view>
			<view class="hor-layout-center" style="margin-top: 15px;">
				<view>考试时间：</view>
				<el-date-picker v-model="value2" type="month" value-format="yyyyMM" placeholder="选择月" @change="onDateChange"></el-date-picker>
			</view>
			<el-table :data="examRank" height="80%" border style="width: 100%;margin-top: 20px;">
				<el-table-column prop="username" label="姓名">
				</el-table-column>
				<el-table-column prop="uTotalScore" label="分数">
				</el-table-column>
				<el-table-column type="index" label="排名" width="100">
				</el-table-column>
			</el-table>
		</view>
	</view>
</template>

<script>
	import {
		getCurYearMonth
	} from "../../common/comm.js"
	export default {
		data() {
			return {
				value2: '',
				examRank: []
			}
		},
		onLoad() {
			this.value2 = getCurYearMonth()
			this.getExamRank()
		},
		methods: {
			onDateChange() {
				this.getExamRank()
			},
			getExamRank() {
				if (!this.value2) {
					this.examRank = []
					return
				}
				uni.showLoading({
					title: '加载中...',
					mask: true
				})
				this.$request('exam/exam/getExamSort', {
					date: this.value2
				}, {
					showModal: false
				}).then(res => {
					// alert(JSON.stringify(res))
					this.examRank = res.data
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
	.grid-view {
		width: 40%;
		height: 80vh;
		padding: 13px;
		background: #e1f2ff;
		border-radius: 6px;
		box-shadow: 0 0 5px #c9bebf;
	}

	.grid-view:hover {
		background: #d0ebff;
		box-shadow: 0 0 5px #c9b8ba;
	}
</style>
