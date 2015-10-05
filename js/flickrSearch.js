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
