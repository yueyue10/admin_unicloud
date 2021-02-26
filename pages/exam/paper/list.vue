<template>
	<view>
		<view class="uni-header">
			<view class="uni-group">
				<view class="uni-title"></view>
				<view class="uni-sub-title"></view>
			</view>
			<view class="uni-group">
				<input class="uni-search" type="text" v-model="query" placeholder="请输入搜索内容" />
				<button class="uni-button" type="default" size="mini" @click="search">搜索</button>
				<button class="uni-button" type="default" size="mini" @click="navigateTo('./add')">新增</button>
				<button class="uni-button" type="default" size="mini" @click="delTable" v-if="showDeleteAll">批量删除</button>
			</view>
		</view>
		<view class="uni-container">
			<uni-clientdb ref="udb" :collection="collectionName" :options="options" :where="where" field="" page-data="replace"
			 :orderby="orderby" :getcount="true" :page-size="options.pageSize" :page-current="options.pageCurrent"
			 v-slot:default="{data,pagination,loading,error}">
				<uni-table :loading="loading" :emptyText="error.message || '没有更多数据'" border stripe :type="showDeleteAll?'selection':''"
				 @selection-change="selectionChange">
					<uni-tr>
						<uni-th align="center">题目</uni-th>
						<uni-th align="center">职称</uni-th>
						<uni-th width="170" align="center">考试时间</uni-th>
						<uni-th align="center">状态</uni-th>
						<uni-th width="204" align="center">操作</uni-th>
					</uni-tr>
					<uni-tr v-for="(item,index) in data" :key="index">
						<uni-td align="center">{{item.title}}</uni-td>
						<uni-td align="center">
							<text v-for="(item,index) in getRoleObjs(item.user_role)">{{item.role_name}}</text>
						</uni-td>
						<uni-td align="center">
							<view class="ver-layout">
								<view class="hor-layout">
									<uni-dateformat :date="item.start_time" :threshold="[0, 0]" format="yyyy/MM/dd hh:mm" />
									<text class="question-time">开始</text>
								</view>
								<view class="hor-layout" style="margin-top: 3px;">
									<uni-dateformat :date="item.end_time" :threshold="[0, 0]" format="yyyy/MM/dd hh:mm" />
									<text class="question-time">结束</text>
								</view>
							</view>
						</uni-td>
						<uni-td align="center">
							<text class="question-status" v-if="item.status ==0">编辑中</text>
							<text class="question-status" style="background: #ff0000;" v-if="item.status ==1">已发布考试</text>
							<text class="question-status" style="background: #8c8c8c;" v-if="item.status ==2">考试已结束</text>
						</uni-td>
						<uni-td align="center">
							<view class="uni-group" v-if="item.status==0">
								<button @click="confirmPublish(item)" class="uni-button" size="mini" type="warn">发布考试</button>
								<button @click="navigateTo('./edit?id='+item._id)" class="uni-button" size="mini" type="primary">修改
								</button>
								<button @click="confirmDelete(item)" class="uni-button" size="mini" type="warn">删除</button>
							</view>
							<view class="uni-group" v-if="item.status==1">
								<button @click="resetPaper(item)" class="uni-button" size="mini" type="warn">撤回</button>
								<button @click="navigateTo('./edit?flag=detail&id='+item._id)" class="uni-button" size="mini" type="primary">详情
								</button>
							</view>
							<view class="uni-group" v-if="item.status==2">
								<button @click="navigateTo('./edit?flag=detail&id='+item._id)" class="uni-button" size="mini" type="primary">详情
								</button>
							</view>
						</uni-td>
					</uni-tr>
				</uni-table>
				<view class="uni-pagination-box">
					<uni-pagination show-icon :page-size="pagination.size" v-model="pagination.current" :total="pagination.count"
					 @change="onPageChanged" />
				</view>
			</uni-clientdb>
		</view>
	</view>
</template>

<script>
	const db = uniCloud.database()
	// 表查询配置
	const dbCollectionName = 'paper'
	const dbOrderBy = 'create_date desc' // 排序字段
	const dbSearchFields = [] // 支持模糊搜索的字段列表
	// 分页配置
	const pageSize = 10
	const pageCurrent = 1
	const showDeleteAll = true
	import {
		mapState
	} from 'vuex'

	export default {
		data() {
			return {
				query: '',
				where: '',
				orderby: dbOrderBy,
				collectionName: dbCollectionName,
				options: {
					pageSize,
					pageCurrent
				},
				roleList: [],
				showDeleteAll: showDeleteAll
			}
		},
		computed: {
			...mapState('user', ['userInfo']),
		},
		onLoad() {
			this.getRoleList()
		},
		onShow() {
			this.refreshPaperStatus()
		},
		methods: {
			refreshPaperStatus() {
				this.$request('exam/paper/refreshPaper', {}, {
					showModal: false
				}).then(res => {
					// alert(JSON.stringify(res))
					if (res.updated)
						this.loadData()
				}).catch(err => {
					this.errMsg = err.message
				})
			},
			getRoleObjs(role_ids) {
				let roleList = this.roleList
				let roleObjs = roleList.filter(item => {
					return role_ids.indexOf(item.role_id) > -1
				})
				return roleObjs
			},
			getWhere() {
				const query = this.query.trim()
				if (!query) {
					return ''
				}
				const queryRe = new RegExp(query, 'i')
				return dbSearchFields.map(name => queryRe + '.test(' + name + ')').join(' || ')
			},
			search() {
				const newWhere = this.getWhere()
				const isSameWhere = newWhere === this.where
				this.where = newWhere
				if (isSameWhere) { // 相同条件时，手动强制刷新
					this.loadData()
				}
			},
			loadData(clear = true) {
				// debugger
				this.$refs.udb.loadData({
					clear
				}, () => {
					// debugger
					console.log("ssss")
				})
			},
			onPageChanged(e) {
				this.$refs.udb.loadData({
					current: e.current
				})
			},
			navigateTo(url) {
				uni.navigateTo({
					url,
					events: {
						refreshData: () => {
							this.loadData()
						}
					}
				})
			},
			// 多选处理
			selectedItems() {
				var dataList = this.$refs.udb.dataList
				return this.selectedIndexs.map(i => dataList[i]._id)
			},
			//批量删除
			delTable() {
				const ids = this.selectedItems()
				const currentUserId = this.userInfo._id
				if (ids.includes(currentUserId)) {
					uni.showToast({
						icon: 'none',
						title: '当前账号不能删除自己',
						duration: 1500
					})
					return
				}
				this.$refs.udb.remove(ids)
			},
			// 多选
			selectionChange(e) {
				this.selectedIndexs = e.detail.index
			},
			confirmDelete(item) {
				// this.$refs.udb.remove(item._id)
				uni.showModal({
					title: '提示',
					content: "确认删除试卷？",
					showCancel: true,
					success: (res) => {
						if (res.cancel)
							return
						this.$request('exam/paper/deletePaper', {
							paperId: item._id
						}, {
							showModal: false
						}).then(res => {
							uni.showToast({
								title: '新增成功'
							})
							this.search()
						}).catch(err => {
							uni.showModal({
								content: err.message || '请求服务失败',
								showCancel: false
							})
						}).finally(() => {
							uni.hideLoading()
						})
					}
				})
			},
			confirmPublish(item) {
				uni.showModal({
					title: '提示',
					content: "确认发布试卷？",
					showCancel: true,
					success: (res) => {
						if (res.cancel)
							return
						uni.showLoading({
							title: '提交中...',
							mask: true
						})
						db.collection("paper").where({
							_id: item._id
						}).update({
							status: 1
						}).then(res => {
							uni.showToast({
								title: "发布成功"
							})
							this.search()
						}).catch(err => {
							uni.showModal({
								content: err.message || "请求失败"
							})
						}).finally(() => {
							uni.hideLoading()
						})
					},
				})
			},
			resetPaper(item) {
				uni.showModal({
					title: '提示',
					content: "确认撤回试卷？",
					showCancel: true,
					success: (res) => {
						if (res.cancel)
							return
						uni.showLoading({
							title: '提交中...',
							mask: true
						})
						db.collection("paper").where({
							_id: item._id
						}).update({
							status: 0
						}).then(res => {
							uni.showToast({
								title: "撤回成功"
							})
							this.search()
						}).catch(err => {
							uni.showModal({
								content: err.message || "请求失败"
							})
						}).finally(() => {
							uni.hideLoading()
						})
					},
				})
			},
			getRoleList() {
				this.$request('system/role/list', {}, {
					showModal: false
				}).then(res => {
					this.roleList = res.data
				}).catch(err => {
					this.errMsg = err.message
				}).finally(() => {
					this.loading = false
				})
			}
		}
	}
</script>
<style>
	.question-type,
	.question-status {
		padding: 2px 4px;
		border-radius: 5px;
		font-size: smaller;
	}

	.question-type {
		background: #c0ceb4;
		color: gray;
	}

	.question-status {
		background: #55aaff;
		color: white;
	}

	.question-time {
		background: #55aa7f;
		font-size: xx-small;
		color: white;
		padding: 1px 2px;
		border-radius: 3px;
		margin-left: 2px;
	}
</style>
