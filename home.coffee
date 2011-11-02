ul = document.getElementById "bookmarks"
store = window.localStorage
gmailRe = new RegExp(/https:\/\/mail\.google\.com\/?(a\/.+\/)?/)

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

addBookmark = (id, title, url, indent) ->
    li = document.createElement "li"
    li.style.cssText = "padding-left: #{indent*2}em;"
    title = title.replace(/&/g, "&amp;").replace(/</g,"&lt;").replace(/>/g, "&gt;")
    if url
        li.innerHTML = "<a href=\"#{encodeURI(url)}\" id='bm_#{id}'>#{title}</a>"
        # Try Gmail
        m = gmailRe.exec(url)
        if m
            gmail = "https://mail.google.com/"
            gmail += if m[1] then m[1] else "mail/"
            gmail += "feed/atom"
            updateGmailCount("bm_" + id, gmail) if url.match(/https:\/\/mail\.google\.com.*/)
    else
        li.innerHTML = "&#x25bc; #{title}"
    ul.appendChild li

addBookmarks = (bookmarks, indent = 0) ->
    for b in bookmarks
        addBookmark b.id, b.title, b.url, indent
        if not b.url
            addBookmarks b.children, indent + 1

chrome.bookmarks.getTree (bookmarks) ->
    addBookmarks bookmarks[0].children[0].children
