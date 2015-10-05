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
