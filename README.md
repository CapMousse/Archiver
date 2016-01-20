# Archiver

*Archiver* is a tool to eradicate paper with minimal setup. It can store and search on your documents like bills, taxes, fines, loan ... or any PDF.

## Warning

**This project is not responsible for any data/paper loss.**
**This project was made only to be used on *local* network, like on a NAS, and doesn't integrate any security (for the moment)**


## Requirements
- Nodejs
- Mongodb
- Tesseract (tesseract-ocr on apt)
- ImageMagick

## Installation
Clone the current repository and install all requirements.

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

* * *

This project is inspired from [paperless](https://github.com/danielquinn/paperless) from [@danielquinn](https://github.com/danielquinn)

