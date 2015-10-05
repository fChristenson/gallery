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
