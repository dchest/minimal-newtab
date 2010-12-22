ul = document.getElementById "bookmarks"
store = window.localStorage

setGmailCount = (id, count) ->
    klass = if count == "0" then "zero" else "count"
    countTemplate = "<span class=#{klass}>#{count}</span>"
    span = document.getElementById(id + "_count")
    if span
        span.innerHTML = countTemplate
    else
        link = document.getElementById(id)
        link.innerHTML += " <span id='#{id}_count'>#{countTemplate}</span>"

updateGmailCount = (id, url) ->
    lastCount = store.getItem(id + "_count")
    setGmailCount(id, lastCount) if lastCount != null
    if (new Date()).getTime() - store.getItem(id + "_time") > 60000 # 1 min
        xhr = new XMLHttpRequest()
        xhr.onreadystatechange =  ->
            if xhr.readyState == 4 and xhr.status == 200
                parser = new DOMParser()
                doc = parser.parseFromString(xhr.responseText, "text/xml")
                count = doc.getElementsByTagName("fullcount")[0]?.textContent
                store.setItem(id + "_count", count)
                store.setItem(id + "_time", (new Date()).getTime())
                setGmailCount(id, count)
        xhr.open "GET", url, true
        xhr.send()

addBookmark = (id, title, url) ->
   if url and title
       li = document.createElement "li"
       li.innerHTML = "<a href='#{url}' id='bm_#{id}'>#{title}</a>"
       ul.appendChild li
       # Try Gmail 
       re = new RegExp(/https:\/\/mail\.google\.com\/?(a\/.+\/)?/)
       m = re.exec(url)
       if m
          gmail = "https://mail.google.com/"
          gmail += if m[1] then m[1] else "mail/"
          gmail += "feed/atom"
          updateGmailCount("bm_" + id, gmail) if url.match(/https:\/\/mail\.google\.com.*/)
          

chrome.bookmarks.getTree (bookmarks) ->
    addBookmark b.id, b.title, b.url for b in bookmarks[0].children[0].children

