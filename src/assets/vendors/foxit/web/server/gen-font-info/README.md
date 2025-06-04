# Generate a CSV file with font information

## Usage

To execute the following command in the `gen-font-info` directory:

```shell
npm install
node index.js <input-path> [output-path] [output-override=true]
```

## Explanation of the parameters

- input-path: the path of font file. It supports the following formats:

    1. Font file URL, which returns a font file with the  `content-type` set to `application/octet-stream`.

    2. Font list URL, which returns a font list with the `content-type` set to `application/json`, formatted as `["font-a-url", "font-b-url", ...]`.

    3. Local font file path, which supports both absolute path and relative path.

    4. Local font folder path, which will traverse all font files in this folder including subfolders. It supports both absolute path and relative path.

- output-path: Generated CSV file path, default is `fontInfo.csv` in the current directory.

- output-override: Whether to overwrite the existing CSV file, default is `true`. If set to `false`, new font information will be appended to the existing CSV file.

## Example

### Example of font file URL
```shell    
node index.js http://localhost:8080/fonts/Bradhitc_M.ttf ./fontInfo.csv
```

### Example of font list URL
```shell
node index.js http://localhost:8080/fonts.json ./fontInfo.csv
```

### Example of local font file path
```shell
# Relative path 
node index.js ./fonts/arial.ttf ./fontInfo.csv
node index.js ./fonts ./fontInfo.csv
# Absolute path
# win
node index.js  D:\fonts\Bradhitc_M.ttf E:\fontInfo.csv
node index.js  D:\fonts E:\fontInfo.csv
# linux, mac
node index.js  /home/fonts/Bradhitc_M.ttf /home/fontInfo.csv
node index.js  /home/fonts /home/fontInfo.csv
```

### Example of output-override
```shell    
node index.js  /home/fonts /home/fontInfo.csv false
node index.js  /home/fonts false
```