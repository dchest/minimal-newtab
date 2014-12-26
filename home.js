(function() {
  var store = window.localStorage;

  var gmailRe = new RegExp(/https:\/\/mail\.google\.com\/?mail?\/?(u\/\d+)?/);

  var entities = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': '&quot;',
    "'": '&#39;',
    "/": '&#x2F;'
  };

  function escapeHTML(str) {
    return String(str).replace(/[&<>"'\/]/g, function(s) {
      return entities[s];
    });
  }

  function setGmailCount(id, count) {
    var klass = count === "0" ? "zero" : "count";
    var countTemplate = "<span class=" + klass + ">" + count + "</span>";
    var span = document.getElementById(id + "_count");
    if (span) {
      span.innerHTML = countTemplate;
    } else {
      var link = document.getElementById(id);
      link.innerHTML += " <span id='" + id + "_count'>" + countTemplate + "</span>";
    }
  }

  function updateGmailCount(id, url) {
    var lastCount, xhr;
    lastCount = store.getItem(id + "_count");
    if (lastCount !== null) {
      setGmailCount(id, lastCount);
    }
    if ((new Date()).getTime() - store.getItem(id + "_time") > 60000) {
      xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function() {
        var count, doc, parser, _ref;
        if (xhr.readyState === 4 && xhr.status === 200) {
          parser = new DOMParser();
          doc = parser.parseFromString(xhr.responseText, "text/xml");
          count = +((_ref = doc.getElementsByTagName("fullcount")[0]) !== null ? _ref.textContent : 0);
          store.setItem(id + "_count", count);
          store.setItem(id + "_time", (new Date()).getTime());
          setGmailCount(id, count);
        }
      };
      xhr.open("GET", url, true);
      return xhr.send();
    }
  }

  function addBookmark(ul, id, title, url) {
    var li = document.createElement("li");
    title = title.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    li.innerHTML = "<a href=\"" + (encodeURI(url)) + "\" id='bm_" + id + "'>" + escapeHTML(title) + "</a>";
    ul.appendChild(li);
    var m = gmailRe.exec(url);
    if (m) {
      var gmail = "https://mail.google.com/mail/";
      if (m[1]) {
        gmail += m[1] + '/';
      }
      gmail += "feed/atom";
      updateGmailCount("bm_" + id, gmail);
    }
  }

  function addGroup(ul, title) {
    var li = document.createElement("li");
    li.className = 'group-title';
    li.innerHTML = escapeHTML(title);
    var sublist = document.createElement("ul");
    sublist.appendChild(li);
    ul.appendChild(sublist);
    return sublist;
  }

  function addBookmarksTree(ul, bookmarks) {
    for (var i = 0; i < bookmarks.length; i++) {
      var b = bookmarks[i];
      if (b.url) {
        addBookmark(ul, b.id, b.title, b.url);
      } else {
        addBookmarksTree(addGroup(ul, b.title), b.children);
      }
    }
  }

  chrome.bookmarks.getTree(function(bookmarks) {
    addBookmarksTree(document.getElementById("bookmarks"),
                 bookmarks[0].children[0].children);
  });

}).call(this);
