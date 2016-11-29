export default class Template {

  dailymotionLink(videoId) {
    return `<a class="watch-on-dm-btn" href="https://www.dailymotion.com/video/${videoId}" target="_blank">
      <svg class="list__button__icon">
        <use xlink:href="images/icons.svg#dmp_ico-logo"></use>
      </svg>
    </a>`
  }

  itemList(items) {
    return items.reduce((a, item) => a + `
<li class="list-view__list__item" data-id="${item.id}">
  <label>Recording - ${(new Date(item.id)).toLocaleString()}</label>
  <button class="remove-btn" title="Delete">
    <svg class="list__button__icon">
      <use xlink:href="images/icons.svg#dmp_ico-trash"></use>
    </svg>
    <span class="visuallyhidden">Delete</span>
  </button>
  <button class="download-btn" title="Download">
    <svg class="list__button__icon">
      <use xlink:href="images/icons.svg#dmp_ico-download"></use>
    </svg>
    <span class="visuallyhidden">Download</span>
  </button>
  ${item.dailymotion_id
    ? this.dailymotionLink(item.dailymotion_id)
    : `<button class="dailymotion-btn" title="Upload to Dailymotion">
        <svg class="list__button__icon"><use xlink:href="images/icons.svg#dmp_ico-upload"></use></svg>
        <span class="visuallyhidden">Upload</span>
      </button>`
  }
</li>`, '')
  }
}
