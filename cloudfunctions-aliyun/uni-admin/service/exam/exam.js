const {
	Service
} = require('uni-cloud-router')
const {
	getMonthSideDate
} = require('../date.js')
module.exports = class ExamService extends Service {
	constructor(ctx) {
		super(ctx)
		this.examCt = this.db.collection('exam')
		this.dbCmd = this.db.command
	}
	async getExamInfo(examId) {
		return this.db.collection('exam,uni-id-users,uni-id-roles').doc(examId).field(
			'title,userId{username},user_role{role_name},start_time,end_time,question_list,create_date,paperId,userId,uTotalScore'
		).get()
	}
	async getExamSort(date) {
		console.log("date=======", date)
		let sideDate = getMonthSideDate(date)
		console.log("sideDate=======", sideDate)
		// 查询固定月份的考试，并排名
		let result = await this.db.collection('exam').aggregate().match({
			start_time: this.dbCmd.and(this.dbCmd.lte(sideDate[1]), this.dbCmd.gte(sideDate[0])),
			end_time: this.dbCmd.and(this.dbCmd.lte(sideDate[1]), this.dbCmd.gte(sideDate[0]))
		}).lookup({
			from: 'uni-id-users',
			localField: 'userId',
			foreignField: '_id',
			as: 'userList',
		}).unwind('$userList').project({
			title: 1,
			create_date: 1,
			uTotalScore: 1,
			username: "$userList.username"
		}).sort({
			uTotalScore: -1
		}).end()
		console.log("getExamSort", JSON.stringify(result))
		return result
	}
}
