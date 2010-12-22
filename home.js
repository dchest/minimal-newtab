(function() {
  var addBookmark, setGmailCount, store, ul, updateGmailCount;
  ul = document.getElementById("bookmarks");
  store = window.localStorage;
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
  addBookmark = function(id, title, url) {
    var gmail, li, m, re;
    if (url && title) {
      li = document.createElement("li");
      title = title.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      li.innerHTML = "<a href=\"" + (encodeURI(url)) + "\" id='bm_" + id + "'>" + title + "</a>";
      ul.appendChild(li);
      re = new RegExp(/https:\/\/mail\.google\.com\/?(a\/.+\/)?/);
      m = re.exec(url);
      if (m) {
        gmail = "https://mail.google.com/";
        gmail += m[1] ? m[1] : "mail/";
        gmail += "feed/atom";
        if (url.match(/https:\/\/mail\.google\.com.*/)) {
          return updateGmailCount("bm_" + id, gmail);
        }
      }
    }
  };
  chrome.bookmarks.getTree(function(bookmarks) {
    var b, _i, _len, _ref, _results;
    _ref = bookmarks[0].children[0].children;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      b = _ref[_i];
      _results.push(addBookmark(b.id, b.title, b.url));
    }
    return _results;
  });
}).call(this);
