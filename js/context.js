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

    return '&per_page=' + this.pageSize;

  }

};
