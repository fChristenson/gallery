var app = (function() {

  var app = {};

  // using a central object to reference values keeps things nice and DRY
  var context = {

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

      return '&per_page=' + context.pageSize;

    }

  };

  var getSearchUrl = function(queryString, page) {

    var url = context.strings.SEARCH_URL + '?text=' + queryString + '&';

    url += context.strings.API_KEY + '&';
    url += context.strings.SEARCH_METHOD + '&';
    url += context.strings.JSON_FORMAT + '&';
    url += context.strings.CONTENT_TYPE_PHOTO + '&';
    url += context.strings.MEDIA_PHOTO + '&';
    url += context.getPageSizeQuery() + '&';
    url += context.strings.PRIVACY_PUBLIC + '&';
    url += context.strings.NO_JSON_CALLBACK;

    if(page && page > 0) {

      url += '&page=' + page;

    }

    return url;

  };

  var findThumbnail = function(list) {

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

  };


  var flickrSearch = function(queryString, page, callback) {

    var url = getSearchUrl(queryString, page);
    var xmlhttp =  new XMLHttpRequest();


    xmlhttp.onreadystatechange = function () {

      if (xmlhttp.readyState === context.doneState && xmlhttp.status === context.status.OK) {

        return callback(JSON.parse(xmlhttp.responseText));

      }

    };

    xmlhttp.open('GET', url, true);
    xmlhttp.send();

  };

  var getThumbnail = function(imageId, callback) {

    var url = getThumbnailUrl(imageId);
    var xmlhttp = new XMLHttpRequest();


    xmlhttp.onreadystatechange = function () {

      if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {

        var response = JSON.parse(xmlhttp.responseText);
        var image;

        if(response && response.sizes) {

          image = findThumbnail(response.sizes.size);

        }

        return callback(image);

      }

    };

    xmlhttp.open('GET', url, true);
    xmlhttp.send();

  };

  var getThumbnailUrl = function(imageId) {

    var url = 'https://api.flickr.com/services/rest/?';

    url += context.strings.API_KEY + '&';
    url += context.strings.SIZE_METHOD + '&';
    url += context.strings.NO_JSON_CALLBACK + '&';
    url += context.strings.JSON_FORMAT + '&';
    url += 'photo_id=' + imageId;

    return url;

  };

  var setSelectedPage = function(page) {

    var liArray = Array.prototype.slice.call(context.elements.PAGE_UL.children);

      liArray.forEach(function(li) {

        var a = li.children[0]; // get the a tag inside the li
        if(a.innerHTML == page) {

          a.classList.add(context.strings.SELECTED);

        } else {

          a.classList.remove(context.strings.SELECTED);

        }

      });

  };

  app.addImages = function(imageArray) {

    context.imageArray.forEach(function(image) {

      var li = document.createElement('li');
      var img = document.createElement('img');
      var a = document.createElement('a');
      a.href = image.originalSrc || image.largeSrc || image.mediumSrc || image.smallSrc;
      a.target = '_blank'; // default to open new tab so we dont lose state
      img.src = image.smallSrc;
      img.alt = image.title;
      a.appendChild(img);
      li.appendChild(a);

      context.elements.PHOTOS_UL.appendChild(li);

    });

  };

  var clearOldPhotos = function() {

    context.imageArray = [];
    var liArray = Array.prototype.slice.call(context.elements.PHOTOS_UL.children);

      if (liArray && liArray.length > 0) {

          liArray.forEach(function(li) {

              context.elements.PHOTOS_UL.removeChild(li);

          });

      }

  };

  var handleCompletedRequest = function(data, callback) {

    if(context.imageArray.length === context.pageSize) {

      context.elements.SEARCH_INPUT.value = ''; // reset input field
      setSelectedPage(data.photos.page);
      context.elements.LOADER.classList.remove(context.strings.LOAD);
      callback(context.imageArray);

    }

  };

  // bit of a callback nesting going on here but in a real project I would use promises

   app.search = function(page, callback) {

    // save the search so pagination works
    if(context.elements.SEARCH_INPUT.value) {

      context.lastSearch = context.elements.SEARCH_INPUT.value;

    }

     if (context.lastSearch) {

        clearOldPhotos();

        // run a flickr search to get the photo id´s
         context.elements.LOADER.classList.add(context.strings.LOAD);
         flickrSearch(context.lastSearch, page, function(data) {

          // get thumbnails

          data.photos.photo.forEach(function(photo) {

            context.maxPage = data.photos.pages;
            getThumbnail(photo.id, function(image) {

              image.title = photo.title;
              context.imageArray.push(image);
              handleCompletedRequest(data, callback);

            });

        });

      });

   }

  };

  app.createMenu = function() {

    var createLi = function(val) {

      var li = document.createElement('li');
      var a = document.createElement('a');
      a.innerHTML = val;
      a.href = '#';
      li.appendChild(a);
      return li;

    };

    var updatePageNumbers = function(start) {

       var liArray = Array.prototype.slice.call(context.elements.PAGE_UL.children);
       // two first and two last are not number buttons
       for(var i = 2; i < liArray.length - 2; i++) {

        var a = liArray[i].children[0];
        a.innerHTML = start;
        start++;

       }

    };

    var getNumberButton = function(number) {

      var li = createLi(number);
      li.onclick = function() {

        if(context.lastSearch && !context.IsLoading) {

          context.lastPage = parseInt(li.children[0].innerHTML);
          context.IsLoading = true;
          app.search(context.lastPage, function(imageArray) {

            app.addImages(imageArray);
            setSelectedPage(context.lastPage);
            context.IsLoading = false;

          });

        }

      };

      return li;

    };

    var goToStartButton = function() {

      var li = createLi('<<');
      li.onclick = function() {

        if(context.lastSearch && context.lastPage > 0 && !context.IsLoading) {

          context.lastPage = 1;
          context.IsLoading = true;
          app.search(context.lastPage, function(imageArray) {

            context.IsLoading = false;
            updatePageNumbers(1);
            app.addImages(imageArray);
            setSelectedPage(context.lastPage);

          });

        }

      };

      return li;

    };

    var goToLastPageButton = function() {

      var li = createLi('>>');
      li.onclick = function() {

        if(context.lastSearch && !context.IsLoading && context.lastPage != context.maxPage) {

          context.lastPage = context.maxPage;
          context.IsLoading = true;
          app.search(context.maxPage, function(imageArray) {

            context.IsLoading = false;
            updatePageNumbers(context.lastPage - (context.nPages -1));
            app.addImages(imageArray);
            setSelectedPage(context.lastPage);

          });

        }

      };

      return li;

    };

    var getLastLiNumber = function() {

      var liArray = context.elements.PAGE_UL.children;
      var a = liArray[liArray.length - 3].children[0];
      return parseInt(a.innerHTML);

    };

    var getFirstLiNumber = function() {

      var liArray = context.elements.PAGE_UL.children;
      var a = liArray[2].children[0];
      return parseInt(a.innerHTML);

    };

    var nextButton = function() {

      var li = createLi('>');
      li.onclick = function() {

        if(context.lastSearch && !context.IsLoading && context.lastPage + 1 <= context.maxPage) {

          context.lastPage = context.lastPage + 1;
          context.IsLoading = true;

          app.search(context.lastPage, function(imageArray) {
            // if going forward pushes outside the menu range, update the menu
            if (getLastLiNumber() < context.lastPage) {

              updatePageNumbers(context.lastPage);
              setSelectedPage(context.lastPage);

            }

            app.addImages(imageArray);
            context.IsLoading = false;

          });

        }

      };

      return li;

    };

    var previousButton = function() {

      var li = createLi('<');
      li.onclick = function() {

        if(context.lastSearch && context.lastPage > 1 && !context.IsLoading) {

          context.lastPage = context.lastPage - 1;
          context.IsLoading = true;
          app.search(context.lastPage, function(imageArray) {
            // if going back pushes outside the menu range, update the menu
            if (getFirstLiNumber() > context.lastPage) {

              updatePageNumbers(context.lastPage - (context.nPages - 1));
              setSelectedPage(context.lastPage);

            }

            app.addImages(imageArray);
            context.IsLoading = false;

          });

        }

      };

      return li;

    };

    context.elements.PAGE_UL.appendChild(goToStartButton());
    context.elements.PAGE_UL.appendChild(previousButton());

    for (var i = 1; i <= context.nPages; i++) {

      context.elements.PAGE_UL.appendChild(getNumberButton(i));

    }

    context.elements.PAGE_UL.appendChild(nextButton());
    context.elements.PAGE_UL.appendChild(goToLastPageButton());

  };

  app.createMenu();
  return app;

})();

