var app = {
  // using a central object to reference values keeps things nice and DRY
  context: {
    isLoading: false,
    lastSearch: null,
    maxPage: null,
    lastPage: 1,
    nPages: 5,
    pageSize: 20,
    imageArray: [],
    status: {

      OK: 200

    },
    doneState: 4,
    elements: {

      PHOTOS_UL: document.getElementById('fc-gallery-ul--photos'),
      SEARCH_INPUT: document.getElementById('fc-form-input--search'),
      LOGO: document.getElementById('fc-logo'),
      PAGE_UL: document.getElementById('fc-gallery-ul--pages'),
      LOADER: document.getElementById('fc-loader')

    },
    strings: {

      SELECTED: 'fc-gallery-ul-pages-li-a--selected',
      LOAD: 'fc-animation-load',
      SEARCH_URL: 'https://api.flickr.com/services/rest',
      API_KEY: 'api_key=5aa36189c69753a0726efbde5e6bb662',
      SEARCH_METHOD: 'method=flickr.photos.search',
      SIZE_METHOD: 'method=flickr.photos.getSizes',
      JSON_FORMAT: 'format=json',
      CONTENT_TYPE_PHOTO: 'content_type=photos',
      MEDIA_PHOTO: 'media=photos',
      PRIVACY_PUBLIC: 'privacy_filter=1',
      NO_JSON_CALLBACK: 'nojsoncallback=1'

    },
    getPageSizeQuery: function() {

      return '&per_page=' + this.pageSize;

    }

  },
  // helper to build the api query
  getSearchUrl: function(queryString, page) {

    var url = this.context.strings.SEARCH_URL + '?text=' + queryString + '&';

    url += this.context.strings.API_KEY + '&';
    url += this.context.strings.SEARCH_METHOD + '&';
    url += this.context.strings.JSON_FORMAT + '&';
    url += this.context.strings.CONTENT_TYPE_PHOTO + '&';
    url += this.context.strings.MEDIA_PHOTO + '&';
    url += this.context.getPageSizeQuery() + '&';
    url += this.context.strings.PRIVACY_PUBLIC + '&';
    url += this.context.strings.NO_JSON_CALLBACK;

    if(page && page > 0) {

      url += '&page=' + page;

    }

    return url;

  },
  // function to make the initial call to flickr
  flickrSearch: function(queryString, page, callback) {

    var url = this.getSearchUrl(queryString, page);
    var xmlhttp =  new XMLHttpRequest();
    var that = this;

    xmlhttp.onreadystatechange = function () {

      if (xmlhttp.readyState === that.context.doneState && xmlhttp.status === that.context.status.OK) {

        return callback(JSON.parse(xmlhttp.responseText));

      }

    };

    xmlhttp.open('GET', url, true);
    xmlhttp.send();

  },
  // helper to search through the flickr res and find the images
  findThumbnail: function(list) {

    var result = {};

    for(var i = 0; i < list.length; i++) {

      if (list[i].label === 'Small') {

        result.smallSrc = list[i].source;

      } else if (/.*Large.*/.test(list[i].label)) {

        result.largeSrc = list[i].source;

      } else if (list[i].label === 'Original') {

        result.originalSrc = list[i].source;

      } else if (list[i].label === 'Medium') {

        result.mediumSrc = list[i].source;

      }

    }

    return result;

  },
  // helper to build the second req to flickr, this one gets the images
  getThumbnailUrl: function(imageId) {

    var url = 'https://api.flickr.com/services/rest/?';

    url += this.context.strings.API_KEY + '&';
    url += this.context.strings.SIZE_METHOD + '&';
    url += this.context.strings.NO_JSON_CALLBACK + '&';
    url += this.context.strings.JSON_FORMAT + '&';
    url += 'photo_id=' + imageId;

    return url;

  },
  // this get the actual images from flickr
  getThumbnail: function(imageId, callback) {

    var url = this.getThumbnailUrl(imageId);
    var xmlhttp = new XMLHttpRequest();
    var that = this;

    xmlhttp.onreadystatechange = function () {

      if (xmlhttp.readyState === that.context.doneState && xmlhttp.status === that.context.status.OK) {

        var response = JSON.parse(xmlhttp.responseText);
        var image;

        if(response && response.sizes) {

          image = that.findThumbnail(response.sizes.size);

        }

        return callback(image);

      }

    };

    xmlhttp.open('GET', url, true);
    xmlhttp.send();

  },
  // helper to set the selected page number in the menu
  setSelectedPage: function(page) {

    var liArray = Array.prototype.slice.call(this.context.elements.PAGE_UL.children);
    var that = this;

      liArray.forEach(function(li) {

        var a = li.children[0]; // get the a tag inside the li
        if(a.innerHTML == page) {

          a.classList.add(that.context.strings.SELECTED);

        } else {

          a.classList.remove(that.context.strings.SELECTED);

        }

      });

  },
  addImages: function(imageArray) {

    var that = this;
    that.context.imageArray.forEach(function(image) {

      var li = document.createElement('li');
      var img = document.createElement('img');
      var a = document.createElement('a');
      a.href = image.originalSrc || image.largeSrc || image.mediumSrc || image.smallSrc;
      a.target = '_blank'; // default to open new tab so we dont lose state
      img.src = image.smallSrc;
      img.alt = image.title;
      a.appendChild(img);
      li.appendChild(a);

      that.context.elements.PHOTOS_UL.appendChild(li);

    });

  },
  clearOldPhotos: function() {

    this.context.imageArray = [];
    var liArray = Array.prototype.slice.call(this.context.elements.PHOTOS_UL.children);

      if (liArray && liArray.length > 0) {

          var that = this;
          liArray.forEach(function(li) {

              that.context.elements.PHOTOS_UL.removeChild(li);

          });

      }

  },
  handleCompletedRequest: function(data, callback) {

    if(this.context.imageArray.length === this.context.pageSize) {

      this.context.elements.SEARCH_INPUT.value = ''; // reset input field
      this.setSelectedPage(data.photos.page);
      this.context.elements.LOADER.classList.remove(this.context.strings.LOAD);
      callback();

    }

  },
  // bit of a callback nesting going on here, promises would be nice here
  search: function(page, callback) {

    // save the search so pagination works
    if(this.context.elements.SEARCH_INPUT.value) {

      this.context.lastSearch = this.context.elements.SEARCH_INPUT.value;

    }

     if (this.context.lastSearch) {

        this.clearOldPhotos();

        // run a flickr search to get the photo id´s
         this.context.elements.LOADER.classList.add(this.context.strings.LOAD);
         var that = this;
         this.flickrSearch(this.context.lastSearch, page, function(data) {
          // get thumbnails
          data.photos.photo.forEach(function(photo) {

            that.context.maxPage = data.photos.pages;
            that.getThumbnail(photo.id, function(image) {

              image.title = photo.title;
              that.context.imageArray.push(image);
              that.handleCompletedRequest(data, callback);

            });

        });

      });

   }
  },
  createLi: function(val) {

    var li = document.createElement('li');
    var a = document.createElement('a');
    a.innerHTML = val;
    a.href = '#';
    li.appendChild(a);
    return li;

  },
  // helper to update the numbers in the menu
  updatePageNumbers: function(start) {

     var liArray = Array.prototype.slice.call(this.context.elements.PAGE_UL.children);
     // two first and two last are not number buttons
     for(var i = 2; i < liArray.length - 2; i++) {

      var a = liArray[i].children[0];
      a.innerHTML = start;
      start++;

     }

  },
  // this is our general button function to get the images on the page of the provided number
  getNumberButton: function(number) {

    var li = this.createLi(number);
    var that = this;
    li.onclick = function() {

      if(that.context.lastSearch && !that.context.IsLoading) {

        that.context.lastPage = parseInt(li.children[0].innerHTML);
        that.context.IsLoading = true;
        that.search(that.context.lastPage, function(imageArray) {

          that.addImages(imageArray);
          that.setSelectedPage(that.context.lastPage);
          that.context.IsLoading = false;

        });

      }

    };

    return li;

  },
  goToStartButton: function() {

    var li = this.createLi('<<');
    var that = this;
    li.onclick = function() {

      if(that.context.lastSearch && that.context.lastPage > 0 && !that.context.IsLoading) {

        that.context.lastPage = 1;
        that.context.IsLoading = true;
        that.search(that.context.lastPage, function(imageArray) {

          that.context.IsLoading = false;
          that.updatePageNumbers(1);
          that.addImages(imageArray);
          that.setSelectedPage(that.context.lastPage);

        });

      }

    };

    return li;

  },
  goToLastPageButton: function() {

    var li = this.createLi('>>');
    var that = this;
    li.onclick = function() {

      if(that.context.lastSearch && !that.context.IsLoading && that.context.lastPage != that.context.maxPage) {

        that.context.lastPage = that.context.maxPage;
        that.context.IsLoading = true;
        that.search(that.context.maxPage, function(imageArray) {

          that.context.IsLoading = false;
          that.updatePageNumbers(that.context.lastPage - (that.context.nPages -1));
          that.addImages(imageArray);
          that.setSelectedPage(that.context.lastPage);

        });

      }

    };

    return li;

  },
  /*
    Helper to check if we are at the end of our menu.
    We want this so we know when its time to shift all the numbers to the next page ranges.
  */
  getLastLiNumber: function() {

    var liArray = this.context.elements.PAGE_UL.children;
    var a = liArray[liArray.length - 3].children[0];
    return parseInt(a.innerHTML);

  },
  // check the comment for getLastLiNumber, same but for the first li number
  getFirstLiNumber: function() {

    var liArray = this.context.elements.PAGE_UL.children;
    var a = liArray[2].children[0];
    return parseInt(a.innerHTML);

  },
  nextButton: function() {

    var li = this.createLi('>');
    var that = this;
    li.onclick = function() {

      if(that.context.lastSearch && !that.context.IsLoading && that.context.lastPage + 1 <= that.context.maxPage) {

        that.context.lastPage = that.context.lastPage + 1;
        that.context.IsLoading = true;

        that.search(that.context.lastPage, function(imageArray) {
          // if going forward pushes outside the menu range, update the menu
          if (that.getLastLiNumber() < that.context.lastPage) {

            that.updatePageNumbers(that.context.lastPage);
            that.setSelectedPage(that.context.lastPage);

          }

          that.addImages(imageArray);
          that.context.IsLoading = false;

        });

      }

    };

    return li;

  },
  previousButton: function() {

    var li = this.createLi('<');
    var that = this;
    li.onclick = function() {

      if(that.context.lastSearch && that.context.lastPage > 1 && !that.context.IsLoading) {

        that.context.lastPage = that.context.lastPage - 1;
        that.context.IsLoading = true;
        that.search(that.context.lastPage, function(imageArray) {
          // if going back pushes outside the menu range, update the menu
          if (that.getFirstLiNumber() > that.context.lastPage) {

            that.updatePageNumbers(that.context.lastPage - (that.context.nPages - 1));
            that.setSelectedPage(that.context.lastPage);

          }

          that.addImages(imageArray);
          that.context.IsLoading = false;

        });

      }

    };

    return li;

  },
  // function to create the pageination menu
  initUi: function() {

    // now that all that helpers are defined we create the menu
    this.context.elements.PAGE_UL.appendChild(this.goToStartButton());
    this.context.elements.PAGE_UL.appendChild(this.previousButton());

    for (var i = 1; i <= this.context.nPages; i++) {

      this.context.elements.PAGE_UL.appendChild(this.getNumberButton(i));

    }

    this.context.elements.PAGE_UL.appendChild(this.nextButton());
    this.context.elements.PAGE_UL.appendChild(this.goToLastPageButton());

  },
  init: function() {

    this.initUi();

  }

};

app.init();
