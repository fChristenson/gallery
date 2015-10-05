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
