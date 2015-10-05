var getThumbnailUrl = function(imageId) {

  var url = 'https://api.flickr.com/services/rest/?';

  url += context.strings.API_KEY + '&';
  url += context.strings.SIZE_METHOD + '&';
  url += context.strings.NO_JSON_CALLBACK + '&';
  url += context.strings.JSON_FORMAT + '&';
  url += 'photo_id=' + imageId;

  return url;

};
