const {
	Service
} = require('uni-cloud-router')

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
}
