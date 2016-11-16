export default class Template {

  dailymotionLink(videoId) {
    return `<a class="watch-on-dm-btn" href="https://www.dailymotion.com/video/${videoId}" target="_blank">🔗</a>`
  }

  itemList(items) {
    return items.reduce((a, item) => a + `
<li data-id="${item.id}">
  <label>Recording - ${(new Date(item.id)).toLocaleString()}</label>
  <button class="remove-btn">🗑</button>
  <button class="download-btn">⬇</button>
  ${item.dailymotion_id
    ? this.dailymotionLink(item.dailymotion_id)
    : '<button class="dailymotion-btn">⬆</button>'
  }
</li>`, '')
  }
}
