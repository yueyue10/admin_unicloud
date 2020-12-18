//参考：https://www.cnblogs.com/liyixiang/p/6038122.html
//格式化日期：yyyy-MM-dd
function formatDate(date) {
	var myyear = date.getFullYear();
	var mymonth = date.getMonth() + 1;
	var myweekday = date.getDate();
	if (mymonth < 10) {
		mymonth = "0" + mymonth;
	}
	if (myweekday < 10) {
		myweekday = "0" + myweekday;
	}
	return (myyear + "-" + mymonth + "-" + myweekday);
}
// 获取时间戳
function timeStamp(date) {
	return date.getTime();
}
// 获取月份的开始、结束时间
function getMonthSideDate(yearMonth) {
	let yearStr = yearMonth.substring(0, 4)
	let monthStr = yearMonth.substring(4)
	let monthValue = parseInt(monthStr) - 1
	let startDate = getMonthStartDate(yearStr, monthValue)
	let endDate = getMonthEndDate(yearStr, monthValue)
	return [startDate, endDate]
}
//获得本月的开始日期
function getMonthStartDate(myYear, myMonth) {
	var monthStartDate = new Date(myYear, myMonth, 1);
	return timeStamp(monthStartDate);
}

//获得本月的结束日期
function getMonthEndDate(myYear, myMonth) {
	var monthEndDate = new Date(myYear, myMonth, getMonthDays(myYear, myMonth));
	return timeStamp(monthEndDate);
}

//获得某月的天数
function getMonthDays(myYear, myMonth) {
	var monthStartDate = new Date(myYear, myMonth, 1);
	var monthEndDate = new Date(myYear, myMonth + 1, 1);
	var days = (monthEndDate - monthStartDate) / (1000 * 60 * 60 * 24);
	return days;
}

module.exports = {
	formatDate,
	getMonthDays,
	getMonthSideDate
}
