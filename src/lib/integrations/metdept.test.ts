import assert from "node:assert/strict";
import {
  capAlertToWarning,
  capSeverityToLevel,
  mergeAdvisoryAndCapWarnings,
  parseCapRss,
  parseCapXml,
  splitCapInstruction,
  type MetDeptWarning,
} from "./metdept";

assert.equal(capSeverityToLevel("Minor"), "yellow");
assert.equal(capSeverityToLevel("Moderate"), "amber");
assert.equal(capSeverityToLevel("Severe"), "red");
assert.equal(capSeverityToLevel("Extreme"), "red");
assert.equal(capSeverityToLevel(null, "Immediate"), "amber");
assert.equal(capSeverityToLevel("Unknown"), "unknown");

const emptyRss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Weather Advisory CAP Feed</title>
    <pubDate>Mon, 20 Jul 2026 05:46:54 GMT</pubDate>
  </channel>
</rss>`;

const emptyFeed = parseCapRss(emptyRss);
assert.equal(emptyFeed.title, "Weather Advisory CAP Feed");
assert.ok(emptyFeed.publishedAt?.startsWith("2026-07-20"));
assert.equal(emptyFeed.items.length, 0);

const rssWithItem = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Weather Advisory CAP Feed</title>
    <pubDate>Mon, 20 Jul 2026 06:00:00 GMT</pubDate>
    <item>
      <title>Heavy Rain Yellow Warning</title>
      <link>https://was.meteo.gov.lk/cap/en/cap-heavy-rain-today.xml</link>
      <description><![CDATA[<p>Coastal rain advisory</p>]]></description>
      <pubDate>Mon, 20 Jul 2026 05:50:00 GMT</pubDate>
      <guid>cap-heavy-rain-1</guid>
    </item>
  </channel>
</rss>`;

const itemFeed = parseCapRss(rssWithItem);
assert.equal(itemFeed.items.length, 1);
assert.equal(itemFeed.items[0]?.title, "Heavy Rain Yellow Warning");
assert.equal(
  itemFeed.items[0]?.link,
  "https://was.meteo.gov.lk/cap/en/cap-heavy-rain-today.xml",
);
assert.equal(itemFeed.items[0]?.description, "Coastal rain advisory");
assert.equal(itemFeed.items[0]?.guid, "cap-heavy-rain-1");

const split = splitCapInstruction(
  "Action Required: Stay indoors\nDamage Expected: Flooding in low areas\nMonitor updates",
);
assert.equal(split.actionRequired, "Stay indoors");
assert.equal(split.damageExpected, "Flooding in low areas");
assert.equal(split.remainder, "Monitor updates");

const capXml = `<?xml version="1.0" encoding="UTF-8"?>
<alert xmlns="urn:oasis:names:tc:emergency:cap:1.1">
  <identifier>met-heavy-rain-1</identifier>
  <sender>info@meteo.gov.lk</sender>
  <sent>2026-07-20T05:50:00+00:00</sent>
  <status>Actual</status>
  <msgType>Alert</msgType>
  <scope>Public</scope>
  <info>
    <language>en</language>
    <category>Met</category>
    <event>Heavy Rain</event>
    <responseType>Monitor</responseType>
    <urgency>Immediate</urgency>
    <severity>Minor</severity>
    <certainty>Possible</certainty>
    <expires>2026-07-20T23:59:00+00:00</expires>
    <senderName>Department of Meteorology, Sri Lanka</senderName>
    <headline>Heavy Rain Yellow Warning (Be Aware)</headline>
    <description>Warning Description: Showers expected in western districts.</description>
    <instruction>Action Required: Avoid landslide-prone slopes
Damage Expected: Localized flooding</instruction>
    <web>https://was.meteo.gov.lk</web>
    <area>
      <areaDesc>Districts: Colombo, Gampaha</areaDesc>
    </area>
    <area>
      <areaDesc>Divisions: Kelaniya, Wattala</areaDesc>
    </area>
  </info>
</alert>`;

const alert = parseCapXml(
  capXml,
  "https://was.meteo.gov.lk/cap/en/cap-heavy-rain-today.xml",
);
assert.ok(alert);
assert.equal(alert?.identifier, "met-heavy-rain-1");
assert.equal(alert?.info[0]?.event, "Heavy Rain");
assert.equal(alert?.info[0]?.severity, "Minor");
assert.equal(alert?.info[0]?.description, "Showers expected in western districts.");
assert.equal(alert?.info[0]?.actionRequired, "Avoid landslide-prone slopes");
assert.equal(alert?.info[0]?.damageExpected, "Localized flooding");
assert.deepEqual(alert?.info[0]?.areaDescs, [
  "Districts: Colombo, Gampaha",
  "Divisions: Kelaniya, Wattala",
]);

const capWarning = capAlertToWarning(alert!);
assert.ok(capWarning);
assert.equal(capWarning?.name, "Heavy Rain");
assert.equal(capWarning?.level, "yellow");
assert.equal(capWarning?.source, "cap");
assert.equal(capWarning?.urgency, "Immediate");
assert.equal(capWarning?.severity, "Minor");
assert.equal(capWarning?.certainty, "Possible");
assert.deepEqual(capWarning?.districts, ["Colombo", "Gampaha"]);
assert.deepEqual(capWarning?.divisions, ["Kelaniya", "Wattala"]);
assert.equal(
  capWarning?.capUrl,
  "https://was.meteo.gov.lk/cap/en/cap-heavy-rain-today.xml",
);

const advisoryOnly: MetDeptWarning = {
  id: "adv-1",
  dayKey: "today",
  dayLabel: "Today",
  name: "Heavy Rain",
  level: "yellow",
  warningLabel: "Yellow Warning (Be Aware)",
  bulletinNo: null,
  validFrom: "2026-07-20T05:00",
  validTo: "2026-07-20T23:59",
  summary: "Showers expected.",
  summaryBullets: ["Showers expected"],
  actionRequired: "Stay alert",
  damageExpected: null,
  areas: [],
  districts: ["Colombo"],
  divisions: [],
  urgency: null,
  severity: null,
  certainty: null,
  headline: null,
  webUrl: null,
  capUrl: null,
  source: "advisory",
};

const enriched = mergeAdvisoryAndCapWarnings([advisoryOnly], [capWarning!]);
assert.equal(enriched.feedMode, "advisory+cap");
assert.equal(enriched.warnings.length, 1);
assert.equal(enriched.warnings[0]?.source, "advisory+cap");
assert.equal(enriched.warnings[0]?.urgency, "Immediate");
assert.equal(enriched.warnings[0]?.severity, "Minor");
assert.equal(enriched.warnings[0]?.actionRequired, "Stay alert");
assert.equal(enriched.warnings[0]?.damageExpected, "Localized flooding");
assert.equal(
  enriched.warnings[0]?.capUrl,
  "https://was.meteo.gov.lk/cap/en/cap-heavy-rain-today.xml",
);

const capOnly = mergeAdvisoryAndCapWarnings([], [capWarning!]);
assert.equal(capOnly.feedMode, "cap");
assert.equal(capOnly.warnings[0]?.source, "cap");

const advisoryMode = mergeAdvisoryAndCapWarnings([advisoryOnly], []);
assert.equal(advisoryMode.feedMode, "advisory");
assert.equal(advisoryMode.warnings[0]?.source, "advisory");

assert.equal(parseCapXml("<rss></rss>"), null);

console.log("metdept.test.ts: ok");
