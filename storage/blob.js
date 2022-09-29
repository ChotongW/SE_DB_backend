const { BlobServiceClient } = require('@azure/storage-blob');

const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
if (!AZURE_STORAGE_CONNECTION_STRING) {
  throw Error("Azure Storage Connection string not found");
}
//console.log(AZURE_STORAGE_CONNECTION_STRING)

// Create the BlobServiceClient object which will be used to create a container client
const blobServiceClient = BlobServiceClient.fromConnectionString(
  AZURE_STORAGE_CONNECTION_STRING
);

const containerName = "carimg"

// console.log("\nconnecting container...");
// console.log("\t", containerName);

// Get a reference to a container
const containerClient = blobServiceClient.getContainerClient(containerName);

//console.log(`Container was created successfully.\n\tURL: ${containerClient.url}`);

module.exports = {
    blobServiceClient,
    containerClient,
  }
// module.exports = blobServiceClient;
// module.otherMethod  = containerClient;