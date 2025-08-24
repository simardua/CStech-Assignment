const multer = require('multer');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');
const XLSX = require('xlsx');
const Agent = require('../models/Agent');
const DistributedList = require('../models/DistributedList');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['.csv', '.xlsx', '.xls'];
  const fileExtension = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only CSV, XLSX, and XLS files are allowed.'));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Process CSV file
const processCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => {
        // Normalize column names and extract required fields
        const record = {
          firstName: data.FirstName || data.firstName || data['First Name'] || '',
          phone: data.Phone || data.phone || data['Phone Number'] || '',
          notes: data.Notes || data.notes || data.Note || ''
        };
        
        // Only add record if at least firstName or phone is present
        if (record.firstName.trim() || record.phone.trim()) {
          results.push(record);
        }
      })
      .on('end', () => {
        resolve(results);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
};

// Process Excel file
const processExcel = (filePath) => {
  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    return data.map(row => ({
      firstName: row.FirstName || row.firstName || row['First Name'] || '',
      phone: row.Phone || row.phone || row['Phone Number'] || '',
      notes: row.Notes || row.notes || row.Note || ''
    })).filter(record => record.firstName.trim() || record.phone.trim());
  } catch (error) {
    throw error;
  }
};

// Distribute records among agents
const distributeRecords = (records, agents) => {
  const distributions = [];
  const recordsPerAgent = Math.floor(records.length / agents.length);
  const remainingRecords = records.length % agents.length;
  
  let currentIndex = 0;
  
  agents.forEach((agent, index) => {
    const recordCount = recordsPerAgent + (index < remainingRecords ? 1 : 0);
    const agentRecords = records.slice(currentIndex, currentIndex + recordCount);
    
    distributions.push({
      agentId: agent._id,
      agentName: agent.name,
      records: agentRecords,
      recordCount: agentRecords.length
    });
    
    currentIndex += recordCount;
  });
  
  return distributions;
};

// @desc    Upload and distribute CSV/Excel file
// @route   POST /api/lists/upload
// @access  Private
const uploadAndDistribute = async (req, res) => {
  try {
    // Get all active agents
    const agents = await Agent.find({ isActive: true }).select('_id name');
    
    if (agents.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No active agents found. Please add agents first.'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const filePath = req.file.path;
    const fileName = req.file.originalname;
    const fileExtension = path.extname(fileName).toLowerCase();
    
    let records = [];
    
    try {
      // Process file based on extension
      if (fileExtension === '.csv') {
        records = await processCSV(filePath);
      } else if (fileExtension === '.xlsx' || fileExtension === '.xls') {
        records = await processExcel(filePath);
      }
      
      if (records.length === 0) {
        // Clean up uploaded file
        fs.unlinkSync(filePath);
        return res.status(400).json({
          success: false,
          message: 'No valid records found in the uploaded file'
        });
      }
      
      // Distribute records among agents
      const distributions = distributeRecords(records, agents);
      
      // Save distribution to database
      const distributedList = new DistributedList({
        fileName,
        totalRecords: records.length,
        distributions
      });
      
      await distributedList.save();
      
      // Clean up uploaded file
      fs.unlinkSync(filePath);
      
      res.json({
        success: true,
        message: 'File processed and distributed successfully',
        data: {
          totalRecords: records.length,
          agentCount: agents.length,
          distributions: distributions.map(d => ({
            agentName: d.agentName,
            recordCount: d.recordCount
          }))
        }
      });
      
    } catch (fileError) {
      // Clean up uploaded file on error
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      throw fileError;
    }
    
  } catch (error) {
    console.error('Upload and distribute error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error processing file'
    });
  }
};


const getDistributedLists = async (req, res) => {
  try {
    const lists = await DistributedList.find()
      .populate('distributions.agentId', 'name email')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: lists
    });
  } catch (error) {
    console.error('Get distributed lists error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};


const getDistributionDetails = async (req, res) => {
  try {
    const list = await DistributedList.findById(req.params.id)
      .populate('distributions.agentId', 'name email mobile');
    
    if (!list) {
      return res.status(404).json({
        success: false,
        message: 'Distribution not found'
      });
    }
    
    res.json({
      success: true,
      data: list
    });
  } catch (error) {
    console.error('Get distribution details error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  upload: upload.single('file'),
  uploadAndDistribute,
  getDistributedLists,
  getDistributionDetails
};