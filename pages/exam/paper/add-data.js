import validator from '@/js_sdk/validator/question.js';

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
    pickerOptions: {
        shortcuts: [{
            text: '最近一周',
            onClick(picker) {
                const end = new Date();
                const start = new Date();
                start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
                picker.$emit('pick', [start, end]);
            }
        }, {
            text: '最近一个月',
            onClick(picker) {
                const end = new Date();
                const start = new Date();
                start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
                picker.$emit('pick', [start, end]);
            }
        }]
    },
    questionAction: 0,
    paperPic: '',
    paperTitle: '',
    selRoles: [],
    selTime: [],
    questionList: [],
    paperId: '',
    questionId: '',
    roles: [],
    formDataFlag: '',
    questionType: 0,
}
