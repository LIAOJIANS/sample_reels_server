var express = require('express');
var router = express.Router();
const multer  = require('multer')

const { WorkLists } = require('../db/model')
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
// 添加项目
router.post('/addWork', upload.single('file'), function(req, res) {
    const { workName, workSrc, workIntroduction, workContent } = req.body
    const file = req.file
    const workImg = 'http://localhost:4000/' + file.path
    // 储存数据库
    new WorkLists({ workName, workSrc, workIntroduction, workContent, workImg }).save(function (err, list) {
        // 提交成功返回给前端
        res.send({ code: 0, msg: '上传成功！'})
    })
});
// 作品列表
router.get('/workList', function (req, res) {
    WorkLists.find(function (err, list) {
        res.send({ code: 0, data: list })
    })
})
module.exports = router;
