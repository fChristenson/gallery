var addImages = function(imageArray) {

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
