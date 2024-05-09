import fastify from "fastify";
import { XMLParser } from "fast-xml-parser";
import { Pool } from "undici";

export const app = fastify();
const pool = new Pool("https://www.nrk.no");
const parser = new XMLParser({
	ignoreAttributes: false,
});

const feeds = {
	buskerud: "/buskerud/toppsaker.rss",
	innlandet: "/innlandet/toppsaker.rss",
	mr: "/mr/toppsaker.rss",
	nordland: "/nordland/toppsaker.rss",
	rogaland: "/rogaland/toppsaker.rss",
	"stor-oslo": "/stor-oslo/toppsaker.rss",
	sorlandet: "/sorlandet/toppsaker.rss",
	tromsogfinnmark: "/tromsogfinnmark/toppsaker.rss",
	trondelag: "/trondelag/toppsaker.rss",
	vestfoldogtelemark: "/vestfoldogtelemark/toppsaker.rss",
	vestland: "/vestland/toppsaker.rss",
	ostfold: "/ostfold/toppsaker.rss",
};

const handler = async (req, res) => {
	const { distrikt } = req.params;
	const path = feeds[distrikt] || "/toppsaker.rss";
	const response = await pool.request({
		method: "GET",
		path,
	});
	const body = await response.body.text();
	const feed = parser.parse(body);

	const html = /* html */ `<!doctype html>
<html lang="no">
  <head>
    <meta charset="utf-8">
    <link rel="dns-prefetch" href="https://gfx.nrk.no">
    <title>Siste saker fra NRK.no</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="/style.css">
    <meta name="robots" content="noindex">
  </head>
  <body>
    <main>
      <h1>Siste saker fra NRK.no</h1>
      <div class="articles">
      ${feed.rss.channel.item
				.map(
					(item) => /* html */ `<article>
    ${item["media:content"] ? `<img src="${item["media:content"]["@_url"]}" loading="lazy" decoding="async"  alt="">` : ""}
    <h2><a href="${item.link}">${item.title}</a></h2>
    <p>${item.description}</p>
  </article>`,
				)
				.join("")}
      </div>
    </main>
    <footer>
      <nav aria-label="Distrikt">
				<ul>
          <li>
            <a href="/buskerud">NRK Buskerud</a>
          </li>
          <li>
            <a href="/innlandet">NRK Innlandet</a>
          </li>
          <li>
            <a href="/mr">NRK Møre og Romsdal</a>
          </li>
          <li>
            <a href="/nordland">NRK Nordland</a>
          </li>
          <li>
            <a href="/rogaland">NRK Rogaland</a>
          </li>
          <li>
            <a href="/stor-oslo">NRK Stor-Oslo</a>
          </li>
          <li>
            <a href="/sorlandet">NRK Sørlandet</a>
          </li>
          <li>
            <a href="/tromsogfinnmark">NRK Troms og Finnmark</a>
          </li>
          <li>
            <a href="/trondelag">NRK Trøndelag</a>
          </li>
          <li>
            <a href="/vestfoldogtelemark">NRK Vestfold og Telemark</a>
          </li>
          <li>
            <a href="/vestland">NRK Vestland</a>
          </li>
          <li>
            <a href="/ostfold">NRK Østfold</a>
          </li>
        </ul>
      </nav>
    </footer>
  </body>
</html>`;
	res.type("text/html").send(html);
};

app.get("/", handler);
for (const distrikt of Object.keys(feeds)) {
	app.get(`/${distrikt}`, handler);
}
