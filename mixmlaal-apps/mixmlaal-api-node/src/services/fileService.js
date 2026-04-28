const multer = require('multer');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// 文件存储配置
const uploadDir = process.env.UPLOAD_DIR || './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 配置multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: process.env.MAX_FILE_SIZE || 50 * 1024 * 1024 // 默认50MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.xlsx', '.xls', '.csv', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('只允许上传Excel、CSV或TXT文件'), false);
    }
  }
});

// 文件处理服务
class FileService {
  constructor() {
    this.upload = upload;
  }

  // 解析Excel文件
  parseExcel(filePath) {
    try {
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(worksheet);
      return data;
    } catch (error) {
      console.error('解析Excel文件失败:', error);
      throw error;
    }
  }

  // 解析CSV文件
  parseCSV(filePath) {
    try {
      const workbook = xlsx.readFile(filePath, { type: 'string' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(worksheet);
      return data;
    } catch (error) {
      console.error('解析CSV文件失败:', error);
      throw error;
    }
  }

  // 解析TXT文件
  parseTXT(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      const data = [];
      
      for (const line of lines) {
        if (line.trim()) {
          const parts = line.split('\t');
          if (parts.length >= 3) {
            data.push({
              name: parts[0].trim(),
              phone: parts[1].trim(),
              address: parts[2].trim(),
              priority: parts[3] ? parts[3].trim() : 'medium',
              deliveryTime: parts[4] ? parts[4].trim() : null
            });
          }
        }
      }
      
      return data;
    } catch (error) {
      console.error('解析TXT文件失败:', error);
      throw error;
    }
  }

  // 解析文件
  parseFile(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    
    switch (ext) {
      case '.xlsx':
      case '.xls':
        return this.parseExcel(filePath);
      case '.csv':
        return this.parseCSV(filePath);
      case '.txt':
        return this.parseTXT(filePath);
      default:
        throw new Error('不支持的文件类型');
    }
  }

  // 验证地址数据
  validateAddressData(data) {
    const validData = [];
    const invalidData = [];
    
    for (const item of data) {
      const errors = [];
      
      // 验证必填字段
      if (!item.name || item.name.trim() === '') {
        errors.push('收货人姓名不能为空');
      }
      
      if (!item.phone || item.phone.trim() === '') {
        errors.push('联系电话不能为空');
      } else if (!/^1[3-9]\d{9}$/.test(item.phone.trim())) {
        errors.push('联系电话格式不正确');
      }
      
      if (!item.address || item.address.trim() === '') {
        errors.push('详细地址不能为空');
      }
      
      // 验证优先级
      if (item.priority && !['high', 'medium', 'low'].includes(item.priority)) {
        errors.push('优先级必须是high、medium或low');
      }
      
      if (errors.length === 0) {
        validData.push({
          name: item.name.trim(),
          phone: item.phone.trim(),
          address: item.address.trim(),
          priority: item.priority || 'medium',
          deliveryTime: item.deliveryTime || null,
          notes: item.notes || null
        });
      } else {
        invalidData.push({
          data: item,
          errors: errors
        });
      }
    }
    
    return {
      valid: validData,
      invalid: invalidData
    };
  }

  // 生成Excel模板
  generateTemplate() {
    const data = [
      {
        '收货人姓名': '张三',
        '联系电话': '13800138000',
        '详细地址': '北京市朝阳区建国路88号',
        '优先级': 'high',
        '配送时间': '9:00-11:00',
        '备注': '请提前联系'
      },
      {
        '收货人姓名': '李四',
        '联系电话': '13900139000',
        '详细地址': '北京市海淀区中关村大街1号',
        '优先级': 'medium',
        '配送时间': '14:00-16:00',
        '备注': ''
      }
    ];
    
    const worksheet = xlsx.utils.json_to_sheet(data);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, '地址模板');
    
    const templatePath = path.join(uploadDir, 'address-template.xlsx');
    xlsx.writeFile(workbook, templatePath);
    
    return templatePath;
  }

  // 清理临时文件
  cleanup(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error('清理临时文件失败:', error);
    }
  }
}

module.exports = new FileService();