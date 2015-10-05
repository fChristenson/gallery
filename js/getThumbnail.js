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
