const {
	Controller
} = require('uni-cloud-router')
module.exports = class ExamController extends Controller {
	constructor(ctx) {
		super(ctx)
		this.examServie = this.service.exam.exam
	}
	async getExamInfo() {
		const {
			examId
		} = this.ctx.data
		return this.examServie.getExamInfo(examId)
	}
	async getExamSort(){
		const {
			date
		} = this.ctx.data
		return this.examServie.getExamSort(date)
	}
}
