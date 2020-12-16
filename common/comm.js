// 年月日，时分秒
export function getFullTime() {
	let date = new Date(), //时间戳为10位需*1000，时间戳为13位的话不需乘1000
		Y = date.getFullYear() + '',
		M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1),
		D = (date.getDate() < 10 ? '0' + (date.getDate()) : date.getDate()),
		h = (date.getHours() < 10 ? '0' + (date.getHours()) : date.getHours()),
		m = (date.getMinutes() < 10 ? '0' + (date.getMinutes()) : date.getMinutes()),
		s = (date.getSeconds() < 10 ? '0' + (date.getSeconds()) : date.getSeconds());
	let dateStr = Y + M + D + h + m + s;
	console.log(dateStr)
	return dateStr
}
