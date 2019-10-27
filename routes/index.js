var express = require('express');
var router = express.Router();
const multer  = require('multer')

const { WorkLists, AdminPwd } = require('../db/model')
const fs = require('fs');
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // 接收到文件后输出的保存路径（若不存在则需要创建）
        cb(null, 'public/uploads')
    },
    filename: function (req, file, cb) {
        // 将保存文件名设置为 时间戳 + 文件原始名，比如 151342376785-123.jpg
        cb(null, Date.now() + "-" + file.originalname)
    }
});
// 创建文件夹
var createFolder = function(folder){
    try{
        // 测试 path 指定的文件或目录的用户权限,我们用来检测文件是否存在
        // 如果文件路径不存在将会抛出错误"no such file or directory"
        fs.accessSync(folder);
    }catch(e){
        // 文件夹不存在，以同步的方式创建文件目录。
        fs.mkdirSync(folder);
    }
};

var upload = multer({ storage: storage });

var uploadFolder = './public/uploads/';
createFolder(uploadFolder);

// 管理员校验
router.post('/api/pwd', function (req, res) {
    const adminPwd = req.body.adminPwd
    AdminPwd.findOne({ adminPwd }, function (err, admin) {
        if (admin) {
            res.cookie('adminId', admin._id, { maxAge: 1000*60*60*24 })
            res.send({ code: 0, data: admin })
        } else {
            res.send({ code: 1, msg: '操作码不正确！' }) // 返回信息
        }
    })
});

// 注册管理员
router.post('/api/admin', function (req, res) {
    const { adminPwd } = req.body

    new AdminPwd({ adminPwd }).save(function (err, admin) {
        res.send({ code: 0, msg: '注册成功！'})
    })
});

// 添加项目
router.post('/addWork', upload.single('file'), function(req, res) {
    // const adminId = req.cookies.adminId
    const { workName, workSrc, workIntroduction, workContent, isLogin } = req.body
    if (!isLogin) {
        return res.send({ code: 1, msg: '请输入操作码，再进行操作' })
    }
    const file = req.file
    const workImg = 'http://106.53.70.87:4001/' + file.path
    // 储存数据库
    new WorkLists({ workName, workSrc, workIntroduction, workContent, workImg }).save(function (err, list) {
        // 提交成功返回给前端
        res.send({ code: 0, msg: '上传成功！'})
    })
});

// 作品列表
router.get('/api/workList', function (req, res) {
    let countIp = 0
    AdminPwd.find(function(err, count) {
        if(count){
            countIp = count[0].countIp + 1
            AdminPwd.findByIdAndUpdate({  _id: count[0]._id }, { countIp: countIp*1 }, function (err, a) {
                if(!err) {
                    WorkLists.find(function (err, list) {
                        res.send({ code: 0, data: list, count: countIp })
                    })
                }
            })
        }
    })
});

// 查看管理员是否登录
router.get('/api/adminInfo', function (req, res) {
    const adminId = req.cookies.adminId
    if (!adminId) {
        return res.send({ code: 1, msg: '未登录' })
    } else {
        return res.send({ code: 0, data: { login: true } })
    }
})

// // 更改项目
// router.post('/workUpdata', upload.single('file'), function (req, res) {
//     const adminId = req.cookies.adminId
//     if (!adminId) {
//         return res.send({ code: 1, msg: '未登录' })
//     }
//     const { workName, workSrc, workIntroduction, workContent } = req.body
//     const file = req.file
//     const workImg = 'http://localhost:4000/' + file.path
//
// })

// 删除项目
router.post('/api/delWork', function (req, res) {

    const adminId = req.cookies.adminId
    if (!adminId) {
        return res.send({ code: 1, msg: '未登录' })
    }
    const { id } = req.body
    WorkLists.remove({ _id: id }, function (err, work) {
        if(!err) {
            res.send({ code: 0, msg: '删除成功！'})
        } else {
            res.send({ code: 0, msg: '删除失败', err})
        }
    })
})

module.exports = router;
