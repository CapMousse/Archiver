# Change Log

## 0.4.5 - 2016-02-26
### Fixed
- crash file renameSync on `tpmfs` systems

## 0.4.4 - 2016-02-25
### Fixed
- scanner crash with faulty regexp

### Added
- Read only mode

## 0.4.3 - 2016-02-24
### Fixed
- watcher crash with file name cotaining spaces
- watcher crash with faulty regexp

### Changed
- Stop force downloading archived files, use `express.static` instead

## 0.4.2 - 2016-02-23
### Fixed
- search tags not working

### Added
- RootUrl for proxy server with alias

## 0.4.1 - 2016-01-24
### Fixed
- Deleting tags not delete tags from files
- Search not working for tags

## 0.4.0 - 2016-01-22
### Added
- Support for images files (jpg/png/gif/bmp)
- Support for text files (text/md)
- Filter by type of file : `filter:"png"`

### Changed
- Filters now use new format : `filter:"value"`

## 0.3.0 - 2016-01-20
### Added
- Tags management
- Document auto taging
- Search with filters (`tags:/content:/name:`)

### Changed
- Refactor layout and views

### Fixed
- search not using global marker

## 0.2.1 - 2016-01-20
### Fixed
- Delete link opening new window

## 0.2.0 - 2016-01-20
### Added
- Delete file link

### Fixed
- Search not working

## 0.1.0 - 2016-01-20
### Added
- Inital release
