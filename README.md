# Archiver

*Archiver* is a tool to eradicate paper with minimal setup. It can store and search on your documents like bills, taxes, fines, loan ... or any PDF.

## Warning

**This project is not responsible for any data/paper loss.**
**This project was made only to be used on *local* network, like on a NAS, and doesn't integrate any security (for the moment)**


## Requirements
- Nodejs >= 4
- Mongodb
- Tesseract (tesseract-ocr on apt)
- ImageMagick

## Installation
Clone the current repository and install all requirements. Then run :

```
npm install
```

## Configuration

Copy the `config.example.js` as `config.js`, then in the `config.js` file :
- Set `port` to the port you want to use for the web interface
- Set `scanDir` to the directory where you will send new file to scan
- Set `archiveDir` to the directory where you want *Archiver* to store all your files

All dir can be absolutes

## Launch

- `npm run watch` to launche the document scanner
- `npm start` to launch the web interface

If you want to automaticaly launch thoses at start, you can use `crontab` (`sudo crontab -e`):
```
@reboot /dir/to/archiver npm run watch
@reboot /dir/to/archiver npm start
```

## How it work

Drop any PDF file in you `scanDir` directory and wait some time for the watcher to index and move the file in the `archiveDir`. It can take some time, depending of the file size.

Go to `http://server-address:8000` to see all your files.

You can search in all files content and name with the search form in the header. But you also can use filters to improve search results :
- `content:anything in the content`
- `name:anything in the title`
- `tags:list,of,tags`
- `content:all at name:the same tags:time`

You can also define tags to be added automatically on file add or manually scan all files. Tag filters can be literal string or RegExp.
**Warning:** manually scan all files for tags can take time !

* * *

This project is inspired from [paperless](https://github.com/danielquinn/paperless) from [@danielquinn](https://github.com/danielquinn)

