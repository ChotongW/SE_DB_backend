const express = require('express');
router = express.Router()
const db = require('../database/db');
const upload = require('../storage/multer');
const blob = require('../storage/blob');

router.put('/', upload.single('file'), (req, res) => {
    let simpleFile = req.file
    // Create a unique name for the blob
    const blobName = simpleFile.filename;

    // Get a block blob client
    const blockBlobClient = blob.containerClient.getBlockBlobClient(blobName);
  
    // Display blob name and url
    console.log(`\nUploading to Azure storage as blob\n\tname: ${blobName}:\n\tURL: ${blockBlobClient.url}`);
  
    // Upload data to the blob
    //console.log(simpleFile)
    blockBlobClient.uploadFile(simpleFile.path, simpleFile.filename.length);
    console.log(`Blob was uploaded successfully`);
    res.send('File uploaded successfully');

  //   fs.unlink(simpleFile.path, (err) => {
  //     if (err) throw err;
  //     // if no error, file has been deleted successfully
  //     console.log('File deleted!');
  // });
});

module.exports = router;