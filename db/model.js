

// 1、链接数据库
const mongoose = require('mongoose')

// 1.2 链接制定数据库
mongoose.connect('mongodb://localhost:27017/personWork')

// 1.3 获取链接对象
const conn = mongoose.connection

// 1.4 绑定链接完成的监听
conn.on('connected', () => {
    console.log('链接数据库成功咯！')
})

const workLists = mongoose.Schema({
    workName: { type: String, require: true },
    workSrc: { type: String, require: true },
    workImg: { type: String, require: true },
    workIntroduction: { type: String, require: true },
    workContent: { type: String, require: true }
})

// 2.2 定义Model
const WorkLists = mongoose.model('works', workLists)

// 2.3 向外暴露一个Model
exports.WorkLists = WorkLists // 用户信息Model

const admin = mongoose.Schema({
    adminPwd: { type: String, require:true },
    countIp: { type: Number }
})
const AdminPwd = mongoose.model('admin', admin)
exports.AdminPwd = AdminPwd
