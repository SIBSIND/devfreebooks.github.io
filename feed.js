const harp = require('./harp.json').globals;
const RSS = require('rss');
const moment = require('moment');
const fs = require('fs-extra');
const path = require('path');

const rootUrl = harp.root_url.production;
const categoryDir = path.join(__dirname, 'public/_categories');
const imageRootUrl = `${rootUrl}assets/images/`;
const outputFeed = 'www/rss.xml';
const books = [];
const feed = new RSS({
  title: harp.title,
  description: harp.description,
  feed_url: `${rootUrl}rss.xml`,
  site_url: rootUrl,
  image_url: `${imageRootUrl}${harp.slug_title}-thumb.png`,
  managingEditor: harp.author,
  pubDate: moment().format('LLLL'),
  ttl: 60
});

fs.readdirSync(categoryDir).forEach((categoryFile) => {
  const categoryName = categoryFile.replace('.json', '');
  const category = require(path.join(categoryDir, categoryFile)).index;
  category.books.forEach((book) => {
    const bookId = book.title.replace(/[^\w\s]/g, '').replace(/\s/g, '-').toLowerCase();
    const bookLink = `${rootUrl}${categoryName}/#${bookId}`;
    const bookPublishedAt = moment(book.added_at || moment().format('YYYYMMDD'), 'YYYYMMDD');
    books.push({
      title: `Book: ${book.title}`,
      description: book.description,
      url: bookLink,
      author: harp.author,
      date: bookPublishedAt.format('ll')
    });
  });
});

const sortedBooks = books.sort((first, second) => {
  const a = moment(first.date, 'll').toDate().getTime();
  const b = moment(second.date, 'll').toDate().getTime();
  if (a < b) return 1;
  if (a > b) return -1;
  return 0;
});

sortedBooks.forEach(book => feed.item(book));

fs.writeFileSync(outputFeed, feed.xml());
console.log(`Generated RSS: ${outputFeed}`);
