Convert keras format to tfjs format :
-> To convert keras model to tfjs_model use the following command:
tensorflowjs_converter --input_format=keras /path/to/my_model.h5 /path/to/tfjs_model

Combine Binary Files in Linux:
-> After converting the keras model it is necessary to combine all the multiple binary files
-> To combine the binary files use the following command:
https://linuxhint.com/combine-binary-files-linux/
cat file1.bin file2.bin file3.bin > file4.bin


Metro Config:
-> Create a file metro.config.js and copy the code below:
const { getDefaultConfig } = require('metro-config');
module.exports = (async () => {
  const defaultConfig = await getDefaultConfig();
  const { assetExts } = defaultConfig.resolver;
  return {
    resolver: {
      // Add bin to assetExts
      assetExts: [...assetExts, 'bin'],
    }
  };
})();

