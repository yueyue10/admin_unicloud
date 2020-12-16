<template>
  <view>
    <view class="uni-header">
      <view class="uni-group">
        <view class="uni-title"></view>
        <view class="uni-sub-title"></view>
      </view>
      <view class="uni-group">
        <input class="uni-search" type="text" v-model="query" placeholder="请输入搜索内容"/>
        <button class="uni-button" type="default" size="mini" @click="search">搜索</button>
        <button class="uni-button" type="default" size="mini" @click="delTable">批量删除</button>
      </view>
    </view>
    <view class="uni-container">
      <uni-clientdb ref="udb" :collection="collectionName" :options="options" :where="where"
                    field="title,userId{_id,username},uTotalScore,create_date"
                    page-data="replace"
                    :orderby="orderby" :getcount="true" :page-size="options.pageSize"
                    :page-current="options.pageCurrent"
                    v-slot:default="{data,pagination,loading,error}">
        <uni-table :loading="loading" :emptyText="error.message || '没有更多数据'" border stripe type="selection"
                   @selection-change="selectionChange">
          <uni-tr>
            <uni-th align="center">考题</uni-th>
            <uni-th align="center">考生</uni-th>
            <uni-th align="center">得分</uni-th>
            <uni-th width="170" align="center">创建时间</uni-th>
            <uni-th width="204" align="center">操作</uni-th>
          </uni-tr>
          <uni-tr v-for="(item,index) in data" :key="index">
            <uni-td align="center">{{item.title}}</uni-td>
            <uni-td align="center"> {{item.userId ? item.userId.map(item => item.username).join('、') : '-'}}</uni-td>
            <uni-td align="center">{{item.uTotalScore}}</uni-td>
            <uni-td align="center">
              <uni-dateformat :date="item.create_date" :threshold="[0, 0]"/>
            </uni-td>
            <uni-td align="center">
              <view class="uni-group">
                <button @click="navigateTo('./edit?id='+item._id)" class="uni-button" size="mini" type="primary">详情
                </button>
              </view>
            </uni-td>
          </uni-tr>
        </uni-table>
        <view class="uni-pagination-box">
          <uni-pagination show-icon :page-size="pagination.size" v-model="pagination.current" :total="pagination.count"
                          @change="onPageChanged"/>
        </view>
      </uni-clientdb>
    </view>
  </view>
</template>

<script>
const db = uniCloud.database()
// 表查询配置
const dbCollectionName = 'exam,uni-id-users'
const dbOrderBy = 'create_date desc' // 排序字段
const dbSearchFields = ['title','userId.username'] // 支持模糊搜索的字段列表
// 分页配置
const pageSize = 10
const pageCurrent = 1

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
      }
    }
  },
  computed: {
    ...mapState('user', ['userInfo']),
  },
  onLoad() {
    this.getUsersData()
  },
  methods: {
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
	  // alert(JSON.stringify(newWhere))
      if (isSameWhere) { // 相同条件时，手动强制刷新
        this.loadData()
      }
    },
    loadData(clear = true) {
      this.$refs.udb.loadData({
        clear
      }, () => {
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
      this.$refs.udb.remove(item._id)
    },
    // 获取用户数据
    getUsersData() {

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
</style>
