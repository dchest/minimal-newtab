(function() {
  var addBookmark, addBookmarks, gmailRe, setGmailCount, store, ul, updateGmailCount;

  ul = document.getElementById("bookmarks");

  store = window.localStorage;

  gmailRe = new RegExp(/https:\/\/mail\.google\.com\/?(a\/.+\/)?/);

  setGmailCount = function(id, count) {
    var countTemplate, klass, link, span;
    klass = count === "0" ? "zero" : "count";
    countTemplate = "<span class=" + klass + ">" + count + "</span>";
    span = document.getElementById(id + "_count");
    if (span) {
      return span.innerHTML = countTemplate;
    } else {
      link = document.getElementById(id);
      return link.innerHTML += " <span id='" + id + "_count'>" + countTemplate + "</span>";
    }
  };

  updateGmailCount = function(id, url) {
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
          count = (_ref = doc.getElementsByTagName("fullcount")[0]) != null ? _ref.textContent : void 0;
          store.setItem(id + "_count", count);
          store.setItem(id + "_time", (new Date()).getTime());
          return setGmailCount(id, count);
        }
      };
      xhr.open("GET", url, true);
      return xhr.send();
    }
  };

  addBookmark = function(id, title, url, indent) {
    var gmail, li, m;
    li = document.createElement("li");
    li.style.cssText = "padding-left: " + (indent * 2) + "em;";
    title = title.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    if (url) {
      li.innerHTML = "<a href=\"" + (encodeURI(url)) + "\" id='bm_" + id + "'>" + title + "</a>";
      m = gmailRe.exec(url);
      if (m) {
        gmail = "https://mail.google.com/";
        gmail += m[1] ? m[1] : "mail/";
        gmail += "feed/atom";
        if (url.match(/https:\/\/mail\.google\.com.*/)) {
          updateGmailCount("bm_" + id, gmail);
        }
      }
    } else {
      li.innerHTML = "&#x25be; " + title;
    }
    return ul.appendChild(li);
  };

  addBookmarks = function(bookmarks, indent) {
    var b, _i, _len;
    if (indent == null) {
      indent = 0;
    }
    for (_i = 0, _len = bookmarks.length; _i < _len; _i++) {
      b = bookmarks[_i];
      addBookmark(b.id, b.title, b.url, indent);
      if (!b.url) {
        addBookmarks(b.children, indent + 1);
      }
    }
  };

  chrome.bookmarks.getTree(function(bookmarks) {
    return addBookmarks(bookmarks[0].children[0].children);
  });

}).call(this);
