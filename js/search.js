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

 var search = function(page, callback) {

  // save the search so pagination works
  if(context.elements.SEARCH_INPUT.value) {

    context.lastSearch = context.elements.SEARCH_INPUT.value;

  }

   if (context.lastSearch) {

    try {

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

    } catch(err) {

      console.log(err);
      alert('Aw something is not right :(');

    }

 }

};
