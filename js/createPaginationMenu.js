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
      search(context.lastPage, function(imageArray) {

        addImages(imageArray);
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
      search(context.lastPage, function(imageArray) {

        context.IsLoading = false;
        updatePageNumbers(1);
        addImages(imageArray);
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
      search(context.maxPage, function(imageArray) {

        context.IsLoading = false;
        updatePageNumbers(context.lastPage - (context.nPages -1));
        addImages(imageArray);
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

      search(context.lastPage, function(imageArray) {
        // if going forward pushes outside the menu range, update the menu
        if (getLastLiNumber() < context.lastPage) {

          updatePageNumbers(context.lastPage);
          setSelectedPage(context.lastPage);

        }

        addImages(imageArray);
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
      search(context.lastPage, function(imageArray) {
        // if going back pushes outside the menu range, update the menu
        if (getFirstLiNumber() > context.lastPage) {

          updatePageNumbers(context.lastPage - (context.nPages - 1));
          setSelectedPage(context.lastPage);

        }

        addImages(imageArray);
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
