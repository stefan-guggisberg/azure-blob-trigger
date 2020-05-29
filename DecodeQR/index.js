/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

'use strict';

const { decodeFromBuffer } = require('@adobe/helix-qr-code');
const azure  =  require('azure-storage');

module.exports = async function (context, uploadedBlob) {

  try {
    context.log.verbose(`Processing ${context.bindingData.name}...`);
    // detect & decode QR Code
    const code = await decodeFromBuffer(uploadedBlob);
    if (code) {
      context.log.verbose(`Decoded QR Code: ${code.data}`);
    }
    context.log.verbose('Updating Blob metadata...');
  
    // update metadata
    const blobService = azure.createBlobService(process.env.AzureWebJobsStorage); 
    blobService.setBlobMetadata(
      context.bindingData.blobTrigger.split('/')[0],
      context.bindingData.name, 
      { qrCode: code && code.data || '(null)' },
      (error, s, r) => {
        if (error) {
          context.log.error('Failed to update metadata:', error);
        } 
        context.log.verbose('Blob metadata successfully updated');
      }
    );
  } catch (err) {
    context.log.error('Encountered error:', error);
  }
};